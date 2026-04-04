"use client";

import { AlertTriangle, Info, Users } from "lucide-react";
import type { CriticalNode } from "@/data/mockData";

interface BatchPulseProps {
  activity: number;
  change: string;
  period: string;
  weeklyData: number[];
}

function BatchPulse({ activity, change, period, weeklyData }: BatchPulseProps) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-4 font-medium">
        Batch Pulse
      </h4>
      <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
        <div className="flex justify-between items-end mb-4">
          <span className="text-3xl font-bold text-cyan-400">{activity}%</span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">
            {change} {period}
          </span>
        </div>
        <div className="flex gap-1 h-12 items-end">
          {weeklyData.map((value, i) => (
            <div
              key={i}
              className="flex-1 bg-cyan-400/40 rounded-t"
              style={{ height: `${value}%` }}
            />
          ))}
        </div>
        <p className="text-[10px] text-white/40 mt-4 leading-relaxed">
          System activity is peak. Class interaction levels are optimal for the current module.
        </p>
      </div>
    </div>
  );
}

interface CriticalNodesProps {
  nodes: CriticalNode[];
}

function CriticalNodes({ nodes }: CriticalNodesProps) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-4 font-medium">
        Critical Nodes
      </h4>
      <div className="space-y-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-3 rounded-xl border-l-4 flex items-start gap-3 ${
              node.severity === "warning"
                ? "bg-red-500/10 border-l-red-500"
                : "bg-white/[0.06] border-l-violet-500"
            }`}
          >
            {node.severity === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold text-white">{node.title}</p>
              <p className="text-[10px] text-white/40">{node.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngagementNebula() {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-4 font-medium">
        Engagement Nebula
      </h4>
      <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-900/40 to-cyan-900/20 border border-white/[0.06]">
        {/* Animated gradient orbs */}
        <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-violet-500/20 blur-xl" />
        <div className="absolute bottom-8 right-8 w-20 h-20 rounded-full bg-cyan-500/20 blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-violet-500/10 blur-2xl" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b] via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className="flex justify-center -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-[#1c1b1b] overflow-hidden"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${i}`}
                  alt={`Student ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-[#1c1b1b] bg-white/10 flex items-center justify-center text-[8px] font-bold text-violet-400">
              +42
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[10px] text-violet-400 font-black uppercase tracking-tighter">
              Live Session active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsPanelProps {
  batchPulse: BatchPulseProps;
  criticalNodes: CriticalNode[];
}

export function StatsPanel({ batchPulse: pulse, criticalNodes: nodes }: StatsPanelProps) {
  return (
    <aside className="w-80 bg-white/[0.04] border-l border-white/[0.06] p-6 overflow-y-auto">
      <div className="space-y-8">
        <BatchPulse {...pulse} />
        <CriticalNodes nodes={nodes} />
        <EngagementNebula />
      </div>
    </aside>
  );
}
