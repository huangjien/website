# Project Context

A modern, multilingual blog/knowledge site built with Next.js 15.x and React 19.x. It features GitHub-backed content, theme and language switching, authentication, AI-assisted Q&A, PWA support, and a full testing/CI pipeline. This document captures the core context, tech stack, conventions, and patterns used across the project to help contributors and OpenSpec changes align with how the system is built.

## Goals and Non-Goals
- Goals
  - Provide a fast, responsive, multilingual website with dark/light themes
  - Fetch and render content (posts) from GitHub Issues and README
  - Offer authenticated features (Settings, AI) via NextAuth
  - Include AI chat and audio transcription helpers
  - Ship as a PWA with offline-ready basics
  - Maintain strong testing coverage (unit + E2E) and CI-driven deployments
- Non-Goals
  - Not a CMS with server-side authoring UI (content comes from GitHub)
  - No backend database layer (stateless API routes and external services)

## Runtime Requirements
- Node.js
  - Local: Node 20 (see .nvmrc)
  - CI: Node 24 (GitHub Actions)
- Package manager: Yarn (preferred) or npm
- Default dev port: 8080
- Required environment variables: see .env.local.example (OpenAI, NextAuth, GitHub, Google OAuth/TTS)

## Tech Stack (key packages & versions)
- Framework: Next.js ^15.5.4 (pages router)
- React: ^19.2.0
- Styling/UI
  - Tailwind CSS 4.1.14 (+ @tailwindcss/typography)
  - Shadcn UI (Radix UI primitives via shadcn/ui)
  - Styled-components ^6.1.19
  - React Icons ^5.5.0, framer-motion ^12.x (animations)
- State & hooks: React hooks, ahooks ^3.9.5
- Internationalization: i18next ^25.x, react-i18next ^16.x
- Authentication: next-auth ^4.24.x (providers: GitHub, Google)
- PWA: next-pwa ^5.6.0
- Markdown: react-markdown ^10.x + remark-gfm, rehype-raw, rehype-highlight
- Testing
  - Unit: Jest ^30.x + Testing Library
  - E2E: Playwright ^1.56.0
- Tooling: ESLint ^9.x (eslint-config-next), Prettier ^3.x, Husky ^9.x, lint-staged ^16.x, cross-env

## Architecture & Directory Layout
- pages router: src/pages/
  - _app.js: global providers (NextThemes, Session, Settings, i18n)
  - _document.js: head tags, manifest, icons, theme-color
  - layout.js: top-level layout, NavigationBar, footer, scroll-to-top button
  - api/: thin stateless API routes (OpenAI proxy, GitHub content, labels/issues, jokes, comments, auth)
- Components: src/components/ (presentational + small logic)
- Lib/Hooks: src/lib/ (Requests.js, useGithubContent.js, useSettings.js, NoSSR)
- Internationalization: src/locales/ (per-language JSON, i18n initialization, resources.js)
- Config: src/config/ (fonts, site)
- Tests: colocated in src/**/__tests__/ and top-level jest.setup.js, test-setup.js
- Path alias: @/* → src/* (jsconfig.json)

## Data Flow & Key Features
- GitHub-backed content
  - useGithubContent.js calls internal API endpoints (Requests.js) to fetch README and Issues
  - Filters issues using label conventions from settings (blog.labels, blog.content)
  - Formats markdown with remark/rehype plugins
- Auth-only features (AI, Settings)
  - next-auth providers (GitHub, Google)
  - Session gating in UI and protected API (e.g., /api/ai requires a valid session)
- AI & Audio
  - /api/ai: server-side gateway to OpenAI chat completions (model selectable; default gpt-4o-mini)
  - /api/transcribe: proxy to OpenAI audio transcription
  - src/lib/aiService.js: helpers for getAnswer() and transcribeAudio()
- Theming & UX
  - next-themes with class-based dark mode; defaultTheme='dark'
  - Tailwind + HeroUI theme tokens (see tailwind.config.js: colors, radius)
  - Scroll-to-top button appears after 100px scroll
- PWA
  - next-pwa configured; disabled in development; assets in public/manifest.json and icons

## API Conventions
- Location: src/pages/api
- Patterns
  - GET for retrieval: about, issues, labels, member, joke
  - POST when required: ai (requires auth), transcribe
  - JSON responses with explicit error handling; HTTP status codes reflect outcome (401 unauthorized, 500 server errors)
- External integrations
  - GitHub REST (for content)
  - OpenAI (chat + audio)
  - Google TTS (if configured)

## Internationalization Conventions
- Supported languages: en (default/fallback), ar, ja, ko, zh_CN, zh_TW, fr, de, ga, it, ru, es
- File placement: src/locales/<lang>.json with flat-ish key namespaces (e.g., header.*, issue.*, layout.version)
- Initialization: src/locales/i18n.js and resources.js
- Adding a new language
  1) Add <lang>.json with keys mirroring en.json structure
  2) Register in resources.js and languages list in i18n.js
  3) Verify with src/locales/__tests__/i18n.test.js and UI smoke checks

## Styling & UI Conventions
- Use Tailwind utility classes for layout and spacing; keep CSS in src/pages/globals.css minimal
- Prefer shadcn/ui components (Radix UI primitives + local components in src/components/ui) for controls, layout, and interactions
- Dark mode: class-based (Tailwind darkMode="class") using CSS variables defined in globals.css; default radius set in tailwind.config.js
- Avoid SSR-only assumptions in components that depend on browser APIs; use NoSSR wrapper when necessary

## Testing Strategy
- Unit tests (Jest + Testing Library)
  - Colocate tests under src/**/__tests__/
  - jsdom environment
  - Coverage collected from src/**/*.{js,jsx} excluding Next special files and API routes
  - Transform ignores configured to include ahooks
- E2E tests (Playwright)
  - BaseURL: http://localhost:8080
  - Projects: Desktop Chrome and Mobile Chrome (Pixel 5)
  - Retries enabled; screenshots and video recording
  - e2e/home.test.js validates primary navigation and content

## Linting, Formatting, and Git Hooks
- ESLint (next + prettier plugins) and Prettier enforced via lint-staged on pre-commit
- Husky pre-commit installed via prepare script
- Recommended commit style: Conventional Commits (feat, fix, docs, chore, refactor, test) for clarity

## CI/CD & Deployment
- GitHub Actions (.github/workflows/CID.yaml)
  - Triggers on push to main
  - Steps: checkout → auth gcloud → setup gcloud → node setup → install deps → lint → build → docker build/push → deploy to Cloud Run
  - Deploys image docker.io/huangjien/website:latest to Cloud Run (service: blog) in region europe-west1, port 8080, allow unauthenticated
- Docker
  - docker:build/docker:push scripts for building and publishing
  - docker:run runs container with .env.local

## Environment & Secrets
- Mandatory variables (see .env.local.example):
  - OpenAI: OPEN_AI_KEY
  - NextAuth: NEXTAUTH_URL, NEXTAUTH_SECRET
  - Providers: GITHUB_CLIENT_ID/SECRET, GOOGLE_CLIENT_ID/SECRET
  - GitHub content: BLOG_REPO, BLOG_TOKEN, BLOG_MEMBER
  - Optional: GOOGLE_TTS_* for text-to-speech
- Do not commit .env.local; use GitHub secrets for CI/CD

## Access Control & Security
- API /api/ai requires an authenticated session; return 401 otherwise
- Server-side calls to external APIs use server-held keys only
- Avoid exposing secrets in client bundles; leverage Next.js API routes as proxies

## Performance & Build
- next.config.js
  - output: 'standalone' for container deploys
  - transpilePackages: ['ahooks']
  - styledComponents compiler enabled
  - eslint.ignoreDuringBuilds: true (CI lints before build)
  - rewrites: /robots.txt → /api/robots (ensure route exists or adjust)
- JIT mode in Tailwind; dark mode class

## Naming & Organization Conventions
- Components: PascalCase (e.g., NavigationBar.js, ThemeSwitch.js)
- Pages: kebab-case or lower-case (e.g., about.js, settings.js)
- Tests: mirror component/page structure under __tests__
- Imports: prefer '@/...' alias for src-based absolute imports
- i18n keys: namespace.key (e.g., header.home, layout.version) and keep parity across languages

## OpenSpec Collaboration Notes
- Use this document as the authoritative context for spec-writing
- Before proposing changes:
  - Review existing specs in openspec/specs and active changes in openspec/changes
  - Choose a verb-led, unique change-id (e.g., add-ai-voice, update-theme-palette)
- Author deltas per capability using ADDED/MODIFIED/REMOVED/RENAMED blocks with at least one Scenario each
- Validate proposal with `openspec validate <change-id> --strict` before implementation
- Implementation proceeds only after approval; archive changes post-deploy

## Known Considerations & To-Dos
- Confirm /api/robots implementation or adjust next.config rewrites
- Keep translations up to date (en.json used as baseline)
- Ensure NEXTAUTH_URL reflects deployment domain for production
