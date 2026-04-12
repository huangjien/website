# Milestone 7 Charter

**Milestone:** #7 - Deployment Structure Migration (Cloud Run Edge + Home Runtime)  
**Created:** 2026-04-11  
**Status:** Active - Confirmed Scope

---

## Executive Summary

This milestone migrates production deployment from Cloud Run-hosted application runtime to a cost-optimized edge proxy model. Cloud Run will host only Nginx (with Tailscale sidecar connectivity), while application runtime executes on a home-hosted Next.js container over tailnet networking.

---

## Confirmed Scope

| Workstream                         | Include | Notes                                                             |
| ---------------------------------- | ------- | ----------------------------------------------------------------- |
| Cloud Run runtime migration        | ✅      | Replace direct app deploy with Nginx + sidecar deployment shape  |
| Tailscale connectivity integration | ✅      | Route Cloud Run proxy traffic to home Next.js container           |
| Edge proxy and fallback behavior   | ✅      | Implement proxy headers/timeouts and static maintenance fallback  |
| Secrets and security posture       | ✅      | Use Secret Manager auth key and keep home service non-public      |
| Verification and operations        | ✅      | Add deployment checks, rollback path, and runbook-level guidance  |

---

## Target Outcomes

| Outcome                              | Target                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------- |
| Cloud Run cost reduction             | Production runtime no longer executes full Next.js application on Cloud Run |
| Secure transport path                | GCP-to-home traffic runs through Tailscale, not direct public home ingress |
| Stable public ingress                | Existing custom domain and HTTPS continue via Cloud Run                    |
| Controlled failure mode              | Home upstream outage serves static maintenance page (`503`)                |
| Operational confidence               | Deploy, verify, and rollback procedures are documented and repeatable      |

---

## Proposed Workstreams

### Workstream 1: Runtime Topology Migration

- Replace current Cloud Run app deployment with Nginx edge service deployment
- Align container/runtime configuration for sidecar-compatible operation
- Preserve existing domain entrypoint compatibility

### Workstream 2: Tailscale Path Integration

- Configure Cloud Run sidecar authentication from Secret Manager key
- Establish deterministic proxy route to home tailnet IP and fixed app port
- Validate connectivity and startup ordering constraints

### Workstream 3: Proxy Reliability and Fallback

- Define Nginx upstream timeout and retry behavior for low-traffic profile
- Forward essential headers (`Host`, `X-Forwarded-*`, request ID)
- Serve static maintenance page when upstream is unavailable

### Workstream 4: Security and Deployment Workflow

- Remove direct Cloud Run app-runtime assumptions from deployment workflow
- Ensure no sensitive payload logging in proxy layer
- Align deployment env/secret wiring with new architecture

### Workstream 5: Verification and Runbook Expansion

- Add smoke checks for route correctness and fallback behavior
- Add operational rollback steps to previous known-good deployment
- Validate lint/type-check/test quality gates and deployment verification artifacts

---

## Phases

| Phase    | Workstream                       | Focus                                                    |
| -------- | -------------------------------- | -------------------------------------------------------- |
| Phase 30 | Runtime Topology Migration       | Cloud Run deployment shape conversion                    |
| Phase 31 | Tailscale Path Integration       | Sidecar auth and home upstream routing                   |
| Phase 32 | Proxy Reliability and Fallback   | Header/timeout policy and maintenance-page behavior      |
| Phase 33 | Security and Deployment Workflow | Secret wiring and CI/CD migration                        |
| Phase 34 | Verification and Runbook         | Smoke checks, rollback path, and closure-quality gates   |

---

## Success Criteria

| Criteria                                                               | Status  |
| ---------------------------------------------------------------------- | ------- |
| Cloud Run no longer hosts direct application runtime                   | Pending |
| Public domain remains available through Cloud Run edge path            | Pending |
| Requests proxy successfully to home Next.js container over Tailscale   | Pending |
| Upstream outage behavior serves controlled maintenance page             | Pending |
| Deployment verification and rollback process is documented and repeatable | Pending |

---

## Quality Gates

- `pnpm lint` must pass
- `pnpm type-check` must pass
- `pnpm test` must pass
