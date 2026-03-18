# Phase 5 Implementation Plan: Security and Configuration Hygiene

## Summary

Execute risk-first security hardening for secret boundaries and auth consistency with focused endpoint changes and contract tests.

## Scope

### In Scope

- Auth enforcement for secret-backed settings API
- Auth enforcement for issue mutation path
- Session-guard consistency updates for AI routes
- Production NextAuth secret fail-fast guard
- Test updates and verification reporting

### Out of Scope

- Broad auth redesign across all pages/routes
- Provider-level identity/role model redesign

## Work Breakdown

### Slice 1: Secret Boundary Hardening

- Require session on `GET /api/settings`
- Restrict `useSettings` prefetch to authenticated sessions

### Slice 2: Mutation Guard Hardening

- Require session on `POST /api/issues`
- Preserve current unauthenticated read behavior for `GET /api/issues`

### Slice 3: Auth Configuration Consistency

- Use `authOptions` when retrieving server session in `/api/ai`
- Fail fast in production when `NEXTAUTH_SECRET` is unset

### Slice 4: Test and Verification

- Add/expand API tests for settings and issues auth contracts
- Run `pnpm lint`, `pnpm type-check`, `pnpm test`
- Publish verification report and sync GSD docs

## Definition of Done

- Secret-backed settings API requires authentication
- Issue creation path requires authentication
- AI session checks use consistent auth options
- Production secret fallback is blocked
- Verification gates pass and docs are updated
