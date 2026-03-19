# Phase 7 Implementation Plan: Outbound Request Security Hardening

## Summary

Execute risk-first outbound hardening on `image-proxy` and `transcribe` to reduce SSRF and cost-abuse risk with explicit API contracts.

## Scope

### In Scope

- `src/pages/api/image-proxy.js` request-boundary hardening
- `src/pages/api/transcribe.js` auth and abuse controls
- API regression tests for new security contracts
- Verification and GSD document updates

### Out of Scope

- Full distributed rate-limit infrastructure migration
- Broad redesign of all AI endpoint auth policy

## Work Breakdown

### Slice 1: Image Proxy Hardening

- Enforce `GET` method only.
- Add outbound host allowlist and block unsafe hosts.
- Add per-IP rate limiting.
- Enforce image MIME and max response size.
- Tighten GitHub token injection host matching.

### Slice 2: Transcribe Hardening

- Require authenticated session.
- Add per-IP rate limiting.
- Validate multipart content type.
- Validate payload size ceiling.

### Slice 3: Tests and Verification

- Add/update API tests for new constraints.
- Run lint, type-check, full tests, and targeted E2E.
- Publish verification report and sync roadmap/state/project docs.

## Definition of Done

- Outbound request routes enforce explicit security boundaries.
- New behavior is regression-tested.
- Verification gates pass and Phase 7 artifacts are published.
