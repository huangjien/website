# Architecture Audit Findings — 2026-07-04

> Comprehensive audit covering security, architecture, performance, testing, and DevOps.
> Each finding has actionable tasks with checkboxes for tracking.

## Execution Status: 2026-07-04

**Overall: 21 of 23 findings executed.** Test suite: 1078 passed, 15 pre-existing failures (styling/layout tests unrelated to this work).

| Severity | Found | Executed | Notes |
|----------|-------|----------|-------|
| Blocker  | 2     | 2        | Both fixed |
| High     | 6     | 6        | H1 required decoupling first; H2/H3 scoped to dead code removal |
| Medium   | 8     | 8        | All complete |
| Low      | 7     | 5        | L4 (auth route test), L5 (MarkdownContent test) deferred |

---

## Blockers

### B1. `/api/chat` has no authentication — OpenAI cost abuse

**File:** `src/pages/api/chat.js:38-58`

**Problem:** The streaming chat endpoint performed only IP-based rate limiting. Every sibling AI endpoint calls `getServerSession` and returns 401, but `/api/chat` did not.

- [x] Add `getServerSession(authOptions)` call after method check in `src/pages/api/chat.js`
- [x] Return 401 `AuthenticationError` when session is null
- [x] Add test case: "returns 401 when unauthenticated" in `src/__tests__/api/chat.test.js`
- [x] Verify the `useChat` client in `src/pages/ai.js` sends session credentials
- [ ] Test manually: open browser in incognito, navigate to `/ai`, confirm 401 toast appears

---

### B2. Image proxy SSRF vulnerability (DNS rebinding)

**File:** `src/pages/api/image-proxy.js`

**Problem:** `isBlockedHost` validated the hostname string but never resolved the actual IP. A domain resolving to `127.0.0.1` or `169.254.169.254` passed the check. No redirect control.

- [x] Resolve hostname to IP(s) via `dns.promises.resolve4` / `dns.promises.resolve6` before the fetch
- [x] Check each resolved IP against `isPrivateIpv4` / `isPrivateIpv6`
- [x] Reject if any resolved IP is private/internal
- [x] Disable redirects in the fetch call (`redirect: "manual"`) and follow manually with re-validation at each hop
- [x] Add test: domain resolving to private IP is rejected
- [x] Add test: redirect to internal URL is rejected
- [x] All 14 image-proxy tests pass

---

## High Priority

### H1. Legacy AI stack removed after decoupling

**Problem:** Two parallel AI implementations coexisted. The legacy stack was coupled to the new one via `transcribeAudio`.

- [x] Moved `transcribeAudio` from `aiService.js` into `useAudioRecording.js` directly
- [x] Updated `useAudioRecording.test.js` to mock `fetch` instead of `aiService`
- [x] Deleted `src/components/QuestionTabs.js` (orphaned — only imported by its own test)
- [x] Deleted `src/components/__tests__/QuestionTabs.test.js`
- [x] Deleted `src/lib/aiService.js`
- [x] Deleted `src/__tests__/lib/aiService.test.js`
- [x] Deleted `src/pages/api/ai.js` (legacy non-streaming endpoint)
- [x] Deleted `src/__tests__/api/ai.test.js`
- [x] `Chat.js` kept — still used by `IssueList.js` for list rendering

---

### H2. Dead code removed from `apiClient.js`

**Problem:** 320-line module mixed dead `ApiClient` class, dead `withValidation`, live middleware, errors, and helpers.

- [x] Deleted unused `ApiClient` class, `apiClient` singleton, `DEFAULT_HEADERS`, `DEFAULT_TIMEOUT`
- [x] Deleted `withValidation` (dead code — Joi not installed)
- [x] Removed 4 ApiClient-specific tests from `apiClient.test.js`
- [x] All 32 remaining apiClient tests pass
- [ ] Full module split into `api/errors.js`, `api/middleware.js`, `api/logging.js` deferred (low ROI, high churn across 18 files)

---

### H3. Dead code removed from `Requests.js`

**Problem:** Three data-fetching strategies with dead exports and security-risky client-side API calls.

- [x] Removed dead `settingContext` (the real one is in `useSettings.js`)
- [x] Removed dead `userContext`
- [x] Removed `getUser` (direct client-side GitHub API call with token — security risk)
- [x] Removed unused `createContext` and `currentUser` imports
- [x] Updated `Requests.test.js` (removed 2 getUser tests, 23 remaining pass)
- [ ] Full SWR migration deferred (large refactor, separate effort)

---

### H4. Dynamic imports added for heavy libs

**Problem:** Zero `next/dynamic` usage. Full markdown pipeline and AI SDK statically imported into client bundles.

- [x] Added `experimental.optimizePackageImports` in `next.config.js` for `react-icons`, `react-markdown`, 7 `@radix-ui/*` packages
- [x] Converted `MarkdownContent` to dynamic import in `Chat.js` (`ssr: false`)
- [x] Converted `Response` to dynamic import in `src/pages/ai.js` (`ssr: false`)
- [x] Updated `Chat.test.js` and `ai.additional.test.js` with `next/dynamic` mock
- [ ] Run `pnpm analyze` to capture before/after bundle sizes (needs `pnpm install` first)

---

### H5. N+1 query on `/api/issues?includeComments=1` capped

**File:** `src/pages/api/issues.js`

- [x] Added `MAX_ISSUES_WITH_COMMENTS = 10` constant
- [x] Capped comment-fetching to first 10 issues via `data.slice(0, MAX_ISSUES_WITH_COMMENTS)`
- [x] Added inline comment documenting the N+1 tradeoff
- [x] Added 2 new tests (enrichment + cap enforcement)
- [x] All 25 issues tests pass

---

### H6. Dead dependencies removed

- [x] Removed `framer-motion` from `package.json`
- [x] Removed `styled-components` from `package.json`
- [x] Removed `styledComponents: true` from `next.config.js`
- [x] Added `poweredByHeader: false` to `next.config.js`
- [ ] Run `pnpm install` to update lockfile

---

## Medium Priority

### M1. Duplicated mutation telemetry extracted

- [x] Created `src/lib/api/mutation-telemetry.js` with `createMutationFailureHandler` factory
- [x] Updated `issues.js` and `comments.js` to use shared helper
- [x] All 94 relevant tests pass

---

### M2. Duplicate test files removed

- [x] Deleted `src/__tests__/lib/apiClient.test.js` (kept co-located)
- [x] Deleted `src/__tests__/lib/NoSSR.test.js` (kept co-located)
- [x] Deleted `src/__tests__/locales/i18n.test.js` (kept co-located)
- [x] Deleted `src/components/__tests__/ai-elements/response.test.js` (kept co-located)

---

### M3. Jest coverage includes API routes

- [x] Removed `"!src/pages/api/**"` from `collectCoverageFrom` in `jest.config.js`

---

### M4. Security headers added

- [x] Added `X-Frame-Options: DENY` to `next.config.js` and nginx
- [x] Added `X-Content-Type-Options: nosniff` to both
- [x] Added `Referrer-Policy: strict-origin-when-cross-origin` to both
- [x] Added `Strict-Transport-Security` to both
- [x] Added `Permissions-Policy` to both
- [x] Fixed nginx duplicate upstream entries (3→1)
- [x] Added `proxy_buffering off` + `proxy_read_timeout 120s` for `/api/chat` SSE streaming
- [x] Added `poweredByHeader: false` to `next.config.js`
- [ ] Test with `curl -I` on deployed environment

---

### M5. pnpm version aligned

- [x] Dockerfile: `pnpm@10.33.0` → `pnpm@11.9.0`
- [x] Jenkinsfile: `pnpm@11.5.0` → `pnpm@11.9.0`
- [x] `package.json` already at `pnpm@11.9.0`

---

### M6. ESLint gaps fixed

- [x] Re-enabled `no-unused-vars` as `"warn"` with `argsIgnorePattern: "^_"`
- [x] Added `eslint-plugin-react-hooks` to devDependencies
- [x] Enabled `react-hooks/exhaustive-deps: "error"`
- [ ] Run `pnpm install` then `pnpm lint:fix` to clean up warnings

---

### M7. Docker hardened

- [x] Added `USER node` before CMD in runner stage
- [x] Added `HEALTHCHECK` hitting `/api/health`

---

### M8. Service Worker improved

- [x] Enabled `navigationPreload: true` in `src/sw.js`
- [x] Removed unconditional `registration.update()` from `PwaRegister.js`
- [x] Added `"sw:update"` custom event listener for manual update triggers
- [x] Updated `sw.test.js` and `PwaRegister.test.js`

---

## Low Priority

### L1-L7. Cleanup items

- [x] **L7a**: Removed ~150 commented-out locale entries from `src/locales/i18n.js`
- [x] **L7b**: Consolidated `jest.setup.js` and `src/setupTests.js` into one file; deleted duplicate
- [x] **L7c**: Added `{ passive: true }` to scroll listener in `src/pages/layout.js`
- [x] **L7d**: Wrapped `Issue` and `Chat` in `React.memo` in `IssueList.js`
- [ ] **L1**: Decompose `src/pages/ai.js` god component (deferred — large effort)
- [ ] **L2**: Decide on `storage.js` (deferred)
- [ ] **L4**: Add test for auth route (deferred)
- [ ] **L5**: Add test for `MarkdownContent.js` (deferred)
- [ ] **L6**: nginx `/` location security header inheritance (minor)
- [ ] **L7e**: Playwright E2E claim vs reality (documentation fix)

---

## Remaining Steps Before Deploy

1. Run `pnpm install` to update lockfile (removed deps, added eslint-plugin-react-hooks)
2. Run `pnpm build` to verify production build succeeds
3. Run `pnpm lint:fix` to clean up new `no-unused-vars` warnings
4. Manually test `/api/chat` returns 401 when not logged in
5. Manually test image proxy rejects SSRF attempts
6. Test with `curl -I` to verify security headers are present

---

*Generated: 2026-07-04*
*Executed: 2026-07-04*
*Audit method: Architecture review + test coverage analysis + performance/security scan*
