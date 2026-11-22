"use client";

import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import type { PeerComparison } from "@/lib/path-types";

interface PeerComparisonPanelProps {
  peers: PeerComparison[];
  currentStudentId: string;
}

const medalColors = [
  "from-yellow-400 to-amber-500",
  "from-gray-300 to-gray-400",
  "from-amber-600 to-amber-700",
];

export function PeerComparisonPanel({ peers, currentStudentId }: PeerComparisonPanelProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[hsl(220,15%,10%)]/60 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-indigo-500" />
          Class Rankings
        </h3>
        <span className="text-[9px] uppercase tracking-wider text-violet-200 font-semibold bg-violet-500/15 px-2 py-0.5 rounded-full">
          Weekly
        </span>
      </div>

      <div className="space-y-1.5">
        {peers.map((peer, index) => {
          const isCurrentUser = peer.studentId === currentStudentId;
          const medalColor = index < 3 ? medalColors[index] : "";

          return (
            <motion.div
              key={peer.studentId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all ${
                isCurrentUser
                  ? "bg-violet-500/15 ring-1 ring-violet-400/30"
                  : "bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              {/* Rank Badge */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                index < 3
                  ? `bg-gradient-to-br ${medalColor} text-white shadow-sm`
                  : "bg-white/[0.06] text-white/60 border border-white/10"
              }`}>
                {peer.rank}
              </div>

              {/* Avatar */}
              <InitialsAvatar name={peer.studentName} seed={peer.studentId} className="size-7" textClassName="text-[10px]" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-semibold truncate ${isCurrentUser ? "text-violet-200" : "text-white"}`}>
                  {peer.studentName}
                  {isCurrentUser && <span className="ml-1 text-[8px] text-violet-300 font-medium">(You)</span>}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full"
                      style={{ width: `${peer.progress}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-white/55 font-medium w-7 text-right">{peer.progress}%</span>
                </div>
              </div>

              {/* Weekly Change */}
              <div className="flex items-center gap-0.5 shrink-0">
                {peer.weeklyChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : peer.weeklyChange < 0 ? (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                ) : (
                  <Minus className="w-3 h-3 text-white/30" />
                )}
                {peer.weeklyChange !== 0 && (
                  <span className={`text-[9px] font-semibold ${peer.weeklyChange > 0 ? "text-emerald-500" : "text-red-400"}`}>
                    {peer.weeklyChange > 0 ? "+" : ""}{peer.weeklyChange}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
