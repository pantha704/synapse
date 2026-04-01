# Stack Research: MindMapClass

**Researched:** 2026-04-01
**Domain:** EdTech / LMS / Mindmap-based Progress Platform

## Recommended Stack (2025-2026)

### Frontend

| Technology | Version | Confidence | Rationale |
|-----------|---------|------------|-----------|
| **Next.js** | 15.x | ✅ High | SSR/SSG for performance, App Router for multi-tenant routing, Server Actions for backend logic |
| **React** | 19.x | ✅ High | Industry standard, massive ecosystem, pairs with React Flow |
| **React Flow** | 12.x | ✅ High | Purpose-built for interactive node-based graphs. Pan/zoom native. 1300+ doc snippets. Custom nodes, edges, click handlers. **THE** library for this use case |
| **Zustand** | 5.x | ✅ High | Lightweight state management, performs well with React Flow updates |
| **Framer Motion** | 11.x | ✅ High | Smooth modal transitions (node → detail view), micro-animations |
| **TypeScript** | 5.x | ✅ High | End-to-end type safety is critical for multi-tenant data isolation |

### Backend

| Technology | Version | Confidence | Rationale |
|-----------|---------|------------|-----------|
| **Next.js API Routes / Server Actions** | 15.x | ✅ High | Keep backend co-located for hackathon speed. Split later if needed |
| **tRPC** | 11.x | 🟡 Medium | End-to-end type safety with Prisma. Optional — API Routes are sufficient for v1 |
| **NextAuth.js (Auth.js)** | 5.x | ✅ High | Authentication with credential provider, role-based access (Admin/Teacher/Student) |

### Database & Storage

| Technology | Version | Confidence | Rationale |
|-----------|---------|------------|-----------|
| **PostgreSQL** | 16.x | ✅ High | ACID-compliant relational DB. Perfect for tenant → batch → subject → topic hierarchy |
| **Prisma** | 6.x | ✅ High | Type-safe ORM, excellent migrations, schema-first approach |
| **pgvector** extension | 0.7+ | ✅ High | Vector similarity search directly in PostgreSQL — no separate vector DB needed |
| **S3-compatible storage** (MinIO / Cloudflare R2) | - | ✅ High | Resource file uploads (PDFs, videos, docs). R2 is free egress |

### AI / RAG Pipeline

| Technology | Confidence | Rationale |
|-----------|------------|-----------|
| **Groq** | ✅ High | Ultra-fast inference for student chat (low TTFT critical for UX) |
| **NVIDIA NIM** | ✅ High | Heavy lifting — curriculum analysis, auto-topic-sequencing, PDF understanding |
| **LangChain.js** or **Vercel AI SDK** | 🟡 Medium | RAG orchestration. Vercel AI SDK is lighter and Next.js native |
| **PDF parsing: pdf-parse + MarkItDown** | ✅ High | Text extraction from uploaded PDFs. Lightweight, reliable |
| **Chunking: Recursive Character (~512 tokens, 10-20% overlap)** | ✅ High | Best baseline for academic/technical text |

### Real-time & Analytics

| Technology | Confidence | Rationale |
|-----------|------------|-----------|
| **Server-Sent Events (SSE)** | ✅ High | Announcements push, engagement updates. Simpler than WebSockets for our use case |
| **Redis** (optional v2) | 🟡 Medium | Caching frequently accessed data (course structures, session data). Not needed for v1 |
| **Event logging table** | ✅ High | Track login, resource views, time on topic, chat usage for engagement scoring |

### Deployment

| Technology | Confidence | Rationale |
|-----------|------------|-----------|
| **Vercel** | ✅ High | Next.js native deployment, free tier, instant preview deploys for hackathon demos |
| **Supabase** (PostgreSQL + pgvector + Auth + Storage) | ✅ High | All-in-one: managed Postgres, vector search, file storage, auth. **Massive time saver for hackathon** |

## What NOT to Use

| Technology | Why Not |
|-----------|---------|
| **MongoDB** | Relational data (institution→batch→subject→topic) is a poor fit for document DB |
| **Separate vector DB (Pinecone/Weaviate)** | pgvector in PostgreSQL is sufficient and avoids managing another service |
| **Socket.io/WebSockets** | Overkill for our use case. No real-time collaboration on the canvas (teacher edits, students view). SSE is sufficient |
| **Microservices** | Hackathon timeline. Monolith-first with Next.js, split later |
| **Docker/Kubernetes** | Deployment complexity. Vercel + Supabase handles this |
| **Firebase** | PostgreSQL is a better fit for relational data, and we need pgvector for RAG |

## Critical Notes

1. **Supabase as the backend powerhouse**: Provides managed PostgreSQL (with pgvector), file storage (S3-compatible), Row-Level Security for multi-tenancy, and auth — all in one. This is the highest-leverage choice for a hackathon.
2. **React Flow is essential**: No other library provides the pan/zoom node-based canvas experience we need with this level of customization (custom node components, minimap, controls, fit-to-view).
3. **Vercel AI SDK over LangChain**: For a Next.js app, Vercel AI SDK provides streaming responses, built-in React hooks, and less overhead than LangChain.

---
*Researched: 2026-04-01*
