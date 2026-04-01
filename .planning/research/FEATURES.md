# Features Research: MindMapClass

**Researched:** 2026-04-01
**Domain:** EdTech / LMS / Mindmap-based Progress Platform

## Table Stakes (Must have or users leave)

### Authentication & Roles
- User signup/login with email+password
- Role-based access: Admin, Teacher, Student
- Session persistence across browser refresh
- Password reset via email
- Force password change on first login (for bulk-created accounts)

### Batch & Subject Management
- Admin creates institutions (multi-tenant)
- Teacher creates batches (like Google Classroom classes)
- Subjects assigned per batch with teacher ownership
- Join codes for student enrollment (6-character, human-readable)
- Admin bulk upload students via CSV (roll no, name, email, section, batch)

### Mindmap Canvas
- Pannable/zoomable canvas (Google Maps-like navigation)
- Full topic tree visualization (root → chapters → topics)
- Visual node status: locked → upcoming → in-progress → completed
- Click to expand node details (resources, progress, subtopics)
- Minimap for navigation orientation
- Zoom-to-fit control

### Resource Management
- Teacher uploads files (PDF, video, docs, links) per topic node
- Students can view/download resources from node detail view
- Resource sequencing (manual drag-and-drop by teacher)
- File type icons and previews

### Progress Tracking
- Teacher marks batch-wide class coverage ("we covered this")
- Student marks personal study progress
- Visual progress indicators on mindmap nodes
- Sidebar subject list with overall completion %

### Announcements
- Teacher posts announcements to batch
- Announcements with attachments (forms, PDFs, links)
- Read/unread tracking per student

## Differentiators (Competitive advantage)

### AI-Powered Features
- **AI Chat per student** — RAG over uploaded resources, subject-scoped
- **AI curriculum sequencing** — Teacher provides materials, AI suggests topic order
- **AI proactive nudging** — "You've been stuck on Trees for 4 days, want help?"
- **AI announcement analysis** — "You have a pending form to sign from yesterday's announcement"
- **AI assignment awareness** — "You have 2 pending assignments due this week"
- **Student memory** — AI remembers important details about each student across sessions

### Engagement Intelligence
- Silent check-in (login = attendance, no button clicks)
- Behavioral signals: resource views, time on topic, AI chat usage, announcement reads
- 3-tier status: 🟢 Progressing / 🟡 Stuck / 🔴 Inactive
- Teacher dashboard with engagement heatmaps
- "Students struggling with X topic" insights

### Gamification
- XP points per completed topic
- Level badges (Beginner → Intermediate → Advanced → Master)
- Study streaks (consecutive days of activity)
- Progress milestone celebrations (animated confetti on chapter completion)
- Leaderboard per batch (optional, teacher can toggle)

### Analytics
- Per-student progress report (exportable PDF)
- Batch-wide analytics (completion rates, engagement distribution)
- Teacher performance metrics (for admin)
- Topic difficulty heatmap (which topics are students struggling with?)
- Engagement trend charts (weekly activity patterns)

### Assignment System
- Teacher attaches assignments to mindmap nodes
- Due dates with automated reminders
- Submission tracking (submitted/not submitted)
- Grade entry by teacher

## Anti-Features (Things to deliberately NOT build)

| Feature | Why NOT |
|---------|---------|
| Real-time collaborative editing of mindmap | Massive complexity (CRDTs), not core value. Teacher edits, students view |
| Video conferencing | Not our domain. Integrate with Zoom/Meet links instead |
| Plagiarism detection | Complex, needs external service (Turnitin), defer to v2+ |
| Peer-to-peer messaging/DMs | Privacy concerns, moderation burden. Announcements are sufficient |
| Custom themes per institution | Nice-to-have but not v1. Logo + color accent is enough |
| Mobile native app | Web-first, responsive design covers mobile use case for now |
| Offline mode | Service worker complexity, not critical for always-connected students |
| Payment/subscription system | Keep space for Razorpay but don't implement in v1 |

## Feature Dependencies

```
Authentication → Batch Management → Subject Setup → Mindmap Canvas
                                                    ↓
                                              Resource Upload → AI RAG Pipeline
                                                    ↓
                                              Progress Tracking → Analytics
                                                    ↓
                                              Announcements → AI Proactive Features
                                                    ↓
                                              Gamification (can layer on independently)
```

## Complexity Estimates

| Feature Group | Complexity | Reasoning |
|--------------|------------|-----------|
| Auth + Roles | Medium | Role-based middleware, multi-tenant isolation |
| Batch/Subject Management | Low-Medium | CRUD + join codes |
| Mindmap Canvas | **High** | React Flow custom nodes, smooth transitions, state management |
| Resource Management | Medium | File upload, storage, association with nodes |
| AI Chat (RAG) | **High** | PDF parsing, chunking, embedding, vector search, streaming responses |
| AI Curriculum Sequencing | Medium-High | Topic ordering algorithm, LLM integration |
| Engagement Tracking | Medium | Event logging, background score computation |
| Analytics Dashboard | Medium | Data aggregation, charts, PDF export |
| Gamification | Low-Medium | XP calculation, badge logic, streak tracking |
| Announcements | Low | CRUD + read tracking |
| Assignment System | Medium | Due dates, submission tracking, grade entry |

---
*Researched: 2026-04-01*
