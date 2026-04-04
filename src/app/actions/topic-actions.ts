'use server';

import { prisma } from '@/lib/prisma';
import { ResourceType, ProgressStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function fetchTopicResourcesAction(topicId: string) {
  const resources = await prisma.resource.findMany({
    where: { topicId },
    orderBy: { createdAt: 'asc' }
  });
  return resources;
}

export async function createTopicResourceAction(
  subjectId: string,
  topicId: string, 
  title: string, 
  type: ResourceType, 
  url: string
) {
  const resource = await prisma.resource.create({
    data: {
      title,
      type,
      url,
      subjectId,
      topicId,
    }
  });

  revalidatePath(`/teacher/subjects/${subjectId}`);
  return resource;
}

export async function markResourceCompleteAction(
  studentId: string,
  resourceId: string,
  topicId: string,
  subjectId: string
) {
  // 1. Mark resource complete
  await prisma.studentResourceProgress.upsert({
    where: {
      studentId_resourceId: { studentId, resourceId }
    },
    update: {
      isCompleted: true,
      completedAt: new Date()
    },
    create: {
      studentId,
      resourceId,
      isCompleted: true,
      completedAt: new Date()
    }
  });

  // 2. Check if all resources for this topic are now complete
  const allTopicResources = await prisma.resource.findMany({
    where: { topicId },
    select: { id: true }
  });

  const completedProgress = await prisma.studentResourceProgress.findMany({
    where: {
      studentId,
      resourceId: { in: allTopicResources.map(r => r.id) },
      isCompleted: true
    }
  });

  if (completedProgress.length === allTopicResources.length && allTopicResources.length > 0) {
    // Topic is complete!
    await prisma.studentProgress.upsert({
      where: {
        studentId_topicId: { studentId, topicId }
      },
      update: {
        status: ProgressStatus.COMPLETED
      },
      create: {
        studentId,
        topicId,
        status: ProgressStatus.COMPLETED
      }
    });

    // Also log engagement event
    await prisma.engagementEvent.create({
      data: {
        studentId,
        type: 'TOPIC_COMPLETE',
        metadata: { topicId }
      }
    });
  } else {
    // Topic is in progress
    await prisma.studentProgress.upsert({
      where: {
        studentId_topicId: { studentId, topicId }
      },
      update: {
        status: ProgressStatus.IN_PROGRESS
      },
      create: {
        studentId,
        topicId,
        status: ProgressStatus.IN_PROGRESS
      }
    });
  }

  revalidatePath(`/student/subjects/${subjectId}`);
}
