# Phase 14 Implementation Plan: Performance Verification v2

## Summary

Expand performance verification coverage by adding budgets for remaining UI pages (`/about`, `/auth/error`, `/error`), following the established Phase 10 patterns.

## Scope

### In Scope

- Update `scripts/perf-budgets.json` with new page targets
- Run `pnpm perf:ci` to verify new budgets
- Verification and GSD documentation sync

### Out of Scope

- Core Web Vitals integration (Lighthouse CI)
- API route latency coverage
- Tooling changes beyond budget configuration

## Work Breakdown

### Slice 1: Route Expansion

Objectives:

- Add `/about` page performance budget (similar to `/` and `/ai`)
- Add `/auth/error` page performance budget
- Add `/error` page performance budget
- Use conservative p95 thresholds based on page complexity

Deliverables:

- Updated `scripts/perf-budgets.json`

Exit Criteria:

- Budgets follow existing JSON structure
- Thresholds are reasonable for page complexity

### Slice 2: Verification and Reporting

Objectives:

- Run `pnpm perf:ci` with updated budgets
- Verify all performance gates pass
- Publish Phase 14 verification report
- Update ROADMAP, STATE, and PROJECT

Exit Criteria:

- All performance checks pass
- Documentation is synchronized

## Budget Targets

| Page        | Suggested p95 Threshold   |
| ----------- | ------------------------- |
| /about      | 900ms (similar to home)   |
| /auth/error | 600ms (simple error page) |
| /error      | 600ms (simple error page) |

## Definition of Done

- Performance budgets cover additional 3 pages (total 7)
- Quality gates pass including `pnpm perf:ci`
- Phase 14 execution artifacts are published
