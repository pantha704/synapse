"use client";

export const dynamic = "force-dynamic";
import { SideNavBar } from "@/components/layout/SideNavBar";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { LearningPath } from "@/components/path/LearningPath";
import { StatsPanel } from "@/components/stats/StatsPanel";
import { learningNodes, criticalNodes, batchPulse } from "@/data/mockData";

export default function LearningPathPage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e]">
      <SideNavBar />
      <TopNavBar />

      <main className="ml-64 pt-16 h-screen overflow-hidden flex">
        <LearningPath nodes={learningNodes} />
        <StatsPanel batchPulse={batchPulse} criticalNodes={criticalNodes} />
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-[calc(20rem+2rem)] w-14 h-14 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] z-50 group hover:scale-110 transition-transform">
        <span className="text-white text-2xl group-hover:rotate-90 transition-transform duration-300">
          +
        </span>
      </button>
    </div>
  );
}
