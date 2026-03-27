# PROJECT

## Overview

This repository is a Next.js website application using the Pages Router, with:

- React 19 UI
- Tailwind CSS styling
- NextAuth authentication
- i18n via react-i18next
- AI chat and voice features through API routes
- PWA support via Serwist

## Runtime Architecture

### App Shell

- `src/pages/_app.js` initializes providers and global layout:
  - `SessionProvider`
  - `NextThemesProvider`
  - `ProvideSettings`
  - `RootLayout`
  - `PwaRegister`
- `src/pages/_document.js` provides document-level meta and PWA recovery script.

### Frontend Routes

- `src/pages/index.js` home page (GitHub README + issues display)
- `src/pages/about.js` markdown content page
- `src/pages/ai.js` AI chat experience
- `src/pages/settings.js` authenticated settings UI
- `src/pages/error.js` and `src/pages/auth/error.js` error handling views

### Backend Routes

Primary API endpoints in `src/pages/api/`:

- Content + GitHub: `about.js`, `issues.js`, `comments.js`, `labels.js`, `member.js`
- AI: `ai-models.js`, `chat.js`, `transcribe.js`, `tts.js`, `ai.js`
- Auth + settings: `auth/[...nextauth].js`, `settings.js`
- Utilities: `health.js`, `markdown.js`, `image-proxy.js`, `ip.js`, `getIp.js`, `postIp.js`

### Module Responsibilities

- `src/components/`: reusable UI and feature components
- `src/components/ai-elements/`: AI interaction UI atoms/molecules
- `src/lib/`: hooks, API clients, request helpers, validation, utilities
- `src/hooks/`: additional feature hooks (audio recording)
- `src/config/`: site and model configuration
- `src/locales/`: translation resources and i18n initialization

## Core Data Flows

1. Home route uses `useGithubContent` to fetch README/issues via internal API.
2. About route renders markdown content from API-backed repository content.
3. AI route uses chat + model APIs; supports speech-to-text and text-to-speech.
4. Settings route uses session-gated API for user settings persistence.

## Build, Quality, and Test

- Package manager: pnpm (`packageManager: pnpm@10.32.1`)
- Dev server: `pnpm dev` (port 8080)
- Lint/type checks: `pnpm lint`, `pnpm type-check`
- Unit tests: Jest + Testing Library (`pnpm test`)

## Important Config

- `next.config.js`: PWA integration, cache headers, rewrites
- `jest.config.js`: test environment, transforms, coverage thresholds
- `tailwind.config.js` + `postcss.config.mjs`: styling pipeline

## Operating Baseline

- Existing project guidance remains in `AGENTS.md` and is the primary implementation convention source.
- GSD operational files are maintained at repository root: `PROJECT.md`, `ROADMAP.md`, `STATE.md`.
- New implementation work should extend existing modules and patterns instead of introducing parallel structures.
- Milestone 1 closure evidence is captured in `docs/plans/2026-03-18-milestone-1-completion-report.md`.
- Milestone 2 scope and priorities are defined in `docs/plans/2026-03-18-milestone-2-charter.md`.
- Milestone 2 closure evidence is captured in `docs/plans/2026-03-19-milestone-2-completion-report.md`.
- Milestone 3 scope and priorities are defined in `docs/plans/2026-03-19-milestone-3-charter.md`.

## Current Hotspots

- API route hardening is now standardized with shared method-guard and error envelope utilities.
- Phase 2 baseline metrics are captured in `docs/plans/2026-03-18-phase-2-baseline-metrics.json`.
- Home/AI/settings routes now include targeted performance and UX optimizations from Phase 2 execution.
- NextAuth error page routing is aligned to the UI error page at `/auth/error`.
- `/robots.txt` rewrite now has a matching `/api/robots` route.
- Phase 3 added scenario-focused API/AI tests.
- Phase 4 added i18n parity guardrails with English fallback merge and locale parity auditing.
- Phase 5 hardened secret-backed endpoint access and mutation auth boundaries for settings/issues/AI session flows.
- Phase 6 retired legacy utility IP endpoints to reduce unauthenticated API attack surface.
- Phase 7 hardened outbound image proxy and transcribe routes with host/type/size/rate/auth controls.
- Phase 8 consolidated CI workflows and enforced stronger PR/main validation and deploy gating.
- Phase 9 expanded remaining high-risk API contract tests.
- Phase 10 introduced production-like performance budgets with CI-enforced threshold checks.
- Phase 11 established request-id correlated structured API logging and critical AI route log adoption.
- Phase 12 expanded observability to all API routes with metrics baseline and event enrichment.
