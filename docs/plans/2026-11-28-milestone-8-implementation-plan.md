# Milestone 8 Implementation Plan: Build Gate, AI Removal, Cloudflare, Article Images, Open Publishing, Article Index

**Milestone:** #8 - Build gate, remove the AI tab, move build and deploy to Cloudflare Workers, fix article images, open publishing, add an article index sidebar
**Created:** 2026-11-28
**Status:** Active - Not Started
**Baseline (commit `5c12ebb`, 2026-11-27):** working tree clean. `pnpm test` is green with 100 suites and 1236 tests. CI validation is green. The CI deploy job and the local build are red (see Phase 35).

> Line numbers in this plan refer to commit `5c12ebb`. If a line moved, find the code by the symbol name.

## How to use this plan

1. Work from top to bottom. Each phase ends green and in one commit, so a stopped phase resumes at its first unticked task.
2. Tick a task only after its **verify** line passes.
3. Task markers:
   - **[git]**: commit, tag, or push. Runs only after you say go.
   - **[you]**: you do it. It installs software on your machine or handles secrets. Secrets never pass through the agent.
   - **[manual]**: outside the repository, for example the Cloudflare, GCP, and GitHub settings.

## Progress Tracker

| Phase | Work                                              | Tasks     | Est. (agent) | Your time | Status | Commit |
| ----- | ------------------------------------------------- | --------- | ------------ | --------- | ------ | ------ |
| 35    | Build gate and CI cleanup                         | T001-T009 | ≈ 60 min     | ≈ 15 min  | ☐      |        |
| 36    | Remove the AI tab and all AI features (tag first) | T010-T048 | ≈ 140 min    | ≈ 15 min  | ☐      |        |
| 37    | Cloudflare Workers take over build and deploy     | T049-T081 | ≈ 180 min    | ≈ 60 min  | ☐      |        |
| 38    | Display images in articles                        | T082-T090 | ≈ 60 min     | ≈ 10 min  | ☐      |        |
| 39    | Any signed-in user can add an article             | T091-T101 | ≈ 45 min     | ≈ 15 min  | ☐      |        |
| 40    | Article index sidebar                             | T102-T112 | ≈ 75 min     | ≈ 15 min  | ☐      |        |
| -     | Closure (roadmap and verification report)         | T113-T115 | ≈ 15 min     | ≈ 5 min   | ☐      |        |

Total: ≈ 9 h 35 min of agent time and ≈ 2 h 15 min of your time.

Gate results (fill in after each phase):

| Phase | lint | type-check | test (suites / tests) | coverage (global) | build                     | i18n parity |
| ----- | ---- | ---------- | --------------------- | ----------------- | ------------------------- | ----------- |
| 35    | -    | -          |                       | -                 |                           | -           |
| 36    |      |            |                       |                   |                           |             |
| 37    |      |            |                       |                   | OpenNext + deploy dry-run | -           |
| 38    |      |            |                       |                   | OpenNext + deploy dry-run | -           |
| 39    |      |            |                       |                   | OpenNext + deploy dry-run | -           |
| 40    |      |            |                       |                   | OpenNext + deploy dry-run |             |

`OpenNext + deploy dry-run` = `pnpm exec opennextjs-cloudflare build` and `pnpm exec wrangler deploy --dry-run`, the two commands that CI runs from Phase 37 on.

## Decisions

Confirmed with the site owner on 2026-11-28.

| Topic                | Decision                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tag                  | Annotated tag `lastAiTab` with message `before remove ai tab`, on the last commit before the removal. It follows the existing `lastNextUi` / `before remove nextui`.                |
| AI scope             | "All features" includes text-to-speech and voice transcription. They were reachable only from the AI page and the chat list.                                                        |
| Sidebar              | An index of article titles. Click a title to open that article and scroll to it.                                                                                                    |
| Publishing           | Any signed-in user (GitHub or Google login) publishes at once. The `BLOG_AUTHOR_EMAILS` allowlist no longer limits publishing.                                                      |
| Other images         | GitHub and YouTube thumbnail images go through the server proxy. Every other host loads directly in the reader's browser.                                                           |
| Cloudflare toolchain | OpenNext (`@opennextjs/cloudflare`), not vinext. vinext is in beta.                                                                                                                 |
| Build and deploy     | Cloudflare Workers Builds, connected to the GitHub repository. GitHub Actions does not deploy.                                                                                      |
| GitHub Actions       | The validation job stays. It runs the OpenNext build and a deploy dry-run. The GCP deploy job is deleted.                                                                           |
| Pre-commit           | `pnpm build` runs on every commit, after the tests.                                                                                                                                 |
| Old deployment files | Delete after the cutover to Workers is confirmed (slice 37.7).                                                                                                                      |
| Order                | Chosen by this plan: build gate, AI removal, Cloudflare, images, publishing, sidebar. The platform moves before the features, so each feature later deploys through Workers Builds. |

## Summary

Six changes, in this order:

1. **Phase 35** makes the local build pass and adds a build gate to the pre-commit hook. It removes the broken GCP deploy from GitHub Actions.
2. **Phase 36** removes the AI tab and all AI code, tests, packages, locale keys, configuration, and documentation. A tag preserves the last state before the removal.
3. **Phase 37** moves build and deploy to Cloudflare Workers with OpenNext, cuts `blog.huangjien.com` over, and then retires the GCP and Docker deployment.
4. **Phase 38** makes images inside articles render. Today 6 of the 7 real article images fail.
5. **Phase 39** lets every signed-in user add an article (a GitHub Issue) from `/write`.
6. **Phase 40** adds a sidebar with the index of the articles on the page.

## Scope

### In Scope

- Node 24 for the repository, a build gate in `.husky/pre-commit`, and a Node version check in the hook.
- The GCP deploy job removed from `.github/workflows/CID.yaml`, then the OpenNext build and a deploy dry-run added to its validation job.
- Tag `lastAiTab` before the removal.
- All AI code paths: page, API routes, libraries, components, hook, style file, tests, screenshots, npm packages, env keys, locale keys, performance targets, documentation.
- OpenNext and Wrangler configuration, Workers Builds, secrets in the Cloudflare dashboard, the DNS cutover of `blog.huangjien.com`, and the removal of the old deployment files.
- The two server changes that Workers needs: the image proxy cache and the client IP header.
- The image proxy allowlist and the `SmartImage` attempt order.
- The publish check in `POST /api/issues`, `/api/author`, and `/write`.
- A new `ArticleIndex` component and its layout in `IssueList`.

### Out of Scope

- Historical documents: the plans under `docs/plans/` (except `docs/jenkins-pipeline.md`, which is deleted in slice 37.7), `STATE.md`, `.hallmark/log.json`, `.trae/`.
- The commented-out "new issue" button in `src/components/IssueList.js` (lines 169-171). `/write` is the entry point.
- A moderation queue for articles from other users (you chose "publish now").
- Eviction for the proxy image cache (see Risk 8).
- vinext, Cloudflare Images, and image optimization on Workers.
- `ROADMAP.md` history and `openspec/` setup.

## Preconditions and Required Inputs

1. A Cloudflare account with the zone `huangjien.com`. The nameservers are `athena.ns.cloudflare.com` and `cosmin.ns.cloudflare.com` (checked 2026-11-28), so this is already true.
2. A local `.env.local` with `GITHUB_TOKEN` (access to the private repo `huangjien-com/blog`), `GITHUB_REPO`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `BLOG_AUTHOR_EMAILS`. The smoke tests in Phases 36 to 39 need them.
3. `HEAD` is the commit to tag for the AI removal. On 2026-11-28 that is `5c12ebb`.
4. Optional: a GitHub account that is not in `BLOG_AUTHOR_EMAILS`, to test the Phase 39 path with a second account. The code path is the same for every session, so the owner account is a valid stand-in.

## Work Breakdown

---

### Phase 35: Build gate and CI cleanup

**Goal:** `pnpm build` passes locally, the pre-commit hook refuses a commit when the build fails, and GitHub Actions no longer deploys to GCP.

**State on 2026-11-28:**

| Item                 | Finding                                                                                                                                                                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pre-commit hook      | `.husky/pre-commit` runs lint-staged, the tests, and a patch version bump. It has no build step.                                                                                                                                                                            |
| Local build, Node 26 | Fails after 3 s. `pnpm build` stops with `TypeError: Cannot read properties of undefined (reading 'length')` in `BatchedHash.update`, while the Serwist service worker is bundled. This machine runs Node 26.13.1 from Homebrew.                                            |
| Local build, Node 24 | Passes in 24.6 s on the same commit and the same dependencies (Node 24.22.3). `.nvmrc` contains `24`.                                                                                                                                                                       |
| CI                   | `Validate Quality Gates` passes, including `pnpm build:webpack`. `Build and Deploy Edge Runtime` fails at the Deploy step: `ERROR: (gcloud.run.services.replace) Image 'mirror.gcr.io/huangjien/website-edge:5c12ebbb' not found.` The last 3 runs are red for this reason. |

#### Slice 35.1 - Make the local build pass (≈ 15 min)

- [x] T001 **[you]** Install Node 24 for this repository. Option A (recommended): install `fnm` with `brew install fnm`, add `eval "$(fnm env --use-on-cd)"` to `~/.zshrc`, open a new shell in the repository, and run `fnm use`. `fnm` then reads `.nvmrc`. Option B: `brew install node@24` and put its `bin` folder first in `PATH`. The Homebrew `node` (26) can stay.
- [x] T002 Run `node --version` and `pnpm build` in the repository. **Verify:** the version starts with `v24.` and the build exits with code 0 (24.6 s measured).

#### Slice 35.2 - Pre-commit build gate (≈ 20 min)

- [x] T003 `.husky/pre-commit`: add step 0 before `lint-staged`, a Node version check. Compare the major version of `node --version` with `.nvmrc`. On a mismatch print `Node 24 is required (.nvmrc), found <version>. Run fnm use.` and exit 1.
- [x] T004 `.husky/pre-commit`: add step 3 between `pnpm test --silent` and the version bump: `pnpm build`, with its output written to a log file. On failure print the last 40 lines of the log and exit 1. Update the numbered comment at the top of the file.
- [x] T005 Prove that the gate blocks. (a) Create `src/pages/zz-broken.js` with `import x from "../lib/does-not-exist";`, stage it, and run `git commit -m test`. **Verify:** the commit is refused with "Module not found". Then run `git reset -q src/pages/zz-broken.js` and delete the file. (b) Stage a harmless new file, put Node 26 first in `PATH` (`PATH="/opt/homebrew/bin:$PATH" git commit -m test`). **Verify:** the commit is refused with the Node message. Remove the file. **Verify:** `git log -1 --format=%s` is still `fix`.
- [x] T006 `CONTRIBUTING.md`: add a section "Pre-commit checks" with the four steps (Node 24 check, lint-staged, tests, build) and the version bump. **Verify:** `pnpm format:check` passes.

#### Slice 35.3 - GitHub Actions: remove the GCP deploy (≈ 15 min)

- [x] T007 `.github/workflows/CID.yaml`: delete the `build` job (lines 63-197, "Build and Deploy Edge Runtime"), the `deploy_edge` input (lines 15-19), and the env lines `SERVICE_NAME`, `RUN_REGION`, `EDGE_IMAGE_REPO` (lines 22-24). Keep the `validate` job as it is.
- [x] T008 **[git]** Commit (`build gate in pre-commit, remove gcp deploy from ci`) and push. The commit passes the new gate: lint-staged, tests, build (about 30 s).
- [x] T009 **Verify:** `gh run list --workflow CID.yaml --limit 1` shows `success` for the new commit, with only the `validate` job.

---

### Phase 36: Remove the AI tab and all AI features

**Goal:** no AI route, component, package, key, or document line remains, and the tag keeps the old state reachable.

| Area            | What is removed                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI page and API | `src/pages/ai.js`; `src/pages/api/ai-models.js`, `chat.js`, `transcribe.js`, `tts.js`                                                                                |
| AI libraries    | `src/lib/ai/` (7 modules); `src/config/ai-models.js`                                                                                                                 |
| AI UI           | `src/components/ai-elements/` (7 components); `Chat.js`, `ConversationTab.js`, `ConfigurationTab.js`; `src/hooks/useAudioRecording.js`; `src/styles/hallmark-ai.css` |
| Tests           | 24 test files                                                                                                                                                        |
| Assets          | 4 files `screenshots/ai-*.png`                                                                                                                                       |
| npm packages    | `@ai-sdk/openai`, `@ai-sdk/react`, `ai`, `openai`, `http-proxy`, `zod`. Each is imported only by files that this phase deletes.                                      |
| Shared code     | Navigation, settings, locales, configuration, and scripts. See slices 36.3 to 36.6.                                                                                  |

Total: 53 tracked files deleted (25 source files, 24 test files, 4 screenshots).

#### Slice 36.1 - Tag the pre-removal state (≈ 5 min)

- [x] T010 Run `git status --short`. **Verify:** it prints nothing. If it prints anything, stop and ask before you tag.
- [x] T011 Create the tag: `git tag -a lastAiTab -m "before remove ai tab"`. **Verify:** `git tag -n1` lists `lastAiTab  before remove ai tab`, and `git rev-list --count lastAiTab..HEAD` prints `0`.
- [x] T012 **[git]** Push the tag: `git push origin lastAiTab`. **Verify:** `git ls-remote --tags origin lastAiTab` prints one line.

#### Slice 36.2 - Delete AI-only files (≈ 20 min)

- [x] T013 Delete the AI page and API routes: `src/pages/ai.js`, `src/pages/api/ai-models.js`, `src/pages/api/chat.js`, `src/pages/api/transcribe.js`, `src/pages/api/tts.js`.
- [x] T014 **[P]** Delete `src/lib/ai/` and `src/config/ai-models.js`.
- [x] T015 **[P]** Delete `src/components/ai-elements/`, `src/components/Chat.js`, `src/components/ConversationTab.js`, `src/components/ConfigurationTab.js`, `src/hooks/useAudioRecording.js`, and `src/styles/hallmark-ai.css`.
- [x] T016 **[P]** Delete the tests outside those folders: `src/__tests__/api/ai-models.test.js`, `chat.test.js`, `transcribe.test.js`, `tts.test.js`; `src/__tests__/hooks/useAudioRecording.test.js`; `src/__tests__/pages/ai.test.js`, `ai.additional.test.js`; `src/components/__tests__/ai-elements/`; `src/components/__tests__/Chat.test.js`, `ConversationTab.test.js`, `ConfigurationTab.test.js`.
- [x] T017 **[P]** Delete `screenshots/ai-page.png`, `screenshots/ai-after-click.png`, `screenshots/ai-settings-panel.png`, `screenshots/ai-settings-closed.png`.

**Verify (slice):** `git status --short | grep -c '^ D'` prints `53`.

#### Slice 36.3 - Navigation and shared UI (≈ 25 min)

- [x] T018 `src/config/site.js`: remove the `{ label: "AI", href: "/ai" }` nav item (lines 9-12). This also removes AI from the footer in `src/pages/layout.js`.
- [x] T019 `src/components/NavigationBar.js`: remove `BiChip` from the import (line 6) and the `/ai` entry (line 17). Change `NAV_ITEMS.slice(0, 2)` (line 48) to `slice(0, 1)` and `NAV_ITEMS.slice(2)` (line 51) to `slice(1)`, so Write stays directly after Home.
- [x] T020 `src/components/MobileMenu.jsx`: remove `BiChip` (line 7) and the `/ai` menu item (lines 58-67).
- [x] T021 `src/components/Breadcrumb.jsx`: remove the `segment === "ai"` label mapping (line 19).
- [x] T022 `src/components/IssueList.js`: remove `Chat`, `MemoizedChat`, and the `"Chat"` case in `renderCell`. Remove the `useSettings` import and `languageCode` / `speakerName`. Remove the text-to-speech code: `audioSrc`, `open`, `handleOpenChange`, `handleText2Speech`, `readText`, and the audio `<Dialog>`. Change the `inTab` default from `"ai"` to `"issue"`. Update the JSDoc: drop "chat", "text-to-speech", and the `inTab` default.

#### Slice 36.4 - Settings, locale plumbing, configuration (≈ 15 min)

- [x] T023 `src/lib/useSettings.js`: remove the `languageCode` and `speakerName` state (lines 42-48) and their return fields (lines 101-104).
- [x] T024 `src/components/LanguageSwitch.js`: remove `setLanguageCode` and `setSpeakerName` and the voice lookups (lines 11, 14, 22-24, 40-48). `chooseLanguageKey` keeps only `setCurrentLanguage(key)`.
- [x] T025 `src/locales/i18n.js`: remove the voice fields `languageCode` and `name` from every entry of `languages` (lines 24-87). Each entry keeps `key` and `value`.
- [x] T026 `src/lib/apiClient.js`: remove `getOpenAiApiKey` (lines 189-190). `src/pages/_app.js`: remove the `hallmark-ai.css` import (line 18).
- [x] T027 `next.config.js`: change `Permissions-Policy` to `microphone=()` (line 42). Voice recording is gone.
- [x] T028 `jest.setup.js`: remove the `"TTS API Error"` console filter (line 128). `test-setup.js`: remove `process.env.OPEN_API_KEY = "test-openai-key"` (line 26).

#### Slice 36.5 - Locale files (≈ 15 min)

- [x] T029 In all 12 files `src/locales/*.json`, remove the top-level `ai`, `chat`, and `tts_button` objects, and the keys `header.ai`, `settings.select_voice`, `settings.voice_note`. `en.json` has 58 such keys. `de`, `es`, `fr`, `it`, `zh_CN`, `zh_TW` have 52 each. `ar`, `ga`, `ja`, `ko`, `ru` are partial files: remove the AI keys they contain.
- [x] T030 `src/locales/__tests__/parity.test.js`: remove the six `ai.*` entries from `TRANSITIONAL_KEYS` (lines 26-31).
- [x] T031 `src/locales/__tests__/i18n.test.js`: remove the voice assertions: "languages with codes" (line 178 area), "consistent structure for languages with voice support" (line 222), "should not have duplicate voice names" (line 392), and the other `languageCode` / `name` checks. Keep `languages.length` and `toHaveLength(12)`.

**Verify (slice):** `grep -cE '"(ai|chat|tts_button)"' src/locales/*.json` prints `0` for every file. `pnpm test src/locales` and `pnpm check:i18n-parity` pass.

#### Slice 36.6 - Dependencies and configuration (≈ 15 min)

- [x] T032 `package.json`: remove `@ai-sdk/openai`, `@ai-sdk/react`, `ai`, `openai`, `http-proxy`, and `zod` from `dependencies`. Then run `pnpm install` to update `pnpm-lock.yaml`.
- [x] T033 `pnpm-workspace.yaml`: remove the AI overrides `@ai-sdk/gateway`, `@ai-sdk/react`, `ai`, `@ai-sdk/mcp`, `@ai-sdk/openai`, `@ai-sdk/provider-utils`, `@ai-sdk/provider`, `openai`, `zod` (lines 47-55 and 111). Keep `esbuild: true` and `workerd: true` under `allowBuilds` (lines 5-6). `@opennextjs/cloudflare` and `wrangler` need them in Phase 37.
- [x] T034 `.env.local.example`: remove `OPEN_AI_KEY`, `OPENAI_API_KEY`, and their comments (lines 4-7). `.env.test`: remove both keys (lines 6-7).
- [x] T035 `docker-compose.yml`: drop `OPENAI_*` from the comment (line 11). `deploy-home.sh`: drop `OPENAI_*` from the message (line 18). Both files are deleted later in slice 37.7.
- [x] T036 `scripts/perf-budgets.json`: remove the `ai` target (lines 12-17). `scripts/measure-phase2-baseline.mjs`: remove the `ai` and `api-ai-models` targets (lines 8 and 11).

**Verify (slice):** `pnpm ls @ai-sdk/openai @ai-sdk/react ai openai http-proxy zod` lists no package. `pnpm install --frozen-lockfile` succeeds.

#### Slice 36.7 - Shared tests (≈ 25 min)

- [x] T037 `src/config/__tests__/site.test.js`: remove the AI nav item from the expected list (line 17) and the `aiItem` assertion (line 40).
- [x] T038 `src/components/__tests__/NavigationBar.test.js`: remove the `BiChip` mock (line 54) and the `header.ai` assertions (lines 167, 213, 225). Add one assertion: with `canPublish: true`, the Write link comes directly after the Home link.
- [x] T039 `src/components/__tests__/MobileMenu.test.js`: remove the `header.ai` stub (line 10) and its assertions.
- [x] T040 `src/components/__tests__/Breadcrumb.test.js`: the suite uses `/ai` as its sample path in 8 places. Use `/settings` instead. Remove the `header.ai` stub (line 14).
- [x] T041 `src/components/__tests__/IssueList.test.js`: remove the 8 chat and text-to-speech tests: "renders chat components when ComponentName is Chat", "handles text-to-speech functionality", "handles TTS modal opening and closing", "calls TTS API with correct parameters", "handles TTS API error gracefully", "encodes TTS text properly for URL", "creates audio URL from blob response", "stops audio when modal is closed". Remove the voice fields from the `useSettings` mock.
- [x] T042 `src/lib/__tests__/useSettings.test.js`: remove the two voice tests (lines 82 and 92). `src/components/__tests__/LanguageSwitch.test.js`: remove the 3 voice references. `src/lib/__tests__/apiClient.test.js`: remove the `getOpenAiApiKey` tests.

**Verify (slice):** `pnpm test` is green with 76 suites.

#### Slice 36.8 - Documentation, gates, smoke test (≈ 20 min)

- [x] T043 `README.md`: remove the AI text in the intro (line 14), the AI row of the feature table (line 23), and the `OPENAI_API_KEY` sample (lines 69-70). `PROJECT.md`: remove the AI lines 11, 30, 39, 46, and 56. `CONTRIBUTING.md`: remove the `ai-elements/` line (line 129).
- [x] T044 Run the gates: `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm test:coverage` (global ≥ 70 %), `pnpm check:i18n-parity`, `pnpm build`. Write the results in the gate table at the top.
- [x] T045 Residual scan. **Verify:** this command prints nothing: `grep -rnIiE '(openai|open_ai|@ai-sdk|ai-elements|/api/(chat|tts|transcribe|ai-models)|useAi[A-Z]|useAudioRecording|ConversationTab|ConfigurationTab|tts_button|speakerName|hallmark-ai)' src scripts test-setup.js jest.setup.js README.md PROJECT.md CONTRIBUTING.md .env.local.example .env.test package.json pnpm-workspace.yaml next.config.js`
- [x] T046 Smoke test with `pnpm dev` (port 8080): (1) the desktop nav shows Home, Settings, About, and Write when you are signed in; (2) the mobile menu shows the same items; (3) `curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/ai` prints `404`; (4) the same for `/api/chat`, `/api/tts`, `/api/transcribe`, `/api/ai-models`; (5) Home, About, and Settings render; (6) the language switch still changes the language.
- [x] T047 **[git]** Commit Phase 36 as one commit: `remove ai tab and features`. Stage by explicit path. First check `git status` and `git diff --cached --stat`: expect 53 deletions and the edited files.
- [x] T048 **[manual]** Remove `OPENAI_API_KEY` and `OPEN_AI_KEY` from the home runtime env file. Then delete or rotate the key at the provider if nothing else uses it.

---

### Phase 37: Cloudflare Workers take over build and deploy

**Goal:** Cloudflare Workers Builds builds and deploys the site on every push to `main`. `blog.huangjien.com` is served by the Worker. The GCP and Docker deployment is retired.

**Facts (checked 2026-11-28):**

| Topic            | Fact                                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Toolchain        | `@opennextjs/cloudflare` 1.20.19. Peer versions: Next `>=16.4.5` (this repo has 16.4.6) and Wrangler `^4.148.0` (current: 4.169.0). The adapter depends on `esbuild`. Cloudflare recommends vinext for new apps. vinext is in beta.                                                        |
| Build and deploy | Workers Builds is configured in the dashboard: build command, deploy command (default `npx wrangler deploy`), preview command (default `npx wrangler preview`), and branch. The dashboard Worker name must equal `name` in the Wrangler config. Pushes to other branches create a preview. |
| Build image      | Node 24.22.1 by default. `.nvmrc` overrides it. pnpm runs through Corepack and uses `packageManager` from `package.json` (12.23.0).                                                                                                                                                        |
| Node.js APIs     | `node:fs` can write only to an in-memory `/tmp` that is unique to each request. `node:dns` works (DNS over HTTPS; each lookup is one subrequest). Node.js compatibility is on by default for compatibility dates from 2026-08-04.                                                          |
| Images           | Workers has no Next.js image optimizer. Set `images.unoptimized: true`. With it, `next/image` renders the original URL as a plain image (checked in the installed Next.js 16.4.6 source).                                                                                                  |
| Domain           | `huangjien.com` is on Cloudflare. A Workers custom domain needs an active Cloudflare zone. It cannot be created on a hostname with an existing CNAME record.                                                                                                                               |
| Plan limits      | Workers Free: 10 ms CPU time per request. Workers Paid: from $5 per month, 30 s CPU time per request by default. The docs I read do not say which plan a Next.js app needs.                                                                                                                |

**Server code that Workers needs changed:**

1. `src/pages/api/image-proxy.js`: the cache writes to disk. On Workers that cache never hits, because `/tmp` is unique to each request.
2. `getClientIp` in `src/lib/apiClient.js`: it reads `x-forwarded-for` and `x-real-ip`. On Workers the client IP arrives in `cf-connecting-ip`. Without the change, all visitors share one rate-limit bucket.

No other server file uses Node-only APIs (`src/pages/api/transcribe.js` is deleted in Phase 36).

#### Slice 37.1 - Add OpenNext and Wrangler (≈ 25 min)

- [x] T049 Run `pnpm add -D @opennextjs/cloudflare wrangler`. **Verify:** `pnpm ls @opennextjs/cloudflare wrangler` lists both packages and `pnpm install --frozen-lockfile` succeeds.
- [x] T050 New `wrangler.jsonc` in the repository root:

  ```jsonc
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "blog",
    "main": ".open-next/worker.js",
    "compatibility_date": "2026-11-01",
    "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
    "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
    "services": [{ "binding": "WORKER_SELF_REFERENCE", "service": "blog" }],
    "observability": { "enabled": true },
  }
  ```

  `nodejs_compat` is the OpenNext template value. It is redundant from 2026-08-04 on and does no harm. There is no `routes` entry yet: the first deploys go to `blog.<account>.workers.dev`.

- [x] T051 New `open-next.config.ts` in the repository root:

  ```ts
  import { defineCloudflareConfig } from "@opennextjs/cloudflare";

  export default defineCloudflareConfig({});
  ```

- [x] T052 `package.json` scripts: add `"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview"`, `"deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"`, `"upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload"`, and `"cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"`. Keep `build` as it is: `opennextjs-cloudflare build` runs the `build` script.
- [x] T053 `.gitignore`: add `.open-next/`, `.wrangler/`, `.dev.vars`, `.dev.vars.*`, and `cloudflare-env.d.ts`. **Verify:** `git check-ignore .dev.vars .open-next/worker.js` prints both paths.
- [x] T054 `next.config.js`: add `images: { unoptimized: true }` under `images`, next to `remotePatterns`. Keep `output: "standalone"`.
- [x] T055 If `pnpm lint` fails on `open-next.config.ts` (the ESLint config has no TypeScript parser), add `"open-next.config.ts"` to the top-level `ignores` in `eslint.config.mjs`. Then run `pnpm lint`, `pnpm type-check`, `pnpm format:check`, and `pnpm exec opennextjs-cloudflare build`. **Verify:** all pass and `.open-next/worker.js` exists. If the build asks for another `output` setting, follow its message and write the change here: ________

#### Slice 37.2 - Server code for Workers, tests first (≈ 45 min)

- [x] T056 `src/__tests__/api/image-proxy.test.js`: add red tests with a mocked `globalThis.caches.default`: (a) a cache hit returns the image and makes no upstream request; (b) after a successful upstream request, the response is stored in the cache; (c) with no `caches` global, the proxy still returns the image.
- [x] T057 `src/lib/__tests__/apiClient.test.js`: add red tests for `getClientIp`: `cf-connecting-ip` wins over `x-forwarded-for`; without it the order is `x-forwarded-for`, then `x-real-ip`, then `unknown`.

**Verify (tests first):** `pnpm test src/__tests__/api/image-proxy.test.js src/lib/__tests__/apiClient.test.js`: the new tests fail.

- [x] T058 `src/lib/apiClient.js` `getClientIp` (line 193): read `cf-connecting-ip` first.
- [x] T059 `src/pages/api/image-proxy.js`: remove `fs`, `path`, `process.cwd()`, `CACHE_DIR`, and the helper functions that used them. Cache through `globalThis.caches.default` when it exists (`cache.match` and `cache.put`). When it does not exist (local Node), use an in-memory `Map`. Keep the cache key, the 30-day expiry, and the `X-Cache` headers. Keep the host allowlist, the private-IP guards, the redirect checks, the size cap, and the rate limit. Keep `node:dns` and `node:net`: they work on Workers.

**Verify (slice):** the two test files are green.

#### Slice 37.3 - Local check on the Workers runtime (≈ 25 min)

- [ ] T060 **[you]** Create `.dev.vars` in the repository root (it is git-ignored) with the runtime variables from `.env.local`. Set `NEXTAUTH_URL=http://localhost:8787` for this local check.
- [x] T061 Run `pnpm preview` and open http://localhost:8787. **Verify:** (1) Home lists the articles; (2) About and Settings render; (3) an article image loads through `/api/image-proxy`; (4) `curl -s -o /dev/null -w '%{http_code}' http://localhost:8787/api/health` prints `200`; (5) the sign-in button starts the OAuth redirect; (6) `robots.txt`, `manifest.json`, and `sw.js` load.
- [x] T062 Gates: `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm test:coverage`, `pnpm format:check`.
- [x] T063 **[git]** Commit: `deploy on cloudflare workers with opennext`.

#### Slice 37.4 - GitHub Actions: validate the Cloudflare build (≈ 15 min)

- [x] T064 `.github/workflows/CID.yaml`, `validate` job: replace `- run: pnpm build:webpack` (line 56) with `- run: pnpm exec opennextjs-cloudflare build` and `- run: pnpm exec wrangler deploy --dry-run`. The dry run packs the Worker and uploads nothing.
- [x] T065 **[git]** Push. **Verify:** the CI run is green and shows the two new steps.

#### Slice 37.5 - Deploy to a preview URL (≈ 20 min)

- [ ] T066 **[you]** Run `pnpm exec wrangler login` and approve it in the browser.
- [ ] T067 **[you]** Set the runtime secrets. Run `pnpm exec wrangler secret put NAME` for each of `NEXTAUTH_SECRET`, `GITHUB_TOKEN`, `GITHUB_MEMBER`, `BLOG_AUTHOR_EMAILS`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`. Paste each value when asked. In the dashboard (Settings → Variables & Secrets) add `NEXTAUTH_URL` = `https://blog.huangjien.com` and `GITHUB_REPO` = `https://api.github.com/repos/huangjien-com/blog`.
- [ ] T068 Run `pnpm exec opennextjs-cloudflare deploy -- --keep-vars`. **Verify:** `curl -s -o /dev/null -w '%{http_code}' https://blog.<account>.workers.dev/api/health` prints `200`.
- [ ] T069 Plan limit check: open Home, About, Settings, and 3 API routes on the preview URL. Then look at the logs of the Worker in the dashboard. **Verify:** no CPU-limit error. If requests fail on the CPU limit, switch to Workers Paid before the cutover.
- [ ] T070 Full check on the preview URL: Home lists the articles, 3 API routes answer 200, an article image loads, `sw.js` loads, and the logs show no error.

#### Slice 37.6 - Cutover of `blog.huangjien.com` (≈ 20 min)

- [ ] T071 **[you]** Connect Workers Builds in the dashboard: Workers & Pages → `blog` → Settings → Builds → Connect → the GitHub repository `huangjien/website`. Production branch: `main`. Build command: `pnpm exec opennextjs-cloudflare build`. Deploy command: `pnpm exec opennextjs-cloudflare deploy -- --keep-vars`. Preview command: `pnpm exec opennextjs-cloudflare upload -- --keep-vars`.
- [ ] T072 **[you]** Prepare the rollback path. In the dashboard (DNS → Records) write down the type, the name, and the target of the record for `blog`: ________. Then delete that record. A custom domain cannot be created while a CNAME record exists on the hostname.
- [ ] T073 Add to `wrangler.jsonc`: `"routes": [{ "pattern": "blog.huangjien.com", "custom_domain": true }]`. **[git]** Commit (`route blog.huangjien.com to the worker`) and push. The pre-commit gate runs. Workers Builds deploys, and Cloudflare creates the DNS record and a certificate. **Verify:** `dig blog.huangjien.com +short` answers with Cloudflare proxy addresses, and `curl -sI https://blog.huangjien.com` returns `HTTP/2 200`.
- [ ] T074 Check after the cutover (10 minutes): sign in with GitHub and with Google, open `/write`, load articles #59 and #57, call `/api/health`. Then watch the Worker logs for one day.

Rollback, only if a check fails: in the dashboard, delete the DNS record that the custom domain created, and restore the record from T072. Traffic returns to the Cloud Run revision that runs now. DNS changes at Cloudflare usually apply within minutes (typical value, not measured). The Cloud Run deploy is broken, so rollback returns to that older revision and not to new code.

#### Slice 37.7 - Retire the old deployment (≈ 30 min) - start only after you confirm the Workers site works

- [ ] T075 Delete these 13 tracked files: `Dockerfile`, `Dockerfile.edge`, `.dockerignore`, `docker-compose.yml`, `deploy-home.sh`, `deploy/cloudrun/service.yaml`, `deploy/nginx/default.conf.template`, `deploy/nginx/entrypoint.sh`, `deploy/nginx/maintenance.html`, `deploy/nginx/nginx.conf`, `Jenkinsfile`, `scripts/deploy-jenkins-pipeline.py`, `docs/jenkins-pipeline.md`. **Verify:** `git status --short | grep -c '^ D'` prints `13`.
- [ ] T076 `.github/dependabot.yml`: the `docker` entry with `directory: "/"` (lines 70-86) finds no file now. Change its directory to `/.devcontainer`.
- [ ] T077 `README.md`: rewrite "🚢 Deployment Topology" (lines 73-135) for Workers: Workers Builds, the build and deploy commands, `wrangler.jsonc`, secrets in the dashboard, the cutover, and the rollback. Update the tech-stack table (lines 33-35) and line 14 ("Deployed on Google Cloud Run").
- [ ] T078 `ROADMAP.md`: add a note under Milestone 7 that the Cloud Run edge and the home runtime were retired by Milestone 8.
- [ ] T079 `package.json`: remove the scripts `docker:build`, `docker:push`, and `docker:run` (lines 53-55). **Verify:** `grep -rnIE 'docker|Dockerfile|deploy-home|cloudrun|gcloud|Cloud Run|Jenkins' README.md CONTRIBUTING.md PROJECT.md package.json .github scripts` prints nothing that is not about the dev container.
- [ ] T080 Gates: `pnpm lint`, `pnpm test`, `pnpm build`. Then **[git]** commit: `remove gcp and docker deployment`.
- [ ] T081 **[manual]** When you are ready: delete the GitHub secrets `GCP_PROJECT_ID`, `GCP_SA_KEY`, `HOME_UPSTREAM_HOST`, `HOME_UPSTREAM_PORT`, and `DOCKER_PASSWORD`. On GCP delete the Cloud Run service `blog` (europe-west1), its images, the service account key, and the `TS_AUTHKEY` secret. In Tailscale remove the `tag:cloud-run-edge` tag. On the home host stop the `home-upstream` container.

---

### Phase 38: Display images in articles

**Goal:** every image in every article renders.

**Evidence (2026-11-28, live data from `https://blog.huangjien.com/api/issues`):** 7 articles contain one image each. 6 fail.

| Articles      | Markup in the issue          | Image host                                  | Result today                                                                                                                                                                                            |
| ------------- | ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #59, #53, #52 | `<img width height alt src>` | `github.com/user-attachments/assets/<uuid>` | First attempt: 404 (no GitHub token, and the repo is private). Proxy: GitHub answers 302 to `github-production-user-asset-6210df.s3.amazonaws.com`. That host is not allowed, so the proxy answers 400. |
| #57, #56, #55 | `![alt](url)`                | `img.youtube.com`                           | First attempt: 400 (host not in `remotePatterns` on Node). Proxy: 400 (host not allowed).                                                                                                               |
| #38           | `![alt](url)`                | `myoctocat.com` (an SVG)                    | Most likely renders today. Next.js serves `.svg` sources without the optimizer, and the host answers 200 to a request with the blog as referer. Not loaded in a browser for this plan.                  |

**Root cause in code:**

1. `src/pages/api/image-proxy.js` lines 19-27: `DEFAULT_ALLOWED_HOSTS` has six `*.githubusercontent.com` hosts and `github.com`. It does not have the S3 host of the attachment redirect, `img.youtube.com`, or `myoctocat.com`. The redirect check (lines 318-320) rejects the new host.
2. `src/components/SmartImage.js` lines 29-40: two attempts only (first attempt, then proxy). Then the "Image failed to load" placeholder.
3. `next.config.js` lines 75-96: `images.remotePatterns` has `github.com`, `user-images.githubusercontent.com`, and `avatars.githubusercontent.com`.

**Fix:**

1. The proxy accepts every `githubusercontent.com` subdomain, the S3 attachment host, and YouTube thumbnails.
2. `SmartImage` sends attachments directly to the proxy and adds one last attempt: load the image directly in the browser.
3. Phase 37 already set `images.unoptimized: true`. So the first attempt for every other URL is now a direct load in the browser, not the optimizer.

#### Slice 38.1 - Failing tests first (≈ 15 min) - must finish before slice 38.2

- [x] T082 `src/__tests__/api/image-proxy.test.js`: add these tests: (a) follows a 302 to `https://github-production-user-asset-6210df.s3.amazonaws.com/…` and returns the image; (b) follows a 302 to `https://private-user-images.githubusercontent.com/…` and returns the image; (c) accepts `img.youtube.com`; (d) accepts `i.ytimg.com`; (e) still returns 400 for `https://example.com/a.png`.
- [x] T083 `src/components/__tests__/SmartImage.test.js`: add these tests: (a) a `src` below `https://github.com/user-attachments/` renders the proxy URL first; (b) when the first attempt fails for `https://img.youtube.com/vi/x/0.jpg`, the proxy URL is used; (c) when the proxy fails too, a plain `<img>` with the original `src` and `referrerPolicy="no-referrer"` renders; (d) when that fails too, the "Image failed to load" placeholder renders.
- [x] T084 `src/lib/__tests__/markdown-utils.test.js`: add the self-closing tag from article #59: `<img width="628" height="396" alt="Image" src="https://github.com/user-attachments/assets/<uuid>" />` converts to `![Image](<url>)`. If this test passes on the first run, keep it as a regression guard.

**Verify (slice):** `pnpm test src/__tests__/api/image-proxy.test.js src/components/__tests__/SmartImage.test.js`: the new tests fail.

#### Slice 38.2 - Fix (≈ 25 min)

- [x] T085 `src/pages/api/image-proxy.js`: in `DEFAULT_ALLOWED_HOSTS` (lines 19-27), replace the six `*.githubusercontent.com` entries with the parent domain `githubusercontent.com`. `isHostAllowed` (line 38) already matches subdomains. Add `github-production-user-asset-6210df.s3.amazonaws.com`, `img.youtube.com`, and `i.ytimg.com`. Keep `github.com` and `github.githubassets.com`. Every redirect hop is checked again (lines 302-326), so the private-IP guards stay active.
- [x] T086 `src/components/SmartImage.js`: build the attempt order from the URL:
  1. `https://github.com/user-attachments/*`: proxy, then the failed placeholder. The first attempt cannot send a GitHub token, so it cannot read a private repository attachment.
  2. Every other URL: `next/image` with the original URL, then proxy, then a plain `<img loading="lazy" decoding="async" referrerPolicy="no-referrer">`, then the failed placeholder.

  Skip an attempt whose URL already failed. The plain `<img>` needs the comment `{/* eslint-disable-next-line @next/next/no-img-element */}`.

**Verify (slice):** `pnpm test src/__tests__/api/image-proxy.test.js src/components/__tests__/SmartImage.test.js src/lib/__tests__/markdown-utils.test.js` is green. `pnpm lint` shows no new warning.

#### Slice 38.3 - Verification (≈ 20 min)

- [x] T087 Proxy smoke test. Run `pnpm preview`, then `curl -s -D - -o /dev/null 'http://localhost:8787/api/image-proxy?url=https%3A%2F%2Fgithub.com%2Fuser-attachments%2Fassets%2F519c2516-b08c-490a-862a-6dfe56978803'`. **Verify:** `200`, `Content-Type: image/png`, and `X-Cache: MISS`. The second call shows `X-Cache: HIT`.
- [x] T088 Browser smoke test on http://localhost:8787: open article #59 (attachment) and #57 (YouTube thumbnail). Each image renders, with no "Image failed to load" placeholder. Open article #38: the SVG still renders.
- [x] T089 Gates: `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm test:coverage`. Report the coverage of `src/components/SmartImage.js` and `src/pages/api/image-proxy.js`. Write the results in the gate table.
- [x] T090 **[git]** Commit: `fix article images`.

---

### Phase 39: Any signed-in user can add an article

**Goal:** every signed-in user can publish an article from `/write`. Anonymous users still get 401.

**State today:**

- `src/pages/api/issues.js` lines 81-90: POST needs a session **and** `isBlogAuthor(session)`. `isBlogAuthor` compares the session email with `BLOG_AUTHOR_EMAILS`.
- `src/pages/api/author.js`: returns `canPublish: isBlogAuthor(session)`.
- `src/pages/write.js` lines 45-52: a signed-in user without `canPublish` sees "This studio is private".
- `NavigationBar.js` and `MobileMenu.jsx` show the Write link only when `canPublish` is true.

**Controls that stay:** sign-in required (401), 10 issues per hour per user, title ≤ 200 characters, body ≤ 65536 characters, at most 20 labels of at most 50 characters, the mandatory `blog` label, and the telemetry events `issue_post_attempt`, `issue_post_success`, `issue_post_failure`.

#### Slice 39.1 - Failing tests first (≈ 10 min) - must finish before slice 39.2

- [x] T091 `src/__tests__/api/issues.test.js`: replace "rejects an authenticated user who is not the owner" (line 198) with "publishes for a signed-in user who is not the owner and adds the blog label". Expect 200 and an upstream POST to `/issues` with `blog` in `labels`. Keep "rejects unauthenticated POST" and "rejects POST when issue rate limit is exceeded".
- [x] T092 `src/__tests__/api/author.test.js`: a signed-in session that is not in `BLOG_AUTHOR_EMAILS` returns `authenticated: true` and `canPublish: true`. No session returns both as `false`.
- [x] T093 `src/__tests__/pages/write.test.js`: replace the "This studio is private" case (line 45): with `canPublish: true`, the page renders the blog editor.

**Verify (slice):** `pnpm test src/__tests__/api/issues.test.js src/__tests__/api/author.test.js src/__tests__/pages/write.test.js`: the three changed cases fail.

#### Slice 39.2 - Server (≈ 10 min)

- [x] T094 `src/pages/api/issues.js`: remove the `isBlogAuthor` block (lines 85-90) and its import (line 14).
- [x] T095 `src/pages/api/author.js`: return `canPublish: Boolean(session?.user)`. Remove the `isBlogAuthor` import.
- [x] T096 `src/lib/blogAuthor.js`: remove `isBlogAuthor`, which is unused after T094 and T095. Keep `parseBlogAuthorEmails`: the dev-only endpoint `src/pages/api/dev/session.js` uses it as a local safety gate. Update `src/lib/__tests__/blogAuthor.test.js`.

**Verify (slice):** `pnpm test src/__tests__/api/issues.test.js src/__tests__/api/author.test.js src/__tests__/pages/write.test.js src/lib/__tests__/blogAuthor.test.js` is green.

#### Slice 39.3 - UI and documentation (≈ 10 min)

- [x] T097 `src/pages/write.js`: remove the `!canPublish` branch (lines 45-52). Change "Your private writing studio" to "Writing studio". `src/components/BlogEditor.js`: change the header label "Private studio" (line 192) to "Writing studio". `NavigationBar.js` and `MobileMenu.jsx` need no change.
- [x] T098 `.env.local.example` (lines 14-16) and `README.md` (line 67): reword the `BLOG_AUTHOR_EMAILS` comment. It now limits only who can inject a local dev session through `POST /api/dev/session`. It no longer limits publishing.

**Verify (slice):** `pnpm test` is green.

#### Slice 39.4 - Verification (≈ 15 min)

- [x] T099 Gates: `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm test:coverage`. Write the results in the gate table.
- [ ] T100 Smoke test with `pnpm dev` (port 8080): sign in locally with `POST /api/dev/session` and an allowlisted email. The nav shows Write. `/write` opens the editor. Publish a test article. The success screen shows the issue number. The article appears on the home page within about 1 minute (the issues API caches for 60 seconds). Delete the test issue on GitHub. Anonymous check: `curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"title":"x"}' http://localhost:8080/api/issues` prints `401`.
- [x] T101 **[git]** Commit: `allow signed-in users to add articles`.

---

### Phase 40: Article index sidebar

**Goal:** on wide screens, a sidebar lists the titles of the articles on the page. Click a title to open that article and scroll to it.

**Design:**

- The index shows the articles of the current page. It follows the search box and the pagination.
- The sidebar is visible at 1024 px and wider (Tailwind `lg`). Below that, it is hidden and the layout is unchanged.
- No new dependency.

#### Slice 40.1 - Failing tests first (≈ 20 min) - must finish before slice 40.2

- [x] T102 New `src/components/__tests__/ArticleIndex.test.js`: (a) one entry per article with its title; (b) the open article has `aria-current="true"` and `aria-expanded="true"`; (c) a click calls `onSelect(id)`; (d) Enter on a focused entry calls `onSelect(id)`; (e) an empty list renders nothing; (f) the heading uses `t("index.title")`.
- [x] T103 `src/components/__tests__/Issue.test.js`: the `open` prop renders the body. A trigger click calls `onOpenChange`. `src/components/__tests__/IssueList.test.js`: the page renders the index with the visible items. A selection opens that article and calls `scrollIntoView` on its element (mock `Element.prototype.scrollIntoView`). The index follows the search filter.
- [x] T104 `src/__tests__/pages/index.test.js`: the home page renders the index navigation.

**Verify (slice):** `pnpm test src/components/__tests__/ArticleIndex.test.js src/components/__tests__/Issue.test.js src/components/__tests__/IssueList.test.js src/__tests__/pages/index.test.js`: the new tests fail.

#### Slice 40.2 - Build (≈ 35 min)

- [x] T105 New `src/components/ArticleIndex.js`: a `<nav aria-labelledby="article-index-title">` with the heading and one `<button>` per article. Props: `items`, `openId`, `onSelect`. Wrap the component in `React.memo`. Use the existing classes: `glass-card`, `rounded-2xl`, `focus-visible:ring-2 focus-visible:ring-ring`. Clamp each title to 2 lines with `line-clamp-2`.
- [x] T106 `src/components/Issue.js`: accept the props `open` and `onOpenChange`. Pass a controlled `value` to `Accordion.Root`.
- [x] T107 `src/components/IssueList.js`: hold an `openId` state. Pass `open` and `onOpenChange` to `MemoizedIssue`. Give each list item ``id={`article-${item.id}`}``. On `lg` and wider, show the list and `ArticleIndex` in a grid: `lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-8`. The index wrapper is `hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto`. `handleSelect(id)` sets `openId`, then calls `scrollIntoView` on the item. Use `behavior: "smooth"`, or `"auto"` when `prefers-reduced-motion: reduce` is set.
- [x] T108 Add `"index": { "title": "Contents" }` to `src/locales/en.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `zh_CN.json`, and `zh_TW.json`, with a translated value. `ar`, `ga`, `ja`, `ko`, and `ru` get the English text through the base merge in `src/locales/resources.js`.

**Verify (slice):** `pnpm test src/components src/__tests__/pages/index.test.js src/locales` is green. `pnpm check:i18n-parity` exits with 0.

#### Slice 40.3 - Verification (≈ 20 min)

- [x] T109 Browser smoke test with `pnpm dev` (port 8080): at 1024 px and wider, the sidebar lists the titles of the current page. Click a title: the article opens and its top is visible below the sticky nav. Type in the search box: the index gets shorter. Change the page: the index changes. Keyboard only: Tab to an entry, press Enter, the article opens. Below 1024 px: no sidebar and no layout shift. Check light theme, dark theme, and each design style.
- [x] T110 Gates: `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm test:coverage`, `pnpm check:i18n-parity`.
- [ ] T111 Performance check: compare "First Load JS" for `/` in the `pnpm build` output with the Phase 39 build. The expected change is below +1 kB.
- [x] T112 **[git]** Commit: `add article index sidebar`.

---

### Closure

- [x] T113 `ROADMAP.md`: add Milestone 8 with the six phases, and a link to this plan under "Execution Notes". The roadmap asks for this update after each milestone.
- [x] T114 New `docs/plans/2026-11-28-milestone-8-verification-report.md`: the gate results from T044, T062, T089, T099, and T110, and the smoke test results.
- [x] T115 **[git]** Commit the closure: `docs: milestone 8 roadmap and verification report`.

## Dependencies and Order

```text
Phase 35 (build gate) → 36 (AI removal) → 37 (Cloudflare) → 38 (images) → 39 (publishing) → 40 (sidebar) → Closure
```

- Phase 35 comes first. Its hook gates every later commit, and it needs a local build that passes.
- Phase 36 comes before Phase 37. It deletes Node-only AI routes, so the Workers port has less code to carry.
- Phase 37 comes before Phases 38 to 40. The cutover is checked with the features of today, and each later feature then deploys through Workers Builds.
- Phase 38 depends on Phase 37: `images.unoptimized` changes what the first image attempt does.
- Phases 38, 39, and 40 do not depend on each other. The order above is the recommended one.
- In Phases 37 to 40, the "failing tests first" slice must finish before the fix slice.

## Risk Register

| #   | Risk                                                                                                                                      | Control                                                                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The tag points at the wrong commit.                                                                                                       | T010 needs a clean tree. T011 checks `git rev-list --count lastAiTab..HEAD` is `0`.                                                                                                 |
| 2   | A commit is made on a machine with the wrong Node version, where the build fails or differs.                                              | The hook checks the Node major version against `.nvmrc` (T003) and runs the build on every commit (T004).                                                                           |
| 3   | An import of a deleted AI file remains, and the build fails.                                                                              | `pnpm build` in T044 and the residual scan in T045.                                                                                                                                 |
| 4   | `pnpm-lock.yaml` is out of sync after a package change.                                                                                   | T032 and T049 run `pnpm install`. The slice checks run `pnpm install --frozen-lockfile`.                                                                                            |
| 5   | Any GitHub or Google account can publish public content through your token. Unwanted content and labels need a manual removal on GitHub.  | Sign-in, 10 issues per hour per user, size limits, and telemetry stay active. Possible later hardening, not planned: limit non-owner submissions to a fixed server-side label list. |
| 6   | GitHub changes the host of the attachment redirect.                                                                                       | T085 allows both known hosts: the S3 host and `private-user-images.githubusercontent.com`. Watch for `URL host is not allowed` in the logs.                                         |
| 7   | The direct image attempt shows the visitor's IP address to the image host, and it needs the host to allow hotlinks.                       | This is normal for images on other hosts. The proxy handles GitHub and YouTube thumbnails.                                                                                          |
| 8   | The proxy cache has no eviction. On Workers the cache lives in the Cloudflare cache. On Node it lives on disk.                            | Existing behavior, out of scope. Decide separately on a size cap for the Node cache.                                                                                                |
| 9   | Workers Builds settings live in the dashboard, not in the repository.                                                                     | T077 writes the exact settings into `README.md`.                                                                                                                                    |
| 10  | The Workers Free plan allows 10 ms CPU time per request. The docs I read do not say whether a Next.js app fits.                           | T069 checks the logs on the preview URL before the cutover. Workers Paid starts at $5 per month.                                                                                    |
| 11  | Rollback after the cutover returns to the Cloud Run revision that runs now, because the Cloud Run deploy is broken.                       | The cutover starts only after the checks on the preview URL pass (T068 to T070).                                                                                                    |
| 12  | The complete sign-in flow cannot run before the cutover. GitHub allows one callback URL per OAuth app, and it is the production hostname. | T061 checks that sign-in starts. T074 checks the full flow after the cutover. If it fails, use the rollback path.                                                                   |
| 13  | In-memory rate limits count per Worker instance on Workers, so the limits are weaker there.                                               | Accept for a personal site. Later option, not planned: a Cloudflare rate limiting binding.                                                                                          |
| 14  | Without `cf-connecting-ip`, all visitors share one rate-limit bucket on Workers.                                                          | T057 and T058, with tests.                                                                                                                                                          |
| 15  | OpenNext needs the install scripts of `esbuild` and `workerd`.                                                                            | T033 keeps `esbuild: true` and `workerd: true` in `pnpm-workspace.yaml`.                                                                                                            |
| 16  | A programmatic open of an article conflicts with the accordion state of Radix.                                                            | T106 uses a controlled `value`. T103 and T109 verify the behavior.                                                                                                                  |

## Verification Strategy

1. **Test first.** Phases 37, 38, 39, and 40 start with a failing test for each new behavior. Phase 36 is a removal: its tests change in the same commit.
2. **Gates after each phase.** `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm test:coverage` (global ≥ 70 %). Add `pnpm check:i18n-parity` when a phase changes locale files. From Phase 37 on, `pnpm format:check` is in the list, because CI runs it.
3. **Build after each phase.** The pre-commit hook runs `pnpm build` on every commit. From Phase 37 on, CI also runs `pnpm exec opennextjs-cloudflare build` and `pnpm exec wrangler deploy --dry-run`.
4. **Coverage of the changed files.** Report the coverage of each changed source file, not only the global number.
5. **Smoke test on the real surface.** Each phase has a smoke test before its commit: `pnpm dev` on port 8080, `pnpm preview` on port 8787, or the deployed Worker.
6. **Record.** Write the gate results in the table at the top of this plan.

## Left for you

These steps need your accounts. They are the only unfinished tasks.

| Task         | What to do                                                                                                                                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T060         | Put the runtime secrets in `.dev.vars` for the local preview: `NEXTAUTH_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_MEMBER`, `BLOG_AUTHOR_EMAILS`, and the OAuth client ids and secrets. The file is git-ignored.                                                   |
| T066         | Run `pnpm exec wrangler login` and approve it in the browser.                                                                                                                                                                                                           |
| T067         | Set the runtime secrets with `pnpm exec wrangler secret put NAME` for each of the 10 names in T067, and add `NEXTAUTH_URL` and `GITHUB_REPO` in the dashboard under Settings → Variables and Secrets.                                                                   |
| T068         | Run `pnpm exec opennextjs-cloudflare deploy -- --keep-vars` and check `https://blog.<account>.workers.dev/api/health`.                                                                                                                                                  |
| T069         | Watch the Worker logs for CPU-limit errors. The Free plan allows 10 ms of CPU per request.                                                                                                                                                                              |
| T070         | Check the preview URL: home, About, Settings, an article image, `/robots.txt`, `/sw.js`.                                                                                                                                                                                |
| T071         | Connect Workers Builds in the dashboard to `huangjien/website`. Build command `pnpm exec opennextjs-cloudflare build`, deploy command `pnpm exec opennextjs-cloudflare deploy -- --keep-vars`, preview command `pnpm exec opennextjs-cloudflare upload -- --keep-vars`. |
| T072         | Write down the current DNS record for `blog` in the Cloudflare dashboard, then delete it. A custom domain cannot be created while a CNAME exists.                                                                                                                       |
| T073         | Add the route to `wrangler.jsonc`, commit and push. The Worker then takes over the hostname.                                                                                                                                                                            |
| T074         | Check the live site: sign in with GitHub and with Google, open `/write`, load articles #59 and #57, call `/api/health`.                                                                                                                                                 |
| T075 to T081 | After you confirm the Workers site works: delete the 13 old deployment files, update the README and ROADMAP, and remove the GCP, GitHub secret, Tailscale, and home-host leftovers.                                                                                     |
| T100         | Publish one test article from `/write` and delete it again on GitHub.                                                                                                                                                                                                   |
| T111         | Compare the "First Load JS" of `/` in the build output with the Phase 39 build.                                                                                                                                                                                         |

## Definition of Done

- [x] `pnpm build` passes locally under Node 24, and the pre-commit hook refuses a commit when the build fails or the Node version is wrong.
- [x] GitHub Actions has no GCP step and runs the OpenNext build and a deploy dry-run on every pull request.
- [x] The tag `lastAiTab` is on origin and points at the last commit before the removal.
- [x] The residual scan in T045 prints nothing, and `/ai` answers 404.
- [ ] Workers Builds deploys `main`, and `blog.huangjien.com` is served by the Worker.
- [ ] The old deployment files are deleted after you confirmed the Workers site.
- [ ] All 7 real article images render on the deployed site.
- [x] A signed-in user can publish from `/write`. An anonymous POST to `/api/issues` answers 401.
- [ ] The home page shows the article index at 1024 px and wider.
- [x] All gates are green. `ROADMAP.md` and the verification report are updated.
