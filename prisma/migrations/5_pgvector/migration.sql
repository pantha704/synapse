-- pgvector never existed in the migration history: 0_init declares
-- vector(1024) but nothing created the extension, so `prisma migrate deploy` on a
-- fresh database failed before the first table. The vector column also had no
-- ANN index, making every similarity query a full scan.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX IF NOT EXISTS "document_chunks_embedding_hnsw"
  ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);
