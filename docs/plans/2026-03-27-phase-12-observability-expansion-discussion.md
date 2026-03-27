# Phase 12 Discussion: Observability Expansion

## Context

Milestone 3 Workstream 1 targets observability expansion beyond baseline.

Phase 11 established the observability baseline:

- Shared request-id generation/propagation in `src/lib/apiClient.js`
- Structured logging helper `logApiEvent`
- Error handling wrapper `withErrorHandling`
- Applied to 12 API routes (chat, ai, tts, settings, issues, etc.)

Audit findings after Phase 11:

- 8 API routes still lack structured logging and request-id headers
- No metrics collection for API health/density signals
- No distributed tracing strategy defined
- Log aggregation patterns not established

## Desired Outcome

Expand observability coverage to remaining API routes and establish foundations for metrics/tracing strategy.

## Approaches Considered

### Approach A: Route adoption only

- Add `withErrorHandling` to remaining 8 routes

Pros:

- Fast, consistent pattern
- Minimal complexity

Cons:

- No metrics or tracing expansion
- Limited observability depth

### Approach B: Route adoption + metrics baseline

- Add `withErrorHandling` to remaining routes
- Add request-count and latency metrics helper

Pros:

- Immediate health signal visibility
- Low operational overhead

Cons:

- No distributed tracing yet
- Metrics aggregation not yet defined

### Approach C: Full telemetry platform prep

- Route adoption + metrics + tracing instrumentation plan

Pros:

- Complete observability stack foundation
- Maximum future flexibility

Cons:

- High complexity for this phase
- Requires external infrastructure decisions

### Approach D: Route adoption + metrics + structured event enrichment

- Add `withErrorHandling` to remaining routes
- Add metrics helper with request/duration/error counting
- Enrich logs with additional context (user-agent, geo, timing)

Pros:

- Balanced depth improvement
- Actionable metrics without heavy infrastructure
- Good foundation for future tracing

Cons:

- Still no distributed tracing
- Metrics storage not addressed

## Recommendation

Choose **Approach D**.

Rationale: Balances immediate observability gains (full route coverage + metrics) with manageable complexity. Establishes event-enrichment patterns that enable future tracing without requiring external platform decisions now.

## Proposed Slices

### Slice 1: Remaining Route Adoption

- Add `withErrorHandling` to:
  - `transcribe.js`
  - `image-proxy.js`
  - `about.js`
  - `ai-models.js`
  - `joke.js`
  - `health.js`
- Add `logApiEvent` success/error logging to auth-adjacent flows
- Ensure `X-Request-Id` header propagation across all routes

### Slice 2: Metrics Baseline Helper

- Add `src/lib/metrics.js` with:
  - Request counter (by route, method, status)
  - Duration histogram (buckets for p50/p95/p99)
  - Error counter (by route, error type)
- Provide `withMetrics` wrapper for API routes

### Slice 3: Event Enrichment

- Extend `logApiEvent` to capture:
  - `userAgent` from request headers
  - `clientIp` (already in apiClient)
  - `contentLength` for request/response sizes
  - `duration` for request processing time
- Add `logApiEvent` call to success paths, not just errors

### Slice 4: Verification and Tracking

- Add/adjust tests for metrics and new logging behaviors
- Run full quality gates (lint, type-check, tests, E2E)
- Document observability patterns in `PROJECT.md`

## Success Criteria

- All 18+ API routes emit `X-Request-Id` headers
- All routes use shared structured logging for errors
- Metrics helper provides route-level request/duration/error signals
- Event enrichment captures actionable context beyond request-id
- Quality gates pass
