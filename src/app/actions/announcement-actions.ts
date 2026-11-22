"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

async function currentDbUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { supabaseId: user.id } });
}

export type AnnouncementInput = { batchId: string; title: string; body: string };

export async function createAnnouncement({ batchId, title, body }: AnnouncementInput) {
  const user = await currentDbUser();
  if (!user || user.role !== "TEACHER") return { ok: false as const, error: "Only teachers can post" };

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  if (trimmedTitle.length < 3) return { ok: false as const, error: "Title needs at least 3 characters" };
  if (trimmedBody.length < 3) return { ok: false as const, error: "Message needs at least 3 characters" };

  const batch = await prisma.batch.findFirst({ where: { id: batchId, teacherId: user.id } });
  if (!batch) return { ok: false as const, error: "Batch not found for this teacher" };

  await prisma.announcement.create({
    data: { batchId: batch.id, authorId: user.id, title: trimmedTitle, body: trimmedBody },
  });

  revalidatePath("/teacher/learning-path");
  revalidatePath("/student/learning-path");
  return { ok: true as const };
}

export async function markAnnouncementRead(announcementId: string) {
  const user = await currentDbUser();
  if (!user) return { ok: false as const, error: "Not signed in" };

  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });
  if (!announcement) return { ok: false as const, error: "Announcement not found" };

  await prisma.announcementRead.upsert({
    where: { announcementId_studentId: { announcementId, studentId: user.id } },
    create: { announcementId, studentId: user.id },
    update: {},
  });

  revalidatePath("/student/learning-path");
  return { ok: true as const };
}
