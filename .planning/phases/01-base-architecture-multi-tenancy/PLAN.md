# Base Architecture & Multi-Tenancy

Phase 1 establishes the foundational base for MindMapClass. We will set up Next.js 15 (App Router), Supabase for PostgreSQL & Authentication, and Prisma ORM tailored to support our multi-tenant architecture. We'll also scaffold basic, performant UI shells for Teacher, Student, and Admin layouts.

> [!IMPORTANT]
> User Review Required
> The decision to use **Supabase Auth** relies on the idea of pairing it with Prisma for multi-tenancy. We need to agree on how we want to handle S3 bucket uploads down the line (Supabase Storage vs AWS S3 natively) since setting up Supabase now means leaning into their ecosystem.

## Proposed Changes

---

### External Services & Dependencies

#### [NEW] Dependencies
- Install `next@latest`, `react`, `react-dom`
- Install `@supabase/supabase-js`, `@supabase/ssr` (for App Router auth)
- Install `prisma`, `@prisma/client`
- Install `zustand` (for efficient UI state)
- Install `framer-motion` (for the snappy minimalist UI requirement)
- Install `lucide-react` (for icons)
- Install `tailwind-merge`, `clsx` (for styling utilities)

---

### Database Schema (Prisma)

#### [NEW] `prisma/schema.prisma`
We will implement the initial schema defined in our requirements with the multi-tenant `institution_id` references.

Models:
- `Institution`
- `User` (extended with Role: ADMIN, TEACHER, STUDENT)
- `Batch` (maps to an academic cohort, linked to Teacher and Institution)
- `Subject`
- `TopicNode` (Mindmap node structure)
- `Resource`
- `StudentProgress`
- `EngagementEvent`

We will employ the Prisma generic middleware/extension concept (or rely on Supabase RLS) to ensure that users can only query data mapped to their connected `institution_id`.

---

### Authentication Pipeline

#### [NEW] `src/utils/supabase/server.ts` & `src/utils/supabase/client.ts`
Implement robust wrappers around the Supabase SSR utilities so Next.js components can retrieve active user sessions gracefully.

#### [NEW] `src/app/auth/callback/route.ts` & `src/app/login/page.tsx`
Create a smooth, minimalist onboarding cycle:
- Teachers log in via email/password.
- Students sign up using email/password AND a `join_code` provided by the teacher (which automatically binds them to the correct `institution_id` and `batch_id`).

---

### Dashboard Skeletons

#### [NEW] `src/app/(dashboard)/layout.tsx`
The primary authenticated layout. It will verify the user's role and display a global sidebar containing:
- Batch switcher
- Settings/Profile

#### [NEW] `src/app/(dashboard)/teacher/page.tsx`
The default destination for teachers. Lists their active batches and subjects. Framer Motion will be used here to allow smooth entry animations of the subject cards.

#### [NEW] `src/app/(dashboard)/student/page.tsx`
The destination for students. Lists their assigned subjects (with initial progress metrics) that will link out to the interactive React Flow mindmap canvas.

## Open Questions

> [!WARNING]
> 1. **Component Library:** Should we use Shadcn/UI for our components (buttons, dropdowns, inputs), or do you want me to write bespoke minimalist Tailwind elements to keep performance strictly controlled?
> 2. **Package Manager:** Since your global rules explicitly state "use bun", we will use Bun across the board for package management and CLI tasks (`bunx create-next-app`, `bun install`). Are you ready for me to initialize the `create-next-app` project inside this workspace directory immediately?

## Verification Plan

### Automated Tests
- Ensure typechecking (`tsc --noEmit`) passes correctly, and the build runs without error (`bun run build`).

### Manual Verification
1. Boot up the local `dev` server.
2. Manually register a dummy Teacher and Student into Supabase.
3. Verify that signing in routes us to the correct dashboard (e.g. `/(dashboard)/teacher` vs `/(dashboard)/student`).
4. Verify Prisma can correctly inject and query the db records via the UI layout.
