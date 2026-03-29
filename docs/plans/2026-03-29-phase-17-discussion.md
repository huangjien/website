# Phase 17 Discussion: Lighthouse CI Integration

## Context

Phase 17 kicks off Milestone 4 (Performance & Core Web Vitals) by adding Lighthouse CI to measure client-side performance metrics.

## Current State

### Existing Performance Infrastructure

- `pnpm perf:ci` - Server-side latency checks (p95 response times)
- `scripts/perf-budgets.json` - Server-side thresholds for 7 routes
- Measures: Response time, error rate

### What's Missing

- **Client-side metrics** (Core Web Vitals)
- LCP (Largest Contentful Paint)
- FID/INP (First Input Delay / Interaction to Next Paint)
- CLS (Cumulative Layout Shift)
- Lighthouse integration with CI

## Lighthouse CI Options

### Option A: @lhci/cli (Lighthouse CI Official)

**Pros:**

- Official Lighthouse CI tool
- Well-documented
- GitHub Action available
- Proven in production

**Cons:**

- Requires running Lighthouse against live server
- May need separate server setup in CI

---

### Option B: @lighthouse-ci/cli with custom budget config

**Pros:**

- More control over budget definitions
- Can reuse existing performance scripts

**Cons:**

- More configuration work
- Less integrated with GitHub

---

### Option C: Playwright + Lighthouse (via @lhci/cli)

**Pros:**

- Leverages existing infrastructure (Playwright was previously used)
- Browser-based measurement is more accurate

**Cons:**

- E2E tests were removed
- Extra tooling complexity

---

## Recommended Approach

**Option A** (@lhci/cli) is recommended because:

1. **Official tooling** - Best maintained and documented
2. **CI-friendly** - Designed for GitHub Actions integration
3. **Budget management** - Built-in budget checking
4. **Proven** - Used by major projects

## Proposed Scope for Phase 17

1. Install `@lhci/cli` and configure
2. Create `lighthouserc.json` with Core Web Vitals budgets
3. Add Lighthouse CI step to GitHub Actions
4. Run baseline against key pages
5. Establish initial budgets (may need tuning)

## Pages to Measure

Based on existing performance coverage:

| Page     | URL         | Priority |
| -------- | ----------- | -------- |
| Home     | `/`         | High     |
| AI Chat  | `/ai`       | High     |
| Settings | `/settings` | Medium   |
| About    | `/about`    | Medium   |

Note: Auth-required pages may need special handling.

## Budget Targets (Initial)

| Metric      | Target  | Notes                  |
| ----------- | ------- | ---------------------- |
| Performance | > 90    | Lighthouse score       |
| LCP         | < 2.5s  | Good threshold         |
| TBT         | < 200ms | Total Blocking Time    |
| CLS         | < 0.1   | Good threshold         |
| FCP         | < 1.8s  | First Contentful Paint |

## Questions for Discussion

1. Should we include auth-required pages in Lighthouse CI?
2. What budget targets feel appropriate (strict vs relaxed)?
3. Should we test mobile and desktop separately?

---

**Recommendation:** Proceed with Option A using `@lhci/cli`, testing public pages (home, about) initially, with budgets set to "Good" thresholds.
