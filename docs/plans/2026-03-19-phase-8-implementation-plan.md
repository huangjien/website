# Phase 8 Implementation Plan: CI/CD Hardening and Pipeline Consolidation

## Summary

Consolidate workflow definitions and enforce comprehensive validation gates for PR and main deployment paths.

## Scope

### In Scope

- Consolidate workflow definitions to canonical path
- Add pull request validation trigger
- Expand CI gates to include format/type/i18n/pages checks and targeted E2E
- Ensure deploy job depends on successful validation and only runs on push to main
- Update related documentation references

### Out of Scope

- Full pipeline performance optimization
- Infrastructure-level deployment strategy redesign

## Work Breakdown

### Slice 1: Workflow Consolidation

- Keep `.github/workflows/CID.yaml` as single workflow source.
- Remove stale duplicate under `src/.github/workflows`.

### Slice 2: Validation Hardening

- Add `pull_request` trigger for main.
- Enforce gates:
  - `pnpm lint`
  - `pnpm format:check`
  - `pnpm type-check`
  - `pnpm check:i18n-parity`
  - `pnpm test:ci`
  - `pnpm e2e:settings-auth`
  - `pnpm check:pages-tests`
  - `pnpm build:webpack`

### Slice 3: Deployment Guarding

- Keep deployment on push to main.
- Set deploy job dependency on successful validation.

### Slice 4: Verification and Tracking

- Run local quality gates mirroring workflow.
- Publish Phase 8 verification report.
- Sync ROADMAP, STATE, and PROJECT.

## Definition of Done

- CI workflow duplication is removed.
- PR and main pipeline gates are comprehensive and deterministic.
- Deployment is blocked when validation fails.
- Phase 8 artifacts and GSD tracking docs are updated.
