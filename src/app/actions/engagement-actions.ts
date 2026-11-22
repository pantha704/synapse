'use server';

import { prisma } from '@/lib/prisma';
import { EventType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

// ─── Event Logging ───────────────────────────────────────────────


// ─── Engagement Classification ───────────────────────────────────

export type EngagementStatus = 'progressing' | 'stuck' | 'inactive';

export interface StudentEngagement {
  studentId: string;
  studentName: string | null;
  email: string;
  status: EngagementStatus;
  lastActive: Date | null;
  eventCount7d: number;
  topicsCompleted: number;
  progressPercent: number;
}

export async function getBatchEngagement(batchId: string): Promise<StudentEngagement[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHENTICATED");

  const me = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!me) throw new Error("NO_ACCOUNT");

  // a batch id is guessable and the action is public: the caller must own it,
  // be an admin in its institution, or be enrolled in it
  const batch = await prisma.batch.findFirst({
    where: {
      id: batchId,
      OR: [
        { teacherId: me.id },
        ...(me.role === "ADMIN" ? [{ institutionId: me.institutionId }] : []),
        { students: { some: { studentId: me.id } } },
      ],
    },
    select: { id: true },
  });
  if (!batch) throw new Error("FORBIDDEN");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  // Get all students in batch
  const batchStudents = await prisma.batchStudent.findMany({
    where: { batchId },
    include: {
      student: {
        include: {
          studentProgress: true,
          engagementEvents: {
            where: { createdAt: { gte: sevenDaysAgo } },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  // topics taught in this batch only — a global count made every percentage
  // collapse toward zero as other tenants added curriculum
  const batchTopics = await prisma.topicNode.findMany({
    where: { subject: { batches: { some: { batchId } } } },
    select: { id: true },
  });
  const totalTopics = batchTopics.length;
  const inBatch = new Set(batchTopics.map((t) => t.id));

  return batchStudents.map(({ student }) => {
    const events = student.engagementEvents;
    const lastActive = events[0]?.createdAt || null;
    const eventCount7d = events.length;
    // a student enrolled in two batches used to count every completion they had,
    // so one roster row could read 200%
    const topicsCompleted = student.studentProgress.filter(
      (p) => p.status === 'COMPLETED' && inBatch.has(p.topicId)
    ).length;
    const progressPercent = totalTopics > 0 ? Math.round((topicsCompleted / totalTopics) * 100) : 0;

    // Classification logic
    let status: EngagementStatus = 'inactive';
    if (lastActive && lastActive >= twoDaysAgo && topicsCompleted > 0) {
      status = 'progressing';
    } else if (lastActive && lastActive >= sevenDaysAgo) {
      status = 'stuck';
    }

    return {
      studentId: student.supabaseId,
      studentName: student.name,
      email: student.email,
      status,
      lastActive,
      eventCount7d,
      topicsCompleted,
      progressPercent
    };
  });
}

export async function getEngagementSummary(batchId: string) {
  const students = await getBatchEngagement(batchId);

  return {
    total: students.length,
    progressing: students.filter(s => s.status === 'progressing').length,
    stuck: students.filter(s => s.status === 'stuck').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    avgProgress: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.progressPercent, 0) / students.length)
      : 0
  };
}
