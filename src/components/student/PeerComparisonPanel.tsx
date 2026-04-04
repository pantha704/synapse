"use client";

import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import type { PeerComparison } from "@/data/mockData";

interface PeerComparisonPanelProps {
  peers: PeerComparison[];
  currentStudentId: string;
}

export function PeerComparisonPanel({ peers, currentStudentId }: PeerComparisonPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-indigo-500" />
          Class Rankings
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
          Weekly
        </span>
      </div>

      <div className="space-y-2">
        {peers.map((peer, index) => {
          const isCurrentUser = peer.studentId === currentStudentId;
          return (
            <motion.div
              key={peer.studentId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrentUser
                  ? "bg-indigo-50 border border-indigo-200"
                  : "bg-gray-50/50 hover:bg-gray-50"
              }`}
            >
              {/* Rank */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                peer.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                peer.rank === 2 ? "bg-gray-200 text-gray-600" :
                peer.rank === 3 ? "bg-amber-100 text-amber-700" :
                "bg-white text-gray-500"
              }`}>
                {peer.rank}
              </div>

              {/* Avatar */}
              <img
                src={peer.avatar}
                alt={peer.studentName}
                className="w-8 h-8 rounded-full"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${
                  isCurrentUser ? "text-indigo-900" : "text-gray-900"
                }`}>
                  {peer.studentName}
                  {isCurrentUser && <span className="ml-1 text-[10px] text-indigo-500">(You)</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                      style={{ width: `${peer.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{peer.progress}%</span>
                </div>
              </div>

              {/* Weekly Change */}
              <div className="flex items-center gap-0.5">
                {peer.weeklyChange > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : peer.weeklyChange < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-gray-400" />
                )}
                {peer.weeklyChange !== 0 && (
                  <span className={`text-[10px] font-medium ${
                    peer.weeklyChange > 0 ? "text-emerald-500" : "text-red-400"
                  }`}>
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
