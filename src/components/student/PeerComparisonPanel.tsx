"use client";

import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import type { PeerComparison } from "@/data/mockData";

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
    <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-indigo-500" />
          Class Rankings
        </h3>
        <span className="text-[9px] uppercase tracking-wider text-indigo-500 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
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
                  ? "bg-indigo-50/80 ring-1 ring-indigo-200"
                  : "bg-gray-50/60 hover:bg-gray-50"
              }`}
            >
              {/* Rank Badge */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                index < 3
                  ? `bg-gradient-to-br ${medalColor} text-white shadow-sm`
                  : "bg-white text-gray-500 border border-gray-200"
              }`}>
                {peer.rank}
              </div>

              {/* Avatar */}
              <img src={peer.avatar} alt={peer.studentName} className="w-7 h-7 rounded-full shrink-0" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-semibold truncate ${isCurrentUser ? "text-indigo-900" : "text-gray-900"}`}>
                  {peer.studentName}
                  {isCurrentUser && <span className="ml-1 text-[8px] text-indigo-400 font-medium">(You)</span>}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${peer.progress}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium w-7 text-right">{peer.progress}%</span>
                </div>
              </div>

              {/* Weekly Change */}
              <div className="flex items-center gap-0.5 shrink-0">
                {peer.weeklyChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : peer.weeklyChange < 0 ? (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                ) : (
                  <Minus className="w-3 h-3 text-gray-300" />
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
