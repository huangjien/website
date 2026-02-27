import { streamText, convertToCoreMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import {
  checkRateLimit,
  CHAT_RATE_LIMIT,
  CHAT_WINDOW_MS,
} from "../../lib/rateLimit";

/**
 * Chat streaming endpoint using Vercel AI SDK (Pages Router, Node runtime)
 * Compatible with @ai-sdk/react useChat hook (UI Message protocol)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Rate limiting based on IP address
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    "unknown";
  const rateLimitResult = checkRateLimit(ip, CHAT_RATE_LIMIT, CHAT_WINDOW_MS);

  if (!rateLimitResult.allowed) {
    res.setHeader("X-RateLimit-Limit", CHAT_RATE_LIMIT.toString());
    res.setHeader("X-RateLimit-Remaining", "0");
    res.setHeader("X-RateLimit-Reset", rateLimitResult.resetAt.toString());
    return res.status(429).json({
      error: "Too many requests",
      retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
    });
  }

  res.setHeader("X-RateLimit-Limit", CHAT_RATE_LIMIT.toString());
  res.setHeader("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
  res.setHeader("X-RateLimit-Reset", rateLimitResult.resetAt.toString());

  try {
    // Ensure OpenAI API key is available in production (supports both env var names)
    const apiKey = process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }
    const openaiClient = createOpenAI({ apiKey });

    // Validate request body using Zod
    const chatRequestSchema = z.object({
      messages: z.array(z.any()).optional(),
      model: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      system: z.string().optional(),
      input: z.string().optional(),
      prompt: z.string().optional(),
    });

    const validationResult = chatRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: validationResult.error.errors,
      });
    }

    const body = validationResult.data;
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
    const errorMessage =
      error?.message || error?.cause?.message || "Unknown error";
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "AI stream failed", details: errorMessage });
    }
  }
}
