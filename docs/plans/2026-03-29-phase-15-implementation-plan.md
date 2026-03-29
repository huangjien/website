# Phase 15 Implementation Plan: Auth Normalization Phase 2

## Summary

Extend authentication requirements to GitHub token-backed routes (`/api/member`, `/api/labels`, `/api/comments`, `/api/markdown`) by adding session checks, consistent with `/api/settings` and `/api/issues` patterns.

## Scope

### In Scope

- Add `getServerSession` auth check to `/api/member`
- Add `getServerSession` auth check to `/api/labels`
- Add `getServerSession` auth check to `/api/comments`
- Add `getServerSession` auth check to `/api/markdown`
- Update API contract tests for auth behavior
- Verification and GSD documentation sync

### Out of Scope

- Changes to public routes (`/api/health`, `/api/robots`, `/api/joke`, etc.)
- Rate-limit consistency changes
- Role-based access model

## Work Breakdown

### Slice 1: Auth Enforcement

Targets:

- `src/pages/api/member.js`
- `src/pages/api/labels.js`
- `src/pages/api/comments.js`
- `src/pages/api/markdown.js`

Objectives:

- Import `getServerSession` from `next-auth/next`
- Import `authOptions` from `./auth/[...nextauth]`
- Add session check before processing
- Return `401 Unauthorized` when session is missing

Exit Criteria:

- Routes follow same pattern as `/api/settings`
- Unauthenticated requests return 401

### Slice 2: Test Updates

Targets:

- `src/__tests__/api/member.test.js`
- `src/__tests__/api/labels.test.js`
- `src/__tests__/api/comments.test.js`
- `src/__tests__/api/markdown.test.js`

Objectives:

- Add test for unauthenticated request (401 response)
- Update existing tests if needed

Exit Criteria:

- Tests pass with auth enforcement

### Slice 3: Verification and Reporting

Objectives:

- Run lint, type-check, and test suite
- Publish Phase 15 verification report
- Update ROADMAP, STATE, and PROJECT

Exit Criteria:

- All quality gates pass
- Phase 15 artifacts are published

## Definition of Done

- GitHub token-backed routes require user authentication
- Auth behavior is tested
- Quality gates pass
- Phase 15 execution artifacts are published
