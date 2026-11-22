"use server";

import { prisma } from "@/lib/prisma";
import { ResourceType, ProgressStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/**
 * Resources and progress for one topic, scoped to the caller.
 *
 * Server actions are public endpoints, so the student id and the topic id are
 * taken from the session and the database rather than from the caller: passing
 * a classmate's id here used to mark their work complete and forge rankings.
 */
async function requireStudent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHENTICATED");

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) throw new Error("NO_ACCOUNT");
  return dbUser;
}

async function topicInScope(topicId: string, institutionId: string) {
  return prisma.topicNode.findFirst({
    where: { id: topicId, subject: { institutionId } },
    select: { id: true, subjectId: true },
  });
}

export async function fetchTopicResourcesAction(topicId: string) {
  const me = await requireStudent();
  const topic = await topicInScope(topicId, me.institutionId);
  if (!topic) return [];

  return prisma.resource.findMany({
    where: { topicId: topic.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTopicResourceAction(
  subjectId: string,
  topicId: string,
  title: string,
  type: ResourceType,
  url: string
) {
  const me = await requireStudent();
  if (me.role !== "TEACHER" && me.role !== "ADMIN") throw new Error("FORBIDDEN");

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId: me.institutionId },
    select: { id: true },
  });
  if (!subject) throw new Error("SUBJECT_NOT_FOUND");

  const topic = await topicInScope(topicId, me.institutionId);
  if (!topic || topic.subjectId !== subject.id) throw new Error("TOPIC_NOT_IN_SUBJECT");

  const resource = await prisma.resource.create({
    data: { title, type, url, subjectId: subject.id, topicId: topic.id },
  });

  revalidatePath(`/teacher/subjects/${subject.id}`);
  return resource;
}

export async function markResourceCompleteAction(
  resourceId: string,
  topicId: string,
  subjectId: string
) {
  const me = await requireStudent();

  const topic = await topicInScope(topicId, me.institutionId);
  if (!topic || topic.subjectId !== subjectId) throw new Error("TOPIC_NOT_IN_SUBJECT");

  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, topicId: topic.id },
    select: { id: true },
  });
  if (!resource) throw new Error("RESOURCE_NOT_IN_TOPIC");

  const studentId = me.id;

  // completion check + status write in one transaction so two tabs cannot both
  // see "not all done" and leave the topic stuck in progress
  await prisma.$transaction(async (tx) => {
    await tx.studentResourceProgress.upsert({
      where: { studentId_resourceId: { studentId, resourceId: resource.id } },
      update: { isCompleted: true, completedAt: new Date() },
      create: { studentId, resourceId: resource.id, isCompleted: true, completedAt: new Date() },
    });

    const all = await tx.resource.findMany({ where: { topicId: topic.id }, select: { id: true } });
    const done = await tx.studentResourceProgress.count({
      where: { studentId, resourceId: { in: all.map((r) => r.id) }, isCompleted: true },
    });

    const complete = all.length > 0 && done >= all.length;
    const status = complete ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS;

    await tx.studentProgress.upsert({
      where: { studentId_topicId: { studentId, topicId: topic.id } },
      update: { status },
      create: { studentId, topicId: topic.id, status },
    });

    if (complete) {
      await tx.engagementEvent.create({
        data: { studentId, type: "TOPIC_COMPLETE", metadata: { topicId: topic.id } },
      });
    }
  });

  revalidatePath(`/student/subjects/${subjectId}`);
}
