import { useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "ahooks";
import { DEFAULT_AI_MODEL } from "../../config/ai-models";

export const AI_SETTINGS_KEY = "ai:settings";

export const DEFAULT_AI_SETTINGS = Object.freeze({
  model: DEFAULT_AI_MODEL,
  temperature: 1,
  trackSpeed: 300,
  ttsVoice: "alloy",
  systemPrompt: "",
});

/**
 * Persistent AI page settings backed by `localStorage` under `ai:settings`.
 *
 * Returns SSR-safe defaults until the component mounts; then exposes the
 * stored values. The merged `settings` object is always a complete shape
 * (defaults fill in any missing keys from older payloads).
 *
 * @returns {{
 *   settings: typeof DEFAULT_AI_SETTINGS,
 *   setSettings: ReturnType<typeof useLocalStorageState>[1],
 *   mounted: boolean,
 * }}
 */
export function useAiSettings() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [stored, setStored] = useLocalStorageState(AI_SETTINGS_KEY, {
    defaultValue: DEFAULT_AI_SETTINGS,
  });

  const settings = useMemo(() => {
    if (!mounted) return DEFAULT_AI_SETTINGS;
    return { ...DEFAULT_AI_SETTINGS, ...(stored || {}) };
  }, [mounted, stored]);

  return { settings, setSettings: setStored, mounted };
}
