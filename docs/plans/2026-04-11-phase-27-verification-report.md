# Phase 27 Verification Report: API Mutation Hardening

## Verification Scope

- Verify Phase 27 execution against:
  - `docs/plans/2026-04-11-milestone-6-charter.md`

## Quality Gates

- `pnpm lint -- src/pages/api/issues.js src/pages/api/comments.js src/__tests__/api/issues.test.js src/__tests__/api/comments.test.js` passed
- `pnpm test src/__tests__/api/issues.test.js src/__tests__/api/comments.test.js` passed (37 tests across 2 suites)

## Changes Made

### 1. Issue Mutation Abuse Controls

- Added user-scoped issue POST rate limiting (`10/hour`) in `/api/issues`
- Aligned rate-limit failure envelope to canonical `RateLimitError` contract with `retryAfter`

### 2. Validation Boundary Tightening

- Added strict body-type validation for issue mutations (`Body must be a string`)
- Normalized issue payload before upstream POST:
  - Trim title/body
  - Deduplicate and trim labels
  - Reject empty labels and oversized labels
- Normalized comment POST body before upstream call (trimmed value)

### 3. Contract Regression Expansion

- Added issue API tests for:
  - Non-string body rejection
  - Issue POST rate-limit rejection with retry metadata
  - Payload normalization of title/body/labels
- Added comment API test for body normalization before upstream POST
- Updated comments tests to match the canonical rate-limit return shape (`allowed`, `resetAt`)

## Criteria Validation

1. Mutation validation boundaries hardened
   Status: ✅ Pass

2. Abuse-protection behavior validated for issue/comment mutation routes
   Status: ✅ Pass

3. Error envelope consistency maintained for rate-limited mutation paths
   Status: ✅ Pass

4. Phase quality gates
   Status: ✅ Pass

## Result

Phase 27 is complete and verified. Mutation endpoints now enforce tighter input boundaries and clearer abuse protections while preserving deterministic API error contracts.
