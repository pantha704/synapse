import { Users, GraduationCap, Building2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/queries/learning-path";

// DB-backed page: never prerender at build time
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const overview = await getAdminOverview();

  const stats = [
    { label: "Total Students", value: overview ? String(overview.students) : "—", icon: GraduationCap, color: "text-violet-400" },
    { label: "Teachers", value: overview ? String(overview.teachers) : "—", icon: Users, color: "text-cyan-400" },
    { label: "Active Batches", value: overview ? String(overview.batches) : "—", icon: Building2, color: "text-emerald-400" },
    { label: "Avg Completion", value: overview ? `${overview.avgCompletion}%` : "—", icon: TrendingUp, color: "text-amber-400" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Institution Overview</h1>
        <p className="text-white/40 mt-1 text-sm">
          {overview
            ? "Live counts from your institution's records."
            : "No institution linked to this account yet."}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[hsl(220,15%,10%)]/60 border-white/[0.06] hover:border-white/[0.12] transition-colors">
            <CardContent className="p-5">
              <stat.icon className={`w-5 h-5 mb-3 ${stat.color}`} />
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[hsl(220,15%,10%)]/60 border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white/80 font-medium">Where these numbers come from</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/50">
          <p>Students, teachers and batches are counted from this institution&apos;s membership rows.</p>
          <p>Average completion is completed topic-progress rows over all topic-progress rows.</p>
        </CardContent>
      </Card>
    </div>
  );
}
