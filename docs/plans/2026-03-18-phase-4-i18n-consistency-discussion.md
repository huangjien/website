# Phase 4 Discussion: Internationalization Consistency

## Context

Phase 4 in `ROADMAP.md` focuses on:

- Validating translation key parity across locales
- Preventing untranslated user-facing strings in new features

Current gaps include partial locale files, mismatched key namespaces used in UI, and hardcoded user-facing strings in selected components.

## Desired Outcome

Ensure runtime-safe locale parity, enforce parity checks for strict locales, and reduce untranslated user-facing strings in active UI paths.

## Approaches Considered

### Approach A: Full Human Translation Sweep

Translate all missing keys in all locales immediately.

Pros:

- Best linguistic quality

Cons:

- Slowest delivery and high coordination overhead

### Approach B: Runtime Fallback + Strict Guardrails

Merge locale resources with English fallback at runtime and enforce parity checks for strict locales in CI/test.

Pros:

- Immediate runtime consistency
- Practical quality guardrails for future changes

Cons:

- Partial locales still rely on English for missing keys

### Approach C: Locale Reduction

Disable partial locales until fully translated.

Pros:

- Strong consistency guarantee

Cons:

- Regressive UX for users currently selecting those locales

## Recommendation

Choose **Approach B**.

Rationale:

- Preserves existing locale availability
- Delivers immediate consistency improvements
- Establishes automated guardrails for ongoing parity

## Proposed Slices

1. Runtime parity slice
   - Apply English deep-merge fallback for locale resources
2. Guardrail slice
   - Add parity audit script and strict-locale parity tests
3. UI translation slice
   - Replace high-impact hardcoded strings and key mismatches
4. Verification slice
   - Run full quality gates and publish Phase 4 verification report

## Success Criteria

- Runtime locale resources expose full translation key set
- Strict locales pass raw parity checks against English baseline
- Key mismatch/hardcoded string hotspots are reduced
- Lint, type-check, unit tests, and targeted E2E checks pass
