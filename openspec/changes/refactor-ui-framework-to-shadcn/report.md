# Refactor UI Framework to shadcn/ui — Implementation Report

## Summary

This update continues the migration to shadcn/ui (Tailwind + Radix) by refactoring additional components and removing more HeroUI usage. In addition to the earlier Tailwind configuration and Button component work, ThemeSwitch and LanguageSwitch are migrated, new foundational Tooltip and Avatar primitives are added, and the NavigationBar is refactored to use semantic HTML + Tailwind.

## Scope Implemented

- Tailwind & Theming
  - Removed HeroUI plugin references from `tailwind.config.js`
  - Added `tailwindcss-animate` plugin
  - Extended Tailwind theme to read CSS variables for tokens (primary, secondary, accent, etc.)
  - Defined theme CSS variables in `globals.css` for light/dark via `.dark`
- Providers & Globals
  - Removed `CssBaseline` from `_document.js`
  - Verified `NextThemesProvider` remains (attribute='class', defaultTheme='dark')
- Components
  - Created `src/components/ui/button.jsx` with variants (default, outline, ghost, secondary, destructive) and sizes (sm, md, lg, icon)
  - Created `src/components/ui/tooltip.jsx` using `@radix-ui/react-tooltip` and `cn`
  - Created `src/components/ui/avatar.jsx` using `@radix-ui/react-avatar` and `cn`
  - Migrated `src/pages/layout.js` to use the new Button, removed `@heroui/react` imports
  - Migrated `src/components/ThemeSwitch.js` to shadcn Button + Radix Tooltip
  - Migrated `src/components/LanguageSwitch.js` to Radix DropdownMenu + shadcn Button
  - Refactored `src/components/NavigationBar.js` to semantic `nav` + Tailwind styles, using Next.js `Link` and the new `Avatar`

## Files Changed / Added

- Changed
  - `tailwind.config.js`: add variable-backed colors; keep typography plugin; include `tailwindcss-animate`
  - `src/pages/globals.css`: add CSS variables (`:root`, `.dark`) and base body colors
  - `src/pages/_document.js`: remove `CssBaseline` import
  - `src/pages/layout.js`: swap HeroUI Button/Spacer/Link for shadcn Button and simpler layout
  - `src/components/ThemeSwitch.js`: replace HeroUI Button/Tooltip with shadcn Button and Radix Tooltip
  - `src/components/LanguageSwitch.js`: replace HeroUI Dropdown/Button with Radix DropdownMenu and shadcn Button
  - `src/components/NavigationBar.js`: remove HeroUI components and adopt semantic structure + Tailwind classes
- Added
  - `src/components/ui/button.jsx`
  - `src/components/ui/tooltip.jsx`
  - `src/components/ui/avatar.jsx`
  - Updated `openspec/changes/refactor-ui-framework-to-shadcn/tasks.md` to toggle completed items (2.3, 3.2, 4.10)

## Validation

- Dev Server
  - Started Next.js dev server at `http://localhost:8081/`
  - Opened preview and observed no browser errors; terminal warnings are unrelated to Tailwind changes
- Visual
  - Layout scroll-to-top button renders and operates as expected
  - Navigation bar renders with the new Avatar, ThemeSwitch, and LanguageSwitch
  - Tooltip displays correct content for the theme toggle and uses accessible button labels
  - Dark mode styles apply via `.dark` using `next-themes`
- Tailwind/PostCSS
  - `postcss.config.mjs` uses `@tailwindcss/postcss`
  - `globals.css` `@config` directive resolves to project `tailwind.config.js`

## Remaining Work (Next Steps)

- Migrate remaining HeroUI components to shadcn/ui or Tailwind + Radix
  - Login, IssueList, IssueModal, Chat
  - ConfigurationTab, ConversationTab, Comment, Issue, Joke
- Remove all `@heroui/*` dependencies from `package.json` after migration
- Update Jest and e2e tests to align with new DOM structures
- Documentation updates: README and openspec project styling conventions

## Risks / Notes

- Removing HeroUI prematurely may break pages still depending on it; migration should proceed component-by-component
- Web styling tokens are now variable-backed; ensure components use `bg-primary`, `text-primary-foreground`, etc.

## Checklist Status

- 2.3 Define CSS variables in `globals.css`: Completed
- 3.2 Remove `CssBaseline` in `_document.js`: Completed
- 4.10 Migrate `layout.js`: Completed
- 4.x Migrate ThemeSwitch to shadcn/Radix: Completed
- 4.x Migrate LanguageSwitch to shadcn/Radix: Completed
- 2.1, 2.2, 2.4 previously completed
- 1.2, 1.3 previously completed

Prepared as if `openspec apply add-report-summary` was run.
