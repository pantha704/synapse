import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Node, Edge } from '@xyflow/react';
import { MindmapClient } from './mindmap-client';
import { TopicNodeData } from '@/components/canvas/topic-node';
import { ChapterNodeData } from '@/components/canvas/chapter-node';

export default async function TeacherSubjectMindmapPage({
  params
}: {
  params: Promise<{ subjectId: string }>
}) {
  const resolvedParams = await params;
  const { subjectId } = resolvedParams;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      topicNodes: true,
    }
  });

  if (!subject) {
    return notFound();
  }

  // Transform Prisma nodes into React Flow Nodes
  const initialNodes: Node[] = subject.topicNodes.map(tn => {
    // Cast nodeType safely. Default to "topic"
    const type = tn.nodeType === 'chapter' ? 'chapter' : 'topic';
    
    let data;
    if (type === 'chapter') {
      const chapterData: ChapterNodeData = {
        title: tn.title,
      };
      data = chapterData;
    } else {
      const topicData: TopicNodeData = {
        title: tn.title,
        description: tn.description || undefined,
        isLocked: tn.isLocked,
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
    .filter(tn => tn.parentId)
    .map(tn => ({
      id: `e-${tn.parentId}-${tn.id}`,
      source: tn.parentId as string,
      target: tn.id,
      type: 'default', // basic React Flow edge type
      animated: false,
    }));

  return (
    <MindmapClient 
      subjectId={subject.id}
      subjectName={subject.name}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
    />
  );
}
