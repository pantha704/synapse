# Development Roadmap: MindMapClass

**Last Updated:** 2026-04-04

This roadmap defines the sequential phases for building MindMapClass, ensuring foundational systems (auth, data models) are robust before layering on complex interactive features and AI.

## Milestone 1: The Foundation 🧱
**Goal:** Establish the multi-tenant architecture and build the core interactive mindmap experience. The app must be visually functional without AI capabilities.

### Phase 1: Base Architecture & Multi-Tenancy ✅ COMPLETE
- ~~Scaffold Next.js 15 project with App Router.~~
- ~~Setup Supabase (PostgreSQL + Auth).~~
- ~~Implement Prisma schema with strict multi-tenant isolation (Institution -> Batch -> Subject -> Topic).~~
- ~~Create role-based dashboard scaffolding (Admin vs Teacher vs Student views).~~
- ~~Implement authentication flows and secure join codes.~~

### Phase 2: The Interactive Mindmap Canvas ✅ COMPLETE
- ~~Integrate `React Flow` into the Subject detail view.~~
- ~~Create custom React Flow nodes (ChapterNode, TopicNode) representing academic progress.~~
- ~~Implement canvas persistence (save/load node coordinates).~~
- ~~Teacher capability: Create nodes, link edges, defined sequence.~~
- ~~Student capability: View-only panning/zooming over the curriculum.~~
- **Pivot:** Replaced React Flow mindmap with Candy Crush-style game path
- Generated 3 UI variants in Stitch, selected **Academic Light** design
- Created AcademicLearningPath with dotted S-curve path and node cards
- Built PeerComparisonPanel — students can compare performance with class rankings
- Student dashboard: profile, weekly performance chart, activity feed, next milestone
- Teacher dashboard: batch pulse, critical nodes, engagement nebula

### Phase 3: Content & Progress Tracking ✅ COMPLETE
- ~~Implement Supabase Storage (S3) for resource uploads attached to specific TopicNodes.~~
- ~~Build the dual tracking logic: DB schema updates for Teachers assigning class-wide completion vs Students marking personal progress.~~
- ~~Visual updates: Canvas nodes dynamically change colors/styles based on these progress states.~~
- Created Supabase Storage client (`src/lib/storage.ts`) with upload/delete/getUrl helpers
- Added `teacher_progress` table — teachers assign class-wide progress per batch+topic
- Built server actions: `assignBatchTopicProgress`, `updatePersonalProgress`, `getClassRankings`
- PeerComparisonPanel ready to bind to real DB rankings

## Milestone 2: Intelligent Interactions 🧠
**Goal:** Introduce the AI Layer for the curriculum and passive engagement tracking systems.

### Phase 4: AI Context & RAG Pipeline Setup ✅ COMPLETE
- ~~Setup document ingestion pipeline: Parse uploaded PDFs, chunk text.~~
- ~~Configure `pgvector` in the PostgreSQL database.~~
- ~~Integrate embedding model (NVIDIA NIM or equivalent) to vectorize resources.~~
- ~~Create the subject-scoped vector similarity search logic.~~
- Enabled pgvector extension, created `document_chunks` table with HNSW vector index
- Groq SDK with NV-EmbedQA-E5-v5 embeddings (1024-dim)
- PDF ingestion: extract → chunk (500 chars) → embed → store
- Vector similarity search with subject/topic scoping + RAG context builder

### Phase 5: The Edge AI Chat ✅ COMPLETE
- ~~Embed chat interface alongside the mindmap.~~
- ~~Connect Vercel AI SDK to Groq for ultra-low latency inference.~~
- ~~Wire context: Student's query + the specific active Subject -> Vector Search -> Groq -> Streamed Response.~~
- ~~Implement strictly isolated session memory to prevent subject bleed.~~
- `ai_sessions` + `ai_messages` tables for per-subject session memory (24h expiry)
- `chatWithSubject()`: RAG retrieval + Groq llama-3.3-70b with source citations
- AIChatPanel with expandable source chunks, slide-in animation

### Phase 6: Silent Engagement Intelligence ✅ COMPLETE
- ~~Create lightweight event logging tables (Logins, Resource Views, Chat Messages).~~
- ~~Build the Engagement Engine: logic to classify students into 🟢 Progressing, 🟡 Stuck, 🔴 Inactive based on recent event frequency.~~
- ~~Teacher Analytics Dashboard: Visualize engagement heatmaps based on this data.~~
- `logEngagementEvent()` for passive tracking (LOGIN, PAGE_VIEW, RESOURCE_VIEW, AI_CHAT, TOPIC_COMPLETE)
- Classification: 🟢 Progressing (2d active + progress), 🟡 Stuck (7d active, no progress), 🔴 Inactive (7d+)
- Teacher analytics dashboard with filterable student cards and class summary bar

## Milestone 3: Demo & Polish ✨
**Goal:** Optimize the user experience for the hackathon judging environment and ensure "wow!" factor.

### Phase 7: UI Polish & Gamification Elements ✅ COMPLETE
- ~~Implement smooth transitions (Framer Motion) from node clicks to detail modals.~~
- ~~Add immediate visual feedback (confetti) for topic completions.~~
- ~~Refine overall design aesthetics, making the mindmap look premium.~~
- Confetti system: `triggerConfetti()`, `triggerNodeConfetti()`, `triggerCelebration()` with reduced motion support
- Loading skeletons: NodeSkeleton, RankingSkeleton, CardSkeleton, PathSkeleton
- Framer Motion animations throughout (panels, cards, lists, progress bars)
- Sonner toast notifications installed

### Phase 8: The Seed Engine (Demo Prep) ✅ COMPLETE
- ~~Create a comprehensive robust generic seeder script.~~
- ~~Generate high-quality dummy data: "Demo University", populated batches, pre-structured mindmap trees, and historic event logs.~~
- ~~Provide a 1-click reset for presentations to judges.~~
- ~~Ensure onboarding flow is frictionless.~~
- `scripts/seed-demo.ts` — full demo seeder: institution, 2 teachers, 2 batches, 3 subjects, 20+ topics, 10 students
- Varied progress profiles and engagement events across last 14 days
- Idempotent: cleans and recreates on each run

---

## 🎉 All 8 Phases Complete
