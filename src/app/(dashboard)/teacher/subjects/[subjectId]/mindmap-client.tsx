'use client';

import { Node, Edge } from '@xyflow/react';
import { MindmapCanvas } from '@/components/canvas/mindmap-canvas';
import { saveMindmapLayout } from './actions';

interface MindmapClientProps {
  subjectId: string;
  subjectName: string;
  initialNodes: Node[];
  initialEdges: Edge[];
}

export function MindmapClient({ subjectId, subjectName, initialNodes, initialEdges }: MindmapClientProps) {
  const handleSave = async (nodes: Node[], edges: Edge[]) => {
    await saveMindmapLayout(subjectId, nodes, edges);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b bg-card flex justify-between items-center z-10 relative">
        <div>
          <h1 className="text-2xl font-bold">{subjectName} Mindmap</h1>
          <p className="text-sm text-muted-foreground">
            Drag nodes to organize the curriculum. Click "Save Layout" when done.
          </p>
        </div>
      </div>
      
      <div className="flex-1 w-full bg-muted/20">
        <MindmapCanvas 
          initialNodes={initialNodes} 
          initialEdges={initialEdges} 
          onSave={handleSave} 
        />
      </div>
    </div>
  );
}
