# Phase 7: UI Polish & Gamification Elements — Plan

## Plan 1: Confetti & Micro-interactions

**Tasks:**
1. Install `canvas-confetti`
2. Create `src/lib/confetti.ts` — confetti trigger utility
3. Add confetti to topic completion in progress actions
4. Enhance existing hover/press animations on buttons and cards

## Plan 2: Loading Skeletons & Page Transitions

**Tasks:**
1. `src/components/ui/skeleton.tsx` — skeleton components matching content shapes
2. Add skeleton states to AcademicLearningPath, PeerComparisonPanel, Analytics
3. Page transition wrapper in dashboard layout
4. Smooth panel open/close animations (already partially done)

## Verification
- Confetti fires on topic completion
- Skeleton screens shown during data loading
- Page transitions are smooth
- All hover/press interactions feel responsive
- Reduced motion preference respected
