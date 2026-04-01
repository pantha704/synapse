# Development Roadmap: MindMapClass

**Last Updated:** 2026-04-01

This roadmap defines the sequential phases for building MindMapClass, ensuring foundational systems (auth, data models) are robust before layering on complex interactive features and AI.

## Milestone 1: The Foundation 🧱
**Goal:** Establish the multi-tenant architecture and build the core interactive mindmap experience. The app must be visually functional without AI capabilities.

### Phase 1: Base Architecture & Multi-Tenancy
- Scaffold Next.js 15 project with App Router.
- Setup Supabase (PostgreSQL + Auth).
- Implement Prisma schema with strict multi-tenant isolation (Institution -> Batch -> Subject -> Topic).
- Create role-based dashboard scaffolding (Admin vs Teacher vs Student views).
- Implement authentication flows and secure join codes.

### Phase 2: The Interactive Mindmap Canvas
- Integrate `React Flow` into the Subject detail view.
- Create custom React Flow nodes (ChapterNode, TopicNode) representing academic progress.
- Implement canvas persistence (save/load node coordinates).
- Teacher capability: Create nodes, link edges, defined sequence.
- Student capability: View-only panning/zooming over the curriculum.

### Phase 3: Content & Progress Tracking
- Implement Supabase Storage (S3) for resource uploads attached to specific TopicNodes.
- Build the dual tracking logic: DB schema updates for Teachers assigning class-wide completion vs Students marking personal progress.
- Visual updates: Canvas nodes dynamically change colors/styles based on these progress states.

## Milestone 2: Intelligent Interactions 🧠
**Goal:** Introduce the AI Layer for the curriculum and passive engagement tracking systems.

### Phase 4: AI Context & RAG Pipeline Setup
- Setup document ingestion pipeline: Parse uploaded PDFs, chunk text.
- Configure `pgvector` in the PostgreSQL database.
- Integrate embedding model (NVIDIA NIM or equivalent) to vectorize resources.
- Create the subject-scoped vector similarity search logic.

### Phase 5: The Edge AI Chat
- Embed chat interface alongside the mindmap.
- Connect Vercel AI SDK to Groq for ultra-low latency inference.
- Wire context: Student's query + the specific active Subject -> Vector Search -> Groq -> Streamed Response.
- Implement strictly isolated session memory to prevent subject bleed.

### Phase 6: Silent Engagement Intelligence
- Create lightweight event logging tables (Logins, Resource Views, Chat Messages).
- Build the Engagement Engine: logic to classify students into 🟢 Progressing, 🟡 Stuck, 🔴 Inactive based on recent event frequency.
- Teacher Analytics Dashboard: Visualize engagement heatmaps based on this data.

## Milestone 3: Demo & Polish ✨
**Goal:** Optimize the user experience for the hackathon judging environment and ensure "wow!" factor.

### Phase 7: UI Polish & Gamification Elements
- Implement smooth transitions (Framer Motion) from node clicks to detail modals.
- Add immediate visual feedback (confetti) for topic completions.
- Refine overall design aesthetics, making the mindmap look premium.

### Phase 8: The Seed Engine (Demo Prep)
- Create a comprehensive robust generic seeder script.
- Generate high-quality dummy data: "Demo University", populated batches, pre-structured mindmap trees, and historic event logs.
- Provide a 1-click reset for presentations to judges.
- Ensure onboarding flow is frictionless.
