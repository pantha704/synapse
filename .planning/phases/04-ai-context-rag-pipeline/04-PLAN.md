# Phase 4: AI Context & RAG Pipeline Setup — Plan

## Plan 1: pgvector Extension & Schema

**Tasks:**
1. Enable pgvector extension in Supabase via SQL
2. Add `document_chunks` table to Prisma schema with vector column
3. Add `embedding_model` and `embedding_dim` config fields
4. Push schema to Supabase

**Files:**
- `prisma/schema.prisma` — Add DocumentChunk model
- SQL migration for pgvector extension

---

## Plan 2: Document Ingestion Pipeline

**Tasks:**
1. Install dependencies: `pdf-parse`, `@langchain/textsplitters`, `groq-sdk`
2. Create `src/lib/ai/ingestion.ts` — PDF → text → chunks → embeddings
3. Create `src/lib/ai/embeddings.ts` — Groq embedding API wrapper
4. Create server action `ingestDocument(topicId, file)` — full pipeline
5. Add embedding generation on resource upload

**Files:**
- `src/lib/ai/ingestion.ts`
- `src/lib/ai/embeddings.ts`
- Update `src/app/actions/progress-actions.ts` or create `ai-actions.ts`

---

## Plan 3: Vector Search & RAG API

**Tasks:**
1. Create `src/lib/ai/search.ts` — vector similarity search with subject scoping
2. Create server action `searchTopicContext(topicId, query)` — RAG retrieval
3. Create `src/lib/ai/context-builder.ts` — format retrieved chunks for LLM context
4. Build `/api/ai/search` route for client-side semantic search

**Verification:**
- pgvector extension enabled and queryable
- Document chunks table created with vector column
- PDF upload triggers embedding generation
- Semantic search returns relevant chunks for a query
- Subject scoping works (only returns chunks from specified subject)
