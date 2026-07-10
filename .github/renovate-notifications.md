# Renovate Notifications

The `renovate.json` is wired to POST to a webhook on **two streams**:

1. **General PR/branch events** — opened, merged, closed, errors.
2. **OSV vulnerability alerts** — higher-priority channel (filtered via `vulnerabilityAlerts: true`).

Both streams POST to the same `RENOVATE_WEBHOOK_URL` secret, so you only need
to configure one webhook endpoint. The URL is read from the GitHub secret so
the endpoint is never committed.

## Setup — Slack

1. Create an incoming webhook:
   <https://api.slack.com/messaging/webhooks>
2. In your GitHub repo, go to **Settings → Secrets and variables → Actions →
   New repository secret**.
3. Name: `RENOVATE_WEBHOOK_URL`
4. Value: paste the Slack webhook URL (looks like
   `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXX`).

That's it — Renovate will POST a JSON payload like:

```json
{
  "text": "Renovate: renovate/npm-next-20.x — Bump next from 15.1.0 to 15.1.4 (open)"
}
```

Slack auto-formats the `text` field.

## Setup — Discord

1. Channel settings → Integrations → Webhooks → **New webhook**.
2. Copy the webhook URL.
3. Same as Slack: add `RENOVATE_WEBHOOK_URL` secret with the Discord URL
   (`https://discord.com/api/webhooks/...`).
4. The Discord webhook expects the same JSON payload shape and will render the
   `text` field as a plain message.

## Setup — Generic webhook

The payload is documented by Renovate
([`webhookTemplate`](https://docs.renovatebot.com/configuration-options/#webhooktemplate)).
The current template produces:

```
Renovate: <branch> — <title>
Repo: <owner>/<repo>
State: open/merged/closed
Errors: ...
```

Any service that accepts a JSON POST and surfaces `text` / `content` will work
(MS Teams via incoming webhook, Mattermost, etc.).

## Disabling

Set `RENOVATE_WEBHOOK_URL` to an empty value, or remove the `notifications` block
from `renovate.json`.
