"use client";

import { motion } from "framer-motion";
import { BookOpen, Target, Zap, ArrowRight, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { use } from "react";
import Link from "next/link";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
};

export type SubjectData = {
  id: string;
  name: string;
  emoji: string;
  totalTopics: number;
  completedTopics: number;
  status: "progressing" | "stuck" | "not_started";
};

export type DashboardData = {
  studentName: string;
  totalSubjects: number;
  totalCompleted: number;
  streak: number;
  subjects: SubjectData[];
};

const STATUS_CONFIG = {
  progressing: { label: "On track", color: "text-emerald-400", dot: "bg-emerald-400" },
  stuck: { label: "Needs attention", color: "text-amber-400", dot: "bg-amber-400" },
  not_started: { label: "Not started", color: "text-white/30", dot: "bg-white/20" },
};

export default function StudentDashboardClient({ dataPromise }: { dataPromise: Promise<DashboardData> }) {
  const data = use(dataPromise);
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div {...fadeUp}>
        <h1 className="text-2xl font-semibold text-white">Your learning map 🧠</h1>
        <p className="text-white/40 mt-1 text-sm">
          Track your progress across all subjects.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
      >
        {[
          { icon: BookOpen, label: "Subjects", value: data.totalSubjects, color: "text-violet-400" },
          { icon: Target, label: "Completed", value: `${data.totalCompleted} topics`, color: "text-emerald-400" },
          { icon: Zap, label: "Streak", value: "—", color: "text-amber-400" },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <Card className="bg-[hsl(220,15%,10%)]/60 border-white/[0.06]">
              <CardContent className="p-4 text-center">
                <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
                <p className="text-lg font-semibold text-white">{s.value}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Subject Cards */}
      <motion.div {...fadeUp} transition={{ delay: 0.15, ...fadeUp.transition }}>
        <h2 className="text-base font-medium text-white/80 mb-4">Subjects</h2>
        <div className="space-y-3">
          {data.subjects.length === 0 ? (
            <div className="text-white/40 text-sm py-8 text-center border border-white/[0.05] rounded-xl border-dashed">
              You are not enrolled in any subjects yet. Ask your teacher for a join code!
            </div>
          ) : data.subjects.map((subject, i) => {
            const progress = subject.totalTopics > 0 
              ? Math.round((subject.completedTopics / subject.totalTopics) * 100)
              : 0;
            const statusCfg = STATUS_CONFIG[subject.status];
            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.35, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
              >
                <Link href={`/student/subjects/${subject.id}`}>
                  <Card className="bg-[hsl(220,15%,10%)]/60 border-white/[0.06] hover:border-white/[0.14] transition-all duration-200 group cursor-pointer block">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{subject.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-white/90">{subject.name}</p>
                            <div className="flex items-center gap-1">
                              <Circle className={`w-1.5 h-1.5 fill-current ${statusCfg.dot.replace('bg-', 'text-')}`} />
                              <span className={`text-[11px] ${statusCfg.color}`}>{statusCfg.label}</span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
                              />
                            </div>
                            <span className="text-xs text-white/30 w-8 text-right">
                              {progress}%
                            </span>
                          </div>
                          <p className="text-[11px] text-white/30 mt-1">
                            {subject.completedTopics}/{subject.totalTopics} topics
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
