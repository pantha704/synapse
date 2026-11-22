import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { ImportForm } from "./import-form";

export const dynamic = "force-dynamic";

export default async function TeacherStudentsPage() {
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
          students: { include: { student: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!teacher) notFound();

  const batches = teacher.taughtBatches;
  const roster = batches.flatMap((b) =>
    b.students.map((s) => ({
      id: s.student.id,
      name: s.student.name ?? s.student.email.split("@")[0],
      email: s.student.email,
      batch: b.name,
      joinedAt: s.joinedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    }))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Students</h1>
        <p className="text-white/60 mt-1 text-sm">
          {roster.length} enrolled across {batches.length} batch{batches.length === 1 ? "" : "es"}.
        </p>
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-[hsl(220,15%,10%)]/60 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/80">Bulk import</h2>
        <ImportForm batches={batches.map((b) => ({ id: b.id, name: b.name }))} />
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-[hsl(220,15%,10%)]/60 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-white/60">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {roster.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-white/55">
                  No students yet — paste a CSV above or share a join code.
                </td>
              </tr>
            ) : (
              roster.map((r) => (
                <tr key={`${r.id}-${r.batch}`} className="border-t border-white/[0.04]">
                  <td className="px-4 py-3 text-white/80">{r.name}</td>
                  <td className="px-4 py-3 text-white/65">{r.email}</td>
                  <td className="px-4 py-3 text-white/65">{r.batch}</td>
                  <td className="px-4 py-3 text-white/60">{r.joinedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
