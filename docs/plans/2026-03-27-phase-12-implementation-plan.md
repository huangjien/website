# Phase 12 Implementation Plan: Observability Expansion

## Summary

Expand observability coverage to all API routes, introduce metrics baseline helpers, and enrich structured log events with actionable context beyond request-id.

## Scope

### In Scope

- Add `withErrorHandling` to remaining 6 API routes (transcribe, image-proxy, about, ai-models, joke, health)
- Create `src/lib/metrics.js` with request/duration/error counters
- Enrich `logApiEvent` with userAgent, clientIp, contentLength, duration
- Extend success-path logging, not just errors
- Unit tests for metrics helper and enriched logging
- Verification and GSD documentation sync

### Out of Scope

- External telemetry backend integration
- Metrics persistence/aggregation infrastructure
- Full distributed tracing implementation

## Work Breakdown

### Slice 1: Remaining Route Adoption

Objectives:

- Achieve full `X-Request-Id` coverage across all API routes
- Ensure consistent structured error logging via shared helper

Deliverables:

- `transcribe.js`: wrapped with `withErrorHandling`
- `image-proxy.js`: wrapped with `withErrorHandling`
- `about.js`: wrapped with `withErrorHandling`
- `ai-models.js`: wrapped with `withErrorHandling`
- `joke.js`: wrapped with `withErrorHandling`
- `health.js`: wrapped with `withErrorHandling`

Exit Criteria:

- All 18+ API routes emit `X-Request-Id` headers
- All wrapped routes emit structured error logs via shared helper

### Slice 2: Metrics Baseline Helper

Objectives:

- Provide lightweight metrics collection without external dependencies
- Enable route-level visibility into request volume, latency, and errors

Deliverables:

- `src/lib/metrics.js` with:
  - In-memory metrics store (route, method, status, duration)
  - `recordRequest(route, method, status, durationMs)` function
  - `recordError(route, errorType)` function
  - `getMetrics()` function for exposing metrics snapshot
- `withMetrics` wrapper that wraps routes and auto-records metrics
- Unit tests for metrics collection behavior

Exit Criteria:

- Metrics helper is functional and testable
- Wrapper auto-records request count, duration, and errors
- Metrics are retrievable via `getMetrics()`

### Slice 3: Event Enrichment

Objectives:

- Capture actionable context beyond request-id
- Enable richer log analysis and debugging

Deliverables:

- Extend `logApiEvent` in `apiClient.js` to capture:
  - `userAgent`: from `req.headers["user-agent"]`
  - `clientIp`: already available via `getClientIp(req)`
  - `contentLength`: from `req.headers["content-length"]`
  - `duration`: time from request start to log emission
- Update `withErrorHandling` to emit success events (not just errors)
- Add duration tracking to request processing

Exit Criteria:

- `logApiEvent` includes enriched context fields
- Success-path requests emit structured events
- Duration tracking is accurate and consistent

### Slice 4: Verification and Documentation

Objectives:

- Ensure new code passes quality gates
- Document observability patterns for future reference

Deliverables:

- Unit tests for metrics helper
- Tests for enriched logging behavior
- Full quality gate run: lint, type-check, unit tests, E2E, build, perf
- Update `PROJECT.md` with observability expansion details
- Phase 12 verification report

Exit Criteria:

- All tests pass
- Documentation reflects Phase 12 changes
- STATE.md and ROADMAP.md are synced

## Testing Strategy

Mandatory checks after each slice:

- `pnpm lint`
- `pnpm type-check`
- `pnpm test`

Additional verification:

- Manual log output inspection for enriched fields
- Metrics snapshot inspection via `getMetrics()`
- Targeted route calls to verify `X-Request-Id` propagation

## Risk Controls

- Keep metrics in-memory only (no external dependencies)
- Preserve existing error handling behavior while enriching logs
- Test metrics helpers in isolation before integration
- Validate enriched logs without changing existing route semantics

## Execution Order

1. Slice 1: Wrap remaining routes with `withErrorHandling`
2. Slice 2: Create and test `metrics.js` helper
3. Slice 3: Enrich `logApiEvent` and extend success-path logging
4. Slice 4: Full verification and documentation sync

## Definition of Done

- All 18+ API routes emit `X-Request-Id` headers
- All routes use shared structured logging for errors
- Metrics helper provides route-level request/duration/error signals
- Event enrichment captures actionable context (userAgent, clientIp, duration)
- Quality gates pass
- Phase 12 verification report published
