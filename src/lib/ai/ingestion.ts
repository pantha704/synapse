import { PDFParse } from "pdf-parse";
import { createEmbeddings, isEmbeddingsConfigured } from "./embeddings";
import { prisma } from "@/lib/prisma";

export interface Chunk {
  content: string;
  pageNum: number | null;
  chunkIdx: number;
}

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const MIN_CHUNK = 200;

/** Index of the last real sentence end in `s`, or -1. Decimals and common
 *  abbreviations are not sentence ends — `lastIndexOf(".")` split `3.14` into
 *  `3.` + `14` and ended 74 of 87 stored chunks mid-word. */
function lastSentenceBoundary(s: string): number {
  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i];
    if (ch !== "." && ch !== "!" && ch !== "?") continue;

    const prev = s[i - 1] ?? "";
    const next = s[i + 1] ?? "";

    if (ch === "." && /\d/.test(prev) && /\d/.test(next)) continue; // 3.14, v1.2
    if (ch === "." && /(?:\bfig|\be\.g|\bi\.e|\betc|\bvs|\bdr|\bmr|\bms|\bprof|\bno)$/i.test(s.slice(Math.max(0, i - 5), i))) continue;
    if (next === "" || next === " " || next === "\n") return i;
    if (/[A-Z"'(0-9]/.test(next)) return i;
  }
  return -1;
}

function isUseful(chunk: string): boolean {
  if (chunk.length < 10) return false;
  const visible = chunk.replace(/\s/g, "").length;
  if (visible === 0) return false;
  // table-of-contents dot leaders survived as chunks of pure punctuation
  const alnum = chunk.replace(/[^a-z0-9]/gi, "").length;
  // "Chapter 1 ......... 5" survives an alnum-ratio test and then ranks for
  // real queries; a chunk needs prose, not a dotted index
  const dotLeaders = (chunk.match(/\.\s*\./g) ?? []).length;
  return alnum / visible > 0.5 && dotLeaders < 5;
}

export function chunkText(text: string): string[] {
  const clean = text
    .replace(/\r\n/g, "\n")
    // pdf-parse emits its own page separator, and the running footer of every
    // page then becomes retrievable "course material"
    .replace(/^-{1,3}\s*\d+\s+of\s+\d+\s*-{1,3}$/gm, "")
    .replace(/^.*\bPage\s+\d+\b.*$/gm, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!clean) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    let cut = end;

    if (end < clean.length) {
      const boundary = lastSentenceBoundary(clean.slice(start + MIN_CHUNK, end));
      if (boundary !== -1) {
        cut = start + MIN_CHUNK + boundary + 1;
      } else {
        // nothing inside the window: look a little further, because a chunk that
        // stops mid-sentence makes the next one open mid-sentence too
        const extended = lastSentenceBoundary(
          clean.slice(start + MIN_CHUNK, Math.min(start + CHUNK_SIZE + 160, clean.length))
        );
        if (extended !== -1) {
          cut = start + MIN_CHUNK + extended + 1;
        } else {
          const space = clean.lastIndexOf(" ", end);
          if (space > start + MIN_CHUNK) cut = space;
        }
      }
    }

    const chunk = clean.slice(start, cut).trim();
    if (isUseful(chunk)) chunks.push(chunk);

    if (cut >= clean.length) break;

    // A chunk that ended on a sentence boundary hands over cleanly, so no
    // overlap is needed — repeating 50 characters is what made the following
    // chunk open mid-sentence even when the cut was in the right place.
    const endedOnSentence = /[.!?]["')\]]?$/.test(clean.slice(0, cut).trimEnd());
    let next = endedOnSentence
      ? cut
      : cut - Math.min(CHUNK_OVERLAP, Math.floor(chunk.length / 2));
    const space = clean.indexOf(" ", next);
    next = space !== -1 && space < cut ? space + 1 : cut;

    // and prefer the next sentence start inside that overlap, so a chunk opens
    // on a sentence rather than on the tail of the previous one
    const lookahead = clean.slice(next, cut);
    const sentence = lookahead.match(/[.!?]\s+(?=[A-Z0-9"(])/);
    if (sentence?.index !== undefined) {
      const candidate = next + sentence.index + sentence[0].length;
      if (candidate < cut) next = candidate;
    }

    // monotonic: the old tail arithmetic could stall at EOF and OOM the process
    start = Math.max(next, start + 1);
  }

  return chunks;
}

/**
 * Per-page extraction. The old version returned one concatenated string and a
 * page count, which meant every stored chunk had page_num NULL and no citation
 * could ever point at a page.
 */
export async function extractPdfPages(
  buffer: Buffer
): Promise<{ num: number; text: string }[]> {
  // pdf-parse v2 is class-based; the v1 callable default export is gone.
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const pages = (result as { pages?: { num: number; text: string }[] }).pages ?? [];
    if (pages.length > 0) return pages.map((p) => ({ num: p.num, text: p.text ?? "" }));
    return [{ num: 1, text: result.text ?? "" }];
  } finally {
    await parser.destroy?.();
  }
}

export async function extractPdfText(buffer: Buffer): Promise<{ text: string; pages: number }> {
  const pages = await extractPdfPages(buffer);
  return { text: pages.map((p) => p.text).join("\n"), pages: pages.length };
}

export async function ingestDocument(
  topicId: string,
  subjectId: string,
  pdfBuffer: Buffer,
  sourceUrl?: string
): Promise<{ chunksCreated: number; embeddingsGenerated: number; pages: number }> {
  const pages = await extractPdfPages(pdfBuffer);

  // Chunk per page so every chunk knows which page it came from.
  const chunks: { content: string; pageNum: number }[] = [];
  for (const page of pages) {
    for (const content of chunkText(page.text)) chunks.push({ content, pageNum: page.num });
  }

  if (chunks.length === 0) {
    return { chunksCreated: 0, embeddingsGenerated: 0, pages: pages.length };
  }

  // Re-ingesting the same document used to append a second full copy of every
  // chunk; the corpus for one topic is replaced, not duplicated.
  if (sourceUrl) {
    await prisma.$executeRaw`
      DELETE FROM "document_chunks" WHERE topic_id = ${topicId} AND source_url = ${sourceUrl}
    `;
  }

  // Insert first, embed second. The old order awaited every embedding batch
  // before writing a single row, so a slow or hanging provider meant an upload
  // that stored nothing at all.
  const ids: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO "document_chunks" (id, topic_id, subject_id, content, embedding, chunk_idx, page_num, source_url, created_at)
      VALUES (
        gen_random_uuid()::text,
        ${topicId},
        ${subjectId},
        ${chunks[i].content},
        NULL,
        ${i},
        ${chunks[i].pageNum},
        ${sourceUrl || null},
        NOW()
      )
      RETURNING id
    `;
    ids.push(rows[0].id);
  }

  // Embeddings are optional: without a provider the chunks are still stored and
  // retrieval falls back to full-text search.
  let embedded = 0;
  if (isEmbeddingsConfigured()) {
    try {
      const results = await createEmbeddings(chunks.map((c) => c.content));
      for (let i = 0; i < results.length && i < ids.length; i++) {
        const embedding = results[i]?.embedding;
        if (!embedding) continue;
        await prisma.$executeRaw`
          UPDATE "document_chunks" SET embedding = ${`[${embedding.join(",")}]`}::vector(1024)
          WHERE id = ${ids[i]}
        `;
        embedded++;
      }
    } catch (error) {
      console.warn("embedding generation skipped:", error instanceof Error ? error.message : error);
    }
  }

  return { chunksCreated: chunks.length, embeddingsGenerated: embedded, pages: pages.length };
}

export async function deleteTopicChunks(topicId: string): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM "document_chunks" WHERE topic_id = ${topicId}
  `;
}
