"use client";

import { LearningPath } from "@/components/path/LearningPath";
import { StatsPanel } from "@/components/stats/StatsPanel";
import { AnnouncementsPanel } from "@/components/announcements/announcements-panel";
import type { AnnouncementItem, BatchPulse, CriticalNode, LearningNode } from "@/lib/path-types";

interface Props {
  nodes: LearningNode[];
  batchPulse: BatchPulse;
  criticalNodes: CriticalNode[];
  announcements: AnnouncementItem[];
  batchId: string | null;
}

export function TeacherPathView({ nodes, batchPulse, criticalNodes, announcements, batchId }: Props) {
  return (
    <div className="min-h-screen bg-[#0e0e0e]">

      <main className="h-[calc(100vh-4rem)] overflow-hidden flex">
        {nodes.length > 0 ? (
          <LearningPath nodes={nodes} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="max-w-sm text-center space-y-2">
              <h2 className="text-lg font-semibold text-white">No batch assigned yet</h2>
              <p className="text-sm text-white/50">
                Create a batch and attach a subject with topics, then this path fills in automatically.
              </p>
            </div>
          </div>
        )}
        <StatsPanel batchPulse={batchPulse} criticalNodes={criticalNodes}>
          <AnnouncementsPanel items={announcements} canPost batchId={batchId} dark />
        </StatsPanel>
      </main>
    </div>
  );
}
