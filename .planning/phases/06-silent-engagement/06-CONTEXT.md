# Phase 6: Silent Engagement Intelligence — Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build passive engagement tracking and classification system:
- Lightweight event logging for: logins, page views, resource views, AI chat messages, topic completions
- Engagement Engine: classify students into 🟢 Progressing, 🟡 Stuck, 🔴 Inactive based on event frequency and progress velocity
- Teacher Analytics Dashboard: visualize engagement heatmaps, student status cards
- Real-time engagement scoring updated on each event

</domain>

<decisions>
## Implementation Decisions

### Event Logging
- Use existing `engagement_events` table (already in schema)
- Log events via server action `logEngagementEvent(studentId, type, metadata)`
- Events: LOGIN, PAGE_VIEW, RESOURCE_VIEW, AI_CHAT, TOPIC_COMPLETE
- Metadata stored as JSONB for flexibility

### Engagement Classification
- Calculate per-student engagement score based on:
  - Recent event count (last 7 days)
  - Progress velocity (topics completed per week)
  - Time since last activity
- Thresholds:
  - 🟢 Progressing: active in last 2 days + completing topics
  - 🟡 Stuck: active in last 7 days but no progress
  - 🔴 Inactive: no activity in 7+ days

### Teacher Dashboard
- Engagement heatmap: grid view of students with color-coded status
- Student cards: name, avatar, status badge, last active time, progress %
- Filter by status (show only stuck/inactive students)
- Sort by last activity or progress

### the agent's Discretion
- Engagement score calculated server-side on each event log
- Cache engagement status in a computed field for fast queries
- Heatmap uses CSS grid for responsive layout
- Auto-refresh engagement data every 5 minutes via SWR/react-query

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `engagement_events` table already exists in schema with EventType enum
- `prisma/lib/prisma.ts` — Prisma client ready
- StatsPanel component pattern established for teacher view

### Integration Points
- Add engagement event logging to existing page views and actions
- Create engagement classification server action
- Build teacher analytics page with heatmap and student cards

</code_context>

<specifics>
## Specific Ideas

- "Nudge" feature: teacher can send encouragement to stuck/inactive students
- Engagement streaks: consecutive days of activity
- Class-level engagement summary: % progressing, % stuck, % inactive

</specifics>

<deferred>
## Deferred Ideas

- Predictive engagement: ML model to predict at-risk students
- Automated nudge emails to inactive students
- Engagement trends over time (line charts)

</deferred>
