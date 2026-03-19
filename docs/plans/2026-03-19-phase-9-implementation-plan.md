# Phase 9 Implementation Plan: Test Strategy Expansion

## Summary

Execute risk-first test expansion for remaining high-value API contracts and auth error E2E journeys.

## Scope

### In Scope

- API route tests for:
  - `src/pages/api/about.js`
  - `src/pages/api/comments.js`
  - `src/pages/api/labels.js`
  - `src/pages/api/member.js`
- E2E tests for auth error page variants
- Verification and GSD documentation sync

### Out of Scope

- Full API coverage across every low-risk route
- Broad E2E expansion beyond targeted auth/error journeys

## Work Breakdown

### Slice 1: API Contract Tests

- Add deterministic tests for success and key failure paths.
- Validate method, validation, upstream, and timeout behavior where applicable.

### Slice 2: E2E Auth/Error Journeys

- Add browser tests for OAuth and session-required error codes.
- Add fallback unknown-error behavior coverage.

### Slice 3: Verification and Reporting

- Run lint, type-check, unit/integration tests, and targeted E2E.
- Publish Phase 9 verification report.
- Update ROADMAP, STATE, and PROJECT.

## Definition of Done

- Target API routes have contract tests.
- Auth error page has E2E journey coverage.
- Quality gates pass and Phase 9 artifacts are published.
