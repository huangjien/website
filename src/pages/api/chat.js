import { streamText, convertToCoreMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * Chat streaming endpoint using Vercel AI SDK (Pages Router, Node runtime)
 * Compatible with @ai-sdk/react useChat hook (UI Message protocol)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Ensure OpenAI API key is available in production (supports both env var names)
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY;
    if (!apiKey) {
      console.error("[api/chat] missing OpenAI API key: set OPENAI_API_KEY or OPEN_AI_KEY");
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }
    const openaiClient = createOpenAI({ apiKey });

    // Debug incoming request body to diagnose empty messages
    // Note: In production, you may want to remove or reduce this logging.
    const body = req.body ?? {};
    console.log("[api/chat] incoming body keys:", Object.keys(body || {}));
    console.log(
      "[api/chat] messages length:",
      Array.isArray(body.messages) ? body.messages.length : "n/a"
    );

    const { messages, model, temperature, system, input, prompt } = body;

    // Build core messages from UI messages, or fallback to raw input/prompt strings
    let coreMessages;
    if (Array.isArray(messages) && messages.length > 0) {
      coreMessages = convertToCoreMessages(messages);
    } else if (typeof input === "string" && input.trim().length > 0) {
      coreMessages = convertToCoreMessages([
        { role: "user", parts: [{ type: "text", text: input.trim() }] },
      ]);
    } else if (typeof prompt === "string" && prompt.trim().length > 0) {
      coreMessages = convertToCoreMessages([
        { role: "user", parts: [{ type: "text", text: prompt.trim() }] },
      ]);
    } else {
      throw new Error("Invalid prompt: messages must not be empty");
    }

    const result = await streamText({
      model: openaiClient(model || "gpt-4o-mini"),
      messages: coreMessages,
      temperature: typeof temperature === "number" ? temperature : undefined,
      system: typeof system === "string" ? system : undefined,
    });

    // Stream UI message events to the client response
    await result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    console.error("[api/chat] streaming error", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "AI stream failed" });
    }
  }
}
