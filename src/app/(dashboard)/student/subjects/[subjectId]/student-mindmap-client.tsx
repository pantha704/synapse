'use client';

import { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { MindmapCanvas } from '@/components/canvas/mindmap-canvas';
import { TopicSidePanel } from '@/components/canvas/topic-side-panel';
import { fetchTopicResourcesAction, markResourceCompleteAction } from '@/app/actions/topic-actions';

export function StudentMindmapClient({
  subjectId,
  subjectName,
  initialNodes,
  initialEdges,
  studentId,
  completedResourceIds,
}: {
  subjectId: string;
  subjectName: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  studentId: string;
  completedResourceIds: string[];
}) {
  const [panelState, setPanelState] = useState({
    isOpen: false,
    topicId: null as string | null,
    topicTitle: null as string | null,
  });

  const handleNodeSelect = (nodeId: string, nodeTitle: string) => {
    setPanelState({
      isOpen: true,
      topicId: nodeId,
      topicTitle: nodeTitle,
    });
  };

  const handleFetchResources = async (topicId: string) => {
    return await fetchTopicResourcesAction(topicId);
  };

  const handleUploadResource = async () => {
    throw new Error('Students cannot upload resources');
  };

  const handleMarkComplete = async (resourceId: string) => {
    if (!panelState.topicId) return;
    await markResourceCompleteAction(studentId, resourceId, panelState.topicId, subjectId);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative">
      <div className="px-6 py-4 border-b bg-card z-10 relative">
        <h1 className="text-2xl font-bold">{subjectName}</h1>
        <p className="text-sm text-muted-foreground">
          Your learning journey through {subjectName}.
        </p>
      </div>
      
      <div className="flex-1 w-full bg-muted/10 relative">
        <MindmapCanvas 
          initialNodes={initialNodes} 
          initialEdges={initialEdges} 
          readOnly={true}
          onNodeSelect={handleNodeSelect}
        />
        
        <TopicSidePanel
          topicId={panelState.topicId}
          topicTitle={panelState.topicTitle}
          isOpen={panelState.isOpen}
          onClose={() => setPanelState(prev => ({ ...prev, isOpen: false }))}
          readOnly={true}
          fetchResources={handleFetchResources}
          uploadResource={handleUploadResource as any}
          markResourceComplete={handleMarkComplete}
          completedResourceIds={completedResourceIds}
        />
      </div>
    </div>
  );
}
