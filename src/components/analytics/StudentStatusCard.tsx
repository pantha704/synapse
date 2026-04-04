"use client";

import type { StudentEngagement, EngagementStatus } from "@/app/actions/engagement-actions";
import { TrendingUp, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

const statusConfig: Record<EngagementStatus, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  progressing: {
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
    label: "Progressing"
  },
  stuck: {
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: AlertTriangle,
    label: "Stuck"
  },
  inactive: {
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
    icon: Clock,
    label: "Inactive"
  }
};

interface StudentStatusCardProps {
  student: StudentEngagement;
}

export function StudentStatusCard({ student }: StudentStatusCardProps) {
  const config = statusConfig[student.status];
  const Icon = config.icon;

  const timeAgo = student.lastActive
    ? getTimeAgo(student.lastActive)
    : "Never";

  return (
    <div className={`rounded-xl border p-4 ${config.bg} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.email}`}
            alt={student.studentName || "Student"}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{student.studentName || "Anonymous"}</h4>
            <p className="text-[10px] text-gray-500">{student.email}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${config.color} bg-white/80`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{student.progressPercent}%</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Progress</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{student.topicsCompleted}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Topics</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{student.eventCount7d}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Events (7d)</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200/50">
        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last active: {timeAgo}
        </p>
      </div>
    </div>
  );
}

interface EngagementSummaryProps {
  total: number;
  progressing: number;
  stuck: number;
  inactive: number;
  avgProgress: number;
}

export function EngagementSummary({ total, progressing, stuck, inactive, avgProgress }: EngagementSummaryProps) {
  const stats = [
    { label: "Progressing", value: progressing, color: "bg-emerald-500", pct: total ? Math.round((progressing / total) * 100) : 0 },
    { label: "Stuck", value: stuck, color: "bg-amber-500", pct: total ? Math.round((stuck / total) * 100) : 0 },
    { label: "Inactive", value: inactive, color: "bg-red-500", pct: total ? Math.round((inactive / total) * 100) : 0 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Class Engagement</h3>
        <div className="flex items-center gap-1.5 text-emerald-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-bold">{avgProgress}% avg</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-4">
        {stats.map(s => (
          <div
            key={s.label}
            className={`${s.color} transition-all`}
            style={{ width: `${s.pct}%` }}
            title={`${s.label}: ${s.value} (${s.pct}%)`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {stats.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            <span className="text-xs text-gray-600">{s.label}</span>
            <span className="text-xs font-bold text-gray-900">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
