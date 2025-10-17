## 1. Initialization & Dependencies
- [ ] 1.1 Add shadcn/ui (CLI) and initialize components
  - Suggested: `npx shadcn-ui@latest init`
- [x] 1.2 Add utilities and plugins
  - [x] Install `clsx` and `tailwind-merge`
  - [x] Install `tailwindcss-animate`
- [x] 1.3 Decide Tailwind compatibility
  - [x] Confirm shadcn/ui support with Tailwind 4.x (current project) or plan a fallback to 3.x in this change

## 2. Tailwind & Theming
- [x] 2.1 Remove heroui plugin from `tailwind.config.js`
- [x] 2.2 Add `tailwindcss-animate` and update `content` globs to include `components/ui/**/*`
- [x] 2.3 Define CSS variables for theme tokens in `globals.css` (light/dark via `.dark`)
- [x] 2.4 Keep `next-themes` usage (attribute='class', defaultTheme='dark')

## 3. Providers & Globals
- [x] 3.1 Remove `HeroUIProvider` from `src/pages/_app.js`
- [x] 3.2 Remove `CssBaseline` from `src/pages/_document.js`
- [x] 3.3 Ensure base styles render correctly (fonts, globals)

## 4. Component Migration (Mapping)
- [x] 4.1 NavigationBar: replace @heroui components with shadcn equivalents (Avatar, Button, Dropdown, etc.)
- [x] 4.2 ThemeSwitch: use shadcn Button + Tooltip (Radix)
- [x] 4.3 Login: replace @heroui Input/Button/Dropdown with shadcn components
- [x] 4.4 IssueList: replace table/pagination using shadcn Table or Tailwind custom
- [x] 4.5 IssueModal: replace modal/dialog with shadcn Dialog/Sheet
- [x] 4.6 Chat: replace Accordion/Badge/Button with shadcn
- [x] 4.7 ConfigurationTab & ConversationTab: replace Input/Select/Textarea/Progress
- [x] 4.8 Comment & Issue: replace Accordion/Chip (Badge)
- [x] 4.9 LanguageSwitch & Joke: update buttons and menus
- [x] 4.10 Layout.js: replace Button/Spacer and @heroui Link with shadcn Button and native Next/Anchor

## 5. Remove HeroUI & Update Code Imports
- [x] 5.1 Remove all `@heroui/*` imports across `src/`
- [x] 5.2 Update package.json dependencies to remove `@heroui/*` and related
- [x] 5.3 Update `jest.config.js` transformIgnorePatterns (remove `@heroui`)

## 6. Tests & E2E
- [x] 6.1 Update unit tests to align with new DOM for shadcn components
- [ ] 6.2 Ensure coverage remains similar or improved
- [ ] 6.3 Run Playwright e2e (desktop + mobile) and fix regressions
- [ ] 6.4 Visual sanity check (screenshots/videos enabled)

## 7. Documentation & Specs
- [ ] 7.1 Update `README.md` (UI framework section)
- [x] 7.2 Update `openspec/project.md` (Styling/UI Conventions: shadcn/ui)
- [ ] 7.3 Add component usage notes (cn utility, Radix) in docs

## 8. Validation & Approval
- [ ] 8.1 Validate spec change: `openspec validate refactor-ui-framework-to-shadcn --strict`
- [ ] 8.2 Request review/approval before implementation

## 9. Implementation Completion
- [ ] 9.1 Confirm all tasks checked and tests pass
- [ ] 9.2 Merge and deploy
- [ ] 9.3 Archive change: `openspec archive refactor-ui-framework-to-shadcn --yes`