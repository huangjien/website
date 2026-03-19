# Phase 5 Discussion: Security and Configuration Hygiene

## Context

Phase 5 in `ROADMAP.md` focuses on:

- Reviewing environment-variable usage and secret boundaries
- Auditing auth-guarded endpoints for consistent access control

Audit highlights identified:

- Unauthenticated write path on `/api/issues` `POST`
- Unauthenticated secret-backed `/api/settings` access and global prefetch
- Inconsistent session-guard handling across AI endpoints
- Insecure NextAuth secret fallback in production

## Desired Outcome

Enforce clear secret boundaries and consistent auth protections for token-backed and mutation-capable routes, while keeping existing user flows stable.

## Approaches Considered

### Approach A: Tighten all token-backed endpoints immediately

Pros:

- Maximum protection quickly

Cons:

- Higher short-term compatibility risk

### Approach B: Risk-first hardening with compatibility controls

Pros:

- Targets highest-risk routes first
- Lower rollout risk and easier verification

Cons:

- Some lower-risk endpoints remain for later refinement

### Approach C: Documentation-only guardrails

Pros:

- Minimal implementation effort

Cons:

- Does not reduce current exploit surface

## Recommendation

Choose **Approach B**.

## Proposed Slices

1. Secret-boundary slice
   - Enforce auth on `/api/settings`
   - Stop unauthenticated global settings prefetch
2. Mutation-protection slice
   - Require session for `/api/issues` `POST`
3. Auth-consistency slice
   - Standardize `getServerSession(req, res, authOptions)` usage in AI routes
   - Enforce production `NEXTAUTH_SECRET` fail-fast
4. Verification slice
   - Add/extend tests for new auth requirements
   - Run full lint/type-check/tests and targeted E2E

## Success Criteria

- Secret-backed settings data is not available unauthenticated
- Issue mutation path requires authenticated session
- Production auth secret fallback is removed by fail-fast guard
- Quality gates pass with updated test coverage
