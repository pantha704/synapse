"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { use } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
};

export type BatchData = {
  id: string;
  name: string;
  joinCode: string;
  _count: { students: number; subjects: number };
};

export type DashboardData = {
  activeBatches: number;
  totalSubjects: number;
  avgProgress: number;
  batches: BatchData[];
  teacherName: string;
};

export default function TeacherDashboardClient({ dataPromise }: { dataPromise: Promise<DashboardData> }) {
  const data = use(dataPromise);

  const STAT_CARDS = [
    { label: "Active Batches", value: data.activeBatches.toString(), icon: Users, color: "text-violet-400" },
    { label: "Subjects", value: data.totalSubjects.toString(), icon: BookOpen, color: "text-cyan-400" },
    { label: "Avg Progress", value: `${Math.round(data.avgProgress)}%`, icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div {...fadeUp}>
        <h1 className="text-2xl font-semibold text-white">Good morning, {data.teacherName} 👋</h1>
        <p className="text-white/40 mt-1 text-sm">
          Here&apos;s what&apos;s happening across your classes today.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
      >
        {STAT_CARDS.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card className="bg-[hsl(220,15%,10%)]/60 border-white/[0.06] hover:border-white/[0.12] transition-colors">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Batches */}
      <motion.div {...fadeUp} transition={{ delay: 0.15, ...fadeUp.transition }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-white/80">Your Batches</h2>
          <Button
            size="sm"
            variant="outline"
            className="border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.04] gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Batch
          </Button>
        </div>

        <div className="space-y-3">
          {data.batches.length === 0 ? (
            <div className="text-white/40 text-sm py-8 text-center border border-white/[0.05] rounded-xl border-dashed">
              No batches yet. Create your first batch to add students!
            </div>
          ) : data.batches.map((batch, i) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.35, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            >
              <Card className="bg-[hsl(220,15%,10%)]/60 border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white/90">{batch.name}</p>
                      <Badge
                        variant="outline"
                        className="border-white/[0.08] text-white/30 font-mono text-[10px] px-1.5"
                      >
                        {batch.joinCode}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      {batch._count.students} students · {batch._count.subjects} subjects
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-200" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
