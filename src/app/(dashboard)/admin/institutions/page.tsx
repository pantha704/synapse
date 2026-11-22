import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { CreateInstitutionForm } from "./create-form";

export const dynamic = "force-dynamic";

export default async function InstitutionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const me = user ? await prisma.user.findUnique({ where: { supabaseId: user.id } }) : null;

  const institutions = await prisma.institution.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, batches: true, subjects: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Institutions</h1>
        <p className="text-white/60 mt-1 text-sm">
          {institutions.length} tenant{institutions.length === 1 ? "" : "s"} on this deployment. Data never crosses between them.
        </p>
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-[hsl(220,15%,10%)]/60 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/80">New institution</h2>
        <CreateInstitutionForm enabled={Boolean(me?.isSuperAdmin)} />
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-[hsl(220,15%,10%)]/60 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-white/60">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Users</th>
              <th className="px-4 py-3 font-medium">Batches</th>
              <th className="px-4 py-3 font-medium">Subjects</th>
            </tr>
          </thead>
          <tbody>
            {institutions.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-white/55">No institutions yet.</td></tr>
            ) : institutions.map((i) => (
              <tr key={i.id} className="border-t border-white/[0.04]">
                <td className="px-4 py-3 text-white/80">{i.name}</td>
                <td className="px-4 py-3 text-white/60">{i.slug}</td>
                <td className="px-4 py-3 text-white/60">{i._count.users}</td>
                <td className="px-4 py-3 text-white/60">{i._count.batches}</td>
                <td className="px-4 py-3 text-white/60">{i._count.subjects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
