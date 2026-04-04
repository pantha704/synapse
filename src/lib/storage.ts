import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const storage = createClient(supabaseUrl, supabaseKey).storage;

export const BUCKET_NAME = "resources";

export interface UploadedResource {
  path: string;
  url: string;
  contentType: string;
  size: number;
}

export async function uploadResource(
  file: File,
  topicId: string,
  institutionSlug: string
): Promise<UploadedResource> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const path = `${institutionSlug}/${topicId}/${fileName}`;

  const { error: uploadError } = await storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = storage.from(BUCKET_NAME).getPublicUrl(path);

  return {
    path,
    url: data.publicUrl,
    contentType: file.type,
    size: file.size,
  };
}

export async function deleteResource(path: string): Promise<void> {
  const { error } = await storage.from(BUCKET_NAME).remove([path]);
  if (error) throw error;
}

export function getResourceUrl(path: string): string {
  const { data } = storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}
