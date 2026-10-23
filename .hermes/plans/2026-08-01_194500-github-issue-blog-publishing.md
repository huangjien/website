# GitHub Issue Blog Publishing Implementation Plan

> **For implementation:** Execute task-by-task with TDD and independent review before commit.

**Goal:** Allow an explicitly authorized author to compose Markdown in the website, publish it as a GitHub Issue with the `blog` label, and immediately surface the new article on the homepage.

**Architecture:** Keep GitHub Issues as the single source of truth. Add a dedicated protected `/write` page that reuses the existing editor behavior but calls a hardened publishing contract. Authorization must be enforced server-side with an environment allowlist; successful publication returns the created issue and triggers a deterministic client refresh. Do not add a database or duplicate content store.

**Tech Stack:** Next.js Pages Router, NextAuth v4, GitHub Issues REST API, React, Jest + Testing Library.

## Product contract

### Publishing states

- **Draft:** client-side only for MVP, stored under a versioned localStorage key. Draft never carries the `blog` label and never calls GitHub.
- **Publish:** creates one GitHub Issue with the `blog` label plus selected category labels. The GitHub Issue is the canonical published artifact.
- **No hidden pseudo-draft issue state in MVP:** using an open Issue without `blog` as draft complicates recovery, listing, and permissions without enough value.

### Authorization

- Authentication is necessary but not sufficient.
- Introduce `BLOG_AUTHOR_EMAILS` as a comma-separated server-only allowlist.
- Normalize email with trim + lowercase and compare exact values.
- `/api/issues` POST must reject:
  - no session → `401`
  - authenticated but not allowlisted → `403`
- UI visibility is only convenience; the server remains authoritative.
- Do not expose `BLOG_AUTHOR_EMAILS` through `NEXT_PUBLIC_*` variables or session payloads.

### Publish request

```json
{
  "title": "Article title",
  "body": "# Markdown body",
  "labels": ["programming", "devops"]
}
```

The server, not the client, injects the mandatory `blog` label and de-duplicates labels. This prevents accidental creation of a non-blog Issue and prevents clients from controlling the publishing invariant.

### Publish response

Preserve the current GitHub Issue payload, including at least:

```json
{
  "id": 123,
  "number": 61,
  "title": "Article title",
  "html_url": "https://github.com/.../issues/61",
  "labels": [{ "name": "blog" }]
}
```

After success, the editor shows a success state with the Issue URL and navigates to `/` only after the user chooses “View article” or after an explicit short countdown. Avoid silently closing the dialog without feedback.

## Task 1: Add a reusable server-side author policy

**Objective:** Centralize exact author allowlist parsing and authorization.

**Files:**

- Create: `src/lib/blogAuthor.js`
- Create: `src/lib/__tests__/blogAuthor.test.js`
- Modify: `.env.local.example`
- Modify: `README.md`

**Tests first:**

1. Missing/empty `BLOG_AUTHOR_EMAILS` authorizes nobody (fail closed).
2. Matching is case-insensitive and trims whitespace.
3. Non-matching or missing session email is rejected.
4. Multiple comma-separated authors work.

**Implementation shape:**

```javascript
export function parseBlogAuthorEmails(value) { ... }
export function isBlogAuthor(session, value = process.env.BLOG_AUTHOR_EMAILS) { ... }
```

**Verification:**

```bash
pnpm test src/lib/__tests__/blogAuthor.test.js
```

## Task 2: Harden `POST /api/issues` for publishing

**Objective:** Ensure only authorized authors can use the server GitHub token to publish and ensure every published Issue has `blog`.

**Files:**

- Modify: `src/pages/api/issues.js`
- Modify: `src/__tests__/api/issues.test.js`

**Tests first:**

1. Anonymous POST returns `401`.
2. Authenticated non-author POST returns `403` and does not call GitHub.
3. Authorized author POST succeeds.
4. Server adds `blog` when client sends no labels.
5. Server adds and de-duplicates `blog` when categories are supplied.
6. Existing title/body/label length and rate-limit tests continue to pass.
7. GET remains public and unchanged.

**Implementation details:**

- Check `isBlogAuthor(session)` immediately after session validation and before rate limiting/upstream calls.
- Add a canonical `AuthorizationError`/`ApiError` with status `403` according to existing error utilities.
- Normalize labels server-side:

```javascript
const labels = [...new Set(["blog", ...(requestedLabels || [])])];
```

- Keep title `1..200`, body `<=65536`, labels `<=20`, label length `<=50`.
- Continue using `fetchWithTimeout` and mutation telemetry.

**Verification:**

```bash
pnpm test src/__tests__/api/issues.test.js
```

## Task 3: Add an author-capability endpoint

**Objective:** Let the UI determine whether to show the writing surface without leaking the allowlist.

**Files:**

- Create: `src/pages/api/author.js`
- Create: `src/__tests__/api/author.test.js`

**Contract:**

```json
{ "authenticated": true, "canPublish": true }
```

- Anonymous request returns `200` with both false, or `401`; prefer `200` for simple navigation gating.
- Authenticated non-author returns `{ authenticated: true, canPublish: false }`.
- Never return configured emails.

**Verification:**

```bash
pnpm test src/__tests__/api/author.test.js
```

## Task 4: Build the author-facing Blog Studio UI

**Objective:** Deliver a first-class UI for creating a new blog article. This is the primary product surface, not an optional wrapper around the API.

**Files:**

- Create: `src/pages/write.js`
- Create: `src/__tests__/pages/write.test.js`
- Create: `src/components/BlogEditor.js`
- Create: `src/components/__tests__/BlogEditor.test.js`
- Refactor: `src/components/IssueModal.js` only if shared editor helpers are genuinely reusable

**Desktop layout:**

```text
┌──────────────────────────────────────────────────────────────────┐
│ New blog                 Draft saved 20:41   [Save] [Publish]    │
├──────────────────────────────────┬───────────────────────────────┤
│ Title                            │ Preview                       │
│ [_____________________________]  │ Article title                 │
│                                  │                               │
│ Categories                       │ Rendered Markdown...           │
│ [programming] [devops] [AI]      │                               │
│                                  │                               │
│ Markdown editor                  │                               │
│ # Introduction...                │                               │
│                                  │                               │
└──────────────────────────────────┴───────────────────────────────┘
```

**Mobile layout:**

- Single column.
- `Write` / `Preview` tabs instead of side-by-side panes.
- Sticky bottom action bar with `Save draft` and `Publish`.

**UI behavior:**

1. Loading capability → skeleton/loading state.
2. Anonymous → sign-in CTA.
3. Authenticated non-author → explicit `403`-style message.
4. Author → title, Markdown body, category labels, preview, Save draft, Publish.
5. `blog` is not user-toggleable; show a small “Published as blog” invariant note.
6. Publish button disabled while submitting; existing duplicate-submit protection remains.
7. Before publish, show a confirmation dialog summarizing title and labels.
8. Success shows Issue number, GitHub URL, and actions: `View article` / `Open in GitHub`.
9. Failure keeps all editor state and displays an actionable inline error.
10. Warn before navigating away when unsaved changes exist.

**Draft behavior:**

- Versioned localStorage key: `blog_draft_v1`.
- Store `{ title, body, labels, savedAt }`.
- Restore on mount.
- Autosave with a short debounce and show `Saving…` / `Saved at HH:mm` status.
- Clear only after confirmed successful publish.
- Never autosubmit.

**Label behavior:**

- MVP: retain the known category set (`programming`, `devops`, `testing`, `novel`, `AI`, etc.) but exclude mandatory `blog` from user choices.
- Follow-up: fetch authenticated repository labels from `/api/labels` and filter out administrative labels (`settings`, bot labels). Do not block MVP on this.

**Explicitly not in MVP UI:**

- Slug field (GitHub Issue number is the identity).
- SEO panel or database metadata.
- Image upload hosting.
- Scheduled publish.
- AI-generated draft. This can be added later as an opt-in assistant without blocking manual authoring.

**Verification:**

```bash
pnpm test src/__tests__/pages/write.test.js src/components/__tests__/BlogEditor.test.js src/components/__tests__/IssueModal.test.js
```

## Task 5: Add author-only navigation

**Objective:** Make `/write` discoverable only for an authorized author while keeping direct route protection.

**Files:**

- Modify: `src/components/NavigationBar.js`
- Modify: `src/components/MobileMenu.jsx`
- Modify: corresponding component tests
- Modify: `src/config/site` only if footer inclusion is desired (not recommended for author-only action)

**Behavior:**

- Fetch/calculate `canPublish` once in a small hook such as `src/lib/useAuthorCapability.js`.
- Show “Write” in desktop and mobile nav only when `canPublish` is true.
- Direct `/write` access still checks capability.
- Do not show it in the public footer.

## Task 6: Refresh homepage deterministically after publish

**Objective:** Ensure a newly created Issue becomes visible without stale localStorage masking it.

**Files:**

- Modify: `src/lib/useGithubContent.js`
- Modify: `src/lib/__tests__/useGithubContent.test.js`
- Modify: `src/pages/write.js` or `src/components/BlogEditor.js`

**Recommended mechanism:**

- Stop relying on persistent `localStorage["issues"]` as the source displayed after a successful publish.
- Expose a `refresh`/`mutate` path from `useGithubContent`, or use a versioned invalidation key.
- On publish success:
  1. remove/invalidate cached Issues;
  2. navigate to `/?published=<issueNumber>`;
  3. homepage forces one fresh `/api/issues` fetch;
  4. highlight/open the new issue if present.

**Important dependency:** The public homepage must have deterministic public defaults for `blog.labels` and `blog.content`; otherwise anonymous viewing remains empty. Resolve this in the same change or first, using server/public constants rather than authenticated settings.

**Tests first:**

1. Publish success invalidates stale issue cache.
2. Homepage fresh fetch includes the created issue.
3. Failed publish does not clear the draft or existing cache.
4. README failure cannot suppress successful issue loading (decouple the current `Promise.all` because homepage does not use README).

## Task 7: Full validation and operational checks

**Objective:** Verify the author workflow without publishing a real public article during automated tests.

**Automated:**

```bash
pnpm lint
pnpm format:check
pnpm type-check
pnpm test
pnpm build
```

**Manual staging checklist:**

1. Anonymous user cannot see Write and cannot POST.
2. Logged-in non-author cannot see Write; direct `/write` shows forbidden; forged POST returns 403.
3. Allowlisted author can save/reload a local draft.
4. Publish creates exactly one Issue with `blog` plus selected categories.
5. Success UI links to the created GitHub Issue.
6. Homepage refresh displays the article.
7. Markdown, images, code fences, Chinese text, and long content render correctly.
8. Double-click creates only one request; note that strict network retry idempotency is a follow-up unless an idempotency key is added.
9. Revoke the test Issue or use a dedicated test repository for staging.

## Risks and tradeoffs

1. **Current GitHub token is powerful:** server-side author allowlist is mandatory. Authentication alone is unsafe.
2. **Email identity:** GitHub OAuth may not expose email for private-email accounts; Google and GitHub can also produce different emails. If this becomes a problem, add provider/account identity to the JWT and authorize by `provider + providerAccountId` rather than weakening the policy.
3. **GitHub Issue is immediately public:** MVP has no server-side review queue. Local draft protects against accidental early publication but not editorial review.
4. **GitHub API pagination:** homepage currently reads the default first 30 open issues. Add explicit `state=open&per_page=100`, then pagination when content exceeds 100.
5. **Duplicate creation on ambiguous timeout:** UI duplicate-submit protection does not handle “GitHub created it but response was lost.” A later phase can add an idempotency key marker and search before retry.
6. **Raw HTML Markdown:** `rehypeRaw` allows raw HTML. Existing `sanitizeMarkdown` is not a full HTML sanitizer. Treat author access as trusted; separately harden rendering with a sanitize schema if untrusted authors are ever allowed.

## Deliberately deferred

- GitHub Issue editing via PATCH.
- Image upload/attachment hosting.
- Scheduled publishing.
- Multi-author roles stored in a database.
- Review/approval workflow.
- GitHub webhook-driven cache invalidation.

These are valuable only after the secure single-author publish loop works end-to-end.
