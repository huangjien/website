# Personal Website

> A modern, full-featured personal website and blog built with Next.js

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=flat-square&logo=tailwind-css)

A production-ready personal website featuring multilingual support, authentication, dark mode, and AI-powered capabilities. Deployed on Google Cloud Run.

## 🚀 Features

| Category    | Features                                               |
| ----------- | ------------------------------------------------------ |
| **Core**    | Multi-language support (i18n), Dark/Light theme        |
| **Auth**    | GitHub & Google OAuth authentication via NextAuth.js   |
| **Content** | Blog posts, Comments system, Issue tracking            |
| **AI**      | AI chat assistant, Text-to-speech, Voice transcription |
| **PWA**     | Progressive Web App with service worker                |
| **Testing** | 900+ unit tests with Jest                              |

## 🛠 Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend          │  Backend           │  Infrastructure  │
├────────────────────┼────────────────────┼──────────────────┤
│  Next.js 16        │  Next.js API       │  Google Cloud    │
│  React 19          │  Node.js           │  Cloud Run       │
│  TypeScript        │  NextAuth.js       │  Docker          │
│  Tailwind CSS      │  Jest              │  GitHub Actions  │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/huangjien/website.git

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 🔧 Configuration

Configure environment variables:

```bash
# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# GitHub API (for blog content)
GITHUB_TOKEN=your-github-token
GITHUB_REPO=https://api.github.com/repos/username/repo

# AI Services
OPENAI_API_KEY=your-openai-key
```

## 🚢 Deployment Topology

Production uses a Cloud Run edge topology:

- Cloud Run custom domain and HTTPS termination
- Nginx edge runtime container
- Tailscale sidecar container
- Home-hosted Next.js container as upstream over tailnet route
- Static maintenance fallback page (`503`) if home upstream is unavailable

Required deployment secrets for CI/CD:

- `GCP_PROJECT_ID`
- `GCP_SA_KEY`
- `DOCKER_PASSWORD`
- `HOME_UPSTREAM_HOST`
- `HOME_UPSTREAM_PORT`
- Secret Manager secret named `TS_AUTHKEY`

Least-privilege IAM baseline:

- Deploy service account:
  - `roles/run.admin`
  - `roles/iam.serviceAccountUser` (runtime service account only)
  - `roles/secretmanager.secretAccessor` (only for `TS_AUTHKEY`)
- Runtime service account:
  - `roles/secretmanager.secretAccessor` (only for `TS_AUTHKEY`)

Deployment guardrails in CI:

- Required secret/value assertions before deploy
- Numeric validation for `HOME_UPSTREAM_PORT`
- Rendered manifest placeholder resolution check

Tailscale setup checklist:

1. Create tag `tag:cloud-run-edge` in Tailscale ACL policy.
2. Allow `tag:cloud-run-edge` to reach home app node on fixed app port.
3. Create ephemeral auth key scoped to the tag.
4. Store key in GCP Secret Manager as `TS_AUTHKEY`.
5. Grant Cloud Run service account Secret Manager access.
6. Set `HOME_UPSTREAM_HOST` and `HOME_UPSTREAM_PORT` in GitHub secrets.

Rollback command sequence:

```bash
gcloud run revisions list --service=blog --region=europe-west1
gcloud run services update-traffic blog --region=europe-west1 --to-revisions <previous-revision>=100
```

Proxy reliability baseline:

- Retries: 2 (3 total attempts)
- Retry statuses: 502/503/504
- Connect timeout: 3s
- Send/read timeout: 30s

Reliability simulation check:

```bash
./scripts/phase32-verify.sh
```

## 📝 License

Copyright © 2025 [Jien Huang](https://github.com/huangjien). All rights reserved.

---

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-huangjien-181717?style=flat-square&logo=github)](https://github.com/huangjien)
[![Email](https://img.shields.io/badge/Email-huangjien@gmail.com-D14836?style=flat-square&logo=gmail)](mailto:huangjien@gmail.com)
[![Website](https://img.shields.io/badge/Website-www.huangjien.com-4285F4?style=flat-square&logo=google-chrome)](https://www.huangjien.com)

</div>
