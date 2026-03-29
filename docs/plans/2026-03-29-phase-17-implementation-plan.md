# Phase 17 Implementation Plan: Lighthouse CI Integration

## Summary

Add Lighthouse CI to measure Core Web Vitals (LCP, CLS, TBT, FCP) for client-side performance. Test both desktop and mobile form factors on all key pages including auth-required pages.

## Scope

### In Scope

- Install `@lhci/cli` as dev dependency
- Create `lighthouserc.json` with relaxed Core Web Vitals budgets
- Configure pages to test: home (`/`), about (`/about`), settings (`/settings`)
- Add desktop and mobile testing
- Add Lighthouse CI step to GitHub Actions
- Run baseline and document results
- Verification and documentation

### Out of Scope

- Performance optimizations (future phases)
- Playwright integration (separate tooling)
- Auth cookie injection for Lighthouse (use pre-authenticated state)

## Work Breakdown

### Slice 1: Lighthouse CI Setup

Objectives:

- Add `@lhci/cli` to devDependencies
- Create `lighthouserc.json` with configuration
- Configure pages: `/`, `/about`, `/settings`
- Enable desktop and mobile testing

Exit Criteria:

- Lighthouse CI is installed
- Configuration targets all key pages

### Slice 2: Budget Configuration

Objectives:

- Set relaxed budgets:
  - Performance score > 80
  - LCP < 4.0s
  - TBT < 500ms
  - CLS < 0.25
  - FCP < 3.0s

Exit Criteria:

- Budgets accommodate real-world conditions
- Can be tightened in future phases

### Slice 3: GitHub Actions Integration

Objectives:

- Add Lighthouse CI step to CID.yaml
- Run after build step
- Store results as artifacts
- Allow budget failures to fail CI

Exit Criteria:

- Lighthouse CI runs in CI pipeline
- Results are captured

### Slice 4: Verification and Reporting

Objectives:

- Run Lighthouse CI locally
- Document baseline scores
- Create verification report

Exit Criteria:

- Baseline scores documented
- Phase 17 verification report created

## Pages Configuration

| Page     | URL         | Desktop | Mobile |
| -------- | ----------- | ------- | ------ |
| Home     | `/`         | ✅      | ✅     |
| About    | `/about`    | ✅      | ✅     |
| Settings | `/settings` | ✅      | ✅     |

## Relaxed Budget Targets

| Metric            | Desktop Target | Mobile Target |
| ----------------- | -------------- | ------------- |
| Performance Score | > 80           | > 75          |
| LCP               | < 4.0s         | < 4.5s        |
| TBT               | < 500ms        | < 600ms       |
| CLS               | < 0.25         | < 0.3         |
| FCP               | < 3.0s         | < 3.5s        |

## Definition of Done

- Lighthouse CI installed and configured
- All key pages tested (desktop + mobile)
- Baseline scores documented
- Phase 17 artifacts published
