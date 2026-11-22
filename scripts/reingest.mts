/**
 * Re-index one topic's PDF with the current chunker.
 *
 * The chunker changed (sentence boundaries, page numbers, TOC rejection) but the
 * rows already in document_chunks were produced by the old one — a deploy alone
 * does not re-read them. Run this after a chunker change:
 *
 *   set -a; . ./.env.local; set +a
 *   npx tsx scripts/reingest.mts docs/report/Synapse_Proposal_corrected.pdf proposal.pdf
 *
 * Args: <pdf path> [source_url]. Without source_url it re-indexes the first
 * topic that already has chunks.
 */
import { readFileSync } from "node:fs";
import { prisma } from "../src/lib/prisma";
import { ingestDocument } from "../src/lib/ai/ingestion";

async function main() {
  const pdfPath = process.argv[2];
  const sourceUrl = process.argv[3];

  if (!pdfPath) {
    console.error("usage: npx tsx scripts/reingest.mts <pdf> [source_url]");
    process.exit(1);
  }

  let topicId: string;
  let subjectId: string;

  if (sourceUrl) {
    const existing = await prisma.$queryRaw<{ topic_id: string; subject_id: string }[]>`
      SELECT topic_id, subject_id FROM "document_chunks"
      WHERE source_url = ${sourceUrl} LIMIT 1
    `;
    if (existing.length === 0) {
      console.error(`no chunks with source_url = ${sourceUrl}`);
      process.exit(1);
    }
    topicId = existing[0].topic_id;
    subjectId = existing[0].subject_id;
  } else {
    const existing = await prisma.$queryRaw<{ topic_id: string; subject_id: string }[]>`
      SELECT topic_id, subject_id FROM "document_chunks" LIMIT 1
    `;
    if (existing.length === 0) {
      console.error("no chunks in the database to re-index");
      process.exit(1);
    }
    topicId = existing[0].topic_id;
    subjectId = existing[0].subject_id;
  }

  const before = await prisma.$queryRaw<{ n: bigint; max: number | null; pages: bigint }[]>`
    SELECT count(*) AS n, max(length(content)) AS max, count(page_num) AS pages
    FROM "document_chunks" WHERE topic_id = ${topicId}
  `;

  const buffer = readFileSync(pdfPath);
  const result = await ingestDocument(topicId, subjectId, buffer, sourceUrl ?? "proposal.pdf");

  const after = await prisma.$queryRaw<
    { n: bigint; max: number | null; pages: bigint; lower: bigint }[]
  >`
    SELECT count(*) AS n,
           max(length(content)) AS max,
           count(page_num) AS pages,
           count(*) FILTER (WHERE content ~ '^[a-z0-9]') AS lower
    FROM "document_chunks" WHERE topic_id = ${topicId}
  `;

  console.log(
    JSON.stringify(
      {
        topicId,
        before: { chunks: Number(before[0].n), maxLen: before[0].max, withPageNum: Number(before[0].pages) },
        ingest: result,
        after: {
          chunks: Number(after[0].n),
          maxLen: after[0].max,
          withPageNum: Number(after[0].pages),
          startsLowercase: `${Number(after[0].lower)}/${Number(after[0].n)}`,
        },
      },
      null,
      2
    )
  );

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
