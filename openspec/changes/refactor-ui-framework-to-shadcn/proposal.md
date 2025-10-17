## Why

HeroUI has served us well, but we want a Tailwind-first, locally owned component approach that is more customizable and accessible. shadcn/ui (Radix + Tailwind) aligns with our styling conventions, simplifies theming via next-themes + CSS variables, and reduces external dependency footprint.

## What Changes

- Big-bang migration: replace all HeroUI usage with shadcn/ui in a single PR
- Keep Tailwind v4 and follow the latest shadcn guidance for v4; add `tailwindcss-animate`; remove the heroui plugin
- Provide `cn` utility (clsx + tailwind-merge) for class composition
- Keep `next-themes` (attribute='class', defaultTheme='dark'); move tokens to CSS variables in globals.css
- Navigation: adopt shadcn NavigationMenu + Menubar for the NavigationBar
- Lists: use shadcn Table for IssueList (with pagination UI implemented using shadcn components/Tailwind)
- Remove HeroUIProvider from `_app.js` and CssBaseline from `_document.js`
- Update unit + E2E tests to reflect new DOM structure and interactions
- Update project docs and `openspec/project.md` after implementation

**BREAKING**: Removes all `@heroui/*` packages and changes component imports and DOM structure throughout the UI.

## Impact

- Affected specs: ui-framework (new capability)
- Affected code (non-exhaustive):
  - src/pages/\_app.js (HeroUIProvider removal)
  - src/pages/\_document.js (CssBaseline removal)
  - src/pages/layout.js (buttons/spacing/link: @heroui → shadcn/Tailwind)
  - src/components/NavigationBar.js (use NavigationMenu/Menubar)
  - src/components/ThemeSwitch.js (shadcn Button/Tooltip)
  - src/components/Login.js (inputs/buttons/menus → shadcn)
  - src/components/IssueList.js (shadcn Table + pagination)
  - src/components/IssueModal.js (Dialog/Sheet)
  - src/components/Chat.js (Accordion/Badge/Button)
  - src/components/ConfigurationTab.js, ConversationTab.js, Comment.js, Issue.js, LanguageSwitch.js, Joke.js (misc replacements)
  - tailwind.config.js (remove heroui plugin; add tailwindcss-animate; update content globs)
  - jest.config.js (transformIgnorePatterns: remove `@heroui`)
  - package.json (dependencies/devDependencies changes)

## Validation Plan

- Build locally and run jest + playwright E2E suite (desktop + mobile)
- Verify flows: navigation (NavigationMenu/Menubar), language switch, theme switch, login/logout, issues list (Table/pagination), AI page
- Ensure dark/light themes apply consistently via next-themes and CSS vars
- Visual sanity checks via Playwright screenshots/videos

## Rollout

- Branch: `refactor/ui-to-shadcn`
- Single big-bang PR with comprehensive migration + tests
- Deploy after merge; archive change under `openspec/changes/archive/YYYY-MM-DD-refactor-ui-framework-to-shadcn/`
