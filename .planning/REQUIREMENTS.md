# Requirements Directory: MindMapClass

**Last Updated:** 2026-04-01

## 1. System Boundaries

### In-Scope
*   **Authentication & Multi-Tenancy:** Secure login/registration for institutions, teachers, and students.
*   **Batch & Subject Management:** Creation and organization of academic batches and subjects.
*   **Mindmap Canvas:** Interactive, pannable/zoomable visualization of curriculum progress using React Flow.
*   **Resource Management:** Uploading, organizing, and linking S3-backed resources (PDFs, docs, videos) to mindmap nodes.
*   **Dual Progress Tracking:** Batch-wide coverage tracking by teachers and personal completion tracking by students.
*   **AI Chat (RAG):** Per-student, subject-scoped conversational assistant powered by Groq and NVIDIA NIM using pgvector embeddings.
*   **Engagement Tracking:** Silent activity monitoring (login, resource views, chat usage) to categorize student engagement.
*   **Announcements:** Batch-wide teacher announcements with read-receipt tracking.

### Out-of-Scope (v1)
*   **Payment Gateways:** No payment processing (Razorpay integration reserved for future).
*   **Real-time Mindmap Editing:** Students only view; teachers edit without real-time collaboration.
*   **Video Conferencing:** No built-in meeting tools (use external links).
*   **Plagiarism Detection:** Deferred to future integrations with external services.

## 2. User Roles & Flows

### 2.1 Roles
*   **Institution Admin:** Maps to high-level system manager. Onboards teachers, bulk uploads students, views institutional analytics.
*   **Teacher:** Creates batches, sets up subjects, builds mindmaps, uploads resources, pushes announcements, and monitors cohort progress.
*   **Student:** Browses the mindmap, interacts with resources, tracks personal progress, and chats with the AI assistant.

### 2.2 Core Flows
*   **Teacher Onboarding Flow:** Log in -> Create Batch -> Create Subject -> Build Mindmap Nodes -> Upload Resources -> Share Join Code.
*   **Student Learning Flow:** Log in (Silent Check-in) -> Select Subject -> View Mindmap -> Open Node -> Learn from Resources -> Mark Personal Progress.
*   **AI Assistance Flow:** Open Chat Panel on specific node/subject -> Ask Question -> RAG accesses relevant node resources -> Generate Contextual Answer.

## 3. Data Models (High-Level Schema)

*Note: Implementation will use Prisma mapping to this logical schema.*

**`Institution`**
*   `id`: UUID
*   `name`: String
*   `domain`: String (optional)

**`User`**
*   `id`: UUID
*   `institution_id`: FK
*   `role`: Enum (ADMIN, TEACHER, STUDENT)
*   `email`, `password_hash`, `name`

**`Batch`**
*   `id`: UUID
*   `institution_id`: FK
*   `teacher_id`: FK
*   `name`: String
*   `join_code`: String (Unique)

**`Subject`**
*   `id`: UUID
*   `batch_id`: FK
*   `name`: String

**`TopicNode`** (Mindmap Node)
*   `id`: UUID
*   `subject_id`: FK
*   `parent_node_id`: FK (Self-referencing for tree structure)
*   `title`: String
*   `status`: Enum (LOCKED, UPCOMING, IN_PROGRESS, COMPLETED)
*   `position_x`, `position_y`: Float (Canvas coordinates)

**`Resource`**
*   `id`: UUID
*   `topic_node_id`: FK
*   `file_url`: String
*   `type`: String

**`StudentProgress`**
*   `id`: UUID
*   `student_id`: FK
*   `topic_node_id`: FK
*   `status`: Enum (NOT_STARTED, IN_PROGRESS, COMPLETED)

**`EngagementEvent`**
*   `id`: UUID
*   `student_id`: FK
*   `event_type`: String (LOGIN, RESOURCE_VIEW, CHAT)
*   `timestamp`: DateTime

## 4. API & Integration Contracts

### 4.1 Internal API (Server Actions & Routes)
*   `GET /api/mindmap/:subjectId`: Returns layout and node data for React Flow.
*   `POST /api/chat`: Streams AI responses using Vercel AI SDK. Accepts student query and subject context.
*   `POST /api/upload`: Handles direct-to-S3 presigned URLs for resource uploads.

### 4.2 AI & Vector DB Integration
*   **Embeddings:** NVIDIA NIM (e.g., nv-embedqa) / OpenAI embeddings stored in `pgvector`.
*   **Chat Inference:** Groq API (e.g., Llama 3) for fast response generation.

## 5. Non-Functional Requirements

### 5.1 Performance
*   **Canvas Rendering:** Must handle up to 150 nodes without lag on budget hardware (using virtualization if needed).
*   **AI Latency:** Chat Time-to-First-Token (TTFT) targeting < 500ms using Groq.
*   **Page Load:** Next.js initial payload under 200KB; LCP < 2.5s.

### 5.2 Security & Multi-Tenancy
*   **Data Isolation:** All database queries MUST include tenant filtering (enforced via Prisma middleware or RLS).
*   **Access Control:** Strict NextAuth boundary; students cannot mutate batch schemas.

### 5.3 Scalability & Usability
*   **Responsive:** Mindmap canvas must support touch/pan/zoom on tablets.
*   **Hackathon Demo-Ready:** System must start instantly with comprehensive pre-seeded dummy data for judging purposes.
