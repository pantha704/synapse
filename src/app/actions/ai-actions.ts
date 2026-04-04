'use server';

import { prisma } from '@/lib/prisma';
import { ingestDocument, deleteTopicChunks } from '@/lib/ai/ingestion';
import { buildRAGContext, searchSubjectVectors } from '@/lib/ai/search';
import { createEmbedding } from '@/lib/ai/embeddings';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ─── Document Ingestion ──────────────────────────────────────────

export async function ingestResourcePdf(
  resourceId: string,
  topicId: string,
  subjectId: string,
  pdfUrl: string
) {
  const supabase = await createClient();

  // Download PDF from storage
  const { data: pdfData, error: downloadError } = await supabase.storage
    .from('resources')
    .download(pdfUrl);

  if (downloadError || !pdfData) {
    throw new Error(`Failed to download PDF: ${downloadError?.message}`);
  }

  const buffer = Buffer.from(await pdfData.arrayBuffer());

  // Ingest PDF
  const result = await ingestDocument(topicId, subjectId, buffer, pdfUrl);

  revalidatePath(`/teacher/subjects/${subjectId}`);
  return result;
}

export async function deleteResourceEmbeddings(resourceId: string) {
  // Delete all chunks for this resource
  await prisma.$executeRaw`
    DELETE FROM "document_chunks" WHERE source_url LIKE ${`%${resourceId}%`}
  `;
}

// ─── RAG Search ──────────────────────────────────────────────────

export async function searchSubjectContext(
  subjectId: string,
  query: string
) {
  return buildRAGContext(subjectId, query);
}

export async function searchTopicContext(
  topicId: string,
  query: string
) {
  // First get the subject_id from the topic
  const topic = await prisma.topicNode.findUnique({
    where: { id: topicId },
    select: { subjectId: true }
  });

  if (!topic) {
    throw new Error('Topic not found');
  }

  return buildRAGContext(topic.subjectId, query);
}

// ─── Chunk Management ────────────────────────────────────────────

export async function getTopicChunkCount(topicId: string) {
  const count = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) FROM "document_chunks" WHERE topic_id = ${topicId}
  `;
  return Number(count[0]?.count || 0);
}

export async function getSubjectChunkCount(subjectId: string) {
  const count = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) FROM "document_chunks" WHERE subject_id = ${subjectId}
  `;
  return Number(count[0]?.count || 0);
}
