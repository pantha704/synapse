"use client";

import { LearningPath } from "@/components/path/LearningPath";
import { StatsPanel } from "@/components/stats/StatsPanel";
import { AnnouncementsPanel } from "@/components/announcements/announcements-panel";
import { AssignmentsPanel } from "@/components/assignments/assignments-panel";
import type { AnnouncementItem, AssignmentItem, BatchPulse, CriticalNode, LearningNode } from "@/lib/path-types";

interface Props {
  nodes: LearningNode[];
  batchPulse: BatchPulse;
  criticalNodes: CriticalNode[];
  announcements: AnnouncementItem[];
  assignments: AssignmentItem[];
  batchId: string | null;
}

export function TeacherPathView({ nodes, batchPulse, criticalNodes, announcements, assignments, batchId }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-white/[0.06] px-6 py-4 lg:px-8">
        <h1 className="text-2xl font-semibold text-white">Learning path</h1>
        <p className="mt-0.5 text-sm text-white/60">
          Where the batch is, topic by topic.
        </p>
      </header>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        {nodes.length > 0 ? (
          <LearningPath nodes={nodes} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="max-w-sm text-center space-y-2">
              <h2 className="text-lg font-semibold text-white">No batch assigned yet</h2>
              <p className="text-sm text-white/65">
                Create a batch and attach a subject with topics, then this path fills in automatically.
              </p>
            </div>
          </div>
        )}
        <StatsPanel batchPulse={batchPulse} criticalNodes={criticalNodes}>
          <AnnouncementsPanel items={announcements} canPost batchId={batchId} dark />
          <AssignmentsPanel items={assignments} canSubmit={false} dark />
        </StatsPanel>
      </main>
    </div>
  );
}
