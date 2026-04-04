"use client";

import { CheckCircle2, Lock, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";
import type { LearningNode } from "@/data/mockData";

interface LearningPathNodeProps {
  node: LearningNode;
  index: number;
}

export function LearningPathNode({ node, index }: LearningPathNodeProps) {
  const positionClasses = {
    center: "self-center",
    left: "self-start ml-24",
    right: "self-end mr-24",
  };

  const statusConfig = {
    completed: {
      borderColor: "border-emerald-500",
      glowColor: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      iconColor: "text-emerald-500",
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-400",
      badgeBorder: "border-emerald-500/20",
      Icon: CheckCircle2,
    },
    "in-progress": {
      borderColor: "border-violet-500/50",
      glowColor: "shadow-[0_0_40px_rgba(139,92,246,0.4)]",
      iconColor: "text-violet-400",
      badgeBg: "bg-violet-500/20",
      badgeText: "text-violet-300",
      badgeBorder: "border-violet-500/30",
      Icon: BrainCircuit,
    },
    locked: {
      borderColor: "border-white/10",
      glowColor: "",
      iconColor: "text-white/30",
      badgeBg: "bg-white/5",
      badgeText: "text-white/40",
      badgeBorder: "border-white/10",
      Icon: Lock,
    },
  };

  const config = statusConfig[node.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
      className={`relative z-10 flex flex-col items-center mb-80 ${positionClasses[node.position]}`}
    >
      <div className={`group cursor-pointer ${node.status === "locked" ? "opacity-50 grayscale" : ""}`}>
        {/* Node Circle */}
        <div className="relative">
          {node.status === "in-progress" && node.progress !== undefined && (
            <svg className="absolute -inset-2 w-28 h-28 -rotate-90">
              <circle
                className="text-white/10"
                cx="56"
                cy="56"
                fill="transparent"
                r="50"
                stroke="currentColor"
                strokeWidth="4"
              />
              <circle
                className="text-violet-500"
                cx="56"
                cy="56"
                fill="transparent"
                r="50"
                stroke="currentColor"
                strokeDasharray="314.159"
                strokeDashoffset={314.159 - (314.159 * node.progress) / 100}
                strokeWidth="4"
              />
            </svg>
          )}

          <div
            className={`w-24 h-24 rounded-full bg-white/[0.06] flex items-center justify-center border-4 ${config.borderColor} ${config.glowColor} hover:scale-110 transition-transform duration-300`}
          >
            <config.Icon className={`w-10 h-10 ${config.iconColor}`} />
          </div>
        </div>

        {/* Label */}
        <div className="mt-6 text-center">
          <div
            className={`${config.badgeBg} ${config.badgeText} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-2 border ${config.badgeBorder}`}
          >
            {node.status === "in-progress" ? "In Progress" : node.status === "completed" ? "Completed" : "Locked"}
          </div>
          <h3 className="font-headline text-xl font-bold text-white">{node.title}</h3>
          <p className="text-xs text-white/40 mt-1">{node.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface LearningPathProps {
  nodes: LearningNode[];
}

export function LearningPath({ nodes }: LearningPathProps) {
  return (
    <section className="flex-1 relative overflow-y-auto py-20 px-12" style={{ background: "radial-gradient(circle at 50% 50%, #1c1b1b 0%, #0e0e0e 100%)" }}>
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
        {/* SVG S-Curve Path */}
        <svg className="absolute top-0 w-full h-[1500px] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 1500">
          <defs>
            <linearGradient id="pathGradient" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#d0bcff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ddb7ff" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d="M 200 0 C 400 300, 0 500, 200 800 C 400 1100, 0 1300, 200 1500"
            fill="none"
            stroke="url(#pathGradient)"
            strokeLinecap="round"
            strokeWidth="12"
            style={{ filter: "drop-shadow(0 0 15px rgba(208, 188, 255, 0.4))" }}
          />
        </svg>

        {/* Nodes */}
        {nodes.map((node, index) => (
          <LearningPathNode key={node.id} node={node} index={index} />
        ))}
      </div>
    </section>
  );
}
