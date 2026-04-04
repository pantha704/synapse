import * as pdfParse from "pdf-parse";
import { createEmbeddings } from "./embeddings";
import { prisma } from "@/lib/prisma";

export interface Chunk {
  content: string;
  pageNum: number | null;
  chunkIdx: number;
}

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    let chunkEnd = end;

    // Try to break at sentence boundary
    if (end < text.length) {
      const lastSentence = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const breakPoint = Math.max(lastSentence, lastNewline);
      if (breakPoint > start + CHUNK_SIZE / 2) {
        chunkEnd = breakPoint + 1;
      }
    }

    const chunk = text.slice(start, chunkEnd).trim();
    if (chunk.length > 10) {
      chunks.push(chunk);
    }

    start = chunkEnd - CHUNK_OVERLAP;
    if (start <= 0) start = chunkEnd;
  }

  return chunks;
}

export async function extractPdfText(buffer: Buffer): Promise<{ text: string; pages: number }> {
  const result = await (pdfParse as unknown as (buf: Buffer) => Promise<{text: string; numpages: number}>)(buffer);
  return { text: result.text, pages: result.numpages };
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

  // Generate embeddings for all chunks
  const embeddingResults = await createEmbeddings(chunks);

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
