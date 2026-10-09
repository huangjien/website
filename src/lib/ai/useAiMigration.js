import { useEffect, useRef } from "react";

/** Legacy localStorage keys that predate the `ai:*` namespace. */
export const LEGACY_KEYS = [
  "QandA",
  "LastAnswer",
  "ai-model",
  "ai-temperature",
  "ai-elements/conversations",
  "ai-elements/settings",
];

/**
 * One-time migration of legacy localStorage keys into the `ai:*` namespace.
 *
 * Behavior:
 *  - Runs once on mount, after `useAiThread` has hydrated (so we know
 *    whether the user already has data in the new namespace).
 *  - If the new namespace is non-empty, just removes the legacy keys.
 *  - Otherwise, tries the legacy conversation shape first, then the older
 *    QandA shape, populating the new namespace with the first match.
 *  - Always removes the legacy keys after the attempt, even if migration
 *    was a no-op.
 *
 * Idempotent: re-running the effect is a no-op because legacy keys have
 * already been cleared.
 *
 * @param {{
 *   ready?: boolean,
 *   thread?: Array,
 *   setThread?: (next: Array | ((prev: Array) => Array)) => void,
 * }} [opts]
 */
export function useAiMigration({ ready = true, thread = [], setThread } = {}) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (!ready || !setThread) return;
    if (ranRef.current) return;
    ranRef.current = true;

    if (Array.isArray(thread) && thread.length > 0) {
      removeLegacyKeys();
      return;
    }

    const fromConv = readLegacyConversations();
    if (fromConv) {
      setThread(fromConv);
      removeLegacyKeys();
      return;
    }

    const fromQandA = readLegacyQandA();
    if (fromQandA) {
      setThread((prev) =>
        Array.isArray(prev) && prev.length ? prev : fromQandA,
      );
    }

    removeLegacyKeys();
  }, [ready, thread, setThread]);
}

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to read legacy localStorage key "${key}":`, err);
    return null;
  }
}

function readLegacyConversations() {
  const legacyConvs = readJSON("ai-elements/conversations");
  if (!Array.isArray(legacyConvs) || legacyConvs.length === 0) return null;
  const latest = legacyConvs[0]?.messages;
  if (!Array.isArray(latest) || latest.length === 0) return null;
  const now = Math.floor(Date.now() / 1000);
  return latest
    .filter((m) => m && m.role && (m.content || m.content === ""))
    .map((m) => ({
      id: m.id || Math.random().toString(36).slice(2),
      role: m.role,
      content: typeof m.content === "string" ? m.content : "",
      timestamp: m.timestamp || now,
    }));
}

function readLegacyQandA() {
  const legacyQandA = readJSON("QandA");
  if (!Array.isArray(legacyQandA) || legacyQandA.length === 0) return null;
  const now = Math.floor(Date.now() / 1000);
  return legacyQandA.flatMap((item) => {
    if (!item) return [];
    const userId = item.id || Math.random().toString(36).slice(2);
    const assistantId = Math.random().toString(36).slice(2);
    const ts = item.timestamp || now;
    return [
      { id: userId, role: "user", content: item.question || "", timestamp: ts },
      {
        id: assistantId,
        role: "assistant",
        content: item.answer || "",
        timestamp: ts,
      },
    ];
  });
}

function removeLegacyKeys() {
  for (const key of LEGACY_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`Failed to remove legacy localStorage key "${key}":`, err);
    }
  }
}
