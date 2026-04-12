# Phase 30 Discussion: Runtime Topology Migration

## Context

Phase 30 starts Milestone 7 by changing production runtime topology from Cloud Run-hosted Next.js application workload to a Cloud Run edge proxy workload.

The selected milestone architecture is:

- Cloud Run custom domain + HTTPS edge
- Nginx container on Cloud Run
- Tailscale sidecar container on Cloud Run
- Home-hosted Next.js container (fixed port) as upstream over tailnet
- Static `503` maintenance fallback when home upstream is unavailable

## Goal for Phase 30

Convert Cloud Run runtime shape in-place from direct app hosting to edge-proxy hosting while preserving public ingress compatibility and minimizing migration risk under a cost-first profile.

## Options Considered

### Option A: In-Place Service Replacement (Selected)

- Update existing Cloud Run service deployment shape directly.
- Replace app container runtime with Nginx + Tailscale sidecar runtime.
- Keep custom domain attached to the same service.

**Pros**

- Fastest path with minimal service sprawl.
- Lowest operational overhead for low-traffic environments.
- Matches selected rollout preference.

**Cons**

- Higher blast radius if configuration is wrong.
- Rollback depends on fast redeploy of previous known-good revision.

### Option B: Blue/Green Service Switch

- Deploy new edge service in parallel.
- Validate edge path and tailnet connectivity first.
- Cut DNS/domain mapping to new service after verification.

**Pros**

- Strongest rollback posture.
- Isolates cutover risk.

**Cons**

- More setup and temporary cost overhead.
- More moving parts for a small traffic profile.

### Option C: Canary Traffic Split

- Run both topologies and gradually shift traffic.

**Pros**

- Gradual risk reduction.

**Cons**

- Highest implementation complexity for this migration.
- Not aligned with current cost-first and low-traffic objective.

## Selected Approach

Proceed with **Option A (In-Place Service Replacement)**, with explicit rollback and verification gates to control risk.

## Execution Slices for Phase 30

### Slice 1: Runtime Artifact Preparation

- Add edge runtime artifacts (Nginx container config + sidecar-aware service definition inputs).
- Keep current app runtime artifacts available for rollback.

### Slice 2: Cloud Run Deployment Shape Update

- Update deployment workflow to run Nginx + Tailscale sidecar containers.
- Preserve custom domain entrypoint and HTTPS edge assumptions.

### Slice 3: Connectivity Readiness Contract

- Wire home upstream endpoint via environment/config placeholders.
- Ensure startup readiness prevents proxying before sidecar connectivity is available.

### Slice 4: Safety Gates and Rollback

- Add smoke checks for root route and health path.
- Document immediate rollback command path to previous revision.

## Required Inputs for Plan Phase

- Home tailnet upstream host/IP and fixed port
- Secret Manager secret reference for Tailscale auth key
- Cloud Run service name/region confirmation for in-place update
- Maintenance page content (minimal/default vs branded)

## Risks and Controls

- Misconfigured proxy target -> enforce smoke check before traffic confirmation
- Sidecar boot race -> readiness gate before live proxying
- Home endpoint downtime -> static maintenance fallback path

## Recommendation

Move to `/gsd:plan-phase 30` using the selected in-place replacement approach with strict pre-deploy validation and explicit rollback commands.
