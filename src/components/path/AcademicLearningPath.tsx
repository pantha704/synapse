"use client";

import { CheckCircle2, BookOpen, Clock, Lock } from "lucide-react";
import { motion } from "framer-motion";
import type { LearningNode } from "@/lib/path-types";

interface AcademicPathNodeProps {
  node: LearningNode;
  index: number;
}

export function AcademicPathNode({ node, index }: AcademicPathNodeProps) {
  const positionClasses = {
    center: "self-center",
    left: "self-start ml-40",
    right: "self-end mr-40",
  };

  const statusConfig = {
    completed: {
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-900",
      Icon: CheckCircle2,
    },
    "in-progress": {
      bgColor: "bg-white/[0.04]",
      borderColor: "border-indigo-200",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      titleColor: "text-indigo-900",
      Icon: BookOpen,
    },
    upcoming: {
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      titleColor: "text-amber-900",
      Icon: Clock,
    },
    locked: {
      bgColor: "bg-white/[0.02]",
      borderColor: "border-white/10",
      iconBg: "bg-gray-200",
      iconColor: "text-white/40",
      titleColor: "text-white/60",
      Icon: Lock,
    },
  };

  const config = statusConfig[node.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
      className={`relative z-10 flex flex-col items-center mb-80 ${positionClasses[node.position]}`}
    >
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
        className={`w-72 ${config.bgColor} rounded-xl border-2 ${config.borderColor} p-5 cursor-pointer transition-shadow`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
            <config.Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold ${config.titleColor} leading-tight`}>{node.title}</h3>
            <p className="text-[11px] text-white/60 mt-1">{node.description}</p>
          </div>
        </div>

        {node.status === "in-progress" && node.progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-medium text-white/55 uppercase tracking-wider">Progress</span>
              <span className="text-[10px] font-bold text-indigo-600">{node.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${node.progress}%` }}
                transition={{ delay: 0.3 + index * 0.15, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

interface AcademicLearningPathProps {
  nodes: LearningNode[];
  title?: string;
}

export function AcademicLearningPath({ nodes, title }: AcademicLearningPathProps) {
  // these were the literals "Computer Science 101", "3 modules", "65% complete"
  // on every student's path, whatever subject they had actually opened
  const completed = nodes.filter((n) => n.status === "completed").length;
  const percent = nodes.length ? Math.round((completed / nodes.length) * 100) : 0;

  return (
    <section className="flex-1 relative overflow-y-auto py-16 px-12" style={{
      backgroundImage: "radial-gradient(circle at 1px 1px rgba(255,255,255,0.06) 1px, transparent 0)",
      backgroundSize: "20px 20px",
    }}>
      {/* Top Course Header */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-violet-300 font-semibold">{title ?? "Your course"}</p>
          <h2 className="text-xl font-bold text-white mt-1">Learning Path</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">{nodes.length} topic{nodes.length === 1 ? "" : "s"}</span>
          <span className="text-white/25">•</span>
          <span className="text-xs text-white/60">{percent}% complete</span>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
        {/* SVG S-Curve Path — thicker dashed gradient */}
        <svg className="absolute top-0 w-full h-[1600px] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 1600">
          <defs>
            <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M 200 0 C 420 300, -20 520, 200 820 C 420 1120, -20 1350, 200 1600"
            fill="none"
            stroke="url(#pathGrad)"
            strokeWidth="6"
            strokeDasharray="12 8"
            strokeLinecap="round"
          />
        </svg>

        {nodes.map((node, index) => (
          <AcademicPathNode key={node.id} node={node} index={index} />
        ))}
      </div>
    </section>
  );
}
