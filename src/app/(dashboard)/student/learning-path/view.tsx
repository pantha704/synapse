"use client";

import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { AcademicLearningPath } from "@/components/path/AcademicLearningPath";
import { PeerComparisonPanel } from "@/components/student/PeerComparisonPanel";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, Download, Send } from "lucide-react";
import { AnnouncementsPanel } from "@/components/announcements/announcements-panel";
import { AssignmentsPanel } from "@/components/assignments/assignments-panel";
import type { AnnouncementItem, AssignmentItem, LearningNode, PeerComparison, StudentStats } from "@/lib/path-types";

const activityIcons: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  downloaded: Download,
  submitted: Send,
};

interface Props {
  nodes: LearningNode[];
  stats: StudentStats;
  peers: PeerComparison[];
  currentStudentId: string;
  announcements: AnnouncementItem[];
  assignments: AssignmentItem[];
  batchId: string | null;
}

export function StudentPathView({ nodes, stats, peers, currentStudentId, announcements, assignments, batchId }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">

      <main className="flex min-h-0 flex-1 overflow-hidden">
        {nodes.length > 0 ? (
          <AcademicLearningPath nodes={nodes} title={stats.title} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="max-w-sm text-center space-y-2">
              <h2 className="text-lg font-semibold text-white">No curriculum yet</h2>
              <p className="text-sm text-white/60">
                You are not enrolled in a batch with published topics. Ask your teacher for the join code.
              </p>
            </div>
          </div>
        )}

        <aside className="w-80 bg-[hsl(220,15%,10%)]/60 border-l border-white/[0.06] p-5 overflow-y-auto space-y-5">
          <div className="text-center pb-4 border-b border-white/[0.06]">
            <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2 border-2 border-violet-400/40">
              <InitialsAvatar name={stats.name} seed={stats.name} className="size-full" textClassName="text-lg" />
            </div>
            <h3 className="text-sm font-bold text-white">{stats.name}</h3>
            <p className="text-xs text-white/60">{stats.title}</p>
          </div>

          <div className="bg-white/[0.04] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-white">Activity</h4>
              <span className="text-[9px] uppercase tracking-wider text-violet-300 font-semibold bg-violet-500/15 px-2 py-0.5 rounded-full">Weekly</span>
            </div>
            <div className="flex gap-1.5 h-14 items-end mb-2">
              {stats.weeklyPerformance.map((value, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full bg-gradient-to-t from-violet-500 to-indigo-400 rounded-t transition-all" style={{ height: `${Math.max(value, 2)}%` }} />
                  <span className="text-[8px] text-white/55">{stats.weeklyLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white mb-3">Recent Activity</h4>
            {stats.recentActivity.length === 0 ? (
              <p className="text-[11px] text-white/55">Nothing logged yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/10" />
                <div className="space-y-3">
                  {stats.recentActivity.map((activity) => {
                    const Icon = activityIcons[activity.type] || CheckCircle2;
                    return (
                      <div key={activity.id} className="flex items-start gap-2.5 relative">
                        <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center mt-0.5 shrink-0 z-10 ring-4 ring-[hsl(220,15%,10%)]">
                          <Icon className="w-2.5 h-2.5 text-violet-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] text-white/85 leading-snug">{activity.title}</p>
                          <p className="text-[9px] text-white/55 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-wider opacity-80">Level {stats.level}</p>
                <p className="text-sm font-bold">{stats.xp} XP</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider opacity-80">Next level</p>
                <p className="text-sm font-bold">{100 - (stats.xp % 100)} XP</p>
              </div>
            </div>
            {stats.badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {stats.badges.map((b) => (
                  <span key={b} className="rounded-full bg-white/20 px-2 py-0.5 text-[9px]">{b}</span>
                ))}
              </div>
            )}
          </div>

          <AnnouncementsPanel items={announcements} canPost={false} batchId={batchId} dark />

          <AssignmentsPanel items={assignments} canSubmit dark />

          {peers.length > 0 && <PeerComparisonPanel peers={peers} currentStudentId={currentStudentId} />}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">Your progress</span>
            </div>
            <h4 className="text-sm font-bold">
              {nodes.filter((n) => n.status === "completed").length} of {nodes.length} topics done
            </h4>
            <p className="text-[11px] opacity-80 mt-1">Every completed node unlocks the next part of the path.</p>
          </motion.div>
        </aside>
      </main>
    </div>
  );
}
