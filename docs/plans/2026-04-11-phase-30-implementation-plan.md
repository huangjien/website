# Phase 30 Implementation Plan: Runtime Topology Migration

## Summary

Migrate production runtime topology **in place** from Cloud Run-hosted Next.js workload to a Cloud Run edge proxy topology (Nginx + Tailscale sidecar) that forwards traffic to the home-hosted Next.js container over tailnet networking.

## Scope

### In Scope

- Create runtime artifacts for Nginx edge deployment and maintenance fallback page.
- Prepare sidecar-compatible Cloud Run deployment shape for Tailscale connectivity.
- Update CI/CD deployment flow from app-runtime deploy to edge-runtime deploy.
- Preserve existing Cloud Run custom domain and HTTPS edge entrypoint.
- Define rollout safety checks and explicit rollback procedure.

### Out of Scope

- Full Tailscale connectivity tuning and auth rotation policy hardening (Phase 31/33 depth).
- Advanced Nginx reliability tuning and fallback UX expansion beyond baseline (Phase 32 depth).
- End-to-end observability and runbook closure package (Phase 34 depth).

## Preconditions and Required Inputs

Before execution starts, confirm these values:

1. `HOME_UPSTREAM_HOST` (tailnet IP or MagicDNS name)
2. `HOME_UPSTREAM_PORT` (fixed Next.js container port on home host)
3. Secret Manager reference for Tailscale auth key (e.g., `TS_AUTHKEY`)
4. Cloud Run service/region confirmation for in-place replacement:
   - service: `blog`
   - region: `europe-west1`
5. Maintenance page preference (minimal default content in Phase 30)

## Work Breakdown

### Slice 1: Runtime Artifact Preparation

Objectives:

- Add Nginx runtime directory with:
  - `nginx.conf` baseline proxy behavior
  - `maintenance.html` static fallback page
  - startup script/environment template for upstream target values
- Add Cloud Run container topology notes for:
  - Nginx container
  - Tailscale sidecar container

Target Files:

- `deploy/nginx/nginx.conf` (new)
- `deploy/nginx/maintenance.html` (new)
- `deploy/nginx/entrypoint.sh` (new, if needed for env substitution)
- `docs/plans/` phase artifact updates as needed

Exit Criteria:

- Runtime artifacts exist and lint/basic syntax checks pass.
- Nginx config references upstream via environment-configurable host/port.

### Slice 2: CI/CD Deployment Shape Conversion

Objectives:

- Update `.github/workflows/CID.yaml` deployment stage:
  - build/push edge image (or images) instead of app runtime image
  - deploy Cloud Run with Nginx container plus Tailscale sidecar definition
  - inject required env vars and Secret Manager secret bindings
- Keep validation job unchanged unless migration adds new config checks.

Target Files:

- `.github/workflows/CID.yaml`
- `Dockerfile` replacement or additional edge-specific Dockerfile(s)
- Optional: `docker-compose.yml` notes for local topology simulation

Exit Criteria:

- Workflow expresses new runtime topology and deploy arguments clearly.
- Deployment command remains in-place (`gcloud run deploy blog ...`).

### Slice 3: Safe Cutover and Rollback Contract

Objectives:

- Add smoke verification steps after deploy:
  - root route reachable
  - expected proxy response path behavior
- Add deterministic rollback instructions to previous revision.
- Ensure fallback behavior is explicitly testable (upstream unavailable -> `503` maintenance).

Target Files:

- `.github/workflows/CID.yaml` post-deploy checks
- `README.md` (deployment section)
- New runbook notes under `docs/plans/` for rollback commands

Exit Criteria:

- Rollback command sequence documented and reviewable.
- Smoke check contract is explicit and executable.

### Slice 4: Phase Verification Artifact

Objectives:

- Run targeted quality gates for changed deployment files.
- Capture results and risks in Phase 30 verification report.

Exit Criteria:

- `pnpm lint`, `pnpm type-check`, and relevant tests pass (or are documented if unaffected).
- `docs/plans/YYYY-MM-DD-phase-30-verification-report.md` created.

## Risk Register (Phase 30)

1. In-place deploy misconfiguration can break public ingress.
   - Control: staged config checks + immediate rollback command.
2. Sidecar startup order can cause early proxy failures.
   - Control: readiness/smoke checks before marking deploy successful.
3. Missing secret/env values can fail runtime boot.
   - Control: deploy-time required variable assertions in workflow.

## Verification Strategy

- Static config validation:
  - Nginx syntax check in CI step (if tooling added in image build stage).
- Deployment smoke check:
  - HTTP check to public route.
- Fallback behavior check:
  - Controlled upstream-unavailable scenario validation (manual or scripted).

## Definition of Done

- Phase 30 artifacts are merged and deploy workflow reflects edge topology.
- In-place runtime replacement procedure is executable and rollback-ready.
- Phase 30 verification report exists with quality-gate outcomes and risks.
