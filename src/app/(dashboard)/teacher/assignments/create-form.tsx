"use client";

import { useState, useTransition } from "react";
import { createAssignment } from "@/app/actions/assignment-actions";

interface Props {
  batches: { id: string; name: string; topics: { id: string; title: string }[] }[];
}

export function CreateAssignmentForm({ batches }: Props) {
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [topicId, setTopicId] = useState(batches[0]?.topics[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const topics = batches.find((b) => b.id === batchId)?.topics ?? [];

  if (batches.length === 0) {
    return <p className="text-sm text-white/40">Create a batch with topics first.</p>;
  }

  const submit = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await createAssignment({ batchId, topicId, title, instructions, dueAt: dueAt || undefined });
      if (!res.ok) return setMessage(res.error);
      setTitle("");
      setInstructions("");
      setDueAt("");
      setMessage("Assignment created.");
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          value={batchId}
          onChange={(e) => {
            setBatchId(e.target.value);
            const first = batches.find((b) => b.id === e.target.value)?.topics[0]?.id ?? "";
            setTopicId(first);
          }}
          className="rounded-lg border border-white/10 bg-[hsl(220,15%,10%)] px-3 py-2 text-sm text-white"
        >
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className="rounded-lg border border-white/10 bg-[hsl(220,15%,10%)] px-3 py-2 text-sm text-white"
        >
          {topics.length === 0 && <option value="">No topics in this batch</option>}
          {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Assignment title"
        className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30"
      />
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={3}
        placeholder="Instructions (optional)"
        className="w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm text-white placeholder:text-white/30"
      />
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white"
        />
        <button
          onClick={submit}
          disabled={isPending || !title.trim() || !topicId}
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {isPending ? "Creating…" : "Create assignment"}
        </button>
      </div>
      {message && <p className="text-xs text-white/60">{message}</p>}
    </div>
  );
}
