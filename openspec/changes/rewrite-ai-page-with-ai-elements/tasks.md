# Tasks: Rewrite AI Page Using Vercel AI Elements & AI SDK

## Initialization
1. Create feature branch `feature/ai-page-vercel-elements`
2. Initialize Vercel AI Elements via CLI and select required components (message thread + composer)
   - `npx ai-elements@latest` [0]
   - Scaffold `src/components/ai-elements/` (e.g., `message`, `response`, `composer`)
3. Verify Tailwind/shadcn setup and next-themes configuration align with AI Elements

## State and Services
4. Integrate `useChat` from `@ai-sdk/react`
   - Manage messages, streaming, and actions via `useChat`
   - Configure backend endpoints or use SDK defaults
5. Define localStorage schema and migration
   - `ai:conversations`: Array of { id, role, content, model?, temperature?, timestamp }
   - `ai:settings`: { model, temperature, trackSpeed, systemPrompt? }
   - Migrate from `QandA`/`LastAnswer` to `ai:*`
6. Optional services
   - `transcribeAudio(audioBlob)` -> `/api/transcribe`
   - TTS -> `/api/tts`

## Components
7. Message Thread
   - Render user/assistant turns with `Message`, `MessageContent`, and `Response`
   - Support streaming tokens and actions (copy/stop)
8. Composer/Input
   - Multi-line input; send (Enter/Cmd+Enter), stop, clear
   - Shortcut hints; optional mic toggle if audio is included
9. Optional panels/actions
   - Reasoning panel, citations, feedback buttons
10. Optional Audio/TTS
   - Audio record/transcribe; inject into composer
   - TTS overlay to play `/api/tts` output

## Page Integration
11. Rewrite `src/pages/ai.js`
   - Import AI Elements (composer + message thread) and wire to `useChat`
   - Retire `QuestionTabs` and `IssueList` on the AI page
12. Persist settings and conversations
   - Respect `ai:*` localStorage keys and migrate any existing data

## i18n and Accessibility
13. Add new strings under `src/locales/*` (ai.prompt, ai.send, ai.stop, ai.clear, ai.settings, ai.history, ai.stream)
14. Ensure aria-labels, keyboard shortcuts, and focus management

## Testing
15. Unit tests: composer actions; message rendering; persistence
16. E2E tests:
    - Prompt -> streamed response visible
    - History persists across reloads
    - Dark mode visual checks

## Cleanup and Docs
17. Remove legacy imports and UI paths on `ai.js`
18. Update README and `openspec/project.md` to reflect Vercel AI Elements adoption
19. Prepare PR with reviewer notes and screenshots

## References
[0] Vercel Changelog — Introducing AI Elements: Prebuilt, composable AI SDK components — https://vercel.com/changelog/introducing-ai-elements