# Phase 11 Discussion: Observability Baseline

## Context

Milestone 2 Workstream 6 targets observability baseline improvements.

Audit findings:

- API error handling exists but logs are mostly unstructured.
- Request correlation identifiers were not consistently generated or propagated.
- Critical API routes still emitted ad-hoc error logs, reducing incident triage speed.

## Desired Outcome

Establish a low-risk observability baseline with structured API logs and request-id correlation across error handling paths.

## Approaches Considered

### Approach A: Full telemetry platform integration now

Pros:

- Maximum long-term visibility

Cons:

- High implementation and operational complexity for current phase

### Approach B: Structured log and request-id baseline first

Pros:

- Fast, low-risk improvement
- Immediate triage and traceability gains

Cons:

- Not a full tracing/metrics stack yet

### Approach C: Route-by-route manual logging changes only

Pros:

- Minimal shared-library changes

Cons:

- Inconsistent patterns and harder long-term maintenance

## Recommendation

Choose **Approach B**.

## Proposed Slices

1. Shared baseline slice
   - Add request-id extraction/generation and structured log helper in API utilities.
2. Wrapper integration slice
   - Enforce request-id response header and structured error logs in shared API error wrapper.
3. Critical route adoption slice
   - Migrate high-traffic AI routes to shared structured logging helper.
4. Verification and tracking slice
   - Add/adjust tests and run quality gates with docs sync.

## Success Criteria

- API responses include `X-Request-Id` for wrapped routes.
- Error logs emitted by shared wrapper are structured and request-correlated.
- Critical AI routes use shared structured logging helper.
