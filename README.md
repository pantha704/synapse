# Synapse 🧠

Synapse (formerly MindMapClass) is a multi-tenant academic progress platform that reimagines learning via progress tracking and visualization. Designed to bridge the gap between "what a teacher teaches" and "what a student learns", Synapse combines Google Classroom's role management with an interactive and pannable mindmap visualization. 

## 🌟 Core Value
Students and teachers can view their entire curriculum journey as a living, interactive mindmap—making academic progress tangible, visual, and engaging, similar to unlocking a skill tree in a game!

## 🚀 Key Features (In Development)

- **Multi-tenant Architecture:** Completely isolated workspaces for distinct schools or institutions.
- **Role-based Access:** Dedicated spaces and workflows for Admins, Teachers, and Students.
- **Interactive Mindmap Canvas:** A pannable and zoomable visual view of courses where nodes represent chapters and sub-topics.
- **Game-like Progression Tracking:** Watch nodes change state (locked → upcoming → in-progress → completed) to reflect learning progress.
- **Dual Tracking:** Progress measured from the Teacher's delivery versus the Student's actual understanding.
- **AI-Powered Learning Assistant:** Context-aware, subject-scoped AI chat powered by Groq and NVIDIA NIM using RAG over uploaded curriculum resources. 
- **Teacher & Admin Dashboards:** Actionable analytics, heatmaps, and silent engagement tracking without friction for students.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Database & ORM:** PostgreSQL + Prisma
- **Authentication:** Supabase Auth (SSR)
- **UI & Styling:** Tailwind CSS v4, Framer Motion, Shadcn UI
- **State Management:** Zustand
- **Canvas / Mindmap:** React Flow (or D3.js)
- **AI Backend:** Groq & NVIDIA NIM

## 🏃 Getting Started

### Prerequisites
- Node.js & [Bun](https://bun.sh/)
- A [Supabase](https://supabase.com/) project
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pantha704/synapse.git
   cd synapse
   ```

2. Install dependencies via bun:
   ```bash
   bun install
   ```

3. Configure your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   bun run dev
   ```

5. Access the application running locally at [http://localhost:3000](http://localhost:3000).

---

*Built for hackathons, designed for academic excellence.*
