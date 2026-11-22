"use client";

import { useState, useTransition } from "react";
import { importStudentsCsv, type ImportResult } from "@/app/actions/student-import";

export function ImportForm({ batches }: { batches: { id: string; name: string }[] }) {
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setResult(null);
    startTransition(async () => {
      setResult(await importStudentsCsv(csv, batchId));
    });
  };

  if (batches.length === 0) {
    return <p className="text-sm text-white/60">Create a batch first — imports attach students to a batch.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Batch to import students into"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="rounded-lg border border-white/10 bg-[hsl(220,15%,10%)] px-3 py-2 text-sm text-white"
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <span className="self-center text-xs text-white/55">one student per line: name,email</span>
      </div>

      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={6}
        placeholder={"Aditi Sharma,aditi@example.com\nRahul Das,rahul@example.com"}
        className="w-full rounded-xl border border-white/10 bg-transparent p-3 font-mono text-xs text-white placeholder:text-white/20"
      />

      <button
        onClick={submit}
        disabled={isPending || !csv.trim() || !batchId}
        className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {isPending ? "Importing…" : "Import students"}
      </button>

      {result && (
        <div className={`rounded-xl border p-3 text-xs ${result.ok ? "border-emerald-500/30 text-emerald-300" : "border-amber-500/30 text-amber-200"}`}>
          <p>{result.created} account(s) created · {result.enrolled} enrolled in the batch</p>
          {result.skipped.length > 0 && <p className="mt-1 text-white/60">Skipped lines: {result.skipped.join(" | ")}</p>}
          {result.errors.map((e) => <p key={e} className="mt-1 text-red-300">{e}</p>)}
        </div>
      )}
    </div>
  );
}
