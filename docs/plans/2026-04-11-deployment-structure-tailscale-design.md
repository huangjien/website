# Deployment Structure Redesign (Cloud Run + Tailscale Sidecar)

## Context

Current production deployment targets Google Cloud Run with the Next.js application container directly exposed. To reduce GCP cost while preserving public availability, traffic handling will move to a lightweight Cloud Run Nginx front layer that proxies over Tailscale to a home-hosted Next.js container.

## Requirements Confirmed

- Cloud Run will no longer run the application workload directly.
- Tailscale is already available and should carry GCP-to-home traffic.
- Public entry remains Cloud Run with custom domain and HTTPS termination.
- Cloud Run runtime should be Docker-container based with cost-first settings.
- Nginx should serve a static maintenance response when home upstream is offline.
- Tailscale sidecar should authenticate using a key stored in GCP Secret Manager.
- Home upstream is a Next.js container on a fixed port.

## Approaches Considered

### Approach A (Recommended): Cloud Run Nginx + Tailscale Sidecar

- Architecture: Cloud Run custom domain -> Nginx container -> local Tailscale sidecar tunnel -> home Next.js container (tailnet IP:port).
- Pros:
  - Keeps public DNS/TLS simple via existing Cloud Run custom domain flow.
  - Avoids exposing home public IP.
  - Gives explicit reverse-proxy control (timeouts, headers, maintenance page).
  - Supports low-traffic cost profile with minimal container resources.
- Cons:
  - Requires sidecar orchestration and tailnet key lifecycle management.
  - Home-host availability becomes production dependency.

### Approach B: Cloud Run Nginx -> Tailscale Funnel Endpoint

- Architecture: Cloud Run Nginx proxies to Funnel/Serve endpoint published from home.
- Pros:
  - Removes sidecar complexity in Cloud Run.
  - Faster initial setup in some tailnet configurations.
- Cons:
  - Less direct control of transport path and observability.
  - Adds dependency on Funnel behavior/policies for production ingress.

### Approach C: Cloud Run Nginx -> Home Public Internet Upstream

- Architecture: Cloud Run Nginx proxies over public internet to home IP/domain.
- Pros:
  - Operationally straightforward from Nginx perspective.
- Cons:
  - Exposes home infrastructure publicly.
  - Weakens security posture versus tailnet route.
  - More fragile under residential IP and network variability.

## Recommended Design

### Architecture

- Public ingress:
  - Cloud Run service hosts Nginx container and keeps custom domain mapping.
  - Cloud Run handles HTTPS termination at platform edge.
- Internal proxying:
  - Nginx proxies app traffic to home Next.js container reachable over Tailscale.
  - Tailscale sidecar in the same Cloud Run service handles tailnet connectivity.
- Failure behavior:
  - If upstream is unavailable, Nginx serves static maintenance page with `503`.

### Runtime and Routing

- Nginx routes:
  - `/` and all app paths -> `proxy_pass` to home tailnet upstream.
  - health endpoint for Cloud Run readiness.
  - custom maintenance response for upstream failure.
- Header forwarding:
  - Preserve `Host`, `X-Forwarded-For`, `X-Forwarded-Proto`, and request IDs.
- Timeout policy:
  - Conservative low-traffic defaults with explicit connect/read timeouts.

### Security and Secrets

- Tailscale auth key stored in Secret Manager; injected during deploy.
- No home public ingress required for application service.
- Home firewall allows only tailnet access for app port.
- Nginx logs avoid sensitive payload/body content.

### Cost and Reliability

- Cost-first Cloud Run sizing:
  - low CPU/memory footprint,
  - low minimum instances (or zero) for minimal idle cost.
- Reliability controls:
  - maintenance fallback instead of opaque gateway errors,
  - explicit upstream retry/timeout behavior in Nginx.

### CI/CD and Operations

- Replace current Cloud Run app deployment step with Nginx+sidecar deployment.
- Add deployment variables:
  - home tailnet upstream target,
  - Tailscale secret reference,
  - Nginx config checksum/version.
- Add smoke verification:
  - public route check,
  - maintenance-path behavior check (simulated upstream down).

## Implementation Plan (Milestone-Level)

1. Container and runtime structure
   - Add Nginx runtime image/config and sidecar-ready Cloud Run service layout.
2. Networking and proxy configuration
   - Wire proxy routes, forwarded headers, timeout policy, and maintenance fallback.
3. Secret and auth integration
   - Connect Secret Manager auth key and sidecar boot logic.
4. CI/CD migration
   - Update GitHub workflow to deploy new service shape and environment variables.
5. Verification and rollback runbook
   - Add deployment validation checks and rollback path to previous stable service.

## Risks and Mitigations

- Home network instability
  - Mitigation: maintenance fallback, short fail detection, operational alerting.
- Key expiration or auth drift
  - Mitigation: rotation schedule and deployment-time secret validation.
- Sidecar startup race conditions
  - Mitigation: readiness gating before proxying live traffic.

## Success Criteria

- Cloud Run no longer runs application workload directly.
- Public domain remains functional over Cloud Run custom domain.
- Requests are proxied to home Next.js container via Tailscale.
- Upstream outage returns controlled maintenance page.
- Deployment workflow reliably provisions Nginx + Tailscale sidecar configuration.
