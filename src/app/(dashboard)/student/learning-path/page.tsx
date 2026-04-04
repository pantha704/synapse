"use client";

import { SideNavBar } from "@/components/layout/SideNavBar";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { AcademicLearningPath } from "@/components/path/AcademicLearningPath";
import { PeerComparisonPanel } from "@/components/student/PeerComparisonPanel";
import { learningNodes, peerComparisonData, studentStats } from "@/data/mockData";
import { motion } from "framer-motion";
import { BarChart3, Calendar, Clock } from "lucide-react";

export default function StudentLearningPathPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SideNavBar />
      <TopNavBar />

      <main className="ml-64 pt-16 h-screen overflow-hidden flex">
        {/* Center: Learning Path */}
        <AcademicLearningPath nodes={learningNodes} />

        {/* Right: Student Stats + Peer Comparison */}
        <aside className="w-80 bg-white border-l border-gray-200/80 p-5 overflow-y-auto space-y-5">
          {/* Student Profile */}
          <div className="text-center pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-indigo-200">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                alt={studentStats.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-sm font-bold text-gray-900">{studentStats.name}</h3>
            <p className="text-xs text-gray-500">{studentStats.title}</p>
          </div>

          {/* Weekly Performance */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-900">Performance</h4>
              <span className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                Weekly
              </span>
            </div>
            <div className="flex gap-1.5 h-16 items-end mb-2">
              {studentStats.weeklyPerformance.map((value, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t transition-all"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-[8px] text-gray-400">{studentStats.weeklyLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-3">Recent Activity</h4>
            <div className="space-y-3">
              {studentStats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-700">{activity.title}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Comparison */}
          <PeerComparisonPanel peers={peerComparisonData} currentStudentId="1" />

          {/* Next Milestone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-4 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Next Milestone</span>
            </div>
            <h4 className="text-sm font-bold">Midterm Exams</h4>
            <p className="text-xs opacity-80 mt-1">12 days remaining to prepare for your core assessments.</p>
          </motion.div>
        </aside>
      </main>
    </div>
  );
}
