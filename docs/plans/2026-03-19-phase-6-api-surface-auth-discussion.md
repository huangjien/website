# Phase 6 Discussion: API Surface Reduction and Auth Normalization

## Context

Milestone 2 Workstream 1 targets API surface reduction and auth normalization.

Audit findings:

- Legacy utility endpoints `/api/ip`, `/api/getIp`, `/api/postIp` are unauthenticated and expose internal/network/filesystem behavior.
- No active runtime callers were identified for these routes.
- Existing API hardening patterns now exist (`ensureMethod`, `withErrorHandling`) and should be used consistently.

## Desired Outcome

Reduce attack surface by retiring unused risky endpoints while preserving predictable API contracts for callers and tests.

## Approaches Considered

### Approach A: Keep endpoints and add auth/session checks

Pros:

- Backward compatible for existing consumers

Cons:

- Keeps risky functionality alive
- Requires continued maintenance for non-essential routes

### Approach B: Retire legacy endpoints with explicit deprecation responses

Pros:

- Strongest attack-surface reduction
- Simple and deterministic behavior

Cons:

- Breaks unknown external consumers if any still exist

### Approach C: Silent removal without compatibility responses

Pros:

- Minimal implementation footprint

Cons:

- Poor debuggability for clients
- Harder to communicate intent

## Recommendation

Choose **Approach B**.

## Proposed Slices

1. Endpoint retirement slice
   - Migrate `/api/ip`, `/api/getIp`, `/api/postIp` to hardened handlers returning `410 Endpoint retired`.
2. Contract testing slice
   - Add tests for retired behavior and method guards.
3. Verification and tracking slice
   - Run lint/type-check/tests and update roadmap/state/project docs.

## Success Criteria

- Legacy risky endpoints no longer expose network or file operations.
- Endpoint contracts remain explicit (`410` retirement + `405` invalid method).
- Quality gates pass and Phase 6 is documented and verifiable.
