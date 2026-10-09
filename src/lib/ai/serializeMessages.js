/**
 * Pure serialization helpers for AI messages.
 *
 * AI SDK v5 UI messages have a `parts: [{ type: 'text', text: '...' }]` shape.
 * For localStorage we flatten to `{ id, role, content, timestamp }` so the
 * stored payload is small, stable across AI SDK versions, and easy to
 * reason about.
 */

/**
 * Extract displayable text from a UI message.
 * Tries the v5 `parts` shape first, then falls back to legacy `content`
 * or `text` for compatibility with older saved data.
 *
 * @param {object | null | undefined} message
 * @returns {string}
 */
export function uiMessageText(message) {
  if (!message) return "";
  if (Array.isArray(message.parts)) {
    return message.parts
      .map((p) => (p && p.type === "text" ? p.text || "" : ""))
      .join("");
  }
  if (typeof message.content === "string") return message.content;
  if (typeof message.text === "string") return message.text;
  return "";
}

/**
 * Convert a UI message into the compact persisted shape.
 * `@param {object | null | undefined} message
 * @returns {{ id: string, role: string, content: string, timestamp: number } | null}
 */
export function toStoredMessage(message) {
  if (!message || !message.role) return null;
  return {
    id: message.id,
    role: message.role,
    content: uiMessageText(message),
    timestamp:
      toUnixSeconds(message.createdAt) ?? Math.floor(Date.now() / 1000),
  };
}

/**
 * Serialize an array of UI messages for persistence.
 * @param {Array} messages
 * @returns {Array<{ id: string, role: string, content: string, timestamp: number }>}
 */
export function serializeMessages(messages) {
  return (messages || []).map(toStoredMessage).filter(Boolean);
}

/**
 * Convert a stored message back into the v5 UI message shape that
 * `useChat` understands.
 *
 * @param {{ id?: string, role?: string, content?: string }} m
 * @returns {{ id: string, role: string, parts: Array<{ type: 'text', text: string }> }}
 */
export function hydrateMessage(m) {
  return {
    id: m.id || Math.random().toString(36).slice(2),
    role: m.role,
    parts: [{ type: "text", text: String(m.content || "") }],
  };
}

/**
 * @param {Array} serialized
 * @returns {Array}
 */
export function hydrateMessages(serialized) {
  return (serialized || []).map(hydrateMessage);
}

/**
 * Tail-compare two serialized message arrays. Returns true if their length
 * matches and the last entry (id + content) is identical. Used to skip
 * no-op writes to localStorage when a debounced persistence effect fires.
 *
 * @param {Array | null} a
 * @param {Array | null} b
 * @returns {boolean}
 */
export function tailEquals(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  if (a.length === 0) return true;
  const lastA = a[a.length - 1];
  const lastB = b[b.length - 1];
  return lastA.id === lastB.id && lastA.content === lastB.content;
}

/**
 * Convert a Date / number / null / undefined timestamp into unix seconds.
 * Heuristic: values below 1e12 are interpreted as seconds, above as ms.
 * @param {Date | number | string | null | undefined} value
 * @returns {number | null}
 */
export function toUnixSeconds(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? Math.round(ms / 1000) : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value : Math.round(value / 1000);
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? Math.round(parsed / 1000) : null;
  }
  return null;
}
