import { prisma } from "@/lib/prisma";
import { createEmbedding, isEmbeddingsConfigured } from "./embeddings";

export interface SearchResult {
  content: string;
  topicId: string;
  subjectId: string;
  score: number;
  pageNum: number | null;
  /** false when nothing in the corpus actually matched and these rows are a
   *  convenience sample — the difference matters, so it is carried, not hidden */
  matched: boolean;
}

export interface RAGContext {
  query: string;
  chunks: SearchResult[];
  formattedContext: string;
  matched: boolean;
}

const TOP_K = 5;

/** Extracted PDF text can contain anything, including a line that closes the
 *  delimiter around it. Anything delimiter-shaped is removed at the boundary. */
function sanitize(content: string): string {
  return content.replace(/<<<|>>>/g, "");
}

function toResult(
  r: {
    content: string;
    topic_id: string;
    subject_id: string;
    score?: number | null;
    page_num: number | null;
  },
  matched: boolean
): SearchResult {
  return {
    content: sanitize(r.content),
    topicId: r.topic_id,
    subjectId: r.subject_id,
    // a chunk with no embedding yields NULL similarity; null.toFixed() threw
    // inside the request, taking the whole chat down before the model call
    score: Number(r.score ?? 0),
    pageNum: r.page_num,
    matched,
  };
}

export async function searchSubjectVectors(
  subjectId: string,
  query: string,
  limit: number = TOP_K
): Promise<SearchResult[]> {
  if (!isEmbeddingsConfigured()) return searchSubjectLexical(subjectId, query, limit);

  let vector: number[];
  try {
    const { embedding } = await createEmbedding(query);
    vector = embedding;
  } catch (error) {
    // provider down, key revoked, timeout — lexical still answers
    console.warn("embedding failed, falling back to full-text", error);
    return searchSubjectLexical(subjectId, query, limit);
  }

  const literal = `[${vector.join(",")}]`;
  const results = await prisma.$queryRaw<
    { content: string; topic_id: string; subject_id: string; score: number | null; page_num: number | null }[]
  >`
    SELECT
      content,
      topic_id,
      subject_id,
      page_num,
      1 - (embedding <=> ${literal}::vector(1024)) AS score
    FROM "document_chunks"
    WHERE subject_id = ${subjectId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${literal}::vector(1024)
    LIMIT ${limit}
  `;

  if (results.length === 0) {
    // every chunk is unembedded right now: the vector index is empty, not wrong
    return searchSubjectLexical(subjectId, query, limit);
  }

  return results.map((r) => toResult(r, true));
}

export async function buildRAGContext(
  subjectId: string,
  query: string,
  limit: number = TOP_K
): Promise<RAGContext> {
  const chunks = await searchSubjectVectors(subjectId, query, limit);
  const matched = chunks.some((c) => c.matched);

  const formattedContext = chunks
    .map((chunk, i) => `[Source ${i + 1} | Score: ${chunk.score.toFixed(2)}]\n${chunk.content}`)
    .join("\n\n---\n\n");

  return { query, chunks, formattedContext, matched };
}

/** Postgres full-text search — used when no embedding provider is configured. */
export async function searchSubjectLexical(
  subjectId: string,
  query: string,
  limit: number = TOP_K
): Promise<SearchResult[]> {
  const rows = await prisma.$queryRaw<
    { content: string; topic_id: string; subject_id: string; score: number; page_num: number | null }[]
  >`
    SELECT content, topic_id, subject_id, page_num,
           ts_rank(to_tsvector('english', content), websearch_to_tsquery('english', ${query})) AS score
    FROM "document_chunks"
    WHERE subject_id = ${subjectId}
      AND to_tsvector('english', content) @@ websearch_to_tsquery('english', ${query})
    ORDER BY score DESC
    LIMIT ${limit}
  `;

  if (rows.length > 0) return rows.map((r) => toResult(r, true));

  // A stopword query ("what is it") parses to an empty tsquery and matches
  // nothing. Returning the newest five chunks with score 0 pretended those were
  // sources for the question; the caller is told instead, so the model can say
  // the material does not cover it.
  return [];
}
