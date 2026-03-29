# Phase 13 Implementation Plan: API Contract Coverage Completion

## Summary

Complete API contract test coverage by adding deterministic tests for the two remaining untested routes: `health.js` and `joke.js`. This finalizes the ROADMAP workstream "API contract coverage completion."

## Scope

### In Scope

- `src/pages/api/health.js` - Health check endpoint contract tests
- `src/pages/api/joke.js` - External API integration contract tests
- Verification and GSD documentation sync

### Out of Scope

- E2E tests (removed in prior cleanup)
- Performance testing
- External telemetry integration

## Work Breakdown

### Slice 1: Health Endpoint Tests

Target: `src/pages/api/health.js`

Objectives:

- Test successful GET request returns 200 with status and timestamp
- Test invalid method returns 405 with Allow header

Exit Criteria:

- Tests pass reliably
- Assertions match current route contracts

### Slice 2: Joke Endpoint Tests

Target: `src/pages/api/joke.js`

Objectives:

- Test successful joke fetch returns 200 with joke data
- Test external API failure throws ApiError
- Test response shape includes joke, category, type, id

Exit Criteria:

- Tests pass reliably
- External API errors are handled correctly

### Slice 3: Verification and Reporting

- Run lint, type-check, and full test suite
- Publish Phase 13 verification report
- Update ROADMAP, STATE, and PROJECT

## Definition of Done

- All API routes have deterministic contract tests
- Quality gates pass
- Phase 13 execution artifacts are published
