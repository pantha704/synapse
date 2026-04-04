"use client";

export const dynamic = "force-dynamic";
import { useState } from "react";
import { SideNavBar } from "@/components/layout/SideNavBar";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { StudentStatusCard, EngagementSummary } from "@/components/analytics/StudentStatusCard";
import type { StudentEngagement, EngagementStatus } from "@/app/actions/engagement-actions";

// Mock data for demonstration (replace with real DB calls)
const mockStudents: StudentEngagement[] = [
  { studentId: "1", studentName: "Alex Rivers", email: "alex@test.com", status: "progressing", lastActive: new Date(), eventCount7d: 24, topicsCompleted: 5, progressPercent: 85 },
  { studentId: "2", studentName: "Sarah Chen", email: "sarah@test.com", status: "progressing", lastActive: new Date(Date.now() - 3600000), eventCount7d: 18, topicsCompleted: 4, progressPercent: 72 },
  { studentId: "3", studentName: "Marcus Johnson", email: "marcus@test.com", status: "stuck", lastActive: new Date(Date.now() - 3 * 86400000), eventCount7d: 8, topicsCompleted: 2, progressPercent: 35 },
  { studentId: "4", studentName: "Priya Patel", email: "priya@test.com", status: "stuck", lastActive: new Date(Date.now() - 5 * 86400000), eventCount7d: 3, topicsCompleted: 1, progressPercent: 18 },
  { studentId: "5", studentName: "James Wilson", email: "james@test.com", status: "inactive", lastActive: new Date(Date.now() - 10 * 86400000), eventCount7d: 0, topicsCompleted: 0, progressPercent: 0 },
  { studentId: "6", studentName: "Emma Davis", email: "emma@test.com", status: "inactive", lastActive: new Date(Date.now() - 14 * 86400000), eventCount7d: 0, topicsCompleted: 1, progressPercent: 12 },
];

type FilterStatus = "all" | EngagementStatus;

export default function TeacherAnalyticsPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<"status" | "progress" | "activity">("status");

  const summary = {
    total: mockStudents.length,
    progressing: mockStudents.filter(s => s.status === "progressing").length,
    stuck: mockStudents.filter(s => s.status === "stuck").length,
    inactive: mockStudents.filter(s => s.status === "inactive").length,
    avgProgress: Math.round(mockStudents.reduce((sum, s) => sum + s.progressPercent, 0) / mockStudents.length)
  };

  const filtered = filter === "all"
    ? [...mockStudents]
    : mockStudents.filter(s => s.status === filter);

  const sorted = filtered.sort((a, b) => {
    if (sortBy === "progress") return b.progressPercent - a.progressPercent;
    if (sortBy === "activity") return b.eventCount7d - a.eventCount7d;
    // Sort by status: inactive first, then stuck, then progressing
    const order = { inactive: 0, stuck: 1, progressing: 2 };
    return order[a.status] - order[b.status];
  });

  const filters: { key: FilterStatus; label: string; count: number; color: string }[] = [
    { key: "all", label: "All", count: summary.total, color: "bg-gray-500" },
    { key: "progressing", label: "Progressing", count: summary.progressing, color: "bg-emerald-500" },
    { key: "stuck", label: "Stuck", count: summary.stuck, color: "bg-amber-500" },
    { key: "inactive", label: "Inactive", count: summary.inactive, color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SideNavBar />
      <TopNavBar />

      <main className="ml-64 pt-16 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Engagement Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor student engagement and identify at-risk learners</p>
        </div>

        {/* Summary */}
        <EngagementSummary {...summary} />

        {/* Filters & Sort */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <div className="flex gap-2">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.key
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${f.color}`} />
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="status">Sort by Status</option>
            <option value="progress">Sort by Progress</option>
            <option value="activity">Sort by Activity</option>
          </select>
        </div>

        {/* Student Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(student => (
            <StudentStatusCard key={student.studentId} student={student} />
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No students match this filter</p>
          </div>
        )}
      </main>
    </div>
  );
}
