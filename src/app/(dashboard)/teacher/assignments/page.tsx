import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { CreateAssignmentForm } from "./create-form";

export const dynamic = "force-dynamic";

export default async function TeacherAssignmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const teacher = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      taughtBatches: {
        include: {
          subjects: { include: { subject: { include: { topicNodes: { orderBy: { order: "asc" } } } } } },
          students: { select: { studentId: true } },
          assignments: {
            include: {
              topic: { select: { title: true } },
              submissions: { select: { status: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });
  if (!teacher) notFound();

  const batches = teacher.taughtBatches.map((b) => ({
    id: b.id,
    name: b.name,
    topics: b.subjects.flatMap((s) => s.subject.topicNodes.map((t) => ({ id: t.id, title: t.title }))),
  }));

  const rows = teacher.taughtBatches.flatMap((b) =>
    b.assignments.map((a) => ({
      id: a.id,
      title: a.title,
      topic: a.topic?.title ?? "—",
      batch: b.name,
      due: a.dueAt ? a.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "no date",
      submitted: a.submissions.filter((s) => s.status !== "NOT_STARTED").length,
      total: b.students.length,
    }))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Assignments</h1>
        <p className="text-white/60 mt-1 text-sm">{rows.length} created across your batches.</p>
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-[hsl(220,15%,10%)]/60 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/80">New assignment</h2>
        <CreateAssignmentForm batches={batches} />
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-[hsl(220,15%,10%)]/60 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-white/60">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Topic</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-white/55">Nothing assigned yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-white/[0.04]">
                <td className="px-4 py-3 text-white/80">{r.title}</td>
                <td className="px-4 py-3 text-white/65">{r.topic}</td>
                <td className="px-4 py-3 text-white/65">{r.batch}</td>
                <td className="px-4 py-3 text-white/60">{r.due}</td>
                <td className="px-4 py-3 text-white/60">{r.submitted}/{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
