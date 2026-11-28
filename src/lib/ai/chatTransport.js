import { DefaultChatTransport } from "ai";

/**
 * Build the chat transport for the AI page. Memoize the result in the
 * caller so the transport instance only changes when one of the
 * settings that affect the request body changes.
 *
 * The transport sends the latest `model`, `temperature`, and `system`
 * prompt by reading them from a settings object captured at construction
 * time. Callers should re-create the transport when any of these change.
 *
 * When the server fails over to another model after a usage limit
 * (`X-AI-Fallback-From` response header), `onModelFallback` is invoked
 * with `{ from, servedBy }` so the UI can surface a notice.
 *
 * @param {{ model?: string, temperature?: number | string, systemPrompt?: string } | null | undefined} settings
 * @param {((info: { from: string, servedBy: string }) => void) | null | undefined} onModelFallback
 * @returns {DefaultChatTransport}
 */
export function createChatTransport(settings, onModelFallback) {
  const safe = settings || {};

  return new DefaultChatTransport({
    api: "/api/chat",
    async fetch(input, init) {
      const response = await fetch(input, init);
      try {
        const from = response.headers.get("x-ai-fallback-from");
        const servedBy = response.headers.get("x-ai-model");
        if (from && servedBy && onModelFallback) {
          onModelFallback({ from, servedBy });
        }
      } catch (error) {
        // Header inspection must never break the stream.
        console.warn("Failed to inspect chat response headers", error);
      }
      return response;
    },
    prepareSendMessagesRequest: ({ messages }) => ({
      body: {
        messages,
        model: safe.model,
        temperature: parseFloat(safe.temperature ?? 1),
        system: safe.systemPrompt || undefined,
      },
    }),
  });
}

/**
 * Dependency key for memoizing a chat transport. Stable across renders
 * unless one of the inputs that actually affects the request body changes.
 *
 * @param {{ model?: string, temperature?: number | string, systemPrompt?: string } | null | undefined} settings
 * @returns {string}
 */
export function transportDeps(settings) {
  const s = settings || {};
  return `${s.model || ""}|${Number(s.temperature ?? 1)}|${s.systemPrompt || ""}`;
}
