# Phase 7 Discussion: Outbound Request Security Hardening

## Context

Milestone 2 Workstream 2 targets outbound request security hardening.

Audit findings:

- `/api/image-proxy` accepted broad targets with insufficient host restrictions.
- `/api/transcribe` lacked auth and abuse controls for high-cost upstream usage.
- Existing shared controls (`ensureMethod`, rate limiting, auth session patterns) are available.

## Desired Outcome

Reduce SSRF and cost-abuse exposure while preserving expected behavior for supported outbound flows.

## Approaches Considered

### Approach A: Full lockdown to authenticated internal-only calls

Pros:

- Strongest immediate risk reduction

Cons:

- Higher compatibility risk for existing callers

### Approach B: Risk-first hardening with explicit constraints

Pros:

- Balances safety and compatibility
- Fastest path to measurable security improvement

Cons:

- Requires ongoing iteration for broader outbound surface

### Approach C: Monitoring-only without behavior changes

Pros:

- Minimal change risk

Cons:

- Leaves exploit surface active

## Recommendation

Choose **Approach B**.

## Proposed Slices

1. Image proxy boundary controls
   - Method guard, host allowlist, private-host blocking, content-type/size checks, rate limit.
2. Transcribe abuse controls
   - Session requirement, rate limit, content-type and payload-size validation.
3. Verification and tracking
   - Add regression tests and run full quality gates, then sync GSD docs.

## Success Criteria

- Outbound proxy requests are constrained to explicit trusted targets.
- High-cost transcription proxy is auth-gated and abuse-limited.
- Security contract changes are test-covered and fully verified.
