import { FAILOVER_POLICY } from "../../config/ai-models";

/**
 * Model failover policy state and helpers for /api/chat.
 *
 * When the requested model rejects a request with a usage-limit error
 * (429 rate limit, quota exhaustion, provider overload), the handler
 * retries the next healthy model from the curated catalog. Cooldowns are
 * held in an in-memory Map — the same trade-off as lib/rateLimit.js.
 */

const RATE_LIMIT_COOLDOWN_MS = 60 * 1000;
const OVERLOADED_COOLDOWN_MS = 30 * 1000;
const QUOTA_COOLDOWN_MS = 30 * 60 * 1000;
const MAX_RETRY_AFTER_MS = 5 * 60 * 1000;

const sharedCooldownState = createCooldownState();

export function createCooldownState() {
  return new Map();
}

export function getSharedCooldownState() {
  return sharedCooldownState;
}

export function isHealthy(state, modelId, now = Date.now()) {
  const entry = state.get(modelId);
  return !entry || entry.openUntil <= now;
}

/**
 * Ordered failover chain: requested model, then same-tier models, then
 * the remaining catalog order — skipping models in cooldown, capped at
 * policy.maxCandidates.
 */
export function resolveChain(
  requestedModel,
  catalog,
  state,
  now = Date.now(),
  policy = FAILOVER_POLICY,
) {
  const requested = catalog.find((model) => model.id === requestedModel);
  const candidates = [];
  if (requested && isHealthy(state, requested.id, now)) {
    candidates.push(requested.id);
  }

  const rest = catalog.filter((model) => model.id !== requestedModel);
  const sameTier = requested
    ? rest.filter((model) => model.tier === requested.tier)
    : [];
  const ordered = [...sameTier, ...rest];
  for (const model of ordered) {
    if (candidates.length >= policy.maxCandidates) break;
    if (!isHealthy(state, model.id, now)) continue;
    candidates.push(model.id);
  }
  return candidates;
}

/**
 * Classify a provider error to decide failover behavior.
 * Reads structured fields only (statusCode / parsed body), never messages.
 */
export function classifyProviderError(error) {
  const status = error?.statusCode;
  const type = error?.data?.error?.type ?? error?.data?.type;

  if (status === 429 && type === "insufficient_quota") {
    return { kind: "quota", cooldownMs: QUOTA_COOLDOWN_MS };
  }
  if (status === 429) {
    const retryAfterSeconds = Number(error?.responseHeaders?.["retry-after"]);
    const cooldownMs =
      Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? Math.min(retryAfterSeconds * 1000, MAX_RETRY_AFTER_MS)
        : RATE_LIMIT_COOLDOWN_MS;
    return { kind: "rate_limit", cooldownMs };
  }
  if (Number.isInteger(status) && status >= 500) {
    return { kind: "overloaded", cooldownMs: OVERLOADED_COOLDOWN_MS };
  }
  return { kind: "other", cooldownMs: 0 };
}

/**
 * Record a cooldown for a failed model. Quota exhaustion is key-level
 * (the whole curated catalog shares one API key), so cool every model.
 */
export function recordCooldown(state, failedModelId, verdict, catalog) {
  const ids =
    verdict.kind === "quota"
      ? catalog.map((model) => model.id)
      : [failedModelId];
  for (const id of ids) {
    state.set(id, {
      kind: verdict.kind,
      openUntil: Date.now() + verdict.cooldownMs,
    });
  }
}
