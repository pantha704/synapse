"use server";

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { ingestDocument } from "@/lib/ai/ingestion";

export type UploadResult =
  | {
      ok: true;
      resource: { id: string; title: string; type: string; url: string | null };
      chunks: number;
      embeddings: number;
      /** false when the file was stored but no text could be indexed */
      indexed: boolean;
      indexError: string | null;
    }
  | { ok: false; error: string };

const BUCKET = "resources";
const MAX_BYTES = 15 * 1024 * 1024;

/**
 * Upload a curriculum file and index it in one step.
 * Storage write uses the service role because the bucket is not open to anon writes.
 */
export async function uploadAndIngestResource(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser || (dbUser.role !== "TEACHER" && dbUser.role !== "ADMIN")) {
    return { ok: false, error: "Only teachers can upload material" };
  }

  const topicId = String(formData.get("topicId") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received" };
  if (file.size === 0) return { ok: false, error: "File is empty" };
  if (file.size > MAX_BYTES) return { ok: false, error: "File is larger than 15 MB" };

  const topic = await prisma.topicNode.findFirst({
    where: { id: topicId, subject: { institutionId: dbUser.institutionId } },
    include: { subject: true },
  });
  if (!topic) return { ok: false, error: "Topic not found in your institution" };

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not configured" };

  const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
  const buffer = Buffer.from(await file.arrayBuffer());
  // content-addressed path: re-uploading the same document overwrites it instead
  // of creating a second copy that ingestion then has to reconcile
  const digest = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  const path = `${dbUser.institutionId}/${topic.id}/${digest}-${safeName}`;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (uploadError) return { ok: false, error: `Storage: ${uploadError.message}` };

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);

  const resource = await prisma.resource.create({
    data: {
      title: file.name,
      type: file.type.includes("pdf") ? "PDF" : file.type.startsWith("video/") ? "VIDEO" : "NOTE",
      url: pub.publicUrl,
      subjectId: topic.subjectId,
      topicId: topic.id,
    },
  });

  // Index PDFs so the assistant can cite them; other types stay download-only.
  let chunks = 0;
  let embeddings = 0;
  let indexError: string | null = null;
  if (file.type.includes("pdf")) {
    try {
      const result = await ingestDocument(topic.id, topic.subjectId, buffer, pub.publicUrl);
      chunks = result.chunksCreated;
      embeddings = result.embeddingsGenerated;
    } catch (error) {
      // a scanned PDF or a parser failure used to look exactly like success
      indexError = error instanceof Error ? error.message : "indexing failed";
      console.error("ingestion failed", error);
    }
  }

  revalidatePath(`/teacher/subjects/${topic.subjectId}`);
  revalidatePath("/student/learning-path");

  return {
    ok: true,
    resource: { id: resource.id, title: resource.title, type: resource.type, url: resource.url },
    chunks,
    embeddings,
    indexed: chunks > 0,
    indexError,
  };
}
