import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Node, Edge } from '@xyflow/react';
import { MindmapClient } from './mindmap-client';
import { TopicNodeData } from '@/components/canvas/topic-node';
import { ChapterNodeData } from '@/components/canvas/chapter-node';

// DB-backed page: never prerender at build time
export const dynamic = "force-dynamic";

export default async function TeacherSubjectMindmapPage({
  params
}: {
  params: Promise<{ subjectId: string }>
}) {
  const resolvedParams = await params;
  const { subjectId } = resolvedParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const me = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!me) redirect("/no-access");
  if (me.role !== "TEACHER" && me.role !== "ADMIN") notFound();

  // findUnique on the id alone would hand any signed-in user another tenant's
  // curriculum by editing the URL; the institution is part of the key.
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId: me.institutionId },
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
