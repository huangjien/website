# Phase 14 Discussion: Performance Verification v2

## Context

Phase 10 established performance verification baseline with budgets for 4 routes. ROADMAP Workstream 3 targets expanding coverage.

## Audit Findings

Current performance coverage (4 routes):

- `/` (home) ✅
- `/ai` ✅
- `/settings` ✅
- `/api/health` ✅

Missing coverage:

- `/about` - content page
- `/auth/error` - auth error page
- `/error` - error page
- `/layout` - layout page

## Approaches Considered

### Approach A: Expanded Route Coverage

Add performance budgets for remaining UI pages.

**Consensus: Chosen**

### Approach B: Core Web Vitals Integration

Add Lighthouse CI for LCP, FID, CLS metrics.

### Approach C: API Route Latency Coverage

Extend perf checks to all API routes.

### Approach D: Hybrid (Route + API Expansion)

Combine A + C.

## Chosen Approach

**Approach A: Expanded Route Coverage**

Focus on adding `/about`, `/auth/error`, and `/error` pages to performance budgets.

## Proposed Scope

1. Add `/about` page performance budget
2. Add `/auth/error` page performance budget
3. Add `/error` page performance budget
4. Run verification and update artifacts

## Proposed Slices

1. Route expansion slice
2. Verification slice
