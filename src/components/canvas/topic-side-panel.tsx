'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, File, Video, Link as LinkIcon, Download } from 'lucide-react';
import { uploadAndIngestResource } from '@/app/actions/resource-actions';
import { toast } from 'sonner';
import { Resource } from '@prisma/client';

export interface TopicSidePanelProps {
  topicId: string | null;
  topicTitle: string | null;
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  // External hooks to fetch/save resources
  fetchResources: (topicId: string) => Promise<Resource[]>;
  uploadResource: (topicId: string, title: string, type: 'PDF' | 'VIDEO' | 'LINK', url: string) => Promise<Resource>;
  markResourceComplete?: (resourceId: string) => Promise<void>;
  completedResourceIds?: string[];
}

export function TopicSidePanel({ 
  topicId, 
  topicTitle, 
  isOpen, 
  onClose, 
  readOnly = false,
  fetchResources,
  uploadResource,
  markResourceComplete,
  completedResourceIds = []
}: TopicSidePanelProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen || !topicId) return;
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      try {
        const resourceList = await fetchResources(topicId);
        if (!cancelled) setResources(resourceList);
      } catch {
        if (!cancelled) toast.error("Failed to load resources");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, topicId, fetchResources]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !topicId) return;
    
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const body = new FormData();
      body.set("topicId", topicId);
      body.set("file", file);

      const result = await uploadAndIngestResource(body);
      if (!result.ok) throw new Error(result.error);

      setResources(prev => [
        ...prev,
        {
          id: result.resource.id,
          title: result.resource.title,
          type: result.resource.type,
          url: result.resource.url,
          content: null,
          subjectId: "",
          topicId,
          createdAt: new Date(),
        } as Resource,
      ]);
      if (result.chunks > 0) {
        toast.success(`Uploaded and indexed ${result.chunks} chunks`);
      } else if (result.indexed === false && result.indexError) {
        toast.warning("Uploaded, but it could not be read for the assistant", {
          description: result.indexError.slice(0, 120),
        });
      } else if (result.indexed === false) {
        // a scanned PDF has no text layer: stored, but the tutor cannot cite it
        toast.warning("Uploaded, but no text was indexed — the assistant cannot use this file yet", {
          description: "Scanned pages need OCR before they can be searched.",
        });
      } else {
        toast.success("Resource uploaded");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <File className="w-5 h-5 text-red-500" />;
      case 'VIDEO': return <Video className="w-5 h-5 text-blue-500" />;
      default: return <LinkIcon className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{topicTitle}</SheetTitle>
          <SheetDescription>
            {readOnly ? 'View and complete the resources for this topic.' : 'Manage resources and content for this topic.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {!readOnly && (
            <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Upload a standard Resource</p>
              <p className="text-xs text-muted-foreground mb-4">PDF, Video, or Link</p>
              
              <div className="relative">
                <Button disabled={isUploading} variant="secondary">
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Browse Files
                </Button>
                <input 
                  type="file"
                  accept=".pdf" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg mb-4">Topic Materials</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : resources.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No resources attached yet.</p>
            ) : (
              <div className="space-y-3">
                {resources.map((res) => {
                  const isCompleted = completedResourceIds.includes(res.id);

                  return (
                    <div key={res.id} className="p-4 border rounded-lg flex items-center gap-4 bg-card hover:bg-muted/20 transition-colors">
                      {getIcon(res.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={res.title}>{res.title}</p>
                        <a href={res.url || '#'} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center mt-1">
                          <Download className="w-3 h-3 mr-1" /> View Material
                        </a>
                      </div>
                      
                      {readOnly && markResourceComplete && (
                        <Button 
                          variant={isCompleted ? "default" : "outline"} 
                          size="sm"
                          disabled={isCompleted}
                          onClick={() => markResourceComplete(res.id)}
                        >
                          {isCompleted ? 'Completed' : 'Mark Done'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
