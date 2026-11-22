"use client";

import { useState, useTransition } from "react";
import { createInstitution } from "@/app/actions/institution-actions";

export function CreateInstitutionForm({ enabled }: { enabled: boolean }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!enabled) {
    return (
      <p className="text-sm text-white/60">
        Only a platform operator can create institutions. An institution admin manages its own tenant.
      </p>
    );
  }

  const submit = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await createInstitution({ name, slug });
      if (!res.ok) return setMessage(res.error);
      setName("");
      setSlug("");
      setMessage("Institution created.");
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Institution name"
          className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/55"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug (e.g. snu-kolkata)"
          className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/55"
        />
      </div>
      <button
        onClick={submit}
        disabled={isPending || !name.trim() || !slug.trim()}
        className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {isPending ? "Creating…" : "Create institution"}
      </button>
      {message && <p className="text-xs text-white/60">{message}</p>}
    </div>
  );
}
