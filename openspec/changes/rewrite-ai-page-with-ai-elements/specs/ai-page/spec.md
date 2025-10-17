# AI Page Rewrite (Vercel AI Elements)

## ADDED Requirements

### Requirement: Compose AI page with Vercel AI Elements + useChat

The system SHALL render the AI page using Vercel AI Elements components (built on shadcn/ui + Radix) and manage conversation state via `useChat` from `@ai-sdk/react`.

#### Scenario: Initial render shows composer and message thread

- WHEN navigating to `/ai`
- THEN the page SHALL display the composer/input, and a message thread rendering user/assistant turns using `Message`, `MessageContent`, and `Response`
- AND message state SHALL be provided by `useChat`

### Requirement: Persist conversations and settings

The system SHALL persist conversations under `ai:conversations` and settings under `ai:settings` in localStorage.

#### Scenario: On submit, conversation is stored

- GIVEN the composer receives a non-empty prompt
- WHEN the user submits
- THEN a conversation item SHALL be appended to `ai:conversations` with { id, role:user, content, model, temperature, timestamp }, and assistant responses SHALL be stored with { id, role:assistant, content, timestamp }

### Requirement: Streaming transcript using useChat

The system SHALL progressively render assistant output while it is being generated via `useChat` streaming.

#### Scenario: Streaming content visible as tokens arrive

- GIVEN streaming is enabled
- WHEN assistant begins responding
- THEN tokens SHALL append to the thread until completion

### Requirement: Optional audio recording/transcription integration

The system SHOULD support recording audio and sending to `/api/transcribe`, injecting transcribed text into the composer.

#### Scenario: Transcribe audio populates composer

- WHEN recording is stopped and transcription succeeds
- THEN the transcribed text SHALL populate the composer for editing and submission

### Requirement: Optional text-to-speech overlay

The system SHOULD provide an overlay to play synthesized audio via `/api/tts` for selected assistant responses.

#### Scenario: TTS overlay opens and plays

- WHEN an assistant response is selected for playback
- THEN the overlay SHALL open and play audio with controls to stop/close

### Requirement: Dark mode and accessibility

The system SHALL use shadcn/ui styles and Radix primitives provided by AI Elements to ensure accessible interactions and dark mode via next-themes.

#### Scenario: Dark mode applies correctly

- WHEN toggling theme to dark
- THEN AI Elements SHALL reflect dark styles via CSS variables and `.dark` class

## MODIFIED Requirements

### Requirement: AI page uses Vercel AI Elements + useChat instead of QuestionTabs + IssueList

The system SHALL replace the current composition of `QuestionTabs` and `IssueList` with Vercel AI Elements and `useChat` on `src/pages/ai.js`.

#### Scenario: AI page renders new components

- WHEN inspecting `src/pages/ai.js`
- THEN it SHALL import and render the AI Elements composer and the message thread components, wired to `useChat`

### Requirement: Cleanup old localStorage keys

The system SHALL migrate from `QandA` and `LastAnswer` to `ai:conversations` and `ai:settings`, preserving existing data where feasible.

#### Scenario: Existing data is migrated on first load

- WHEN `QandA` or `LastAnswer` exist in localStorage
- THEN their data SHALL be transformed into the new schema and stored under `ai:*` keys

## REMOVED Requirements

### Requirement: HeroUI Tabs and Table on the AI page

Reason: Replace legacy components with Vercel AI Elements and shadcn/ui primitives.

#### Scenario: No `@heroui` imports in ai.js

- WHEN searching `src/pages/ai.js` for `@heroui`
- THEN there SHALL be zero matches after the rewrite

## References

[0] Vercel Changelog — Introducing AI Elements: Prebuilt, composable AI SDK components — https://vercel.com/changelog/introducing-ai-elements
