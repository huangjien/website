## Context

The UI currently appears plain and rigid: harsh borders, minimal elevation, and limited motion affordances. We already use Tailwind + shadcn/ui primitives with CSS variables in `globals.css`, and `tailwindcss-animate` is enabled. This change raises visual quality by softening shapes, introducing subtle elevation and gradients, and adding micro‑interactions while preserving accessibility, performance, and theming.

## Goals / Non-Goals

- Goals
  - Softer shapes: consistent rounded corners at control vs surface levels
  - Elevated surfaces: subtle shadows/rings to clarify hierarchy
  - Tasteful motion: smooth hover/focus transitions using tailwindcss‑animate
  - Modern accents: lightweight gradients/blur for a polished feel
  - Accessibility/theme parity: WCAG AA contrast, robust focus rings, dark/light consistency
- Non‑Goals
  - Rewriting routing, i18n, authentication, or page logic
  - Migrating away from Tailwind/shadcn or adding heavy frameworks

## Decisions

- Use CSS variables in `globals.css` for tokens (colors, radii); add gradient and shadow tokens
- Keep existing Tailwind `borderRadius` scale; apply via component classes (e.g., `rounded-lg`, `rounded-xl`)
- Extend Tailwind `boxShadow` for xs/sm/md/lg tiers; standardize ring usage for focus and hover
- Remove legacy global `border-radius: 12px !important;` overrides; move to precise component classes
- Apply glassy/blurred nav treatment: `bg-background/80` + `backdrop-blur-md` + subtle `border-b`/`ring-1`
- Maintain Radix/shadcn accessibility patterns (focus management, aria attributes)

## Alternatives Considered

- Keep current styling: lowest effort but retains “plain” look and harsh edges
- Adopt a new UI library (Chakra/MUI): heavier footprint, diverges from Tailwind-first approach
- Full custom design system: maximum control, higher maintenance; unnecessary for scope

## Risks / Trade-offs

- Style regressions across pages due to class changes
  - Mitigation: incremental PRs (tokens → primitives → nav/layout → pages) and screenshot diffs
- Accessibility drift (focus/contrast)
  - Mitigation: enforce WCAG AA contrast; keep robust focus rings and keyboard traversal
- Test churn (snapshot changes)
  - Mitigation: prefer role/text queries over class‑based assertions and update snapshots selectively
- Theme inconsistencies between light/dark
  - Mitigation: adjust neutral tokens; verify in visual QA on key pages

## Migration Plan (Incremental)

1. Tokens: add gradient/shadow tokens, tune neutrals, remove global radius overrides
2. Primitives: update Button/Input/Textarea/Select/Tabs/Tooltip/Accordion/Badge/Checkbox/Progress/Dialog to adopt rounded/elevation/motion
3. Navigation & Layout: glassy navbar with rounded container and subtle elevation; refine spacing rhythm
4. Pages Polish: apply accents on `/`, `/ai`, `/settings`, `/about` (gradients, shadows, motion)
5. Validate: lint/build/test; visual QA in both themes; update docs and specs

## Rollback Plan

- Revert per PR if regressions arise; tokens and primitives can be rolled back independently
- Keep branches isolated for each phase to simplify rollback

## Open Questions

- Gradient intensity guidelines for primary vs accent: caps to avoid low contrast?
- Motion duration/curve defaults: adopt shared `ease` and `duration` tokens?

## References

- Tailwind CSS modern UI patterns (rounded corners, elevation, motion)
- shadcn/ui + Radix accessibility considerations
- WCAG 2.1 AA contrast/focus guidelines
