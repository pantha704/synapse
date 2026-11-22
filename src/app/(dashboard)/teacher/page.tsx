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
          },
          subjects: { select: { subjectId: true }, orderBy: { subjectId: "asc" }, take: 1 },
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

  // completed topics / (students x topics), summed per batch.
  // Using the union of topics × the union of students inflates the denominator:
  // two batches of 10 students and 10 topics is 400 opportunities, not 800,
  // because no student can complete the other batch's topics.
  const batchIds = teacher.taughtBatches.map((b) => b.id);
  const perBatch = await Promise.all(
    batchIds.map(async (batchId) => {
      const [topics, students] = await Promise.all([
        prisma.topicNode.count({ where: { subject: { batches: { some: { batchId } } } } }),
        prisma.batchStudent.count({ where: { batchId } }),
      ]);
      return topics * students;
    })
  );
  const completed = await prisma.studentProgress.count({
    where: {
      status: "COMPLETED",
      topic: { subject: { batches: { some: { batchId: { in: batchIds } } } } },
    },
  });
  const opportunity = perBatch.reduce((a, b) => a + b, 0);
  const avgProgress = opportunity ? Math.min(100, Math.round((completed / opportunity) * 100)) : 0;

  return {
    activeBatches,
    totalSubjects,
    avgProgress,
    batches: teacher.taughtBatches.map(b => ({
      id: b.id,
      name: b.name,
      joinCode: b.joinCode,
      subjectId: b.subjects[0]?.subjectId ?? null,
      _count: b._count,
    })),
    teacherName: teacher.name || "Teacher"
  };
}

export default function TeacherDashboardPage() {
  return <TeacherDashboardClient dataPromise={getDashboardData()} />;
}
