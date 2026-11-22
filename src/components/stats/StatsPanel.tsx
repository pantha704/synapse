"use client";

import { AlertTriangle, Info, Users } from "lucide-react";
import type { CriticalNode } from "@/lib/path-types";

interface BatchPulseProps {
  activity: number;
  change: string;
  period: string;
  weeklyData: number[];
}

function BatchPulse({ activity, change, period, weeklyData }: BatchPulseProps) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-widest text-white/60 mb-4 font-medium">
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
        <p className="text-[10px] text-white/60 mt-4 leading-relaxed">
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
      <h4 className="text-[10px] uppercase tracking-widest text-white/60 mb-4 font-medium">
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
              <p className="text-[10px] text-white/60">{node.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


interface StatsPanelProps {
  batchPulse: BatchPulseProps;
  criticalNodes: CriticalNode[];
  children?: React.ReactNode;
}

export function StatsPanel({ batchPulse: pulse, criticalNodes: nodes, children }: StatsPanelProps) {
  return (
    <aside className="w-80 bg-white/[0.04] border-l border-white/[0.06] p-6 overflow-y-auto">
      <div className="space-y-8">
        {children}
        <BatchPulse {...pulse} />
        <CriticalNodes nodes={nodes} />
      </div>
    </aside>
  );
}
