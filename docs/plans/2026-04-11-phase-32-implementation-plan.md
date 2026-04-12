# Phase 32 Implementation Plan: Proxy Reliability and Fallback

## Summary

Implement bounded retry-before-maintenance behavior for the Cloud Run Nginx edge so transient home-upstream failures recover automatically while persistent failures still return a predictable `503` maintenance response.

## Scope

### In Scope

- Define concrete timeout/retry values for low-traffic profile.
- Apply retry policy in Nginx proxy configuration.
- Keep deterministic maintenance fallback after retry exhaustion.
- Add validation checks for transient-recovery and persistent-failure paths.
- Publish Phase 32 verification artifact with measured behavior.

### Out of Scope

- Broader deployment workflow refactors outside reliability tuning (Phase 33).
- Full runbook closure and milestone-wide operational documentation (Phase 34).
- Non-essential UX changes to maintenance page content.

## Policy Decisions (Locked for Phase 32)

- **Retry mode:** retry before maintenance.
- **Max retries:** `2`.
- **Retry-eligible statuses:** `502`, `503`, `504`.
- **Connect timeout:** `3s`.
- **Send timeout:** `30s`.
- **Read timeout:** `30s`.
- **Retry scope:** transient upstream errors only; bounded attempts.

## Work Breakdown

### Slice 1: Reliability Policy Wiring

Objectives:

- Update Nginx proxy directives to include:
  - bounded retry count (`proxy_next_upstream_tries 3` total attempts),
  - retry timeout budget,
  - transient error classes (`502/503/504`).
- Keep `error_page ... =503 /maintenance.html` as terminal behavior.

Target Files:

- `deploy/nginx/default.conf.template`

Exit Criteria:

- Nginx config explicitly reflects bounded retries and fallback path.

### Slice 2: Route Safety and Fallback Boundaries

Objectives:

- Ensure retry policy applies uniformly to primary route handling.
- Confirm no unbounded loops or indefinite waiting behavior.
- Preserve `/healthz` reliability for platform probes.

Target Files:

- `deploy/nginx/default.conf.template`
- `deploy/nginx/nginx.conf` (if needed)

Exit Criteria:

- Route behavior remains deterministic under both success and failure conditions.

### Slice 3: Failure Simulation and Verification Harness

Objectives:

- Add simple validation steps to reproduce:
  1. transient upstream failure recovered within retry budget,
  2. persistent failure leading to maintenance response.
- Record expected behavior and timing bounds.

Target Files:

- `docs/plans/2026-04-11-phase-32-verification-report.md` (to be created in execution)
- Optional test helper notes/scripts if required

Exit Criteria:

- Verification approach is executable and documented.

### Slice 4: Phase Quality Gates and Artifact Publication

Objectives:

- Run quality gates after reliability changes:
  - `pnpm lint`
  - `pnpm type-check`
  - `pnpm test`
- Run edge container config validation (`nginx -t` in container context).
- Publish Phase 32 verification report with final policy values and outcomes.

Exit Criteria:

- All gates pass and Phase 32 verification report is published.

## Detailed Execution Steps

1. Edit Nginx template to add retry directives and timeout values.
2. Build edge image and run `nginx -t` with relay env variables.
3. Run local transient/persistent failure simulation checks.
4. Execute lint/type-check/test gates.
5. Publish Phase 32 verification report and update milestone tracking.

## Risks and Controls

1. Retry policy too aggressive -> increased latency.
   - Control: strict retry count and short timeout window.
2. Retry policy too conservative -> maintenance shown too often.
   - Control: allow two bounded retries for transient failures.
3. Hidden route-specific behavior inconsistencies.
   - Control: validate primary route and health route explicitly.

## Verification Strategy

- Static:
  - Nginx config syntax validation in built edge image.
- Behavioral:
  - transient failure scenario must recover without maintenance page.
  - persistent failure scenario must return maintenance page.
- Quality gates:
  - lint/type-check/tests must pass unchanged.

## Definition of Done

- Nginx reliability policy is implemented with bounded retry-before-maintenance.
- Fallback behavior remains deterministic and documented.
- Phase 32 verification report confirms behavior and quality gates.
