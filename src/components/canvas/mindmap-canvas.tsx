'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TopicNode } from './topic-node';
import { ChapterNode } from './chapter-node';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const nodeTypes: NodeTypes = {
  topic: TopicNode,
  chapter: ChapterNode,
};

interface MindmapCanvasProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  readOnly?: boolean;
  onSave?: (nodes: Node[], edges: Edge[]) => Promise<void>;
  
  // Handlers for side panel (can be injected from pages to keep canvas generic)
  onNodeSelect?: (nodeId: string, nodeTitle: string) => void;
}

export function MindmapCanvas({
  initialNodes,
  initialEdges,
  readOnly = false,
  onSave,
  onNodeSelect,
}: MindmapCanvasProps) {
  // We make sure to spread readOnly into the node data so nodes know if they should be connectable
  const mappedInitialNodes = initialNodes.map(node => ({
    ...node,
    data: { ...node.data, isReadOnly: readOnly },
    draggable: !readOnly,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(mappedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      if (readOnly) return;
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, readOnly]
  );

  const handleSave = async () => {
    if (!onSave || readOnly) return;
    
    setIsSaving(true);
    try {
      await onSave(nodes, edges);
      toast.success('Layout saved successfully');
    } catch (e) {
      toast.error('Failed to save layout');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Don't open side panel if it's a chapter node
      if (node.type === 'chapter') return;
      
      if (onNodeSelect) {
        onNodeSelect(node.id, (node.data as any).title || 'Unknown Topic');
      }
    },
    [onNodeSelect]
  );

  return (
    <div className="w-full h-full relative border rounded-lg overflow-hidden bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        panOnDrag={true}
        zoomOnScroll={true}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        className="touch-none"
      >
        <Controls />
        <MiniMap zoomable pannable className="border rounded-md shadow-sm" />
        <Background gap={12} size={1} />
      </ReactFlow>

      {!readOnly && onSave && (
        <div className="absolute top-4 right-4 z-10">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="shadow-md"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Layout
          </Button>
        </div>
      )}
    </div>
  );
}
