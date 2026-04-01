# MindMapClass

## What This Is

MindMapClass is a multi-tenant academic progress platform that combines Google Classroom's teacher/student role management with NotebookLM's interactive mindmap visualization. Teachers create batches, upload curriculum resources, and track progress on a pannable/zoomable mindmap canvas. Students see their class progress as a game-like skill tree — topics completed, in-progress, and upcoming — and interact with course materials through an AI-powered chat assistant. Built as a web app for hackathon judging, designed for any school or university.

## Core Value

Students and teachers see the entire course journey as a living, interactive mindmap — making academic progress tangible, visual, and engaging like leveling up in a game.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Multi-tenant institution management (multiple schools/universities, each isolated)
- [ ] Role-based access: Admin, Teacher, Student
- [ ] Batch/class creation and management by teachers
- [ ] Subject assignment per batch with teacher ownership
- [ ] Student onboarding via admin bulk CSV upload + join codes
- [ ] Pannable/zoomable canvas mindmap (React Flow / D3) as the main interface
- [ ] Mindmap shows full topic tree per subject — root → chapters → topics
- [ ] Topic node status: locked → upcoming → in-progress → completed (game-like progression)
- [ ] Dual progress tracking: teacher marks batch-wide class coverage, students mark personal study progress
- [ ] Clicking a node opens a smooth modal transition showing resources, subtopics, and completion status
- [ ] Teacher uploads curriculum resources (PDFs, videos, links, docs) attached to mindmap nodes
- [ ] AI-assisted curriculum sequencing — teacher provides materials, AI arranges topic order (or teacher drags manually)
- [ ] Per-student AI chat powered by Groq + NVIDIA NIM with RAG over uploaded resources
- [ ] AI chat is context-scoped per subject (no cross-subject context bleed), with session reset
- [ ] AI remembers important student details across sessions
- [ ] AI can analyze announcements, assignments, deadlines and proactively inform students
- [ ] Announcements system — teachers post notices, forms, homework to batch
- [ ] Assignment/homework system attached to mindmap nodes
- [ ] Silent engagement tracking (login check-in, resource views, time on topic, AI chat usage)
- [ ] 3-tier engagement status: 🟢 Progressing, 🟡 Active but stuck, 🔴 Inactive
- [ ] Teacher analytics dashboard — per-student progress, batch-wide heatmap, struggling topics
- [ ] Admin analytics — teacher performance, batch comparisons, institution overview
- [ ] Gamification — XP per completed topic, level badges, streaks
- [ ] Progress export as PDF reports for admin/teacher
- [ ] Left sidebar with subject dropdown and batch switcher (teachers only)
- [ ] Responsive web app (Next.js)
- [ ] Space for Razorpay payment integration (not implemented in v1)

### Out of Scope

- Payment gateway (Razorpay) — deferred, placeholder architecture only for v1
- Mobile native app — web-first, mobile later
- ID card scanning for onboarding — too much OCR complexity, CSV + join codes sufficient
- Real-time video conferencing — not core to the mindmap progress value
- Plagiarism detection for assignments — complex, external service dependency
- Offline mode — web-first, requires service workers which add complexity

## Context

- **Hackathon/competition context**: The product needs to demonstrate full potential to judges — no paywalls, focus on wow factor and completeness
- **AI infrastructure**: User has access to NVIDIA NIM and Groq APIs for AI-powered features
- **Inspiration**: Google Classroom (roles, batch management, join codes) + NotebookLM (AI chat over documents, mindmap visualization)
- **The "game" metaphor**: Progress should feel like unlocking levels — visual differentiation between completed/active/locked nodes is critical to the UX
- **Key insight — engagement gap**: The difference between "teacher taught it" and "student learned it" is the most valuable data signal. The dual progress tracking makes this visible.
- **Silent engagement**: No check-in buttons. The system passively tracks logins, resource views, AI chat usage, and time-on-topic to determine engagement without student friction.
- **AI proactivity**: The chat assistant should not just answer questions but proactively surface pending assignments, important announcements, and suggest resources when a student appears stuck.

## Constraints

- **AI Backend**: Groq (fast inference for chat) + NVIDIA NIM (heavier tasks: curriculum analysis, auto-sequencing)
- **Web Framework**: Next.js (SSR, multi-tenant routing)
- **Database**: PostgreSQL + Prisma (relational data: institutions → batches → subjects → topics → resources)
- **Canvas**: React Flow or D3.js (pannable/zoomable mindmap)
- **Storage**: S3-compatible (resource file uploads — PDFs, videos, docs)
- **Multi-tenant**: Each institution fully isolated — data, branding, user base
- **No payments v1**: Razorpay placeholder architecture only
- **Hackathon timeline**: Scope accordingly — impressive demo over exhaustive features

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| CSV + Join Code onboarding (not ID scanning) | OCR is fragile, CSV covers institutional workflow, join code covers ad-hoc | — Pending |
| Dual progress tracking (teacher + student) | The engagement gap is the killer insight for analytics | — Pending |
| Groq + NVIDIA NIM for AI | User already has access, Groq is fast for chat, NIM for heavy lifting | — Pending |
| React Flow for mindmap canvas | Purpose-built for interactive node graphs, pan/zoom native | — Pending |
| Multi-tenant from day 1 | Competition requirement — must demo multi-school capability | — Pending |
| Silent engagement tracking | No friction for students, passive behavioral signals are more honest | — Pending |
| Subject-scoped AI chat | Prevents cross-contamination of context between subjects | — Pending |
| Web-first, no native mobile | Faster to build, judges can access immediately via browser | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after initialization*
