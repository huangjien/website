# Tasks: UI Modernization — Softer Borders, Elevated Surfaces, and Micro‑Interactions

## 0. Initialization & Branching

- [ ] 0.1 Create feature branch `feature/ui-modernization`
- [ ] 0.2 Confirm Tailwind/shadcn setup
  - [ ] `tailwindcss-animate` installed/enabled
  - [ ] `content` globs include `src/components/ui/**/*`
  - [ ] `next-themes` configured (attribute='class')

## 1. Design Tokens (globals.css)

- [ ] 1.1 Add gradient tokens
  - [ ] `--gradient-primary` (e.g., based on `--primary`) and `--gradient-accent`
- [ ] 1.2 Add shadow tokens (documentation) and ring emphasis guidance
  - [ ] xs/sm/md/lg shadow tiers (examples documented)
- [ ] 1.3 Tune neutrals for light/dark (contrast AA)
- [ ] 1.4 Remove legacy broad radius overrides (NextUI/HeroUI selectors with `!important`)
- [ ] 1.5 Keep `--radius` tokens; note guidance for control vs surface radii

## 2. Tailwind Theme (tailwind.config.js)

- [ ] 2.1 Extend `boxShadow` scale (xs/sm/md/lg)
- [ ] 2.2 Verify/retain existing `borderRadius` scale and color tokens
- [ ] 2.3 Confirm plugins: `@tailwindcss/typography` and `tailwindcss-animate`

## 3. Primitives (src/components/ui/\*)

- [ ] 3.1 Button
  - [ ] Rounded‑md/lg; accessible focus ring (`focus-visible:ring`)
  - [ ] Gradient variant for primary (from `--gradient-primary` to `--accent`)
  - [ ] Motion: `transition-colors`, `hover:shadow-md`
- [ ] 3.2 Input / Textarea / Select
  - [ ] Rounded‑md; `ring-1 ring-border` baseline; `focus:ring-primary`
  - [ ] Hover/disabled states refined; placeholder contrast
- [ ] 3.3 Dialog / Popover / Tooltip
  - [ ] Rounded‑xl/2xl; `shadow-lg`; motion in/out via `tailwindcss-animate`
- [ ] 3.4 Tabs / Accordion / Badge / Checkbox / Progress
  - [ ] Align radii and elevation tokens; smooth hover/active states

## 4. Navigation & Layout

- [ ] 4.1 NavigationBar
  - [ ] Glassy surface: `bg-background/80 backdrop-blur-md`
  - [ ] Subtle elevation: `border-b` + `ring-1 ring-border`
  - [ ] Rounded container: `rounded-xl`
  - [ ] Optional accent: gradient highlight for brand or active link
- [ ] 4.2 Common containers/cards
  - [ ] Rounded‑xl; `shadow-sm md`; spacing rhythm refined

## 5. Pages Polish

- [ ] 5.1 `/` home
  - [ ] Apply elevated card sections and subtle gradients where appropriate
- [ ] 5.2 `/ai`
  - [ ] Ensure composer/threads adopt new tokens (if using shadcn primitives)
- [ ] 5.3 `/settings` and `/about`
  - [ ] Align with updated primitives and spacing/motion

## 6. Testing & Validation

- [ ] 6.1 Unit tests: update snapshots if needed; prefer role/text queries over class‑based
- [ ] 6.2 E2E (Playwright): desktop + mobile visual checks
  - [ ] Verify hover/focus rings, motion, and elevation across key flows
- [ ] 6.3 Accessibility: contrast checks (AA), keyboard navigation, focus management
- [ ] 6.4 Performance: ensure FCP/LCP unchanged or improved

## 7. Documentation & Specs

- [ ] 7.1 Update `README.md` (Styling guide: tokens, shadows, gradients, motion)
- [ ] 7.2 Update `openspec/project.md` (UI conventions)
- [ ] 7.3 Add illustrative examples for tokens/classes in docs

## 8. Validation & Approval

- [ ] 8.1 Validate spec change: `openspec validate ui-modernization-fancy-styling --strict`
- [ ] 8.2 Request design/QA review and approval

## 9. Implementation Completion

- [ ] 9.1 Confirm lint/test/build all pass; visual QA complete
- [ ] 9.2 Merge and deploy
- [ ] 9.3 Archive change: `openspec archive ui-modernization-fancy-styling --yes`

## References

- Tailwind CSS modern UI patterns; shadcn/ui + Radix accessibility
- WCAG 2.1 AA guidelines on contrast and focus
