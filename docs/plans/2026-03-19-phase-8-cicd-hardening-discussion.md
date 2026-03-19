# Phase 8 Discussion: CI/CD Hardening and Pipeline Consolidation

## Context

Milestone 2 Workstream 3 targets CI/CD hardening and workflow consolidation.

Audit findings:

- Duplicate workflow definition existed under `src/.github/workflows`, creating maintenance drift risk.
- Canonical workflow did not run on pull requests.
- CI quality gates missed key scripts (`type-check`, `format:check`, `check:i18n-parity`, targeted E2E, and `check:pages-tests`).

## Desired Outcome

Establish one canonical workflow with strong pre-merge validation and deployment only after quality gates pass.

## Approaches Considered

### Approach A: Keep push-only deploy workflow with minimal gates

Pros:

- Fastest pipeline runtime

Cons:

- Regressions can reach main before validation depth is sufficient
- Maintains quality drift risk

### Approach B: Split validation and deployment with PR gating

Pros:

- Strong pre-merge protection
- Keeps deployment behavior intact for main branch
- Clear separation of concerns

Cons:

- Longer CI runtime

### Approach C: Build new workflow file and keep old one temporarily

Pros:

- Lower migration risk

Cons:

- Increases duplication and confusion

## Recommendation

Choose **Approach B**.

## Proposed Slices

1. Workflow consolidation
   - Remove stale duplicate workflow path and keep `.github/workflows/CID.yaml` as single source.
2. Validation gate expansion
   - Add pull request trigger and enforce lint, format, type-check, i18n parity, test, targeted E2E, pages-test check, and build.
3. Deployment dependency hardening
   - Deploy job runs only on push to main and only after validation succeeds.

## Success Criteria

- One canonical CI workflow remains.
- PRs to main run comprehensive validation gates.
- Deploy path remains stable and gated by passing validation.
