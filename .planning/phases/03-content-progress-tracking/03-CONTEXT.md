# Phase 3: Content & Progress Tracking - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement content management (resource uploads via Supabase Storage) and dual progress tracking system:
- Teachers can assign class-wide completion status for topics
- Students can mark personal progress on topics
- Canvas nodes dynamically update colors/styles based on progress states
- Peer comparison data reflects real progress from database

</domain>

<decisions>
## Implementation Decisions

### Resource Storage
- Use Supabase Storage buckets for PDF, video, and link resources
- Resources attached to specific TopicNodes
- Teacher-only upload permissions, student read-only

### Progress Tracking Schema
- Extend existing `student_progress` table with teacher-assigned status
- Add `teacher_progress` table for class-wide assignments
- Student personal progress is independent of teacher assignments
- Both track: NOT_STARTED → IN_PROGRESS → COMPLETED

### UI Updates
- Node cards show progress ring/badge based on combined status
- Green = fully completed, Blue = in progress, Gray = not started
- Peer comparison uses real-time progress percentages from DB

### the agent's Discretion
- Storage bucket naming convention: `{institution-slug}-{subject-slug}`
- File size limits: 50MB per resource
- Progress sync: optimistic UI updates with background refetch

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `LearningPath` component (dark variant) — can be adapted for progress colors
- `AcademicLearningPath` component (light variant) — current active design
- `PeerComparisonPanel` — already accepts progress data, just needs real data
- `StatsPanel` — teacher view with batch pulse and critical nodes
- Prisma schema has `StudentProgress`, `StudentResourceProgress` models ready

### Established Patterns
- Server components for data fetching, client components for interactivity
- `createClient()` from `@/utils/supabase/client` for browser Supabase calls
- Server actions in `src/app/actions/` for mutations
- Mock data in `src/data/mockData.ts` — replace with real DB queries

### Integration Points
- Topic nodes in `AcademicLearningPath` need progress prop from DB
- Peer comparison needs aggregate student progress query
- Resource uploads need Supabase Storage bucket setup
- Teacher subject detail page needs resource management UI

</code_context>

<specifics>
## Specific Ideas

- Add file upload drag-and-drop zone in teacher subject view
- Show resource count badge on each topic node
- Student can see which resources are required vs optional
- Progress sync between teacher view and student view in real-time
- Consider adding "study streak" tracking for gamification

</specifics>

<deferred>
## Deferred Ideas

- AI-generated study recommendations based on progress gaps
- Automated resource suggestions from RAG pipeline (Phase 4)
- Study group formation based on complementary progress levels

</deferred>
