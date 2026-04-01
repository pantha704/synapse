# Pitfalls Research: MindMapClass

**Researched:** 2026-04-01
**Domain:** EdTech / LMS / Mindmap-based Progress Platform

## Critical Pitfalls

### 1. Multi-Tenant Data Leakage
**Severity:** 🔴 Critical
**Phase:** Phase 1 (Auth + Data Model)

**The pitfall:** Forgetting to add `tenant_id` filter on even ONE query leaks Institution A's data to Institution B. This is the #1 security failure in multi-tenant SaaS.

**Warning signs:**
- Direct Prisma queries without tenant filter
- API routes that don't extract tenant from session
- Admin endpoints that bypass tenant scoping

**Prevention:**
- Use Prisma middleware that auto-injects `tenant_id` on every query
- Supabase Row-Level Security as a second layer (DB-level enforcement)
- Write a test that attempts cross-tenant data access

---

### 2. React Flow Performance with Large Topic Trees
**Severity:** 🟡 High
**Phase:** Phase 3 (Mindmap Canvas)

**The pitfall:** A subject with 100+ topic nodes causes the canvas to lag. Every node re-render triggers React reconciliation across the entire tree.

**Warning signs:**
- Canvas feels sluggish when zooming/panning
- Node state updates cause full canvas re-render
- Memory usage climbs on subjects with many topics

**Prevention:**
- Use React Flow's built-in virtualization (only render visible nodes)
- Memoize custom node components with `React.memo`
- Use Zustand for canvas state (not React context — avoids cascade re-renders)
- Batch node position updates (don't update state per pixel during drag)
- Test with 150+ nodes as a performance baseline

---

### 3. AI Context Bleed Between Subjects
**Severity:** 🟡 High
**Phase:** Phase 5-6 (AI Chat)

**The pitfall:** Student asks about "arrays" in Data Structures, then switches to Algorithms. The AI still has DS context and gives confused answers mixing both subjects.

**Warning signs:**
- AI responses reference material from wrong subject
- Student sees "hallucinated" content from adjacent subjects
- Chat history contains mixed-subject context

**Prevention:**
- Strict subject_id filtering on vector search (never retrieve across subjects)
- Clear chat context on subject switch (or warn student)
- Include subject name in system prompt: "You are helping with [Subject Name] only"
- Session reset button with confirmation

---

### 4. RAG Quality Degradation with Poor PDF Parsing
**Severity:** 🟡 High
**Phase:** Phase 5-6 (AI RAG)

**The pitfall:** Teacher uploads a scanned PDF or a PDF with tables/diagrams. The text extraction produces garbage. The AI then gives garbage answers citing garbage sources.

**Warning signs:**
- AI responses are gibberish or cite nonsensical text
- Student feedback: "the AI doesn't understand my notes"
- PDFs with images/diagrams produce empty chunks

**Prevention:**
- Validate PDF quality after parsing (check character count, detect garbage text)
- Fallback to OCR for scanned documents
- Show teacher a preview of parsed content: "Is this extraction correct?"
- Allow teacher to manually add text descriptions for diagram-heavy materials
- Log retrieval quality metrics (if retrieved chunks have low similarity scores, flag it)

---

### 5. Dual Progress Tracking Confusion
**Severity:** 🟡 Medium
**Phase:** Phase 4 (Progress Tracking)

**The pitfall:** Students don't understand the difference between "class covered this" and "I studied this." They see green nodes and assume they're done. Or teachers think personal progress means they don't need to mark class progress.

**Warning signs:**
- Students not marking personal progress (assume teacher's mark is enough)
- Teachers confused by two layers of progress data
- Analytics show 100% batch coverage but 20% personal completion (normal, but needs explanation)

**Prevention:**
- Clear visual distinction: batch progress = border/outline, personal = fill color
- Onboarding tooltip explaining the difference
- "Your study progress" vs "Class progress" labels on every indicator
- Analytics dashboard explicitly shows the gap as an insight, not a bug

---

### 6. Join Code / Enrollment Security
**Severity:** 🟡 Medium
**Phase:** Phase 1-2 (Auth + Batch Management)

**The pitfall:** Join codes are too easy to guess (sequential numbers), or they never expire. Random students from other institutions join batches they shouldn't.

**Warning signs:**
- Unknown students appearing in batches
- Join codes shared publicly on social media
- No audit trail of who joined when

**Prevention:**
- 6-character alphanumeric codes (36^6 = 2.1 billion possibilities)
- Codes expire after X days or X uses (teacher configurable)
- Teacher can revoke/regenerate codes
- Enrollment notifications to teacher
- Teacher can remove students from batch

---

### 7. File Storage Cost Spiraling
**Severity:** 🟡 Medium
**Phase:** Phase 4 (Resource Management)

**The pitfall:** Teachers upload large video files (100MB+) for every topic. Storage costs explode. No cleanup mechanism for old resources.

**Warning signs:**
- Storage usage growing rapidly
- Large video files duplicated across batches
- No file size limits enforced

**Prevention:**
- File size limits per upload (e.g., 50MB for documents, 200MB for video)
- Encourage video links (YouTube, Drive) over direct upload
- Show storage usage per institution in admin dashboard
- Implement file deduplication (hash-based)
- Auto-compress images on upload

---

### 8. Engagement Tracking → Privacy Concerns
**Severity:** 🟡 Medium
**Phase:** Phase 4-5 (Engagement Tracking)

**The pitfall:** Tracking every click, time-on-page, and AI conversation raises privacy red flags. Students feel surveilled. Institutions may have GDPR/data protection policies.

**Warning signs:**
- Students avoid using the platform because they feel watched
- Institution admin asks "what data do you collect?"
- No data retention or deletion policy

**Prevention:**
- Transparent engagement tracking — show students what's tracked (login, resource views — NOT chat content)
- Don't store AI chat content for analytics (only metadata: topic, timestamp, count)
- Data retention policy: auto-purge engagement data after academic year
- Privacy settings page showing what's collected
- For v1: just be thoughtful about what you log and document it

---

### 9. Hackathon Demo Failure: Empty Canvas
**Severity:** 🔴 Critical (for competition)
**Phase:** All

**The pitfall:** Judges open the app and see an empty mindmap. No sample data. The wow factor is lost because they need to create institutions, batches, subjects, topics, and upload resources just to see anything.

**Warning signs:**
- Demo starts with login screen and empty dashboard
- Takes 5+ minutes of clicking before judges see the mindmap
- No visual impact on first load

**Prevention:**
- **Seed data is essential**: Pre-populate a demo institution with realistic data
  - "Demo University" with 2-3 batches
  - 3-4 subjects with full topic trees (20-30 nodes each)
  - Sample resources attached
  - Progress data showing mixed completion states
  - Sample announcements and assignments
- Demo accounts: teacher@demo.com, student@demo.com
- One-click "reset demo data" for repeated presentations
- Landing page with screenshots/video before login

---

### 10. Over-engineering the AI Features
**Severity:** 🟡 Medium
**Phase:** Phase 5-6

**The pitfall:** Spending too much time on AI auto-sequencing and proactive features instead of nailing the core mindmap + progress tracking experience.

**Warning signs:**
- AI features are buggy/slow while basic CRUD is polished
- More time on prompt engineering than on the canvas UX
- The "wow" is in the AI but the "use" is in the mindmap

**Prevention:**
- Priority order: Canvas → Progress → Resources → AI Chat → AI Proactive
- AI auto-sequencing can be "coming soon" with a manual fallback
- AI proactive features are v2 — get RAG chat working reliably first
- The mindmap IS the product. AI enhances it.

---
*Researched: 2026-04-01*
