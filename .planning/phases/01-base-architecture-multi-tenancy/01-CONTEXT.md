# Phase 1: Base Architecture & Multi-Tenancy - Context

**Gathered:** 2026-04-01
**Mode:** Auto
**Status:** Ready for planning

<domain>
## Phase Boundary

Establishing the core architecture (Next.js 15 App Router, Supabase Auth, Prisma/PostgreSQL), multi-tenant isolation schema, and role-based onboarding/dashboard structures. This covers login, registration via join codes, and the structural skeleton for teachers/students before mindmaps are rendered.
</domain>

<decisions>
## Implementation Decisions

### Core Authentication Flow
- **D-01:** Email/Password authentication via Supabase Auth.
- **D-02:** Role binding happens immediately at signup. Teachers are invited by Institutional Admin (or seeded for demo), Students sign up and enter a "Join Code" provided by the Teacher.

### Multi-Tenancy Strategy
- **D-03:** Single-deployment URL architecture (no subdomains per tenant). Tenant isolation is strictly enforced at the database level via Prisma middleware/RLS using `institution_id` on all tables. 
- **D-04:** API endpoints must validate user sessions and inject their bound `institution_id` into all queries.

### UI & Dashboard Layouts
- **D-05:** Minimal, highly navigable UI. Shared layout shell with conditionally rendered sidebars (Subject dropdown and Batch switcher for teachers only).
- **D-06:** Zustand used for UI state to minimize re-renders and keep interaction butter-smooth, particularly preparation for the subsequent React Flow phases.
- **D-07:** Framer Motion for optimistic UI state changes and route transitions.

### the agent's Discretion
- Choice of UI component library (e.g., Shadcn UI vs pure Tailwind) is left to the planner, provided it feels premium and is performant.
- Exact styling and loading states (skeletons vs spinners).
- Folder structure inside `src/app` as long as Next.js 15 conventions are followed.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope
- `.planning/PROJECT.md` — Core vision and scope boundaries.
- `.planning/REQUIREMENTS.md` — Strict technical constraints and schema foundations.

### Tech Stack
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase Auth & RLS](https://supabase.com/docs/guides/auth)
- [Prisma Multi-tenancy Patterns](https://www.prisma.io/docs/guides/development-environment/multi-tenancy)
</canonical_refs>
