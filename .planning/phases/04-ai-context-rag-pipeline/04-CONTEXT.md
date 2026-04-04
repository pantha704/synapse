# Phase 4: AI Context & RAG Pipeline Setup - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the AI/RAG infrastructure for subject-scoped document intelligence:
- Enable pgvector extension in Supabase PostgreSQL
- Create document ingestion pipeline (PDF upload → text extraction → chunking → embedding)
- Store embeddings in vector-enabled tables linked to subjects/topics
- Integrate embedding model (Groq with NVIDIA NIM or open-source alternative)
- Build vector similarity search scoped to subject/batch
- Create API endpoints for semantic search over course materials

</domain>

<decisions>
## Implementation Decisions

### Vector Database
- Use Supabase's pgvector extension (already available as a Supabase extension)
- Store embeddings in a dedicated `document_chunks` table with vector column
- Each chunk linked to subject_id, topic_id, and batch_id for scoping

### Embedding Model
- Use Groq API for fast inference (already in env plan)
- Model: nvidia/nv-embedqa-e5-v5 or BGE-m3 for high-quality embeddings (1024-dim)
- Alternative: OpenAI text-embedding-3-small as fallback
- Embeddings generated server-side via server actions

### Document Processing
- PDF extraction: pdf-parse library for server-side PDF text extraction
- Text chunking: Recursive character chunking (500 chars, 50 char overlap)
- Each chunk stores: text, embedding (vector), topic_id, subject_id, page_number
- Metadata: source file name, upload date, chunk index

### Search API
- Subject-scoped: query + subject_id → top-k relevant chunks
- Batch-scoped: query + batch_id → chunks from all subjects in that batch
- RAG context building: retrieve chunks → format as context → send to LLM

### the agent's Discretion
- Chunk size: 500 characters with 50 overlap (balance between context and precision)
- Top-k retrieval: 5 chunks per query
- Vector dimension: 1024 (matches NV-EmbedQA-E5-v5)
- Use Supabase's built-in pgvector functions for similarity search (<=> operator)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/storage.ts` — Supabase Storage client for PDF uploads
- `src/lib/prisma.ts` — Prisma client (need to add vector support)
- `prisma/schema.prisma` — Has subjects, topics, resources tables ready
- `src/app/actions/` — Server actions pattern established

### Established Patterns
- Server actions for mutations, server components for data fetching
- Supabase client for auth and storage
- Mock data in `src/data/mockData.ts` for UI development

### Integration Points
- Need to add pgvector extension via Supabase SQL editor or migration
- Need to extend Prisma schema with document_chunks table (vector column)
- Need to add Groq API key to .env
- PDF upload flow connects to existing storage bucket

</code_context>

<specifics>
## Specific Ideas

- Add "Ask AI about this topic" button on each topic node
- Show RAG-sourced answers inline in the topic detail panel
- Track which chunks were used for each AI response (for transparency)
- Cache embeddings for frequently accessed documents

</specifics>

<deferred>
## Deferred Ideas

- Multi-modal embeddings (images in PDFs)
- Real-time embedding updates when documents change
- Cross-subject semantic search (global knowledge base)

</deferred>
