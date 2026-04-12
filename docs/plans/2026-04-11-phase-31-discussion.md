# Phase 31 Discussion: Tailscale Path Integration

## Context

Phase 30 delivered the edge runtime topology on Cloud Run (Nginx + Tailscale sidecar) and deployment conversion.  
Phase 31 focuses on making Cloud Run-to-home connectivity deterministic, secure, and operable for production traffic.

## Goal for Phase 31

Establish a reliable tailnet path from Cloud Run edge runtime to the home Next.js container using Secret Manager-backed Tailscale authentication and explicit readiness behavior before live proxying.

## Connectivity Options Considered

### Option A: Sidecar + Local Relay Endpoint (Selected)

- Keep Tailscale in a dedicated sidecar container.
- Add a local relay endpoint that Nginx can consume over localhost.
- Relay forwards traffic to the home tailnet target using Tailscale userspace networking.

**Pros**

- Preserves the selected sidecar architecture and separation of concerns.
- Keeps Nginx runtime image minimal and focused on edge proxy behavior.
- Clear lifecycle boundaries for networking/auth vs HTTP proxy logic.

**Cons**

- Requires explicit relay wiring between sidecar and Nginx.
- Adds one more process boundary to monitor.

### Option B: Tailscale Embedded in Nginx Container

- Run Tailscale and Nginx in a single container.
- Nginx proxies directly to tailnet-resolved upstream.

**Pros**

- Simplifies local networking path.
- Fewer inter-container dependencies.

**Cons**

- Blends concerns and increases runtime image complexity.
- Harder to isolate failures and rotate networking credentials cleanly.

### Option C: Proxy via Tailscale Funnel/Serve Endpoint

- Cloud Run Nginx proxies to an externally exposed Funnel/Serve endpoint.

**Pros**

- Minimal Cloud Run runtime integration complexity.

**Cons**

- Adds external dependency layer not aligned with selected sidecar model.
- Less control for low-latency tailnet-first pathing.

## Selected Approach

Proceed with **Option A (Sidecar + Local Relay Endpoint)** to stay aligned with the chosen architecture while keeping connectivity explicit and testable.

## Execution Slices for Phase 31

### Slice 1: Authentication and Identity Contract

- Define Tailscale auth key handling via Secret Manager (`TS_AUTHKEY`).
- Specify sidecar identity/tagging policy for Cloud Run runtime.
- Define required environment inputs for connectivity startup.

### Slice 2: Relay Path Wiring

- Add sidecar relay process exposing localhost endpoint for Nginx upstream.
- Update Nginx upstream target to relay endpoint (not direct unresolved tailnet host).
- Keep fallback handling unchanged (`503` maintenance path).

### Slice 3: Readiness and Health Guarantees

- Ensure Nginx only serves traffic after relay path is ready.
- Add sidecar/relay readiness checks to deployment process.
- Define failure semantics when tailnet path is degraded.

### Slice 4: Security and Operational Controls

- Ensure logs avoid leaking tokens, node keys, or sensitive routing metadata.
- Add key-rotation-safe deployment behavior.
- Capture troubleshooting checks for tailnet path failures.

## Required Inputs for Plan Phase

- Home tailnet target identity to use in relay path (MagicDNS name or tailnet IP)
- Home Next.js fixed port confirmation for relay destination
- Tailscale tag/identity policy for Cloud Run runtime node
- Auth key type policy (ephemeral/reusable) and rotation expectation

## Risks and Controls

- Sidecar starts but relay path not ready
  - Control: explicit readiness gate and startup ordering checks.
- Credential or ACL mismatch blocks home route
  - Control: preflight identity/ACL validation in plan and deploy checks.
- Connectivity flaps under low-traffic cold starts
  - Control: deterministic reconnect behavior and documented recovery commands.

## Recommendation

Move to `/gsd:plan-phase 31` with sidecar-relay connectivity slices, readiness gating, and identity/credential controls as first-class plan items.
