import { prisma } from "@/lib/prisma";
import { createEmbedding } from "./embeddings";

export interface SearchResult {
  content: string;
  topicId: string;
  subjectId: string;
  score: number;
  pageNum: number | null;
}

export interface RAGContext {
  query: string;
  chunks: SearchResult[];
  formattedContext: string;
}

const TOP_K = 5;

export async function searchSubjectVectors(
  subjectId: string,
  query: string,
  limit: number = TOP_K
): Promise<SearchResult[]> {
  // Generate embedding for the query
  const { embedding } = await createEmbedding(query);

  // Use raw SQL for vector similarity search
  const results = await prisma.$queryRaw<
    { content: string; topic_id: string; subject_id: string; score: number; page_num: number | null }[]
  >`
    SELECT
      content,
      topic_id,
      subject_id,
      page_num,
      1 - (embedding <=> ${`[${embedding.join(",")}]`}::vector(1024)) AS score
    FROM "document_chunks"
    WHERE subject_id = ${subjectId}
    ORDER BY embedding <=> ${`[${embedding.join(",")}]`}::vector(1024)
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    content: r.content,
    topicId: r.topic_id,
    subjectId: r.subject_id,
    score: r.score,
    pageNum: r.page_num,
  }));
}

export async function searchTopicVectors(
  topicId: string,
  query: string,
  limit: number = TOP_K
): Promise<SearchResult[]> {
  const { embedding } = await createEmbedding(query);

  const results = await prisma.$queryRaw<
    { content: string; topic_id: string; subject_id: string; score: number; page_num: number | null }[]
  >`
    SELECT
      content,
      topic_id,
      subject_id,
      page_num,
      1 - (embedding <=> ${`[${embedding.join(",")}]`}::vector(1024)) AS score
    FROM "document_chunks"
    WHERE topic_id = ${topicId}
    ORDER BY embedding <=> ${`[${embedding.join(",")}]`}::vector(1024)
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    content: r.content,
    topicId: r.topic_id,
    subjectId: r.subject_id,
    score: r.score,
    pageNum: r.page_num,
  }));
}

export async function buildRAGContext(
  subjectId: string,
  query: string,
  limit: number = TOP_K
): Promise<RAGContext> {
  const chunks = await searchSubjectVectors(subjectId, query, limit);

  const formattedContext = chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1} | Score: ${chunk.score.toFixed(2)}]\n${chunk.content}`
    )
    .join("\n\n---\n\n");

  return {
    query,
    chunks,
    formattedContext,
  };
}
