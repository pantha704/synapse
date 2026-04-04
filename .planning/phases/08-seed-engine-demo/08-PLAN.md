# Phase 8: The Seed Engine (Demo Prep) — Plan

## Plan 1: Comprehensive Seeder Script

**Tasks:**
1. `scripts/seed-demo.ts` — full demo data seeder
2. Create institution, teachers, batches, subjects
3. Create topic node trees with realistic curriculum
4. Create students with varied progress levels
5. Generate engagement events with realistic timestamps
6. Create sample AI sessions with conversations

## Plan 2: Reset & Admin Tools

**Tasks:**
1. `scripts/reset-demo.ts` — clean reset script
2. `src/app/api/admin/reset-demo/route.ts` — API endpoint for 1-click reset
3. "Demo Mode" indicator in UI

## Verification
- Seed script populates all tables with realistic data
- Reset script clears and reseeds cleanly
- Demo data shows varied engagement levels
- AI chat has pre-populated conversations
- Topic trees have proper parent-child relationships
