# Phase 7: UI Polish & Gamification Elements — Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance the user experience with smooth animations, visual feedback, and gamification:
- Framer Motion transitions for page navigation, node clicks, panel open/close
- Confetti animation on topic completion
- Smooth hover/press micro-interactions on buttons, cards, nodes
- Premium visual polish: refined shadows, gradients, spacing consistency
- Loading skeletons for data fetching states
- Toast notifications for actions (save, complete, error)

</domain>

<decisions>
## Implementation Decisions

### Animations
- Page transitions: fade + slide between routes
- Node interactions: scale on hover, bounce on click
- Panel transitions: slide-in/out with spring physics
- Progress bar animations: width transition with ease-out
- List items: stagger animation on mount

### Confetti
- Use `canvas-confetti` library (lightweight, no dependencies)
- Trigger on topic completion (student marks topic as complete)
- Particle count: ~100, colors matching theme (violet, cyan, emerald)

### Toast Notifications
- Already using `sonner` (installed in package.json)
- Toast on: resource upload, progress update, AI response error
- Positioned bottom-right with richColors

### Loading States
- Skeleton screens for: learning path nodes, peer rankings, analytics cards
- Pulse animation on skeleton elements
- Optimistic UI updates where possible

### the agent's Discretion
- Use Framer Motion's `AnimatePresence` for all mount/unmount animations
- Confetti fires once per completion (debounced)
- Skeleton components match the shape of real content
- All animations respect `prefers-reduced-motion`

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Framer Motion already installed and used in several components
- `sonner` toast library installed (Toaster in root layout)
- `motion.div` used in SideNavBar, AcademicLearningPath, PeerComparisonPanel

### Integration Points
- Add confetti to topic completion action
- Add page transition wrapper in layout
- Add skeleton components for loading states
- Enhance existing hover/press interactions

</code_context>

<specifics>
## Specific Ideas

- "Level up" animation when student completes all topics in a module
- Progress ring fills with animation on completion
- Subtle parallax on background elements
- Confetti burst from the completed node position

</specifics>

<deferred>
## Deferred Ideas

- Sound effects for achievements
- Animated mascot/avatar reactions
- Streak counter with fire animation

</deferred>
