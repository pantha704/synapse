'use server';

import { prisma } from '@/lib/prisma';
import { EventType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// ─── Event Logging ───────────────────────────────────────────────

export async function logEngagementEvent(
  studentId: string,
  type: EventType,
  metadata?: Record<string, unknown>
) {
  await prisma.engagementEvent.create({
    data: {
      studentId,
      type,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    }
  });

  revalidatePath('/teacher/analytics');
}

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

  // Get total topics for progress calculation
  const totalTopics = await prisma.topicNode.count();

  return batchStudents.map(({ student }) => {
    const events = student.engagementEvents;
    const lastActive = events[0]?.createdAt || null;
    const eventCount7d = events.length;
    const topicsCompleted = student.studentProgress.filter(p => p.status === 'COMPLETED').length;
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
