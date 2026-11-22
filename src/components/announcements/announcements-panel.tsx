"use client";

import { useState, useTransition } from "react";
import { Megaphone, Check } from "lucide-react";
import { createAnnouncement, markAnnouncementRead } from "@/app/actions/announcement-actions";
import type { AnnouncementItem } from "@/lib/path-types";

interface Props {
  items: AnnouncementItem[];
  canPost: boolean;
  batchId: string | null;
  dark?: boolean;
}

export function AnnouncementsPanel({ items, canPost, batchId, dark = false }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const surface = dark ? "bg-white/[0.04] border-white/[0.06]" : "bg-gray-50 border-gray-200";
  const heading = dark ? "text-white/70" : "text-gray-900";
  const muted = dark ? "text-white/40" : "text-gray-500";

  const post = () => {
    if (!batchId) return;
    setError(null);
    startTransition(async () => {
      const result = await createAnnouncement({ batchId, title, body });
      if (!result.ok) return setError(result.error);
      setTitle("");
      setBody("");
    });
  };

  const markRead = (id: string) => {
    startTransition(async () => {
      await markAnnouncementRead(id);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Megaphone className={`w-3.5 h-3.5 ${muted}`} />
        <h4 className={`text-xs font-semibold ${heading}`}>
          Announcements{items.some((i) => !i.read) && !canPost ? " · new" : ""}
        </h4>
      </div>

      {canPost && (
        <div className={`rounded-xl border p-3 space-y-2 ${surface}`}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-xs text-white placeholder:text-white/30"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message to the batch"
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-xs text-white placeholder:text-white/30"
          />
          {error && <p className="text-[10px] text-red-400">{error}</p>}
          <button
            onClick={post}
            disabled={isPending || !batchId}
            className="w-full rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            {isPending ? "Posting…" : "Post announcement"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className={`text-[11px] ${muted}`}>Nothing posted yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className={`rounded-xl border p-3 ${surface}`}>
              <div className="flex items-start justify-between gap-2">
                <p className={`text-[11px] font-semibold ${heading}`}>{item.title}</p>
                {!item.read && (
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" aria-label="unread" />
                )}
              </div>
              <p className={`mt-1 text-[11px] leading-snug ${muted}`}>{item.body}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className={`text-[9px] ${muted}`}>{item.createdAt}</span>
                {!canPost && !item.read && (
                  <button onClick={() => markRead(item.id)} className="flex items-center gap-1 text-[9px] text-violet-400">
                    <Check className="w-2.5 h-2.5" /> mark read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
