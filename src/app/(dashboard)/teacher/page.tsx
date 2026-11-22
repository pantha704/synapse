import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TeacherDashboardClient, { DashboardData } from "./teacher-dashboard-client";
import { createClient } from "@/utils/supabase/server";

// DB-backed page: never prerender at build time
export const dynamic = "force-dynamic";

async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const teacher = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      taughtBatches: {
        include: {
          _count: {
            select: { students: true, subjects: true }
          }
        }
      }
    }
  });

  if (!teacher) {
    redirect("/no-access");
  }

  const activeBatches = teacher.taughtBatches.length;
  
  // Aggregate data to find total subjects taught
  const totalSubjects = teacher.taughtBatches.reduce((acc, b) => acc + b._count.subjects, 0);

  // completed topics / (students x topics) across the batches this teacher owns.
  // A row ratio would read 100% after a single completion, so the denominator is
  // the work that could be done, not the work that was recorded.
  const batchIds = teacher.taughtBatches.map((b) => b.id);
  const [topics, students, completed] = await Promise.all([
    prisma.topicNode.count({
      where: { subject: { batches: { some: { batchId: { in: batchIds } } } } },
    }),
    prisma.batchStudent.count({ where: { batchId: { in: batchIds } } }),
    prisma.studentProgress.count({
      where: {
        status: "COMPLETED",
        topic: { subject: { batches: { some: { batchId: { in: batchIds } } } } },
      },
    }),
  ]);
  const opportunity = students * topics;
  const avgProgress = opportunity ? Math.min(100, Math.round((completed / opportunity) * 100)) : 0;

  return {
    activeBatches,
    totalSubjects,
    avgProgress,
    batches: teacher.taughtBatches.map(b => ({
      id: b.id,
      name: b.name,
      joinCode: b.joinCode,
      _count: b._count,
    })),
    teacherName: teacher.name || "Teacher"
  };
}

export default function TeacherDashboardPage() {
  return <TeacherDashboardClient dataPromise={getDashboardData()} />;
}
