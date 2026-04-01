# Research Summary: MindMapClass

**Synthesized:** 2026-04-01

## Key Findings

### Stack
**Next.js 15 + React Flow 12 + Supabase (PostgreSQL + pgvector + Storage + Auth) + Groq + NVIDIA NIM**

Supabase is the highest-leverage choice — it provides managed PostgreSQL with pgvector for RAG, file storage for resources, Row-Level Security for multi-tenancy, and auth, all in one platform. React Flow is the definitive library for the interactive mindmap canvas (pan, zoom, custom nodes). Groq provides ultra-fast chat inference; NVIDIA NIM handles heavier curriculum analysis.

### Table Stakes
- Role-based auth (Admin/Teacher/Student) with multi-tenant isolation
- Batch/subject management with join codes and CSV bulk upload
- Pannable/zoomable mindmap canvas with topic status visualization
- Resource upload attached to mindmap nodes
- Dual progress tracking (teacher batch-wide + student personal)
- Announcements with attachments

### Differentiators
- **AI Chat (RAG)** — subject-scoped, per-student context, resource-aware
- **Engagement Intelligence** — passive behavioral signals, 3-tier status, heatmaps
- **Gamification** — XP, badges, streaks make progress tangible
- **AI Proactive Features** — nudges, assignment awareness, announcement analysis
- **Dual Progress Gap** — the insight between "taught" and "learned" is unique

### Watch Out For
1. **🔴 Multi-tenant data leakage** — Prisma middleware + RLS must be bulletproof
2. **🔴 Empty demo** — Seed data is critical for hackathon judges
3. **🟡 React Flow performance** — Virtualize, memoize, use Zustand not Context
4. **🟡 AI context bleed** — Strict subject_id filtering on vector search
5. **🟡 RAG quality** — PDF parsing validation, fallback to OCR
6. **🟡 Privacy** — Be transparent about engagement tracking

### Architecture
- Monolith-first with Next.js (App Router + Server Actions)
- Shared database with tenant_id + RLS
- RAG pipeline: PDF parse → chunk → embed → pgvector → Groq inference
- Event logging for engagement scoring (computed on dashboard read)
- Build order: Auth → Data Model → Canvas → Resources → Progress → AI → Analytics → Gamification

### Critical Recommendation
**The mindmap IS the product.** The AI enhances it but is not the core. Prioritize making the canvas interaction beautiful, smooth, and visually impressive before investing in AI features. Judges will be wowed by a gorgeous mindmap before they try the chat.

---

## Files

| File | Contents |
|------|----------|
| [STACK.md](./STACK.md) | Technology recommendations with versions and confidence |
| [FEATURES.md](./FEATURES.md) | Table stakes, differentiators, anti-features, complexity |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System diagram, data flow, component boundaries, build order |
| [PITFALLS.md](./PITFALLS.md) | 10 domain-specific pitfalls with prevention strategies |

---
*Synthesized: 2026-04-01*
