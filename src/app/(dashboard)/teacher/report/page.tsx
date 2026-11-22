import { getClassReport } from "@/lib/queries/learning-path";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

const tierColor: Record<string, string> = {
  Progressing: "text-emerald-700",
  Stuck: "text-amber-700",
  Inactive: "text-red-600",
};

export default async function TeacherReportPage() {
  const { batchName, rows } = await getClassReport();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Class progress report</h1>
          <p className="text-white/60 mt-1 text-sm">
            {batchName ? `${batchName} · ${rows.length} students` : "No batch assigned yet"}
          </p>
        </div>
        <PrintButton />
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-white overflow-hidden print:border-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Topics</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last activity</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Nothing to report yet.</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r.studentId} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-gray-500">{r.email}</td>
                <td className="px-4 py-3">{r.completed}/{r.total}</td>
                <td className="px-4 py-3">{r.percent}%</td>
                <td className={`px-4 py-3 ${tierColor[r.tier]} print:text-gray-700`}>{r.tier}</td>
                <td className="px-4 py-3 text-gray-500">{r.lastEvent ?? "never"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-white/55 print:hidden">
        Tip: use your browser&apos;s print dialog → &ldquo;Save as PDF&rdquo; to hand this in.
      </p>
    </div>
  );
}
