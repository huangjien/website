import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounceEffect, useLocalStorageState } from "ahooks";
import { serializeMessages, tailEquals } from "./serializeMessages";

export const AI_THREAD_KEY = "ai:conversations";

/** Maximum number of stored messages before the cap kicks in. */
export const THREAD_SOFT_CAP = 2000;

/** Days of history to keep when the cap kicks in. */
export const THREAD_RETENTION_DAYS = 30;

/** Debounce window (ms) for writing the thread on `messages` updates. */
export const THREAD_DEBOUNCE_MS = 500;

/** Debounce window (ms) for the retention sweep. */
export const THREAD_RETENTION_DEBOUNCE_MS = 5_000;

const DAY_MS = 86_400_000;

/**
 * Persistent chat thread backed by `localStorage` under `ai:conversations`.
 *
 * Responsibilities:
 *  - Return the stored thread (SSR-safe: `[]` until mounted).
 *  - Persist `messages` from `useChat` to localStorage, debounced and
 *    skipping writes while a stream is in flight. Writes are guarded by a
 *    tail comparison so identical snapshots don't loop.
 *  - Enforce a soft cap: if the stored thread exceeds `THREAD_SOFT_CAP`,
 *    drop entries older than `THREAD_RETENTION_DAYS` days.
 *
 * The page wires `messages` (from `useChat`) and `status` (also from
 * `useChat`) into this hook. The hook never calls `useChat` itself; it
 * only writes to localStorage.
 *
 * @param {{
 *   messages?: Array,
 *   status?: string,
 *   debounceMs?: number,
 *   retentionDebounceMs?: number,
 * }} [opts]
 * @returns {{
 *   thread: Array,
 *   setThread: ReturnType<typeof useLocalStorageState>[1],
 *   mounted: boolean,
 * }}
 */
export function useAiThread(opts = {}) {
  const {
    messages = [],
    status = "ready",
    debounceMs = THREAD_DEBOUNCE_MS,
    retentionDebounceMs = THREAD_RETENTION_DEBOUNCE_MS,
  } = opts;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [thread, setThread] = useLocalStorageState(AI_THREAD_KEY, {
    defaultValue: [],
  });

  // SSR-safe thread: empty until mount, then the stored value.
  const safeThread = useMemo(
    () => (mounted ? thread || [] : []),
    [mounted, thread],
  );

  // ---- Persist messages on change ---------------------------------------
  // We tail-compare against the last write to skip no-op writes and
  // bypass writes while streaming so we don't churn localStorage on
  // every chunk of a long response.
  const lastWriteRef = useRef(null);
  useDebounceEffect(
    () => {
      if (status === "streaming" || status === "submitted") return;
      const serialized = serializeMessages(messages);
      if (tailEquals(serialized, lastWriteRef.current)) return;
      lastWriteRef.current = serialized;
      setThread(serialized);
    },
    [messages, status, setThread],
    { wait: debounceMs },
  );

  // ---- Soft cap: drop entries older than retention window ---------------
  useDebounceEffect(
    () => {
      const list = thread;
      if (!Array.isArray(list) || list.length <= THREAD_SOFT_CAP) return;
      const cutoff = Math.floor(
        (Date.now() - THREAD_RETENTION_DAYS * DAY_MS) / 1000,
      );
      const filtered = list.filter((item) => (item?.timestamp || 0) > cutoff);
      if (filtered.length === list.length) return;
      lastWriteRef.current = serializeMessages(messages);
      setThread(filtered);
    },
    [thread, messages, setThread],
    { wait: retentionDebounceMs },
  );

  return { thread: safeThread, setThread, mounted };
}
