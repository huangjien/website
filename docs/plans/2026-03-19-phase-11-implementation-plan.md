# Phase 11 Implementation Plan: Observability Baseline

## Summary

Implement shared request-id correlation and structured API error logging, then adopt the baseline in critical AI routes.

## Scope

### In Scope

- Shared request-id helper in `src/lib/apiClient.js`
- Structured logging helper in `src/lib/apiClient.js`
- `withErrorHandling` update to set `X-Request-Id` and structured error events
- Critical route logging migration in AI endpoints (`chat`, `tts`)
- Unit test updates for new request-id behavior
- Verification and GSD documentation sync

### Out of Scope

- External telemetry backend integration
- Full distributed tracing across all outbound providers

## Work Breakdown

### Slice 1: Shared Observability Helpers

- Add helper to read/generate request IDs from request headers.
- Add shared structured API log function.

### Slice 2: Wrapper Integration

- Ensure `withErrorHandling` sets `X-Request-Id`.
- Ensure wrapper emits structured error logs with request context.

### Slice 3: Route Adoption

- Replace ad-hoc error logs with structured helper in critical AI routes.

### Slice 4: Verification and Reporting

- Expand `apiClient` tests for request-id behavior.
- Run lint, type-check, unit tests, targeted E2E, build, and perf gate.
- Publish Phase 11 verification and sync roadmap/state/project docs.

## Definition of Done

- Request-id correlation baseline is active for shared wrapped API routes.
- Structured error logging is emitted via shared helper.
- Critical AI routes adopt the shared logging helper.
- Verification gates pass and Phase 11 artifacts are published.
