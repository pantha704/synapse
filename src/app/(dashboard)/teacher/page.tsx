import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TeacherDashboardClient, { DashboardData } from "./teacher-dashboard-client";
import { createClient } from "@/utils/supabase/server";

async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
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
    notFound();
  }

  const activeBatches = teacher.taughtBatches.length;
  
  // Aggregate data to find total subjects taught
  const totalSubjects = teacher.taughtBatches.reduce((acc, b) => acc + b._count.subjects, 0);

  // For real avgProgress, we would calculate logic based on students.
  // Using 0 as default since it could be heavy.
  const avgProgress = 0;

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
