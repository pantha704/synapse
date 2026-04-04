import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChapterNodeData = {
  title: string;
  isReadOnly?: boolean;
};

export type ChapterNodeType = Node<ChapterNodeData, 'chapter'>;

export function ChapterNode({ data, selected }: NodeProps<ChapterNodeType>) {
  return (
    <>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-primary border-2 border-background"
        isConnectable={!data.isReadOnly}
      />
      <Card 
        className={cn(
          "px-6 py-4 min-w-[200px] border-2 shadow-md transition-colors bg-secondary/30",
          selected ? "border-primary" : "border-secondary"
        )}
      >
        <div className="flex items-center gap-3 justify-center">
          <Layers className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-bold tracking-tight text-foreground uppercase">
            {data.title}
          </h2>
        </div>
      </Card>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-primary border-2 border-background"
        isConnectable={!data.isReadOnly}
      />
    </>
  );
}
