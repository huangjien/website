# Phase 1 Implementation Plan: Reliability and API Hardening

## Summary

Implement Phase 1 using shared API hardening utilities with vertical-slice delivery. Start with a foundation slice, then harden AI and core content endpoints, resolve configuration inconsistencies, and close with coverage improvements.

## Scope

### In Scope

- Shared API hardening helpers for method guards, validation failures, and error envelopes
- Priority endpoint hardening for AI and core content APIs
- Rewrite/config consistency updates related to known routing and tooling mismatches
- Tests proving deterministic error/status behavior for high-risk endpoints

### Out of Scope

- New product features or UI behavior changes
- Full rewrite of all API routes in one batch
- Non-Phase-1 roadmap initiatives

## Chosen Approach

Adopt the Phase 1 recommendation: shared utilities first, then route-by-route adoption with contract discipline on critical endpoints.

Reference: `docs/plans/2026-03-18-phase-1-reliability-api-hardening-discussion.md`

## Work Breakdown

### Slice 1: Foundation Utilities

Objectives:

- Introduce reusable method guard helper
- Introduce reusable error response envelope helper
- Introduce reusable validation failure mapping helper

Deliverables:

- Utility module(s) under `src/lib/`
- Unit tests validating helper behavior and status-code mapping
- Migration guideline note for endpoint adoption order

Exit Criteria:

- Helpers pass unit tests
- Helpers support existing API route patterns without breaking current responses

### Slice 2: AI Endpoint Reliability

Targets:

- `src/pages/api/chat.js`
- `src/pages/api/ai-models.js`
- `src/pages/api/tts.js`
- `src/pages/api/transcribe.js`

Objectives:

- Apply shared guard/error/validation helpers
- Normalize deterministic status codes for auth, input, rate-limit, provider, and internal failures
- Ensure rate-limit handling consistency for AI routes

Exit Criteria:

- AI routes return consistent error envelope
- Failure-mode tests pass for each critical error class

### Slice 3: Core Content/API Hardening

Targets:

- `issues.js`, `comments.js`, `labels.js`, `member.js`, `markdown.js`, `settings.js`

Objectives:

- Apply method guards and standardized error envelope
- Align input validation and invalid-method behavior

Exit Criteria:

- Targeted endpoints conform to shared response pattern
- Endpoint behavior tests pass

### Slice 4: Configuration Consistency

Objectives:

- Resolve `/robots.txt` rewrite mismatch in `next.config.js`
- Align package-manager usage in Playwright and workflow files to repository standard

Exit Criteria:

- No unresolved rewrite target remains
- Tooling references use a consistent package-manager strategy

### Slice 5: Coverage and Regression Safety

Objectives:

- Add/expand API route tests for hardened endpoints
- Ensure Phase 1 behavior is asserted in unit/integration tests

Exit Criteria:

- New hardening tests pass in CI profile
- Regression-prone failure paths are covered

## Testing Strategy

Mandatory checks per slice:

- `pnpm lint`
- `pnpm type-check`
- `pnpm test` (targeted + full where needed)

Additional verification:

- Targeted endpoint tests for method guards, validation errors, auth failures, and provider failures
- Run relevant E2E only where route behavior affects user flows

## Risk Controls

- Apply changes in vertical slices to minimize blast radius
- Preserve existing success response shapes while standardizing error responses
- Use helper-driven refactors to avoid duplicated one-off logic
- Gate every slice by tests before proceeding

## Execution Order

1. Build and test foundation helpers
2. Migrate AI endpoints and validate failure modes
3. Migrate core content endpoints and validate behavior
4. Resolve config/tooling mismatches
5. Finalize coverage and run full validation

## Definition of Done

- Priority endpoints use shared hardening utilities
- Error responses are consistent across Phase 1 target routes
- AI endpoint failure behavior is deterministic and tested
- Known rewrite/tooling inconsistencies are resolved
- Lint, type-check, and tests pass
