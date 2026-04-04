"use client";

import { Check, BookOpen, Lock } from "lucide-react";
import { motion } from "framer-motion";
import type { LearningNode } from "@/data/mockData";

interface AcademicPathNodeProps {
  node: LearningNode;
  index: number;
}

const iconMap: Record<string, typeof Check> = {
  check: Check,
  book: BookOpen,
  lock: Lock,
};

export function AcademicPathNode({ node, index }: AcademicPathNodeProps) {
  const positionClasses = {
    center: "self-center",
    left: "self-start ml-32",
    right: "self-end mr-32",
  };

  const statusConfig = {
    completed: {
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-600",
      Icon: Check,
    },
    "in-progress": {
      bgColor: "bg-white",
      borderColor: "border-indigo-200 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]",
      textColor: "text-indigo-900",
      badgeBg: "bg-indigo-100",
      badgeText: "text-indigo-600",
      Icon: BookOpen,
    },
    locked: {
      bgColor: "bg-gray-100",
      borderColor: "border-gray-200 opacity-60",
      textColor: "text-gray-500",
      badgeBg: "bg-gray-200",
      badgeText: "text-gray-500",
      Icon: Lock,
    },
  };

  const config = statusConfig[node.status];
  const Icon = iconMap[node.icon] || BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
      className={`relative z-10 flex flex-col items-center mb-72 ${positionClasses[node.position]}`}
    >
      {/* Node Card */}
      <div className={`w-64 ${config.bgColor} rounded-xl border-2 ${config.borderColor} p-4 cursor-pointer hover:scale-105 transition-transform`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            node.status === "completed" ? "bg-emerald-100" :
            node.status === "in-progress" ? "bg-indigo-100" : "bg-gray-200"
          }`}>
            <Icon className={`w-5 h-5 ${config.textColor}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-bold ${config.textColor}`}>{node.title}</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">{node.description}</p>
          </div>
        </div>

        {/* Progress Bar (in-progress only) */}
        {node.status === "in-progress" && node.progress !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                style={{ width: `${node.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface AcademicLearningPathProps {
  nodes: LearningNode[];
}

export function AcademicLearningPath({ nodes }: AcademicLearningPathProps) {
  return (
    <section className="flex-1 relative overflow-y-auto py-16 px-12 bg-[#fafafa]" style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)`,
      backgroundSize: "24px 24px",
    }}>
      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
        {/* SVG Dotted S-Curve Path */}
        <svg className="absolute top-0 w-full h-[1400px] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 1400">
          <path
            d="M 200 0 C 400 280, 0 480, 200 750 C 400 1020, 0 1200, 200 1400"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
            strokeDasharray="8 8"
            strokeLinecap="round"
          />
        </svg>

        {/* Nodes */}
        {nodes.map((node, index) => (
          <AcademicPathNode key={node.id} node={node} index={index} />
        ))}
      </div>
    </section>
  );
}
