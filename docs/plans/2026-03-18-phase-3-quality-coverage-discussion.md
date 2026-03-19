# Phase 3 Discussion: Quality and Test Coverage

## Context

Phase 3 in `ROADMAP.md` focuses on:

- Adding scenario-focused tests for critical API and AI workflows
- Strengthening E2E coverage for authentication and settings flows

## Desired Outcome

Raise regression resistance on high-risk backend and AI paths while ensuring auth/settings user journeys are covered by browser-level tests.

## Approaches Considered

### Approach A: Broad Coverage Sweep

Add tests across many routes at once and raise coverage quickly.

Pros:

- Fast apparent coverage growth

Cons:

- Higher flakiness risk
- Harder debugging and slower stabilization

### Approach B: Risk-First Coverage Slices

Prioritize tests around critical API/AI contracts and auth/settings user journeys, then expand incrementally.

Pros:

- Strongest reliability payoff per test added
- Easier maintenance and failure triage

Cons:

- Initial coverage increase appears smaller than broad sweep

### Approach C: E2E-Only Focus

Emphasize browser-level tests and limit API unit/integration additions.

Pros:

- High confidence in user-visible behavior

Cons:

- Slower test runtime
- Lower precision for backend failure diagnosis

## Recommendation

Choose **Approach B**.

Rationale:

- Best balance of speed, determinism, and risk reduction
- Aligns with existing Phase 1/2 guardrail patterns

## Proposed Vertical Slices

1. API/AI contract slice
   - Chat: rate-limit, invalid prompt, stream failure mapping
   - AI models: cache and fallback behavior
   - TTS/transcribe: success and failure paths
   - Settings API: env/upstream/non-array edge cases
2. Auth/settings E2E slice
   - Unauthenticated settings access behavior
   - Authenticated settings table/search/pagination behavior
3. Verification slice
   - Lint, type-check, full tests
   - Phase 3 verification report and roadmap/state updates

## Success Criteria

- Critical API/AI contract branches have scenario-focused tests
- Auth and settings core user journeys are covered by E2E tests
- Added tests are stable and pass in the standard verification gates

## Risks and Mitigations

- Risk: Flaky E2E due to external auth/providers  
  Mitigation: use deterministic request interception for session/settings endpoints.

- Risk: Over-mocking hides real integration defects  
  Mitigation: keep contract assertions aligned with actual API response shapes and status codes.
