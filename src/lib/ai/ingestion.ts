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
  return alnum / visible > 0.5;
}

export function chunkText(text: string): string[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
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

export async function extractPdfText(buffer: Buffer): Promise<{ text: string; pages: number }> {
  // pdf-parse v2 is class-based; the v1 callable default export is gone.
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return { text: result.text, pages: result.total ?? result.pages?.length ?? 0 };
  } finally {
    await parser.destroy?.();
  }
}

export async function ingestDocument(
  topicId: string,
  subjectId: string,
  pdfBuffer: Buffer,
  sourceUrl?: string
): Promise<{ chunksCreated: number; embeddingsGenerated: number }> {
  // Extract text from PDF
  const { text } = await extractPdfText(pdfBuffer);

  // Chunk the text
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    return { chunksCreated: 0, embeddingsGenerated: 0 };
  }

  // Embeddings are optional: without a provider the chunks are still stored and
  // retrieval falls back to full-text search.
  let embeddingResults: { embedding: number[] }[] = [];
  if (isEmbeddingsConfigured()) {
    try {
      embeddingResults = await createEmbeddings(chunks);
    } catch (error) {
      console.warn("embedding generation skipped:", error instanceof Error ? error.message : error);
    }
  }

  // Store chunks with embeddings in database
  for (let i = 0; i < chunks.length; i++) {
    const embedding = embeddingResults[i]?.embedding;

    // Use raw SQL for vector insertion since Prisma doesn't support vector type natively
    await prisma.$executeRaw`
      INSERT INTO "document_chunks" (id, topic_id, subject_id, content, embedding, chunk_idx, source_url, created_at)
      VALUES (
        gen_random_uuid()::text,
        ${topicId},
        ${subjectId},
        ${chunks[i]},
        ${embedding ? `[${embedding.join(",")}]` : null}::vector(1024),
        ${i},
        ${sourceUrl || null},
        NOW()
      )
    `;
  }

  return {
    chunksCreated: chunks.length,
    embeddingsGenerated: embeddingResults.length,
  };
}

export async function deleteTopicChunks(topicId: string): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM "document_chunks" WHERE topic_id = ${topicId}
  `;
}
