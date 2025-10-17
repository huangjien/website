# Proposal: Rewrite AI Page Using Vercel AI Elements

## Summary
Rewrite the AI page (`src/pages/ai.js`) to adopt Vercel’s open-source AI Elements component library and the Vercel AI SDK for state/streaming. Instead of hand-rolled "AI Elements" built on shadcn/ui, we will initialize and compose Vercel AI Elements (built on shadcn/ui and Radix) and wire them to `useChat` from `@ai-sdk/react` for conversation state, streaming responses, and actions.

Reference: Vercel AI Elements announcement and getting started flow [0].

## Rationale
- Align with Vercel’s recommended, composable UI building blocks for AI-native interfaces (message threads, input/composer, reasoning panels, response actions).
- Faster iteration and reduced maintenance vs bespoke components, while retaining full styling control through shadcn/ui primitives and Radix accessibility.
- Built-in patterns for streaming, message composition, and UI actions; integrates cleanly with Vercel AI SDK state (`useChat`).

## Scope of Change
- Replace the current `QuestionTabs` + `IssueList` composition with Vercel AI Elements and `useChat`.
- Key building blocks:
  - Message thread: `Message` + `MessageContent` + `Response` for rendering user/assistant turns.
  - Composer/input: AI Elements input box with send/stop/clear actions.
  - Optional reasoning panel/action bar as needed.
- State management: `useChat` from `@ai-sdk/react` to manage messages, streaming, and actions.
- Persist conversations/settings via localStorage (namespaced `ai:*`), preserving existing data where feasible.
- i18n: update strings for composer, actions, statuses.

## Impacted Files
- `src/pages/ai.js` (rewrite to compose AI Elements and `useChat`).
- `src/components/ai-elements/` (generated or initialized via CLI):
  - `message/*` (e.g., `Message`, `MessageContent`)
  - `response/*` (e.g., `Response`)
  - `composer/*` (input and actions)
  - any additional panels/actions selected at init
- `src/lib/aiService.js` (optional): may wrap/bridge existing APIs to `useChat` handlers; otherwise use SDK defaults.
- `src/locales/*` (new i18n strings for actions, labels).
- Tests: `src/__tests__/pages/ai.test.js` and Playwright E2E covering streaming and actions.

## Non-Goals
- Redesigning site navigation, authentication, or global i18n architecture.
- Building custom chat SDK equivalents when AI Elements provide the needed primitives.

## Validation Plan
- Local dev: AI page renders with AI Elements; no console errors.
- Unit tests: composer actions (send/stop/clear), message rendering, persistence.
- E2E: prompt -> streamed response visible; history persists; dark mode styling verified.
- Accessibility: keyboard navigation, focus management, aria labels.

## Rollout Strategy
- Create feature branch: `feature/ai-page-vercel-elements`.
- Initialize AI Elements via CLI and select required components (`npx ai-elements@latest`).
- Integrate `useChat` and wire to existing backend endpoints or SDK defaults.
- Remove legacy `QuestionTabs`/`IssueList` from `ai.js`.
- Request design/QA review; update `README` and `openspec/project.md` post-merge.

## Risks and Mitigations
- Styling/theme differences: AI Elements are built on shadcn/ui — align Tailwind config and tokens.
- Migration complexity: conduct thorough unit + E2E coverage and manual visual checks.
- API/state integration: start with SDK defaults and progressively adapt to project-specific APIs if needed.

## References
[0] Vercel Changelog — Introducing AI Elements: Prebuilt, composable AI SDK components — https://vercel.com/changelog/introducing-ai-elements