import { useEffect, useState } from "react";
import { getCuratedAiModels } from "../../config/ai-models";

const FETCH_URL = "/api/ai-models";

/**
 * Fetches the live AI model catalog from `/api/ai-models`, falling back to
 * the curated list when the fetch fails or returns no models.
 *
 * Behavior:
 *  - Starts with the curated list so the UI is never empty.
 *  - Skips the fetch in test environments.
 *  - Aborts in-flight requests on unmount or re-fetch.
 *
 * @returns {Array}
 */
export function useAiModelCatalog() {
  const [models, setModels] = useState(() => getCuratedAiModels());

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    if (typeof fetch !== "function") return;

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(FETCH_URL, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load models: ${response.status}`);
        }
        const data = await response.json();
        if (cancelled) return;
        if (Array.isArray(data?.models) && data.models.length > 0) {
          setModels(data.models);
        }
      } catch (err) {
        if (cancelled) return;
        if (err?.name === "AbortError") return;
        console.warn("Failed to load live model catalog, using fallback", err);
        setModels(getCuratedAiModels());
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return models;
}
