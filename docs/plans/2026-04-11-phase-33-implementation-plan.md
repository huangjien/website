# Phase 33 Implementation Plan: Security and Deployment Workflow Hardening

## Summary

Harden the Cloud Run edge deployment path with a **secrets-first, least-privilege** approach by reducing credential exposure, constraining IAM permissions, and adding deploy-time guardrails with auditable verification.

## Scope

### In Scope

- Minimize secret surface in CI/deploy runtime.
- Tighten IAM roles for deploy and runtime identities to least privilege.
- Add fail-fast deployment guardrails for missing/unsafe configuration.
- Add auditable verification artifacts for secret/IAM/guardrail checks.

### Out of Scope

- Runtime topology redesign (already addressed in phases 30-32).
- Organization-wide policy changes outside this repository’s deployment path.
- Milestone-wide closure tasks (Phase 34).

## Security Decisions (Locked for Phase 33)

- Secrets-first hardening order.
- Least-privilege IAM as default baseline.
- Fail-fast CI guardrails for required secret/env integrity.
- No secrets logged in workflow output or debug commands.

## Required Inputs Before Execution

1. Cloud Run deploy service account email.
2. Cloud Run runtime service account email.
3. Current IAM role bindings for both accounts.
4. Exact secret inventory required by edge deploy path:
   - `GCP_PROJECT_ID`
   - `GCP_SA_KEY`
   - `DOCKER_PASSWORD`
   - `HOME_UPSTREAM_HOST`
   - `HOME_UPSTREAM_PORT`
   - Secret Manager: `TS_AUTHKEY`
5. Any org policy constraints affecting Secret Manager or Cloud Run IAM updates.

## Work Breakdown

### Slice 1: Secret Surface Reduction

Objectives:

- Review deploy workflow and remove non-essential secret exposure.
- Ensure manifest rendering consumes only required secrets.
- Add masking-safe practices and avoid printing resolved sensitive values.

Target Files:

- `.github/workflows/CID.yaml`
- `README.md` deployment security section

Exit Criteria:

- Secret usage list is explicit and minimal.
- Workflow contains no step that outputs sensitive values.

### Slice 2: IAM Least-Privilege Contract

Objectives:

- Define minimum required roles for:
  - deploy service account
  - runtime service account
- Restrict Secret Manager access to `TS_AUTHKEY` only.
- Document required role set and verification commands.

Target Files:

- `docs/plans/` phase artifacts
- optional deployment notes in `README.md`

Exit Criteria:

- IAM target state documented with principal/role mapping.
- Verification steps confirm no broad over-privileged bindings.

### Slice 3: Deployment Guardrails

Objectives:

- Add pre-deploy required-variable assertions:
  - fail if required GitHub secrets/env are missing or empty.
- Add config sanity checks:
  - no empty upstream host/port,
  - required template placeholders fully resolved.
- Keep deploy flow deterministic with clear error messages.

Target Files:

- `.github/workflows/CID.yaml`
- `deploy/cloudrun/service.yaml` (if guardrail annotations/values required)

Exit Criteria:

- Deployment fails early with actionable errors on invalid config.

### Slice 4: Security Verification and Rollback Safety

Objectives:

- Add Phase 33 verification evidence for:
  - secret handling controls,
  - IAM least-privilege conformance,
  - guardrail behavior.
- Confirm rollback instructions remain valid after hardening changes.

Target Files:

- `docs/plans/2026-04-11-phase-33-verification-report.md` (execution output)
- `README.md` rollback section (update only if needed)

Exit Criteria:

- Security hardening checks are repeatable and documented with pass/fail outcomes.

## Detailed Execution Steps

1. Inventory current secret references in workflow/template/docs.
2. Refactor workflow to enforce required-secret assertions.
3. Add non-sensitive manifest validation checks before deploy.
4. Define and document least-privilege IAM role matrix.
5. Run deployment dry-run style checks and repository quality gates.
6. Publish Phase 33 verification report and tracking updates.

## Risks and Controls

1. Over-restrictive IAM breaks deployment.
   - Control: staged role tightening with immediate verification after each change.
2. Hidden secret dependency omitted during cleanup.
   - Control: required-secret guardrail list and pre-deploy checks.
3. Guardrails too strict for valid edge cases.
   - Control: explicit validation messages and documented override process.

## Verification Strategy

- Workflow checks:
  - required secret/env assertions pass in configured environment.
- IAM checks:
  - role list matches least-privilege matrix.
- Quality gates:
  - `pnpm lint`
  - `pnpm type-check`
  - `pnpm test`
- Deployment safety:
  - smoke check path still intact after hardening updates.

## Definition of Done

- Secret usage is reduced and explicitly documented.
- IAM contract is least-privilege and verifiable.
- Deploy workflow includes fail-fast guardrails with actionable diagnostics.
- Phase 33 verification report captures security hardening evidence.
