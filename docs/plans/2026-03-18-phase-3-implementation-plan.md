# Phase 3 Implementation Plan: Quality and Test Coverage

## Summary

Execute a risk-first test expansion focused on critical API/AI contracts and auth/settings E2E user journeys, then verify with full project quality gates.

## Scope

### In Scope

- Scenario-focused API/AI tests for critical failure and contract paths
- E2E auth/settings journey tests with deterministic mocks
- Verification reporting and GSD document synchronization

### Out of Scope

- Feature behavior changes unrelated to testability
- Wide coverage expansion outside prioritized risk areas

## Chosen Approach

Use the Phase 3 discussion recommendation:

- Risk-first coverage slices
- Deterministic auth/settings E2E via endpoint interception

Reference: `docs/plans/2026-03-18-phase-3-quality-coverage-discussion.md`

## Work Breakdown

### Slice 1: API/AI Contract Tests

Targets:

- `src/__tests__/api/chat.test.js`
- `src/__tests__/api/ai-models.test.js`
- `src/__tests__/api/tts.test.js`
- `src/__tests__/api/transcribe.test.js`
- `src/__tests__/api/settings.test.js`

Objectives:

- Cover critical status-code and error-envelope branches
- Validate cache/fallback and rate-limit behavior
- Validate provider failure mapping and validation failures

Exit Criteria:

- New contract tests pass reliably
- Assertions match current route contracts

### Slice 2: Auth/Settings E2E Coverage

Targets:

- `e2e/settings-auth.test.js`

Objectives:

- Verify unauthenticated access state for `/settings`
- Verify authenticated settings list/search/pagination behavior

Exit Criteria:

- E2E tests pass on configured projects
- Core auth/settings journey regressions are detectable

### Slice 3: Verification and Reporting

Objectives:

- Run lint/type-check/full tests
- Publish Phase 3 verification report
- Update `ROADMAP.md` and `STATE.md`

Exit Criteria:

- All quality gates pass
- Phase 3 status and evidence are documented

## Testing Strategy

- `pnpm lint`
- `pnpm type-check`
- `pnpm test`
- `pnpm e2e --grep settings` (targeted E2E validation)

## Definition of Done

- Critical API/AI contract branches have scenario-focused tests
- Auth/settings E2E coverage is added and passing
- Verification report exists with pass/fail evidence
- Roadmap/state reflect Phase 3 execution and verification status
