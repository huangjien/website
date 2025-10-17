## Context

The current AI page (`src/pages/ai.js`) composes `QuestionTabs` (conversation/config tabs) and `IssueList` (table of Q&A) using HeroUI, localStorage keys `QandA` and `LastAnswer`, and ahooks. The new requirement is to adopt Vercel’s AI Elements (built on shadcn/ui + Radix) and the Vercel AI SDK (`useChat`) to deliver a cohesive, modern AI experience with streaming, actions, and extensible UI blocks.

## Goals / Non-Goals

- Goals
  - Provide a rich AI chat experience: composer (send/stop/clear), streaming transcript, optional reasoning/actions
  - Persist conversation history and settings; searchable/paginated history
  - Maintain accessibility and dark mode (Radix + next-themes; shadcn/ui styling)
  - Align with Vercel AI Elements and @ai-sdk/react state management (`useChat`)
- Non-Goals
  - Change authentication or global i18n architecture
  - Build a bespoke chat SDK when AI Elements provide primitives

## Decisions

- Initialize Vercel AI Elements via CLI (`npx ai-elements@latest`) and select required components
- Use `useChat` from `@ai-sdk/react` for message state, actions, and streaming
- Compose AI page with AI Elements: `Message`, `MessageContent`, `Response`, and composer/input components; optionally reasoning panel and action bar
- Persist under `ai:conversations` and `ai:settings` (migrate from `QandA`/`LastAnswer` if present)
- Optional integrations: audio record/transcribe (`/api/transcribe`), text-to-speech (`/api/tts`)

## Alternatives Considered

- Keep existing `QuestionTabs` + `IssueList`: less cohesive, more maintenance, limited streaming/audio integration
- Build bespoke components on top of shadcn/ui: more control but duplicates capabilities of AI Elements and slows iteration

## Risks / Trade-offs

- Styling/theme alignment: ensure Tailwind config and tokens align with shadcn/ui used by AI Elements
- Migration complexity: larger UI swap; mitigate with unit + E2E tests and visual checks
- Backend integration: start with SDK defaults; adapt to project APIs progressively

## Migration Plan

1. Create feature branch `feature/ai-page-vercel-elements`
2. Run CLI to initialize components and scaffold `src/components/ai-elements/*`
3. Integrate `useChat` and wire to backend endpoints or SDK defaults
4. Rewrite `src/pages/ai.js` to compose AI Elements (replace `QuestionTabs`/`IssueList`)
5. Migrate localStorage schema; update i18n strings and tests
6. Manual visual review and E2E verification (dark mode, streaming)

## Rollback Plan

- Keep a branch with current AI page; revert if critical issues arise and iterate component-by-component

## Open Questions

- Which additional panels/actions from AI Elements should we include (reasoning, citations, feedback)?
- Audio/TTS UI placement: integrate into composer or dedicated overlays?

## References

[0] Vercel Changelog — Introducing AI Elements: Prebuilt, composable AI SDK components — https://vercel.com/changelog/introducing-ai-elements
