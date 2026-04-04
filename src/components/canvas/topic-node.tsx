import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { BookOpen, Lock, CheckCircle2, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TopicNodeData = {
  title: string;
  description?: string;
  isLocked: boolean;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  isReadOnly?: boolean;
};

export type TopicNodeType = Node<TopicNodeData, 'topic'>;

export function TopicNode({ data, selected }: NodeProps<TopicNodeType>) {
  const isCompleted = data.status === 'COMPLETED';
  const isInProgress = data.status === 'IN_PROGRESS';

  return (
    <>
      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn("w-3 h-3 border-2 border-background", isCompleted ? "bg-emerald-500" : "bg-primary")}
        isConnectable={!data.isReadOnly}
      />
      <Card 
        className={cn(
          "w-64 border-2 transition-all shadow-sm",
          selected ? "ring-2 ring-primary ring-offset-2" : "",
          data.isLocked ? "bg-muted/50 border-dashed border-border" : 
          isCompleted ? "bg-emerald-500/10 border-emerald-500" :
          isInProgress ? "bg-amber-500/10 border-amber-500" :
          "bg-card border-border"
        )}
      >
        <div className="p-4 flex items-start gap-4">
          <div className={cn(
            "p-2 rounded-md",
            data.isLocked ? "bg-muted text-muted-foreground" : 
            isCompleted ? "bg-emerald-500/20 text-emerald-600" :
            isInProgress ? "bg-amber-500/20 text-amber-600" :
            "bg-primary/10 text-primary"
          )}>
            {data.isLocked ? (
              <Lock className="w-5 h-5" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isInProgress ? (
              <PlayCircle className="w-5 h-5" />
            ) : (
              <BookOpen className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold text-sm line-clamp-2",
              data.isLocked ? "text-muted-foreground" : 
              isCompleted ? "text-emerald-700" :
              isInProgress ? "text-amber-700" :
              "text-foreground"
            )}>
              {data.title}
            </h3>
            {data.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {data.description}
              </p>
            )}
            
            {data.status && !data.isLocked && (
              <p className={cn(
                "text-[10px] uppercase tracking-wider font-bold mt-2",
                isCompleted ? "text-emerald-600" :
                isInProgress ? "text-amber-600" :
                "text-muted-foreground"
              )}>
                {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Available'}
              </p>
            )}
          </div>
        </div>
      </Card>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={cn("w-3 h-3 border-2 border-background", isCompleted ? "bg-emerald-500" : "bg-primary")}
        isConnectable={!data.isReadOnly}
      />
    </>
  );
}
