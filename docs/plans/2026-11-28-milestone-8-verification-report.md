# Milestone 8 Verification Report: Build Gate, AI Removal, Cloudflare, Article Images, Open Publishing, Article Index

**Date:** 2026-11-28
**Plan:** `docs/plans/2026-11-28-milestone-8-implementation-plan.md`
**Branch:** `main`
**Commits:** `e941b3e` → `352b624`

## Summary

Six phases executed. 96 of 115 tasks are done. The remaining 19 tasks need your accounts: the Cloudflare login and secrets, the preview deployment, the Workers Builds connection, the DNS cutover, the retirement of the old deployment files, and three smoke tests that need runtime secrets.

| Phase                                    | Result                  | Commit    |
| ---------------------------------------- | ----------------------- | --------- |
| 35 Build gate and CI cleanup             | done                    | `e941b3e` |
| 36 Remove the AI tab and all AI features | done                    | `352b624` |
| 37 Cloudflare Workers via OpenNext       | code done, cutover left | `457225f` |
| 38 Display images in articles            | done                    | `5b2b48d` |
| 39 Any signed-in user can add an article | done                    | `9d9ef4a` |
| 40 Article index sidebar                 | done                    | `3e81b71` |

## Gate results

| Gate                                    | Before                 | After                                                                  |
| --------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `pnpm lint`                             | 0 errors, 0 warnings   | 0 errors, 0 warnings                                                   |
| `pnpm format:check`                     | clean                  | clean                                                                  |
| `pnpm type-check`                       | clean                  | clean                                                                  |
| `pnpm check:i18n-parity`                | 0 hard failures        | 0 hard failures                                                        |
| `pnpm test`                             | 100 suites, 1236 tests | 77 suites, 986 tests                                                   |
| `pnpm build`                            | failed on Node 26      | passes in about 22 s on Node 24                                        |
| `pnpm exec opennextjs-cloudflare build` | -                      | passes in 26 s, Worker 2216 bytes, bundle 10.2 MB raw and 2.06 MB gzip |
| `pnpm exec wrangler deploy --dry-run`   | -                      | passes without credentials                                             |
| CI (`CID.yaml`)                         | red on the deploy step | green on `e941b3e` and `457225f`                                       |

The test count fell because the AI suites were removed with the AI code: 24 test files, 250 tests.

## Phase 35: Build gate and CI cleanup

- The default Node on this machine was Homebrew Node 26.13.1. `pnpm build` failed there after 3 s with `TypeError: Cannot read properties of undefined (reading 'length')` in `BatchedHash.update` during the Serwist service worker bundle. The same commit built in 24.6 s under Node 24.22.3.
- `fnm` 1.39.0 is installed and Node 24.22.3 lives in its store. `~/.zshenv`, `~/.zprofile`, and `~/.zshrc` evaluate `fnm env --use-on-cd`, so the repository picks Node 24 from `.nvmrc` and every other project keeps the system Node.
- `.husky/pre-commit` now runs four steps: a Node version check against `.nvmrc`, lint-staged, the test suite, and `pnpm build`. The build writes to a log file and prints the last 40 lines when it fails.
- Both gate steps were proven: a broken import refused the commit with the webpack error, and Node 26 refused the commit with `Node 24 is required (.nvmrc), found v26.13.1`.
- A stale build cache breaks the build with a confusing `Cannot read properties of undefined (reading length)` error in the hash step of the service worker bundle. The hook now clears `.next/cache` and `public/sw.js` and retries the build once before it refuses the commit.
- The GCP deploy job was removed from `.github/workflows/CID.yaml`. CI is green for the first time since that job was added.

## Phase 36: Remove the AI tab and all AI features

- The tag `lastAiTab` (message `before remove ai tab`) points at `2fa7670`, the last commit that still contains the AI code. It is on origin.
- 55 tracked files deleted: 26 source files, 25 test files, and 4 screenshots. 9234 lines removed in one commit.
- The npm packages `@ai-sdk/openai`, `@ai-sdk/react`, `ai`, `openai`, `http-proxy`, and `zod` are gone from `package.json` and the lockfile. The `zod` release-age override stays because zod is still in the tree through Serwist and Lighthouse.
- The `ai`, `chat`, and `tts_button` translation groups are gone from all 12 locale files, along with `header.ai`, `settings.select_voice`, and `settings.voice_note`. The TTS voice fields are gone from the language list in `src/locales/i18n.js`.
- Smoke test on the dev server: `/ai`, `/api/chat`, `/api/tts`, `/api/transcribe`, and `/api/ai-models` all answer 404. Home, About, Settings, and Write answer 200. The navigation has no AI entry and the home page HTML holds no AI string.

## Phase 37: Cloudflare Workers via OpenNext

- `@opennextjs/cloudflare` 1.20.19 and `wrangler` 4.168.0 are installed. The adapter peer range `next >=16.4.5` matches the installed Next 16.4.6.
- `wrangler.jsonc`, `open-next.config.ts`, and the `preview`, `deploy`, `upload`, and `cf-typegen` scripts are in place. The Worker is named `blog`.
- The local preview runs the app in the Workers runtime. Every route answers 200: `/`, `/about`, `/settings`, `/api/health`, `/robots.txt`, `/manifest.json`, and `/sw.js`.
- Two server changes for the Workers runtime:
  - `src/pages/api/image-proxy.js` no longer writes to disk. It uses the Cache API through `caches.default` and falls back to an in-memory map where the runtime has no cache.
  - `getClientIp` in `src/lib/apiClient.js` reads `cf-connecting-ip` first, so the rate limits see the real client address on Workers.
- `next.config.js` sets `images.unoptimized: true`, because Workers have no Next.js image optimizer. ESLint and Prettier ignore `.open-next` and `.wrangler`.

## Phase 38: Display images in articles

Root cause, confirmed against the live data: a GitHub attachment in a private repository answers 404 without a token and 302 to `github-production-user-asset-6210df.s3.amazonaws.com` with one. Neither the Next.js optimizer nor the image proxy allowed that host, so every attachment failed. The three YouTube thumbnails failed for the same reason on the host allowlist.

- The proxy allowlist now covers every `githubusercontent.com` subdomain, the attachment bucket, `img.youtube.com`, and `i.ytimg.com`.
- `SmartImage` sends private attachments straight to the proxy, and for every other source it tries the image, then the proxy, then the same image as a plain element that skips the optimizer.
- Smoke test on the Workers runtime: a YouTube thumbnail answers 200 `image/jpeg` with `X-Cache: MISS` and then `X-Cache: HIT`.
- Correction to the plan: 6 of the 7 real article images fail today, not 7. The SVG in article #38 is served without the optimizer and most likely renders already.

## Phase 39: Any signed-in user can add an article

- `POST /api/issues` needs a session, no longer an allowlisted email. `/api/author` returns `canPublish` for every signed-in user. `isBlogAuthor` is gone; `parseBlogAuthorEmails` stays for the local dev session endpoint.
- The controls stay: 401 without a session, 10 issues per hour per user, title and body limits, at most 20 labels, the mandatory `blog` label, and the telemetry events.
- The "This studio is private" state and the "private" wording are gone.

## Phase 40: Article index sidebar

- `src/components/ArticleIndex.js` lists the titles of the articles on the page. Clicking a title opens that article and scrolls to it. The sidebar shows at 1024 px and wider and follows the search box and the pagination.
- `Issue` takes a controlled `open` prop, and `IssueList` holds the open id and gives every article a stable anchor id.
- The locale files carry the title in seven languages. The component falls back to "Contents" when a key is missing.
- The index page chunk is 25.2 kB and the client chunks total 1.3 MB. Next.js 16 no longer prints a per-route First Load JS summary, so the planned before and after comparison is not available from the build output. The sidebar adds one component and no dependency.

## Risks that remain

1. The complete sign-in flow can only be tested after the cutover. The GitHub OAuth app has one callback URL, and it points at the production hostname.
2. The Workers Free plan allows 10 ms of CPU per request. Whether a Next.js request fits has to be seen in the logs on the preview URL.
3. The image proxy cache has no eviction. On Workers it lives in the Cloudflare cache; on Node it lives in memory.
4. The Worker bundle is 2.06 MB gzip, below the 10 MB paid limit and above the 3 MB free limit.
5. The old GCP deploy was already broken, so a rollback returns to the Cloud Run revision that runs now, not to new code.

## Commits

| Commit    | Message                                                 |
| --------- | ------------------------------------------------------- |
| `e941b3e` | add build gate to pre-commit, remove gcp deploy from ci |
| `457225f` | deploy on cloudflare workers with opennext              |
| `5b2b48d` | fix article images                                      |
| `9d9ef4a` | allow signed-in users to add articles                   |
| `3e81b71` | add article index sidebar                               |
| `5174103` | feat(ai): chat failover between models                  |
| `2fa7670` | docs: milestone 8 implementation plan                   |
| `352b624` | remove ai tab and features                              |

`5174103` holds the work of a second session that was in progress on the AI chat when this plan started. It is kept in history so that nothing is lost, and `352b624` removes it again with the rest of the AI code.
