-- Full-text search index for the retrieval fallback (no embedding provider).
CREATE INDEX IF NOT EXISTS "document_chunks_fts_idx"
  ON "document_chunks"
  USING GIN (to_tsvector('english', "content"));
