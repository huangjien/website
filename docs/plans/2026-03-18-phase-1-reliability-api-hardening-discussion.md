# Phase 1 Discussion: Reliability and API Hardening

## Context

Phase 1 in `ROADMAP.md` focuses on:

- Standardizing API error responses and validation patterns
- Tightening rate limiting and failure handling around AI endpoints

Current hotspots observed in `PROJECT.md`:

- NextAuth error-page route mismatch
- Missing `/api/robots` rewrite target
- Mixed package-manager usage in scripts and workflows
- API coverage exclusions for `src/pages/api/**`

## Desired Outcome

Establish a reliable and predictable API baseline so frontend routes receive consistent responses, AI endpoints degrade safely under load, and operational regressions are easier to detect.

## Approaches Considered

### Approach A: Targeted Patch Set

Apply focused fixes only to known hotspots:

- Fix auth error route mismatch
- Add missing `/api/robots` endpoint or remove rewrite
- Add method guards to weakest API endpoints
- Add AI endpoint rate-limit consistency checks

Pros:

- Fastest path to immediate risk reduction
- Minimal code movement

Cons:

- Standards remain scattered
- New endpoints can reintroduce inconsistency

### Approach B: Shared API Hardening Utilities

Introduce shared helpers and apply across priority endpoints:

- Common error envelope utility
- Shared request validation pattern
- Reusable method guard helper
- Reusable rate-limit + failure mapping helper for AI routes

Pros:

- Consistent behavior with low duplication
- Better long-term maintainability

Cons:

- Requires coordinated refactor in several routes
- Slightly larger initial change set

### Approach C: Contract-First API Baseline

Define request/response contracts first, then enforce them route-by-route:

- Contract schema for high-traffic endpoints
- Uniform success and error response format
- Route-level invariant checks with explicit status mapping
- Test-first coverage for contract adherence

Pros:

- Highest reliability and change safety
- Clear behavior expectations for frontend and tests

Cons:

- Highest upfront process overhead
- Slower initial delivery than A/B

## Recommendation

Choose **Approach B**, with contract discipline from C on critical routes.

Rationale:

- Delivers meaningful consistency quickly
- Avoids fragmented one-off patches
- Keeps scope practical for a first vertical slice

## Proposed Vertical Slices

1. Foundation slice
   - Add shared method guard + error envelope + validation helper
   - Add unit tests for helpers
2. AI reliability slice
   - Standardize `/api/chat`, `/api/ai-models`, `/api/tts`, `/api/transcribe` error and rate-limit behavior
   - Add failure-mode tests
3. Core content/API slice
   - Apply guards + error envelope to `issues`, `comments`, `labels`, `member`, `markdown`, `settings`
   - Add endpoint behavior tests
4. Configuration consistency slice
   - Resolve `/robots.txt` rewrite mismatch
   - Align package-manager usage in Playwright and CI workflows
5. Coverage slice
   - Introduce API-focused test coverage checks for priority endpoints

## Success Criteria

- Priority endpoints return a consistent JSON error shape
- AI endpoints return deterministic status codes for validation, auth, rate-limit, and provider failures
- No unresolved rewrite targets in Next.js config
- Playwright and CI use consistent package-manager strategy
- Added tests cover new hardening behaviors and pass in CI

## Risks and Mitigations

- Risk: Broad route edits can create regressions  
  Mitigation: Roll out in vertical slices with route-scoped tests.

- Risk: Over-hardening slows delivery  
  Mitigation: Limit first pass to high-risk endpoints, then expand.

- Risk: Inconsistent adoption of helpers  
  Mitigation: Make helper usage mandatory for touched API routes in this phase.
