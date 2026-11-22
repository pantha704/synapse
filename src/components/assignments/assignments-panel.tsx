"use client";

import { useState, useTransition } from "react";
import { ClipboardList, Check } from "lucide-react";
import { submitAssignment } from "@/app/actions/assignment-actions";
import type { AssignmentItem } from "@/lib/path-types";

interface Props {
  items: AssignmentItem[];
  canSubmit: boolean;
  dark?: boolean;
}

const stateLabel = (item: AssignmentItem) => {
  if (item.status === "SUBMITTED") return "submitted";
  if (item.status === "GRADED") return "graded";
  return item.dueAt ? `due ${item.dueAt}` : "open";
};

export function AssignmentsPanel({ items, canSubmit, dark = false }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const surface = dark ? "bg-white/[0.04] border-white/[0.06]" : "bg-gray-50 border-gray-200";
  const heading = dark ? "text-white/70" : "text-gray-900";
  const muted = dark ? "text-white/60" : "text-gray-500";
  const input = dark
    ? "border-white/10 bg-transparent text-white placeholder:text-white/55"
    : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400";

  const submit = (id: string) => {
    setError(null);
    startTransition(async () => {
      const res = await submitAssignment({ assignmentId: id, note });
      if (!res.ok) return setError(res.error);
      setOpenId(null);
      setNote("");
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ClipboardList className={`w-3.5 h-3.5 ${muted}`} />
        <h4 className={`text-xs font-semibold ${heading}`}>Assignments</h4>
      </div>

      {items.length === 0 ? (
        <p className={`text-[11px] ${muted}`}>No assignments yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className={`rounded-xl border p-3 ${surface}`}>
              <div className="flex items-start justify-between gap-2">
                <p className={`text-[11px] font-semibold ${heading}`}>{item.title}</p>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] ${item.status === "SUBMITTED" ? "bg-emerald-500/15 text-emerald-400" : `${muted}`}`}>
                  {stateLabel(item)}
                </span>
              </div>
              {item.topicTitle && <p className={`text-[9px] ${muted}`}>on {item.topicTitle}</p>}
              {item.instructions && <p className={`mt-1 text-[11px] leading-snug ${muted}`}>{item.instructions}</p>}

              {item.submittedCount !== undefined && (
                <p className={`mt-1 text-[9px] ${muted}`}>
                  {item.submittedCount}/{item.studentCount ?? 0} submitted
                </p>
              )}

              {canSubmit && item.status === "NOT_STARTED" && (
                <div className="mt-2">
                  {openId === item.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="Anything to add (optional)"
                        className={`w-full rounded-lg border px-2 py-1.5 text-[11px] ${input}`}
                      />
                      {error && <p className="text-[10px] text-red-400">{error}</p>}
                      <button
                        onClick={() => submit(item.id)}
                        disabled={isPending}
                        className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-white disabled:opacity-40"
                      >
                        <Check className="w-2.5 h-2.5" /> {isPending ? "Submitting…" : "Submit"}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setOpenId(item.id)} className="text-[10px] font-semibold text-violet-400">
                      Mark as submitted
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
