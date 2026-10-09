import { toUnixSeconds } from "./serializeMessages";

/**
 * Resolve a timestamp value to unix seconds, accepting both AI SDK v5
 * (`createdAt`) and legacy localStorage (`timestamp`) shapes, plus Date
 * and ISO string inputs.
 *
 * @param {Date | number | string | null | undefined} value
 * @returns {number | null}
 */
export function resolveTimestamp(value) {
  return toUnixSeconds(value);
}

/**
 * Pick a displayable timestamp (in unix seconds) from a message, falling
 * back through `createdAt`, `timestamp`, and finally the current time.
 * Always returns a finite number.
 *
 * @param {object | null | undefined} message
 * @returns {number}
 */
export function messageTimestamp(message) {
  if (!message) return Math.floor(Date.now() / 1000);
  return (
    resolveTimestamp(message.createdAt) ??
    resolveTimestamp(message.timestamp) ??
    Math.floor(Date.now() / 1000)
  );
}

/**
 * Format a message timestamp for display. Pure function — pass `t` for
 * i18n keys, fall back to English defaults if a key is missing.
 *
 * @param {Date | number | string | null | undefined} value
 * @param {{ (key: string, opts?: object): string } | undefined} t
 * @param {{ now?: () => number }} [opts]
 * @returns {string}
 */
export function formatTimestamp(value, t, opts = {}) {
  const seconds = resolveTimestamp(value);
  if (seconds == null) return "";

  const date = new Date(seconds * 1000);
  const now = opts.now ? opts.now() : Date.now();
  const diffMs = now - seconds * 1000;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  const tr = (key, fallback) => (t && t(key)) || fallback;

  if (diffMins < 1) return tr("ai.timestamp_now", "Just now");
  if (diffMins < 60) {
    return `${diffMins} ${tr("ai.timestamp_mins_ago", "min(s) ago")}`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${tr("ai.timestamp_hours_ago", "h(s) ago")}`;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Format a timestamp from a message object, picking `createdAt` first and
 * falling back to `timestamp` (the legacy localStorage shape). This is
 * the helper the page renders next to each message bubble.
 *
 * @param {object | null | undefined} message
 * @param {{ (key: string, opts?: object): string } | undefined} t
 * @param {{ now?: () => number }} [opts]
 * @returns {string}
 */
export function formatMessageTimestamp(message, t, opts = {}) {
  const seconds = messageTimestamp(message);
  return formatTimestamp(seconds, t, opts);
}
