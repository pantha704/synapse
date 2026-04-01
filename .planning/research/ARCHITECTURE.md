# Architecture Research: MindMapClass

**Researched:** 2026-04-01
**Domain:** EdTech / LMS / Mindmap-based Progress Platform

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Sidebar  │  │   Mindmap    │  │   Chat   │  │  Dashboard │ │
│  │  Nav +    │  │   Canvas     │  │  Panel   │  │  Analytics │ │
│  │  Filters  │  │ (React Flow) │  │  (AI)    │  │  (Charts)  │ │
│  └──────────┘  └──────────────┘  └──────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Next.js API Layer │
                    │  (Server Actions)  │
                    └─────────┬─────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────┴─────┐    ┌───────┴───────┐    ┌──────┴──────┐
    │ PostgreSQL │    │   AI Layer    │    │  S3 Storage │
    │ + pgvector │    │ Groq + NIM   │    │ (Resources) │
    │ (Supabase) │    │ + Embeddings │    │ (Supabase)  │
    └───────────┘    └─────────────┘    └─────────────┘
```

## Major Components

### 1. Multi-Tenant Data Layer

**Strategy:** Shared database with `tenant_id` column + Row-Level Security (RLS)

```
Institution (tenant)
  ├── Users (admin, teachers, students)
  ├── Batches
  │   ├── Subjects
  │   │   ├── Topics (mindmap nodes)
  │   │   │   ├── Resources (files, links)
  │   │   │   ├── Assignments
  │   │   │   └── Topic Progress (per student + batch-wide)
  │   │   └── AI Chat Sessions
  │   ├── Announcements
  │   └── Student Enrollments
  └── Analytics Events
```

**Why shared DB not separate DBs:** Operational simplicity at scale. RLS ensures data isolation without DB-per-tenant sprawl.

### 2. Mindmap Canvas (React Flow)

**Architecture:**
- Custom node components for topic visualization (status colors, icons, progress bars)
- Custom edge components for dependency/sequence arrows
- Zustand store for canvas state (nodes, edges, viewport)
- Server-synced: Canvas layout persisted to DB, loaded on mount
- Teacher mode: Drag nodes, add/remove topics, attach resources
- Student mode: View-only layout, click to open detail modal

**Node Types:**
- `TopicNode` — Standard topic with status indicator
- `ChapterNode` — Grouping node for chapter headers
- `RootNode` — Subject root with batch name

**Status Flow:**
```
locked → upcoming → in-progress → completed
  🔒        ⬜         🟡           ✅
```

### 3. AI/RAG Pipeline

```
Resource Upload → PDF Parse → Chunk (512 tokens) → Embed → pgvector
                                                              │
Student Question → Embed Query → Vector Search → Rerank → LLM → Response
                                                              │
                                                   ┌──────────┴──────────┐
                                                   │ Subject-scoped      │
                                                   │ context filter      │
                                                   │ (only resources     │
                                                   │  from active subj)  │
                                                   └─────────────────────┘
```

**Key design decisions:**
- pgvector for vector storage (co-located with relational data)
- Subject-scoped retrieval (filter by subject_id before similarity search)
- Student memory stored as structured JSON (key facts, preferences)
- Session isolation via session_id with explicit reset
- Groq for fast chat inference
- NVIDIA NIM for curriculum analysis (heavier reasoning tasks)

### 4. Engagement Tracking System

```
Student Action → Event Log (DB table) → Background Job → Engagement Score
                                                              │
                                              ┌───────────────┼───────────────┐
                                              │               │               │
                                        🟢 Progressing  🟡 Stuck     🔴 Inactive
                                        (active +       (active but   (no signals
                                         completing)    not moving)    for X days)
```

**Events tracked:**
- `login` (timestamp, device)
- `resource_view` (resource_id, duration)
- `topic_view` (topic_id, duration)
- `chat_message` (subject_id, topic context)
- `announcement_read` (announcement_id)
- `assignment_submit` (assignment_id)
- `topic_complete` (topic_id, type: batch/personal)

**Scoring algorithm:**
- Recency-weighted activity score (recent actions weigh more)
- Computed on read (when teacher opens dashboard) or via periodic background job
- Thresholds configurable per institution

### 5. Authentication & Authorization

**Strategy:** NextAuth.js with credential provider + role-based middleware

```
Roles:
  SUPER_ADMIN — Platform owner (manages institutions)
  ADMIN       — Institution admin (manages teachers, students, batches)
  TEACHER     — Creates batches, subjects, uploads resources, tracks progress
  STUDENT     — Views mindmap, marks progress, uses AI chat
```

**Authorization middleware:**
- Route-level protection (Server Components check session)
- API-level protection (Server Actions check role + tenant)
- Data-level protection (Prisma middleware adds tenant_id filter)

## Data Flow

### Teacher Creates Curriculum
```
Teacher → Create Batch → Add Subjects → Add Topics (mindmap nodes)
       → Upload Resources per topic → AI suggests sequence (optional)
       → Share join code → Students enroll
```

### Student Learning Flow
```
Student → Login (silent check-in) → View Mindmap
       → Click topic → View resources → Study
       → Mark personal progress → AI chat for help
       → Check announcements → Submit assignments
```

### Analytics Flow
```
Events accumulate → Teacher opens dashboard
                  → Aggregate per student/batch
                  → Show engagement heatmap, progress chart, stuck alerts
```

## Suggested Build Order

1. **Auth + Multi-tenant** (foundation — everything depends on this)
2. **Batch/Subject/Topic CRUD** (the data model for the mindmap)
3. **Mindmap Canvas** (the hero feature — visual wow factor)
4. **Resource Management** (attach files to nodes)
5. **Progress Tracking** (dual tracking, visual indicators)
6. **AI RAG Pipeline** (chat, resource Q&A)
7. **Announcements + Assignments** (engagement ecosystem)
8. **Analytics Dashboard** (data visualization)
9. **Gamification** (XP, badges, streaks — layered on top)
10. **AI Proactive Features** (nudges, task awareness)

## Scaling Considerations (Post-Hackathon)

- **Database:** Read replicas for analytics queries
- **AI:** Cache common embeddings, batch processing for resource ingestion
- **Storage:** CDN for resource delivery (Cloudflare R2 has free egress)
- **Multi-tenant:** Tenant-specific rate limiting to prevent noisy neighbor
- **Canvas:** Virtualize off-screen nodes for large topic trees (React Flow supports this)

---
*Researched: 2026-04-01*
