'use server';

import { prisma } from '@/lib/prisma';
import { Role, ProgressStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

/**
 * Get current authenticated user with role check
 */
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized: No authenticated user');
  }

  return user;
}

/**
 * Verify user is a teacher and owns the specified batch
 */
async function verifyTeacherOwnsBatch(batchId: string, teacherId: string) {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { id: true, teacherId: true }
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (batch.teacherId !== teacherId) {
    throw new Error('Unauthorized: You do not teach this batch');
  }

  return batch;
}

// ─── Auth Sync ──────────────────────────────────────────

export async function syncUserAction(
  supabaseId: string,
  email: string,
  name: string | null,
  role: Role,
  joinCode?: string
) {
  const user = await getAuthenticatedUser();

  // Verify the user is syncing their own data
  if (user.id !== supabaseId) {
    throw new Error('Unauthorized: Cannot sync data for another user');
  }

  // Validate inputs
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email');
  }

  if (role !== 'STUDENT' && role !== 'TEACHER' && role !== 'ADMIN') {
    throw new Error('Invalid role');
  }

  try {
    let existingUser = await prisma.user.findUnique({
      where: { supabaseId }
    });

    if (existingUser) {
      return existingUser;
    }

    let institution = await prisma.institution.findFirst({
      select: { id: true }
    });

    if (!institution) {
      institution = await prisma.institution.create({
        data: {
          name: 'Demo Institution',
          slug: 'demo-inst'
        },
        select: { id: true }
      });
    }

    const newUser = await prisma.user.create({
      data: {
        supabaseId,
        email,
        name,
        role,
        institutionId: institution.id
      }
    });

    if (role === 'STUDENT' && joinCode && joinCode.length === 6) {
      const batch = await prisma.batch.findUnique({
        where: { joinCode: joinCode.toUpperCase() },
        select: { id: true }
      });

      if (batch) {
        await prisma.batchStudent.create({
          data: {
            batchId: batch.id,
            studentId: newUser.id
          }
        });
      }
    }

    return newUser;
  } catch (error) {
    console.error('syncUserAction failed:', error);
    throw new Error('Failed to sync user. Please try again.');
  }
}

// ─── Teacher Progress ───────────────────────────────────

export async function assignBatchTopicProgress(
  batchId: string,
  topicId: string,
  status: ProgressStatus
) {
  const user = await getAuthenticatedUser();

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, role: true }
  });

  if (!dbUser || dbUser.role !== 'TEACHER') {
    throw new Error('Unauthorized: Only teachers can assign progress');
  }

  await verifyTeacherOwnsBatch(batchId, dbUser.id);

  // Validate topic exists
  const topic = await prisma.topicNode.findUnique({
    where: { id: topicId },
    select: { id: true }
  });

  if (!topic) {
    throw new Error('Topic not found');
  }

  // Validate status
  if (!Object.values(ProgressStatus).includes(status)) {
    throw new Error('Invalid progress status');
  }

  try {
    await prisma.teacherProgress.upsert({
      where: { batchId_topicId: { batchId, topicId } },
      update: { status, assignedAt: new Date() },
      create: { batchId, topicId, status, assignedBy: dbUser.id }
    });

    revalidatePath(`/teacher/subjects/${topicId}`);
    revalidatePath(`/teacher/learning-path`);

    return { success: true };
  } catch (error) {
    console.error('assignBatchTopicProgress failed:', error);
    throw new Error('Failed to assign progress. Please try again.');
  }
}

// ─── Student Progress ───────────────────────────────────

export async function updatePersonalProgress(
  topicId: string,
  status: ProgressStatus
) {
  const user = await getAuthenticatedUser();

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, role: true }
  });

  if (!dbUser || dbUser.role !== 'STUDENT') {
    throw new Error('Unauthorized: Only students can update personal progress');
  }

  // Validate topic exists
  const topic = await prisma.topicNode.findUnique({
    where: { id: topicId },
    select: { id: true, subjectId: true }
  });

  if (!topic) {
    throw new Error('Topic not found');
  }

  // Validate status
  if (!Object.values(ProgressStatus).includes(status)) {
    throw new Error('Invalid progress status');
  }

  try {
    await prisma.studentProgress.upsert({
      where: { studentId_topicId: { studentId: dbUser.id, topicId } },
      update: { status, updatedAt: new Date() },
      create: { studentId: dbUser.id, topicId, status }
    });

    revalidatePath(`/student/learning-path`);
    revalidatePath(`/student/subjects/${topic.subjectId}`);

    return { success: true };
  } catch (error) {
    console.error('updatePersonalProgress failed:', error);
    throw new Error('Failed to update progress. Please try again.');
  }
}

// ─── Data Fetching ──────────────────────────────────────

export async function getTopicProgress(topicId: string) {
  const user = await getAuthenticatedUser();

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true }
  });

  if (!dbUser) {
    throw new Error('User not found in database');
  }

  const [teacherProgress, personalProgress] = await Promise.all([
    prisma.teacherProgress.findFirst({
      where: { topicId },
      select: { status: true }
    }),
    prisma.studentProgress.findUnique({
      where: { studentId_topicId: { studentId: dbUser.id, topicId } },
      select: { status: true, updatedAt: true }
    })
  ]);

  return {
    teacherAssigned: teacherProgress?.status || null,
    personal: personalProgress?.status || 'NOT_STARTED',
    updatedAt: personalProgress?.updatedAt || null
  };
}

export async function getClassRankings(batchId: string) {
  const user = await getAuthenticatedUser();

  // Verify user has access to this batch
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, role: true }
  });

  if (!dbUser) {
    throw new Error('User not found');
  }

  // Teachers can view their batches, students can view batches they're in
  const accessCheck = dbUser.role === 'TEACHER'
    ? { id: batchId, teacherId: dbUser.id }
    : { id: batchId, students: { some: { studentId: dbUser.id } } };

  const batchExists = await prisma.batch.findFirst({
    where: accessCheck,
    select: { id: true }
  });

  if (!batchExists) {
    throw new Error('Unauthorized: Cannot access this batch');
  }

  const batchStudents = await prisma.batchStudent.findMany({
    where: { batchId },
    select: {
      student: {
        select: {
          supabaseId: true,
          name: true,
          email: true,
          studentProgress: {
            select: { status: true }
          }
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

  rankings.sort((a, b) => b.progress - a.progress);
  return rankings.map((r, i) => ({ ...r, rank: i + 1 }));
}
