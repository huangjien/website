# Vercel React Best-Practices Implementation Plan

## Objective

Improve Core Web Vitals, reduce client-side JavaScript, eliminate data waterfalls, and harden API responsiveness in priority order with quick wins first.

## Prioritization Principles

- Start with low-risk, high-impact changes.
- Keep behavioral changes isolated and verifiable.
- Ship in small phases with measurable outcomes.

## Phase 1 — Quick Wins (Low Risk, High Return)

### 1. Remove unused imports/state and trim rerender triggers

- Clean unused imports/state in:
  - `src/components/NavigationBar.js`
  - `src/pages/ai.js`
  - `src/pages/settings.js`

### 2. Replace runtime `package.json` import in client layout

- Replace `import packageJson from "../../package.json"` in `src/pages/layout.js`.
- Expose version through a build-time env value or static constant.

### 3. Optimize issue filtering logic

- Replace `JSON.stringify(oneItem)` filtering in `src/components/IssueList.js` with targeted field-based filtering.

### 4. Add outbound fetch timeout/error normalization

- Add `AbortController` timeout and consistent error handling for API routes that call external services, starting with:
  - `src/pages/api/issues.js`
  - `src/pages/api/comments.js`

### 5. Add cache headers for read-heavy APIs

- Add `Cache-Control` for read-mostly GitHub-backed endpoints:
  - `src/pages/api/issues.js`
  - `src/pages/api/comments.js`
  - `src/pages/api/about.js`

## Phase 2 — Critical Rendering Path Fixes

### 1. Remove global app-level NoSSR gate

- Remove app-wide `<NoSSR>` wrapping in `src/pages/_app.js`.
- Keep client-only guards only where they are truly required.

### 2. Keep hydration recovery minimal

- Minimize global inline runtime logic in `src/pages/_document.js`.
- Preserve only essential recovery behavior.

## Phase 3 — Eliminate Waterfalls

### 1. Remove comments N+1 fetch pattern

- Replace per-issue comment requests (`Issue -> Comment`) with a batched strategy:
  - New batched comments endpoint or issue payload enrichment.
- Update:
  - `src/components/Issue.js`
  - `src/components/Comment.js`

### 2. Parallelize independent async work where safe

- Review interceptor chain in `src/lib/apiClient.js`.
- Parallelize only if request/response ordering is not semantically required.

## Phase 4 — Bundle Size and Code Splitting

### 1. Add dynamic imports for heavy UI islands

- Introduce `next/dynamic` for large/rarely-used UI blocks (AI/settings/markdown-heavy sections).

### 2. Consolidate markdown rendering pipeline

- Centralize markdown renderer usage to reduce duplicated heavy imports:
  - `react-markdown`
  - `rehype-raw`
  - `remark-gfm`

### 3. Lazy-load i18n resources

- Move from eager locale loading to per-locale/per-namespace loading:
  - `src/locales/resources.js`

## Phase 5 — Runtime and Asset Strategy

### 1. Replace sync filesystem API calls

- Replace sync `fs` calls with `fs/promises` in:
  - `src/pages/api/image-proxy.js`
  - `src/pages/api/getIp.js`
  - `src/pages/api/postIp.js`

### 2. Migrate high-traffic image paths to Next image optimization

- Adopt `next/image` where feasible starting from `src/components/SmartImage.js`, preserving fallback/proxy behavior where needed.

### 3. Refine static and service worker cache headers

- Adjust header strategy in `next.config.js` to avoid over-caching service worker lifecycle assets.

## Verification Gates (After Each Phase)

### Quality

- `pnpm lint`
- `pnpm test`

### Performance

- Compare before/after Lighthouse metrics (LCP, TBT, INP proxy metrics).
- Compare build output and client JS payload impact.

### Functional Regression

- Verify auth/settings/AI flows.
- Verify issue and comment rendering behavior.
- Verify service worker registration/update behavior.

## Execution Sequence

1. Phase 1 quick wins in this order:
   1. Unused imports/state cleanup
   2. Layout version-source cleanup
   3. Issue filtering optimization
   4. API timeout/error normalization
   5. API cache headers
2. Phase 2 rendering path fixes (remove global NoSSR).
3. Phase 3 waterfall elimination (comments batching).
4. Phase 4 bundle/code-splitting work.
5. Phase 5 runtime/assets hardening.

## Delivery Notes

- Treat each phase as its own reviewable PR-sized change set.
- Measure and record key metrics after each phase before proceeding.
