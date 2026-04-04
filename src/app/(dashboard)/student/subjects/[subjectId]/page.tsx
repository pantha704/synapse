import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Node, Edge } from '@xyflow/react';
import { TopicNodeData } from '@/components/canvas/topic-node';
import { ChapterNodeData } from '@/components/canvas/chapter-node';
import { StudentMindmapClient } from './student-mindmap-client';
import { StudentProgress, StudentResourceProgress, TopicNode as PrismaTopicNode } from '@prisma/client';
import { createClient } from '@/utils/supabase/server';

export default async function StudentSubjectMindmapPage({
  params
}: {
  params: Promise<{ subjectId: string }>
}) {
  const resolvedParams = await params;
  const { subjectId } = resolvedParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // If not logged in but got past middleware, redirect
    return notFound();
  }

  // Fetch real student
  const student = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  });

  if (!student) {
    return notFound();
  }

  const studentId = student.id;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      topicNodes: true,
    }
  });

  if (!subject) {
    return notFound();
  }

  // Fetch progress
  const progress = await prisma.studentProgress.findMany({
    where: {
      studentId: studentId,
      topicId: { in: subject.topicNodes.map((t: PrismaTopicNode) => t.id) }
    }
  });

  const resourceProgress = await prisma.studentResourceProgress.findMany({
    where: {
      studentId: studentId,
      resource: { subjectId: subject.id }
    }
  });

  const completedResourceIds = resourceProgress.filter((p: StudentResourceProgress) => p.isCompleted).map((p: StudentResourceProgress) => p.resourceId);

  const isNodeCompleted = (topicId: string) => {
    return progress.some((p: StudentProgress) => p.topicId === topicId && p.status === 'COMPLETED');
  };

  // Check if a node should be locked
  // A node is locked if it has a non-chapter parent that is NOT completed
  const isNodeLocked = (nodeId: string, parentId: string | null): boolean => {
    if (!parentId) return false; // Root node
    const parentNode = subject.topicNodes.find((t: PrismaTopicNode) => t.id === parentId);
    if (!parentNode) return false;
    
    // If parent is a chapter, the topic is unlocked if the chapter is unlocked. (Usually chapters have no parents or chain)
    if (parentNode.nodeType === 'chapter') {
      return isNodeLocked(parentNode.id, parentNode.parentId);
    }

    // Parent is a topic. Topics require COMPLETION to unlock children.
    if (!isNodeCompleted(parentId)) {
      return true;
    }

    // Recursively check ancestors
    return isNodeLocked(parentNode.id, parentNode.parentId);
  };

  // Transform Prisma nodes into React Flow Nodes
  const initialNodes: Node[] = subject.topicNodes.map((tn: PrismaTopicNode) => {
    const type = tn.nodeType === 'chapter' ? 'chapter' : 'topic';
    
    let data;
    if (type === 'chapter') {
      const chapterData: ChapterNodeData = {
        title: tn.title,
      };
      data = chapterData;
    } else {
      const locked = isNodeLocked(tn.id, tn.parentId);
      const isComplete = isNodeCompleted(tn.id);
      
      const topicData: TopicNodeData = {
        title: tn.title,
        description: tn.description || undefined,
        isLocked: locked,
        status: isComplete ? 'COMPLETED' : locked ? 'NOT_STARTED' : 'IN_PROGRESS'
      };
      data = topicData;
    }

    return {
      id: tn.id,
      type: type,
      position: { x: tn.positionX, y: tn.positionY },
      data,
    };
  });

  // Reconstruct edges from parentId relationships
  const initialEdges: Edge[] = subject.topicNodes
    .filter((tn: PrismaTopicNode) => tn.parentId)
    .map((tn: PrismaTopicNode) => ({
      id: `e-${tn.parentId}-${tn.id}`,
      source: tn.parentId as string,
      target: tn.id,
      type: 'default',
      animated: true, 
    }));

  return (
    <StudentMindmapClient
      subjectId={subject.id}
      subjectName={subject.name}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      studentId={studentId}
      completedResourceIds={completedResourceIds}
    />
  );
}
