"use client";

import { useState } from "react";
import { StudentStatusCard, EngagementSummary } from "@/components/analytics/StudentStatusCard";
import type { StudentEngagement, EngagementStatus } from "@/app/actions/engagement-actions";

type FilterStatus = "all" | EngagementStatus;

export function AnalyticsView({
  students,
  batchName,
}: {
  students: StudentEngagement[];
  batchName: string;
}) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<"status" | "progress" | "activity">("status");

  const summary = {
    total: students.length,
    progressing: students.filter((s) => s.status === "progressing").length,
    stuck: students.filter((s) => s.status === "stuck").length,
    inactive: students.filter((s) => s.status === "inactive").length,
    avgProgress: students.length
      ? Math.round(students.reduce((sum, s) => sum + s.progressPercent, 0) / students.length)
      : 0,
  };

  const filtered = filter === "all" ? students : students.filter((s) => s.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "progress") return b.progressPercent - a.progressPercent;
    if (sortBy === "activity") return b.eventCount7d - a.eventCount7d;
    const order = { inactive: 0, stuck: 1, progressing: 2 };
    return order[a.status] - order[b.status];
  });

  const filters: { key: FilterStatus; label: string; count: number; color: string }[] = [
    { key: "all", label: "All", count: summary.total, color: "bg-white/40" },
    { key: "progressing", label: "Progressing", count: summary.progressing, color: "bg-emerald-400" },
    { key: "stuck", label: "Stuck", count: summary.stuck, color: "bg-amber-400" },
    { key: "inactive", label: "Inactive", count: summary.inactive, color: "bg-red-400" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Engagement analytics</h1>
        <p className="text-sm text-white/60 mt-1">
          {batchName ? `${batchName} · ` : ""}
          {summary.total} student{summary.total === 1 ? "" : "s"}, classified from the last 7 days of activity
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[hsl(220,15%,10%)]/60 p-10 text-center">
          <p className="text-white/70 text-sm">No students enrolled in this batch yet.</p>
          <p className="text-white/50 text-xs mt-1">Add them from Students → CSV import.</p>
        </div>
      ) : (
        <>
          <EngagementSummary {...summary} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors ${
                    filter === f.key
                      ? "bg-violet-500/15 text-violet-200 border border-violet-400/30"
                      : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] border border-white/10"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${f.color}`} />
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <select
              aria-label="Sort students by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="min-h-11 rounded-lg border border-white/10 bg-[hsl(220,15%,10%)] px-3 text-xs text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
            >
              <option value="status">Sort by status</option>
              <option value="progress">Sort by progress</option>
              <option value="activity">Sort by activity</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((student) => (
              <StudentStatusCard key={student.studentId} student={student} />
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/55">No students match this filter</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
