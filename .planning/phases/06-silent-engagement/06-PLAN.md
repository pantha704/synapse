# Phase 6: Silent Engagement Intelligence — Plan

## Plan 1: Engagement Event Logging & Classification

**Tasks:**
1. Server action `logEngagementEvent(studentId, type, metadata)` — insert event
2. Server action `getEngagementStatus(batchId)` — classify all students in batch
3. Engagement classification logic: 🟢 Progressing, 🟡 Stuck, 🔴 Inactive
4. Server action `getTeacherAnalytics(batchId)` — full analytics data

## Plan 2: Teacher Analytics Dashboard UI

**Tasks:**
1. `src/components/analytics/EngagementHeatmap.tsx` — color-coded student grid
2. `src/components/analytics/StudentStatusCard.tsx` — individual student card with status
3. `src/app/(dashboard)/teacher/analytics/page.tsx` — full analytics page
4. Filter by status, sort by activity/progress

## Verification
- Events logged on page views, resource views, AI chat
- Students correctly classified into 3 engagement tiers
- Teacher dashboard shows heatmap and student cards
- Filter and sort work correctly
