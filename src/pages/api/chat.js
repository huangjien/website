import { streamText, convertToCoreMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import {
  ApiError,
  RateLimitError,
  ValidationError,
  ensureMethod,
  getClientIp,
  getOpenAiApiKey,
  withErrorHandling,
} from "../../lib/apiClient";
import {
  checkRateLimit,
  CHAT_RATE_LIMIT,
  CHAT_WINDOW_MS,
} from "../../lib/rateLimit";
import {
  CURATED_MODEL_IDS,
  DEFAULT_AI_MODEL,
  isAllowedAiModel,
} from "../../config/ai-models";

/**
 * Chat streaming endpoint using Vercel AI SDK (Pages Router, Node runtime)
 * Compatible with @ai-sdk/react useChat hook (UI Message protocol)
 */
const chatRequestSchema = z.object({
  messages: z.array(z.any()).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  system: z.string().optional(),
  input: z.string().optional(),
  prompt: z.string().optional(),
});

const handler = withErrorHandling(async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  const ip = getClientIp(req);
  const rateLimitResult = checkRateLimit(ip, CHAT_RATE_LIMIT, CHAT_WINDOW_MS);

  if (!rateLimitResult.allowed) {
    res.setHeader("X-RateLimit-Limit", CHAT_RATE_LIMIT.toString());
    res.setHeader("X-RateLimit-Remaining", "0");
    res.setHeader("X-RateLimit-Reset", rateLimitResult.resetAt.toString());
    throw new RateLimitError(
      Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
      rateLimitResult.resetAt,
    );
  }

  res.setHeader("X-RateLimit-Limit", CHAT_RATE_LIMIT.toString());
  res.setHeader("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
  res.setHeader("X-RateLimit-Reset", rateLimitResult.resetAt.toString());

  try {
    const apiKey = getOpenAiApiKey();
    if (!apiKey) {
      throw new ApiError("OpenAI API key not configured", 500);
    }
    const openaiClient = createOpenAI({ apiKey });

    const validationResult = chatRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Validation failed",
        validationResult.error.errors,
      );
    }

    const body = validationResult.data;
    const { messages, model, temperature, system, input, prompt } = body;
    const selectedModel = model || DEFAULT_AI_MODEL;

    if (!isAllowedAiModel(selectedModel)) {
      throw new ValidationError(
        "Invalid model",
        `Model must be one of: ${CURATED_MODEL_IDS.join(", ")}`,
      );
    }

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
      throw new ValidationError("Invalid prompt", [
        "messages, input, or prompt must be provided",
      ]);
    }

    const result = await streamText({
      model: openaiClient(selectedModel),
      messages: coreMessages,
      temperature: typeof temperature === "number" ? temperature : undefined,
      system: typeof system === "string" ? system : undefined,
    });

    await result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    console.error("[api/chat] streaming error", error);
    if (
      error instanceof ValidationError ||
      error instanceof RateLimitError ||
      error instanceof ApiError
    ) {
      throw error;
    }
    const errorMessage =
      error?.message || error?.cause?.message || "Unknown error";
    if (!res.headersSent) {
      throw new ApiError("AI stream failed", 500, errorMessage);
    }
  }
});

export default handler;
