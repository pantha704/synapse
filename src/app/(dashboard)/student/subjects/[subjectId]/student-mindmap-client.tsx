'use client';

import { toast } from "sonner";
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

  const handleUploadResource = async (
    _topicId: string,
    _title: string,
    _type: 'PDF' | 'VIDEO' | 'LINK',
    _url: string
  ) => {
    throw new Error('Students cannot upload resources');
  };

  const handleMarkComplete = async (resourceId: string) => {
    if (!panelState.topicId) return;
    try {
      await markResourceCompleteAction(resourceId, panelState.topicId, subjectId);
      toast.success("Marked complete");
    } catch (error) {
      // the action throws on an expired session or a resource removed meanwhile;
      // an unhandled rejection made the click look ignored
      toast.error(error instanceof Error ? error.message : "Could not save that");
    }
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
          uploadResource={handleUploadResource}
          markResourceComplete={handleMarkComplete}
          completedResourceIds={completedResourceIds}
        />
      </div>
    </div>
  );
}
