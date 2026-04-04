# Phase 3: Content & Progress Tracking — Plans

## Plan 1: Supabase Storage Integration

**Goal:** Set up Supabase Storage buckets and create resource upload/download system for TopicNodes.

### Tasks
1. Create Supabase Storage bucket `resources` with RLS policies (teachers write, students read)
2. Add `resource_url` and `resource_type` fields to `resources` table (already exists in schema)
3. Build teacher-side file upload component (drag-and-drop, PDF/video/link support)
4. Build student-side resource viewer (embedded PDF viewer, video player, link opener)
5. Connect resources to topic nodes — show resource count badge on each node card

**Files to create/modify:**
- `src/lib/storage.ts` — Supabase Storage client helpers
- `src/app/(dashboard)/teacher/subjects/[subjectId]/upload-resource.tsx` — upload UI
- `src/app/(dashboard)/student/subjects/[subjectId]/resource-viewer.tsx` — resource viewer
- Update `AcademicPathNode` to show resource count badge

**Verification:**
- Teacher can upload a PDF resource to a topic
- Student can view/download the resource
- Resource count badge appears on topic node
- RLS prevents student uploads

---

## Plan 2: Dual Progress Tracking System

**Goal:** Implement teacher class-wide progress assignments and student personal progress tracking.

### Tasks
1. Add `teacher_progress` table: `{batchId, topicId, status, assignedAt, assignedBy}`
2. Extend `student_progress` with `personalStatus` field (separate from teacher-assigned)
3. Create server actions: `assignTopicProgress`, `updatePersonalProgress`
4. Build teacher UI: batch progress assignment modal (select topic → set status for entire class)
5. Build student UI: personal progress toggle on each topic node (mark as started/in-progress/complete)
6. Merge logic: node card color reflects combined status (teacher-assigned overrides for display, personal shown as secondary)
7. Update `PeerComparisonPanel` to use real progress data from DB

**Files to create/modify:**
- Prisma migration: add `teacher_progress` table
- `src/app/actions/progress-actions.ts` — server actions
- `src/components/teacher/BatchProgressModal.tsx` — teacher assignment UI
- Update `AcademicLearningPath` to fetch and display real progress
- Update `PeerComparisonPanel` to accept real data

**Verification:**
- Teacher can assign "completed" to entire batch for a topic
- Student sees teacher-assigned status on node card
- Student can mark personal progress independently
- Peer comparison shows real-time rankings from DB
- Node colors update: green=completed, blue=in-progress, gray=not started

---

## Plan 3: Visual Progress Integration

**Goal:** Wire real data to UI — nodes reflect progress, peer comparison shows live rankings.

### Tasks
1. Create `getTopicProgress` server function (combines teacher + student progress)
2. Create `getClassRankings` server function (aggregates student progress per batch)
3. Update `AcademicPathNode` to accept `progress` prop and render correct colors/icons
4. Update `PeerComparisonPanel` to accept real peer data with progress percentages
5. Add optimistic UI updates for progress changes
6. Add loading skeletons for path nodes and rankings

**Files to create/modify:**
- `src/app/actions/progress-actions.ts` — add data fetching functions
- Update `AcademicLearningPath` — pass real progress to nodes
- Update `PeerComparisonPanel` — bind to real rankings
- Add `SkeletonNode` and `SkeletonRanking` components

**Verification:**
- Node cards show correct status colors from DB
- Peer rankings update when progress changes
- Loading states shown during data fetch
- Optimistic updates reflect immediately
