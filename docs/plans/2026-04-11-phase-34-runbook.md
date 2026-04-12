# Phase 34 Runbook: Deployment, Validation, and Recovery

## Purpose

Operational checklist for Milestone 7 deployment topology:

- Cloud Run edge runtime (Nginx + Tailscale sidecar)
- Home-hosted Next.js upstream over tailnet relay

## Pre-Deploy Checklist

- Confirm required deployment secrets are set:
  - `GCP_PROJECT_ID`
  - `GCP_SA_KEY`
  - `DOCKER_PASSWORD`
  - `HOME_UPSTREAM_HOST`
  - `HOME_UPSTREAM_PORT`
- Confirm Secret Manager secret `TS_AUTHKEY` exists and is current.
- Confirm home upstream runtime is healthy and reachable from tailnet.

## Deploy Procedure

1. Push/merge deploy-ready change to `main` to trigger CI deployment workflow.
2. Confirm workflow passes:
   - required secret/value validation,
   - manifest resolution validation,
   - Cloud Run deploy and smoke-check step.
3. Verify service URL is returned by deploy workflow output.

## Smoke Validation

- Validate edge health endpoint:
  - `GET /healthz` returns `200`.
- Validate proxied app route:
  - `GET /` returns application response (non-maintenance page) when upstream is healthy.

## Fallback Validation

- Simulate unavailable upstream.
- Validate edge returns maintenance response:
  - HTTP `503`
  - maintenance page body.

## Rollback Procedure

1. Identify last known good revision:

```bash
gcloud run revisions list --service=blog --region=europe-west1
```

2. Shift traffic to previous stable revision:

```bash
gcloud run services update-traffic blog --region=europe-west1 --to-revisions <previous-revision>=100
```

3. Re-run smoke validation (`/healthz`, `/`) after rollback.

## Tailscale Key Rotation

1. Create new ephemeral tagged auth key in Tailscale admin.
2. Update Secret Manager secret `TS_AUTHKEY`.
3. Redeploy Cloud Run edge service.
4. Validate connectivity and smoke checks.
5. Revoke old auth key.

## Incident Triage Checklist

- Check Cloud Run revision status and rollout events.
- Check edge container logs for proxy/upstream failures.
- Check sidecar logs for Tailscale auth/connectivity failures.
- Validate home runtime health and tailnet reachability.
- Apply rollback if customer impact persists beyond retry window.
