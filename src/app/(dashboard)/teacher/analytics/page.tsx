import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getBatchEngagement } from "@/app/actions/engagement-actions";
import { AnalyticsView } from "./view";

export const dynamic = "force-dynamic";

export default async function TeacherAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const me = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!me) redirect("/no-access");
  if (me.role !== "TEACHER" && me.role !== "ADMIN") redirect("/student");

  // the teacher's own batch; an admin sees the first batch in their institution
  const batch = await prisma.batch.findFirst({
    where:
      me.role === "TEACHER"
        ? { teacherId: me.id }
        : { institutionId: me.institutionId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  const students = batch ? await getBatchEngagement(batch.id) : [];

  return <AnalyticsView students={students} batchName={batch?.name ?? ""} />;
}
