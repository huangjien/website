# Home-Side Deployment Guide

## Purpose

This guide explains how to deploy and operate the application on your home machine for the current architecture:

- Cloud Run (GCP) runs Nginx + Tailscale sidecar as public edge
- Home machine runs the Next.js application container
- Cloud Run proxies traffic to home over tailnet

---

## 1) Prepare Home Machine

1. Install Docker.
2. Install and connect Tailscale on the home machine.
3. Verify the home node appears in tailnet (`tailscale status`).
4. Choose a fixed app port (example: `8080`).

Notes:

- This fixed port must match `HOME_UPSTREAM_PORT` in GitHub secrets.
- `HOME_UPSTREAM_HOST` should be your home machine tailnet IP or MagicDNS name.

---

## 2) Build Home Runtime Image

From repository root on the home machine:

```bash
docker build -t website-home:latest .
```

---

## 3) Create Home Environment File

Create `.env.home` on the home machine:

```bash
cat > .env.home <<'EOF'
NODE_ENV=production
NEXTAUTH_URL=https://blog.huangjien.com
NEXTAUTH_SECRET=your-nextauth-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_TOKEN=your-github-token
GITHUB_REPO=https://api.github.com/repos/<org>/<repo>
GITHUB_MEMBER=https://api.github.com/orgs/<org>/teams/<team>/members
OPENAI_API_KEY=your-openai-key
EOF
```

> **`NEXTAUTH_URL` must match exactly one of the hosts the gateway routes
> to this container, AND the OAuth callback URLs you registered at GitHub
> and Google.** Currently: `https://blog.huangjien.com` (single-host setup).
> If you later add `www.` or other subdomains, register them separately at
> GitHub/Google AND switch to a multi-host strategy (omit `NEXTAUTH_URL`,
> rely on the gateway's forwarded `Host` / `X-Forwarded-Proto` headers).
> See `src/pages/api/auth/[...nextauth].js` for the full rationale.

Secure it:

```bash
chmod 600 .env.home
```

---

## 4) Run Home Container (Using `.env.home`)

```bash
docker run -d \
  --name website-home \
  --restart unless-stopped \
  -p 8080:8080 \
  --env-file .env.home \
  website-home:latest
```

---

## 5) Verify Home Runtime

1. Confirm container is running:

```bash
docker ps
```

2. Check local response:

```bash
curl -I http://127.0.0.1:8080
```

3. From another Tailscale node, confirm tailnet reachability:

```bash
curl -I http://<HOME_UPSTREAM_HOST>:8080
```

---

## 6) Keep Home Service Private

- Do not open the app port on public internet/router.
- Allow access only over Tailscale.
- Keep Cloud Run as the only public entrypoint.

---

## 7) Keep Cloud Side in Sync

In GitHub repository secrets:

- `HOME_UPSTREAM_HOST` = home tailnet IP or MagicDNS
- `HOME_UPSTREAM_PORT` = fixed home app port (e.g., `8080`)

Then deploy edge by pushing to `main` (CI/CD workflow deploys Cloud Run).

---

## 8) Update and Re-Deploy Home Runtime

1. Rebuild image:

```bash
docker build -t website-home:latest .
```

2. Recreate container:

```bash
docker rm -f website-home
docker run -d \
  --name website-home \
  --restart unless-stopped \
  -p 8080:8080 \
  --env-file .env.home \
  website-home:latest
```

---

## 9) Troubleshooting and Operations

- View logs:

```bash
docker logs -f website-home
```

- Restart container:

```bash
docker restart website-home
```

- If edge issue occurs, use Cloud Run rollback:

```bash
gcloud run revisions list --service=blog --region=europe-west1
gcloud run services update-traffic blog --region=europe-west1 --to-revisions <previous-revision>=100
```

---

## 10) Security Notes

- Never commit `.env.home` to git.
- Add `.env.home` to local ignore if needed.
- Rotate secrets regularly (`NEXTAUTH_SECRET`, `GITHUB_TOKEN`, `OPENAI_API_KEY`).
