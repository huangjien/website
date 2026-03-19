# Phase 6 Implementation Plan: API Surface Reduction and Auth Normalization

## Summary

Execute risk-first API surface reduction by retiring legacy unauthenticated utility endpoints and validating explicit retirement contracts.

## Scope

### In Scope

- `/api/ip` retirement and hardening
- `/api/getIp` retirement and hardening
- `/api/postIp` retirement and hardening
- API contract tests for retirement and method handling
- Verification and GSD document synchronization

### Out of Scope

- Broader auth redesign across all API routes
- Role-based access model changes

## Work Breakdown

### Slice 1: Endpoint Retirement

- Replace legacy implementations with hardened handlers.
- Keep method guards and return `410 Endpoint retired` for valid historical methods.

### Slice 2: Contract Tests

- Add tests covering:
  - `410` for historical valid method per endpoint
  - `405` for invalid methods

### Slice 3: Verification and Reporting

- Run lint, type-check, and test suite validation.
- Publish Phase 6 verification report.
- Update `ROADMAP.md`, `STATE.md`, and `PROJECT.md`.

## Definition of Done

- Legacy risky utility endpoints are retired.
- Retirement behavior is tested and stable.
- Full verification gates pass.
- Phase 6 execution and verification are documented.
