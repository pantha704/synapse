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

export type CreateAssignmentInput = {
  batchId: string;
  topicId: string;
  title: string;
  instructions?: string;
  dueAt?: string;
};

export async function createAssignment({ batchId, topicId, title, instructions, dueAt }: CreateAssignmentInput) {
  const user = await currentDbUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    return { ok: false as const, error: "Only teachers can create assignments" };
  }

  const trimmed = title.trim();
  if (trimmed.length < 3) return { ok: false as const, error: "Title needs at least 3 characters" };

  const batch = await prisma.batch.findFirst({
    // ADMIN used to hit this branch unfiltered: any batch id in any tenant passed.
    where: {
      id: batchId,
      ...(user.role === "TEACHER"
        ? { teacherId: user.id }
        : { institutionId: user.institutionId }),
    },
    include: { subjects: { select: { subjectId: true } } },
  });
  if (!batch) return { ok: false as const, error: "Batch not found for this account" };

  const subjectIds = batch.subjects.map((s) => s.subjectId);
  const topic = await prisma.topicNode.findFirst({
    where: { id: topicId, subjectId: { in: subjectIds } },
    select: { id: true },
  });
  if (!topic) return { ok: false as const, error: "That topic is not part of this batch" };

  const due = dueAt ? new Date(dueAt) : null;
  if (due && Number.isNaN(due.getTime())) return { ok: false as const, error: "Due date is not a valid date" };

  await prisma.assignment.create({
    data: {
      batchId: batch.id,
      topicId: topic.id,
      title: trimmed,
      instructions: instructions?.trim() || null,
      dueAt: due,
      createdBy: user.id,
    },
  });

  revalidatePath("/teacher/assignments");
  revalidatePath("/student/learning-path");
  return { ok: true as const };
}

export async function submitAssignment({ assignmentId, note }: { assignmentId: string; note?: string }) {
  const user = await currentDbUser();
  if (!user) return { ok: false as const, error: "Not signed in" };

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { batch: { include: { students: { where: { studentId: user.id }, select: { id: true } } } } },
  });
  if (!assignment) return { ok: false as const, error: "Assignment not found" };
  if (assignment.batch.students.length === 0) {
    return { ok: false as const, error: "You are not enrolled in this batch" };
  }

  await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId: user.id } },
    create: {
      assignmentId,
      studentId: user.id,
      status: "SUBMITTED",
      note: note?.trim() || null,
      submittedAt: new Date(),
    },
    update: {
      status: "SUBMITTED",
      note: note?.trim() || null,
      submittedAt: new Date(),
    },
  });

  revalidatePath("/student/learning-path");
  revalidatePath("/teacher/assignments");
  return { ok: true as const };
}
