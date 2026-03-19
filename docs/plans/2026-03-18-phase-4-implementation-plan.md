# Phase 4 Implementation Plan: Internationalization Consistency

## Summary

Implement runtime-safe locale parity, add automated parity guardrails, and resolve high-impact untranslated string/key mismatch hotspots.

## Scope

### In Scope

- Runtime locale deep-merge fallback with English baseline
- Locale parity script and strict-locale parity tests
- Translation key additions for active UI mismatch cases
- Replacement of selected hardcoded user-facing strings with i18n keys

### Out of Scope

- Full manual translation completion for all partial locales
- Product behavior changes unrelated to localization consistency

## Work Breakdown

### Slice 1: Runtime Parity Foundation

- Deep-merge locale resources with English fallback
- Ensure lazy-loaded locale bundles receive same fallback merge

### Slice 2: Automated Guardrails

- Add `check:i18n-parity` script for locale audit reporting
- Add parity tests for runtime resources and strict locale raw parity

### Slice 3: UI Key and String Fixes

- Add missing translation keys used by AI/settings paths
- Replace hardcoded strings in settings/smart-image/performance helpers

### Slice 4: Verification and Reporting

- Run lint/type-check/tests and targeted E2E
- Publish Phase 4 verification report
- Sync `ROADMAP.md`, `STATE.md`, and `PROJECT.md`

## Testing Strategy

- `pnpm lint`
- `pnpm type-check`
- `pnpm test`
- `pnpm check:i18n-parity`
- `pnpm e2e --grep "settings auth flows"`

## Definition of Done

- Runtime locale parity is guaranteed via English fallback merge
- Strict locales pass raw key parity checks
- Key mismatch/hardcoded i18n hotspots are addressed
- Verification report is published with passing quality gates
