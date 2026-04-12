# Phase 31 Implementation Plan: Tailscale Path Integration

## Summary

Implement deterministic Cloud Run-to-home connectivity for the new edge topology by wiring a **Tailscale sidecar with ephemeral tagged identity** and a local relay endpoint that Nginx can safely proxy through.

## Scope

### In Scope

- Finalize sidecar identity/auth model (ephemeral tagged node).
- Add detailed setup steps for Secret Manager, IAM, and runtime env wiring.
- Implement local relay path from sidecar networking to home Next.js upstream.
- Add readiness and smoke checks proving tailnet route availability.
- Add troubleshooting and rollback-safe operational steps.

### Out of Scope

- Advanced proxy timeout tuning and UX behavior changes (Phase 32).
- Full CI/CD hardening and policy clean-up beyond Phase 31 requirements (Phase 33).
- Milestone-level closure and full runbook expansion (Phase 34).

## Confirmed Inputs

- Identity policy: **Ephemeral tagged node**.
- Runtime model: Cloud Run service with Nginx + Tailscale sidecar.
- Home workload: Next.js container on fixed port.
- Edge ingress: Cloud Run custom domain.

## Detailed Setup Steps

### Step 1: Tailnet Policy Preparation

1. Create/confirm a tag for cloud edge runtime, e.g. `tag:cloud-run-edge`.
2. In Tailscale ACL policy:
   - allow `tag:cloud-run-edge` to reach home app node on fixed app port,
   - deny unnecessary lateral access.
3. Ensure home machine/node is reachable by MagicDNS or stable tailnet IP.

Deliverable:

- ACL/tag policy documented and approved before deployment.

### Step 2: Auth Key and Secret Manager Wiring

1. Create ephemeral reusable auth key in Tailscale admin for tag scope:
   - tagged to `tag:cloud-run-edge`,
   - shortest practical expiry window.
2. Store key in GCP Secret Manager as `TS_AUTHKEY`.
3. Grant Cloud Run service account `Secret Manager Secret Accessor` to `TS_AUTHKEY`.
4. Validate secret access from deployment account path.

Deliverable:

- `TS_AUTHKEY` secret accessible to Cloud Run runtime and deploy pipeline.

### Step 3: Relay Path Implementation

1. Add sidecar startup command to:
   - start `tailscaled` userspace daemon,
   - run `tailscale up` with ephemeral/tagged settings,
   - expose local relay endpoint for Nginx upstream path.
2. Update Nginx upstream target to relay listener (`127.0.0.1:<relay-port>`).
3. Keep fallback behavior (`502/503/504 -> maintenance.html`) unchanged.

Deliverable:

- Nginx no longer depends on direct unresolved tailnet host during request handling.

### Step 4: Readiness and Health Contract

1. Add readiness check ensuring:
   - sidecar authenticated to tailnet,
   - relay endpoint listening locally,
   - route to home target is reachable.
2. Keep `/healthz` for platform health.
3. Add internal connectivity check endpoint/command for pre-traffic validation.

Deliverable:

- Deployment does not report success until connectivity contract is satisfied.

### Step 5: CI/CD Integration Checks

1. Add deploy-time assertion for required secrets/env:
   - `HOME_UPSTREAM_HOST`,
   - `HOME_UPSTREAM_PORT`,
   - `TS_AUTHKEY` secret reference.
2. Add post-deploy checks:
   - `/healthz` availability,
   - sample proxied route returns expected status.
3. Add explicit failure output hints for:
   - auth failure,
   - ACL denial,
   - upstream offline.

Deliverable:

- Pipeline can quickly classify connectivity failures without manual log digging.

### Step 6: Troubleshooting and Recovery Procedure

1. Add quick diagnostic sequence:
   - Cloud Run revision status,
   - sidecar logs for `tailscaled` and `tailscale up`,
   - Nginx upstream error logs.
2. Add fast rollback instructions to previous revision.
3. Add auth-key rotation steps:
   - create new key,
   - update secret,
   - redeploy,
   - revoke old key.

Deliverable:

- Operators can recover from tailnet outages and key drift safely.

## Work Breakdown

### Slice 1: Identity and Secret Contract

Objectives:

- Lock tag/ACL assumptions and ephemeral auth key lifecycle.
- Wire Secret Manager + IAM permissions.

Exit Criteria:

- Auth key path validated and documented.

### Slice 2: Relay and Upstream Wiring

Objectives:

- Implement local relay integration in runtime template.
- Update Nginx upstream to relay endpoint.

Exit Criteria:

- Requests route via relay path to home workload in test environment.

### Slice 3: Readiness and Smoke Validation

Objectives:

- Add connectivity readiness checks and post-deploy smoke checks.
- Ensure unhealthy tailnet path triggers controlled fallback behavior.

Exit Criteria:

- Connectivity gates fail fast when route is unavailable.

### Slice 4: Operational Playbook and Verification

Objectives:

- Add troubleshooting/rotation/recovery steps.
- Produce Phase 31 verification report.

Exit Criteria:

- Phase 31 artifact set is complete and executable by operators.

## Risks and Controls

1. Ephemeral key expiry causes runtime disconnects.
   - Control: documented rotation cadence and secret refresh procedure.
2. ACL drift blocks Cloud Run to home path.
   - Control: explicit policy checks and deploy-time connectivity smoke.
3. Sidecar process healthy but relay unavailable.
   - Control: relay-specific readiness gate and startup sequencing.

## Verification Strategy

- Static checks:
  - config lint/syntax verification for runtime changes.
- Runtime checks:
  - sidecar auth success markers in logs,
  - relay listener reachable,
  - proxied request succeeds to home app.
- Quality gates:
  - `pnpm lint`, `pnpm type-check`, `pnpm test`.

## Definition of Done

- Sidecar connectivity path is deterministic and uses ephemeral tagged identity.
- Secret/IAM wiring and rotation procedure are documented and testable.
- Nginx upstream path runs through local relay with readiness gates.
- Phase 31 verification report captures successful checks and known risks.
