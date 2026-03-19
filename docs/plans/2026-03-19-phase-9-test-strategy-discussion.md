# Phase 9 Discussion: Test Strategy Expansion for Remaining Risk Areas

## Context

Milestone 2 Workstream 4 targets expansion of test strategy for remaining risk areas.

Audit findings:

- Several token-backed API routes lacked direct contract tests (`about`, `comments`, `labels`, `member`).
- E2E coverage lacked authentication error-path journeys (`/auth/error` variants).
- CI now supports targeted E2E and stronger validation gates from Phase 8.

## Desired Outcome

Increase regression resistance for remaining high-risk API and auth/error user journeys with deterministic automated coverage.

## Approaches Considered

### Approach A: Broad coverage sweep across all remaining routes

Pros:

- Rapid visible coverage expansion

Cons:

- Higher implementation complexity and stabilization cost

### Approach B: Risk-first targeted expansion

Pros:

- Highest reliability impact per added test
- Fast stabilization with deterministic assertions

Cons:

- Leaves lower-risk routes for later phases

### Approach C: E2E-only expansion

Pros:

- Strong user-level confidence

Cons:

- Weaker diagnosis for API contract failures

## Recommendation

Choose **Approach B**.

## Proposed Slices

1. API contract slice
   - Add tests for `about`, `comments`, `labels`, and `member` routes.
2. Auth error E2E slice
   - Add browser-level tests for `/auth/error` query variants and fallback behavior.
3. Verification and tracking slice
   - Run lint/type-check/test/targeted E2E and update GSD docs.

## Success Criteria

- High-risk untested API contracts are covered with deterministic tests.
- Authentication error journeys are covered at E2E level.
- All quality gates pass with new coverage in place.
