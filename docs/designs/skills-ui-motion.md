# ui-motion — skill scouting

## Skills

- effective-agent-skills — process skill: how to author/audit a SKILL.md (routing description, lean body, verify loop); used to build the area skill, not to write UI.
- ui-motion-polish (new) — the area skill: Base-UI shadcn composition, GSAP/framer-motion ownership and reduced-motion rules, react-email inbox constraints.
- web-perf — measures LCP/INP/CLS via DevTools MCP, so "motion didn't cost us a Core Web Vital" is a number, not a vibe.

## Gold standard

A reviewer must be able to tick every line below with a command or a screenshot.

**shadcn composition (style `base-nova`, Base UI — verified in `components.json`)**
- [ ] `npx shadcn@latest info` reports `base: base`; no `asChild` anywhere in `src/components`.
- [ ] Every trigger that renders a custom element uses `render={<X />}`; non-button renders carry `nativeButton={false}`.
- [ ] No new hand-written primitive in `src/components/ui` — `npx shadcn@latest add <name>` only.
- [ ] Colour/radius come from `--color-*` / `--radius-*` tokens in `src/app/globals.css`; zero hard-coded hex in new components.
- [ ] `data-slot` attributes from generated components are preserved.

**GSAP motion layer**
- [ ] `gsap` + `@gsap/react` installed; `registerPlugin` called once at module scope of a `"use client"` file.
- [ ] Every setup lives in `useGSAP(fn, { scope: ref })`; event-handler tweens wrapped in `contextSafe`; `grep -r "useEffect" src | xargs grep -l gsap` returns nothing new.
- [ ] No element is animated by both framer-motion and GSAP (one owner per transform).
- [ ] Durations come from the 120/180/200/280/320/420ms scale; only `transform` and `opacity` animate.
- [ ] `gsap.matchMedia()` has a `(prefers-reduced-motion: reduce)` branch for every entrance/scroll effect; with the emulation on, nothing sits at `opacity: 0` and content is reachable.

**Transactional email UI**
- [ ] Templates built from `@react-email/components`; 600px `Container`; `Row`/`Column` only — no flex/grid in output HTML.
- [ ] Action uses `Button`, not a styled `<a>`; output HTML contains `mso-` fallbacks and absolute https URLs.
- [ ] Dark mode: `color-scheme` + `supported-color-schemes` meta and explicit `@media (prefers-color-scheme: dark)` for background and text; no `dark:`-only styling, no `oklch()`, no CSS variables in the emitted HTML.
- [ ] Every image has `alt` + explicit width/height; one primary CTA ≥44px; visible fallback URL; real preview text; plain-text alternative shipped.

**Gates**
- [ ] `bun run lint` and `bun run build` clean.
- [ ] Keyboard pass on changed components: Tab order, Enter/Space activation, focus ring visible in light and dark.
- [ ] Motion change has a before/after DevTools trace: INP <200ms, CLS 0 on animated content.
- [ ] `git diff --stat` shows no accidental component regeneration.

## Installed

- ui-motion-polish (global, category `design`; reference: `references/inbox-checks.md` for the inbox client matrix and motion perf budget)
