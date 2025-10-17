## Context
The current UI uses HeroUI components and a Tailwind configuration with the heroui plugin. We want a Tailwind-first approach that keeps component code local and is easy to customize. shadcn/ui builds on Tailwind + Radix primitives and provides a flexible, accessible component set.

## Goals / Non-Goals
- Goals
  - Adopt shadcn/ui for primary UI components
  - Preserve dark/light theming via next-themes
  - Maintain or improve accessibility (Radix primitives)
  - Keep build/test pipelines intact (Jest/Playwright)
- Non-Goals
  - Redesign of information architecture or navigation structure
  - Changing i18n or authentication behavior

## Decisions
- Keep Tailwind v4 and follow the latest shadcn guidance for v4 (no fallback planned)
- Use shadcn/ui (Radix + Tailwind) installed via CLI; components live in `components/ui/`
- Navigation: prefer shadcn NavigationMenu + Menubar for the navbar
- Lists: use shadcn Table for IssueList (and build pagination using shadcn/Tailwind)
- Retain `next-themes` (attribute='class', defaultTheme='dark'); drive theme via CSS variables in `globals.css`
- Provide `cn` utility (clsx + tailwind-merge) for consistent class name composition
- Add `tailwindcss-animate` for shadcn/ui animations
- Remove HeroUI provider and plugin; stop using `@heroui/*` packages

## Alternatives Considered
- Keep HeroUI: Familiar but less Tailwind-first and less local customization
- Use Chakra UI or MUI: Mature libraries but heavier and less Tailwind-native
- Build custom-only Tailwind components: Maximum control but higher maintenance cost

## Risks / Trade-offs
- Tailwind v4 guidance is evolving; ensure component generation and content globs are correct
  - Mitigation: Follow official shadcn recommendations for v4; verify builds and styles early
- Large diff across UI: many components change; risk of regressions
  - Mitigation: big-bang PR with thorough unit/E2E tests and visual checks
- Time cost: replacing navbar, table/pagination, dialog, tabs, accordion, tooltips, inputs
  - Mitigation: reuse shadcn templates and prioritize critical screens

## Migration Plan (Big-bang)
1) Initialize shadcn/ui and utilities (`clsx`, `tailwind-merge`, `tailwindcss-animate`)
2) Tailwind config: remove heroui plugin; add animate plugin; update content globs; define CSS vars
3) Providers: remove HeroUIProvider/CssBaseline; confirm NextThemes setup
4) Migrate components in one PR:
   - NavigationBar → NavigationMenu/Menubar
   - ThemeSwitch → shadcn Button/Tooltip
   - Login → shadcn inputs/buttons/menus
   - Layout → shadcn/Tailwind buttons/links/spacing
   - IssueList → shadcn Table + pagination UI
   - IssueModal → Dialog/Sheet
   - Chat → Accordion/Badge/Button
   - Tabs/Accordion/Tooltip/Input/Select/Textarea/Progress → shadcn equivalents
5) Remove `@heroui` packages; update imports
6) Tests: unit + Playwright E2E; fix regressions and update snapshots
7) Documentation: README, openspec/project.md

## Rollback Plan
- Keep a separate branch with HeroUI until migration stabilizes
- If major issues found, revert to HeroUI branch and re-scope migration (component-by-component)

## Open Questions
- None for this change; choices confirmed:
  - Tailwind v4, big-bang migration, NavigationMenu/Menubar, shadcn Table