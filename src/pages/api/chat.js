import {
  JsonToSseTransformStream,
  UI_MESSAGE_STREAM_HEADERS,
  streamText,
  convertToModelMessages,
  MessageConversionError,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import {
  ApiError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ensureMethod,
  getClientIp,
  getOpenAiApiKey,
  logApiEvent,
  withErrorHandling,
} from "../../lib/apiClient";
import { authOptions } from "./auth/[...nextauth]";
import {
  checkRateLimit,
  CHAT_RATE_LIMIT,
  CHAT_WINDOW_MS,
} from "../../lib/rateLimit";
import {
  CURATED_AI_MODELS,
  DEFAULT_AI_MODEL,
  isAllowedAiModel,
} from "../../config/ai-models";
import {
  classifyProviderError,
  getSharedCooldownState,
  recordCooldown,
  resolveChain,
} from "../../lib/ai/failover";

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

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    throw new AuthenticationError("Unauthorized");
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
        `Model must be one of: ${CURATED_AI_MODELS.map((m) => m.id).join(", ")}`,
      );
    }

    let modelMessages;
    if (Array.isArray(messages) && messages.length > 0) {
      modelMessages = await convertToModelMessages(messages);
    } else if (typeof input === "string" && input.trim().length > 0) {
      modelMessages = await convertToModelMessages([
        { role: "user", parts: [{ type: "text", text: input.trim() }] },
      ]);
    } else if (typeof prompt === "string" && prompt.trim().length > 0) {
      modelMessages = await convertToModelMessages([
        { role: "user", parts: [{ type: "text", text: prompt.trim() }] },
      ]);
    } else {
      throw new ValidationError("Invalid prompt", [
        "messages, input, or prompt must be provided",
      ]);
    }

    const cooldowns = getSharedCooldownState();
    const candidates = resolveChain(
      selectedModel,
      CURATED_AI_MODELS,
      cooldowns,
      Date.now(),
    );

    if (candidates.length === 0) {
      // Every curated model is cooling down (e.g. key-level quota hold).
      const retryAt = Math.min(
        ...CURATED_AI_MODELS.map(
          (model) => cooldowns.get(model.id)?.openUntil ?? Date.now(),
        ),
      );
      throw new RateLimitError(
        Math.max(1, Math.ceil((retryAt - Date.now()) / 1000)),
        retryAt,
      );
    }

    let fallbackFrom = null;
    for (let i = 0; i < candidates.length; i += 1) {
      const candidateId = candidates[i];
      const result = await streamText({
        model: openaiClient(candidateId),
        messages: modelMessages,
        temperature: typeof temperature === "number" ? temperature : undefined,
        system: typeof system === "string" ? system : undefined,
        // Fail fast on provider limits; the failover chain owns retries.
        maxRetries: 0,
      });

      // Same SSE pipeline as pipeUIMessageStreamToResponse, but readable
      // chunk-by-chunk so we can fail over before committing a response.
      const reader = result
        .toUIMessageStream()
        .pipeThrough(new JsonToSseTransformStream())
        .pipeThrough(new TextEncoderStream())
        .getReader();

      let firstChunk;
      try {
        // Probe: usage-limit errors reject here, before any byte reaches res.
        firstChunk = await reader.read();
      } catch (error) {
        const verdict = classifyProviderError(error);
        if (verdict.kind === "other") {
          throw error;
        }
        recordCooldown(cooldowns, candidateId, verdict, CURATED_AI_MODELS);
        if (i === candidates.length - 1) {
          throw new RateLimitError(
            Math.max(1, Math.ceil(verdict.cooldownMs / 1000)),
            Date.now() + verdict.cooldownMs,
          );
        }
        fallbackFrom = fallbackFrom ?? selectedModel;
        logApiEvent("warn", "ai_failover", req, {
          from: candidateId,
          kind: verdict.kind,
        });
        continue;
      }

      // Commit point — nothing has been written to res before this line.
      res.writeHead(200, {
        ...UI_MESSAGE_STREAM_HEADERS,
        "X-AI-Model": candidateId,
        ...(fallbackFrom ? { "X-AI-Fallback-From": fallbackFrom } : {}),
      });
      res.write(firstChunk.value);
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        res.end();
      }
      return;
    }
  } catch (error) {
    logApiEvent("error", "chat_stream_error", req, {
      message: error?.message || "Unknown error",
      model: req?.body?.model || DEFAULT_AI_MODEL,
    });
    if (
      error instanceof ValidationError ||
      error instanceof RateLimitError ||
      error instanceof ApiError
    ) {
      throw error;
    }
    // Malformed UI messages from the client → 400, not 500
    if (MessageConversionError.isInstance(error)) {
      throw new ValidationError("Invalid messages", error?.message);
    }
    const errorMessage =
      error?.message || error?.cause?.message || "Unknown error";
    if (!res.headersSent) {
      throw new ApiError("AI stream failed", 500, errorMessage);
    }
  }
});

export default handler;
