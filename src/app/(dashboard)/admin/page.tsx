"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, Building2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
};

const STATS = [
  { label: "Total Students", value: "—", icon: GraduationCap, color: "text-violet-400" },
  { label: "Teachers", value: "—", icon: Users, color: "text-cyan-400" },
  { label: "Active Batches", value: "—", icon: Building2, color: "text-emerald-400" },
  { label: "Avg Completion", value: "—", icon: TrendingUp, color: "text-amber-400" },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div {...fadeUp}>
        <h1 className="text-2xl font-semibold text-white">Institution Overview</h1>
        <p className="text-white/40 mt-1 text-sm">
          Monitor performance across your entire institution.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
      >
        {STATS.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card className="bg-[hsl(220,15%,10%)]/60 border-white/[0.06] hover:border-white/[0.12] transition-colors">
              <CardContent className="p-5">
                <stat.icon className={`w-5 h-5 mb-3 ${stat.color}`} />
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div {...fadeUp} transition={{ delay: 0.2, ...fadeUp.transition }}>
        <Card className="bg-[hsl(220,15%,10%)]/60 border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white/80 font-medium">
              Institution Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">
              Analytics charts coming in Phase 3
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
