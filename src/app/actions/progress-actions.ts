'use server';

import { prisma } from '@/lib/prisma';
import { ProgressStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// ─── Teacher: Assign class-wide progress ─────────────────────────

export async function assignBatchTopicProgress(
  batchId: string,
  topicId: string,
  status: ProgressStatus,
  teacherId: string
) {
  // Verify teacher owns this batch
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { teacher: true }
  });

  if (!batch || batch.teacherId !== teacherId) {
    throw new Error('Unauthorized: You do not teach this batch');
  }

  // Upsert teacher progress assignment
  await prisma.teacherProgress.upsert({
    where: { batchId_topicId: { batchId, topicId } },
    update: { status, assignedAt: new Date() },
    create: { batchId, topicId, status, assignedBy: teacherId }
  });

  revalidatePath(`/teacher/subjects/${topicId}`);
  revalidatePath(`/teacher/learning-path`);
}

// ─── Student: Update personal progress ────────────────────────────

export async function updatePersonalProgress(
  studentId: string,
  topicId: string,
  status: ProgressStatus
) {
  await prisma.studentProgress.upsert({
    where: { studentId_topicId: { studentId, topicId } },
    update: { status, updatedAt: new Date() },
    create: { studentId, topicId, status }
  });

  revalidatePath(`/student/learning-path`);
  revalidatePath(`/student/subjects/${topicId}`);
}

// ─── Data Fetching ────────────────────────────────────────────────

export async function getTopicProgress(topicId: string, studentId: string) {
  const [teacherProgress, personalProgress] = await Promise.all([
    prisma.teacherProgress.findFirst({ where: { topicId } }),
    prisma.studentProgress.findUnique({ where: { studentId_topicId: { studentId, topicId } } })
  ]);

  return {
    teacherAssigned: teacherProgress?.status || null,
    personal: personalProgress?.status || 'NOT_STARTED',
    updatedAt: personalProgress?.updatedAt || null
  };
}

export async function getClassRankings(batchId: string) {
  const batchStudents = await prisma.batchStudent.findMany({
    where: { batchId },
    include: {
      student: {
        include: {
          studentProgress: true
        }
      }
    }
  });

  const rankings = batchStudents.map(({ student }) => {
    const totalTopics = student.studentProgress.length;
    const completedTopics = student.studentProgress.filter(p => p.status === 'COMPLETED').length;
    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      studentId: student.supabaseId,
      studentName: student.name || 'Anonymous',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.email}`,
      progress: progressPercent,
      email: student.email
    };
  });

  // Sort by progress descending and assign ranks
  rankings.sort((a, b) => b.progress - a.progress);
  return rankings.map((r, i) => ({ ...r, rank: i + 1 }));
}

export async function getStudentWeeklyActivity(studentId: string) {
  const events = await prisma.engagementEvent.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return events.map(e => ({
    id: e.id,
    type: e.type.toLowerCase(),
    title: `${e.type.replace('_', ' ')} activity`,
    time: formatTimeAgo(e.createdAt)
  }));
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
