# Phase 8: The Seed Engine (Demo Prep) — Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Create comprehensive demo seeding for hackathon presentations:
- Robust seeder script that populates: institutions, users (teachers + students), batches, subjects, topic nodes, resources, progress data, engagement events
- Pre-structured mindmap trees with realistic curriculum data
- Historic event logs for engagement analytics
- 1-click reset for presentations to judges
- Frictionless onboarding flow

</domain>

<decisions>
## Implementation Decisions

### Seeder Script
- `scripts/seed-demo.ts` — comprehensive seed script using Prisma
- Creates "Demo University" institution
- 2 teachers, 2 batches, 3 subjects, 12+ topic nodes per subject
- 20+ students with varied progress levels (some progressing, some stuck, some inactive)
- Pre-populated engagement events with realistic timestamps
- AI session history with sample conversations

### Data Structure
- Institution: "Demo University" (slug: demo-university)
- Batches: "CS101 - Fall 2024", "CS201 - Spring 2025"
- Subjects: "Introduction to CS", "Data Structures", "Algorithms"
- Topics: realistic curriculum tree (Intro → Variables → Functions → ... → Advanced topics)
- Students: diverse names, varied progress (0% to 100%)

### Reset Mechanism
- `scripts/reset-demo.ts` — drops and recreates all demo data
- Can be triggered via API endpoint `/api/admin/reset-demo` (teacher-only)
- Confirmation dialog before reset

### the agent's Discretion
- Use deterministic IDs for reproducibility (same data every seed)
- Timestamps relative to "now" so demo always looks current
- Include at least one AI conversation per subject for chat demo
- Add some document chunks for RAG demo

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- All Prisma models defined and working
- Supabase connection established
- Server actions for all CRUD operations

### Integration Points
- Seed script uses Prisma directly (bypasses server actions for speed)
- Reset endpoint needs auth check (only teachers/admins)

</code_context>

<specifics>
## Specific Ideas

- "Demo Mode" banner visible in UI when seeded data detected
- One-click "Reset Demo" button in teacher settings
- Pre-filled AI chat conversations showing RAG in action

</specifics>

<deferred>
## Deferred Ideas

- Multiple demo scenarios (different subjects, difficulty levels)
- Video walkthrough of demo data
- Printable demo script for presenters

</deferred>
