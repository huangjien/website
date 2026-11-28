import { createMocks } from "node-mocks-http";

// Polyfill web-stream globals missing from the jsdom test environment.
const {
  ReadableStream: NodeReadableStream,
  TransformStream: NodeTransformStream,
} = require("stream/web");
if (typeof global.ReadableStream === "undefined") {
  global.ReadableStream = NodeReadableStream;
}
if (typeof global.TransformStream === "undefined") {
  global.TransformStream = NodeTransformStream;
}
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
}
if (typeof global.TextEncoderStream === "undefined") {
  global.TextEncoderStream = class {
    constructor() {
      const ts = new TransformStream({
        transform: (chunk, controller) => {
          controller.enqueue(
            typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk,
          );
        },
      });
      this.readable = ts.readable;
      this.writable = ts.writable;
    }
  };
}

const byteStreamOf = (chunks) =>
  new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });

const failingStream = (error) =>
  new ReadableStream({
    start(controller) {
      controller.error(error);
    },
  });

// Stub streamText + convertToModelMessages while exposing a minimal
// MessageConversionError so the handler's `isInstance` guard is testable.
jest.mock("ai", () => {
  class MessageConversionError extends Error {
    constructor(message) {
      super(message);
      this.name = "AI_MessageConversionError";
    }
    static isInstance(error) {
      return error instanceof MessageConversionError;
    }
  }
  class JsonToSseTransformStream extends TransformStream {
    constructor() {
      super({
        // Real implementation converts UI chunk objects to SSE lines.
        transform: (chunk, controller) => {
          controller.enqueue(
            typeof chunk === "string"
              ? chunk
              : `data: ${JSON.stringify(chunk)}\n\n`,
          );
        },
      });
    }
  }
  return {
    streamText: jest.fn(),
    convertToModelMessages: jest.fn(async (messages) => messages),
    MessageConversionError,
    JsonToSseTransformStream,
    UI_MESSAGE_STREAM_HEADERS: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
      "x-vercel-ai-ui-message-stream": "v1",
      "x-accel-buffering": "no",
    },
  };
});

jest.mock("@ai-sdk/openai", () => ({
  createOpenAI: jest.fn(),
}));

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

jest.mock("../../lib/rateLimit", () => ({
  CHAT_RATE_LIMIT: 30,
  CHAT_WINDOW_MS: 60000,
  checkRateLimit: jest.fn(() => ({
    allowed: true,
    remaining: 29,
    resetAt: Date.now() + 1000,
  })),
}));

describe("/api/chat", () => {
  const originalEnv = process.env;
  const rateLimit = require("../../lib/rateLimit");
  const failover = require("../../lib/ai/failover");
  const { getServerSession } = require("next-auth/next");

  beforeEach(() => {
    jest.clearAllMocks();
    failover.getSharedCooldownState().clear();
    process.env = { ...originalEnv, OPENAI_API_KEY: "test-key" };
    // Default: authenticated session
    getServerSession.mockResolvedValue({
      user: { name: "Test User", email: "test@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);

    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: { input: "Hello" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData()).error).toBe("Unauthorized");
  });

  it("rejects invalid model outside curated allowlist", async () => {
    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: {
        model: "totally-unknown-model",
        input: "Hello",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("Invalid model");
  });

  it("uses provided curated model when valid", async () => {
    const { streamText, convertToModelMessages } = require("ai");
    const { createOpenAI } = require("@ai-sdk/openai");

    const openaiClient = jest.fn((modelId) => `MODEL:${modelId}`);
    createOpenAI.mockReturnValue(openaiClient);

    streamText.mockResolvedValue({
      toUIMessageStream: () =>
        byteStreamOf([{ type: "start" }, { type: "finish" }]),
    });

    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: {
        model: "gpt-4o-mini",
        input: "Hi",
      },
    });
    // node-mocks-http renders Uint8Array writes as byte lists — collect raw.
    const written = [];
    res.write = (chunk) => {
      written.push(chunk);
      return true;
    };

    await handler(req, res);

    expect(openaiClient).toHaveBeenCalledWith("gpt-4o-mini");
    expect(convertToModelMessages).toHaveBeenCalledWith([
      { role: "user", parts: [{ type: "text", text: "Hi" }] },
    ]);
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "MODEL:gpt-4o-mini",
        maxRetries: 0,
      }),
    );
    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader("X-AI-Model")).toBe("gpt-4o-mini");
    expect(res.getHeader("X-AI-Fallback-From")).toBeUndefined();
    const body = Buffer.concat(
      written.map((chunk) => Buffer.from(chunk)),
    ).toString("utf8");
    expect(body).toContain('"type":"start"');
    expect(body).toContain('"type":"finish"');
  });

  it("fails over to the next curated model on a provider rate limit", async () => {
    const { streamText } = require("ai");
    const { createOpenAI } = require("@ai-sdk/openai");

    const openaiClient = jest.fn((modelId) => `MODEL:${modelId}`);
    createOpenAI.mockReturnValue(openaiClient);

    const rateLimitError = Object.assign(new Error("Rate limit reached"), {
      statusCode: 429,
      data: { error: { type: "rate_limit_exceeded" } },
      responseHeaders: {},
    });
    let call = 0;
    streamText.mockImplementation(() => {
      call += 1;
      return call === 1
        ? { toUIMessageStream: () => failingStream(rateLimitError) }
        : {
            toUIMessageStream: () => byteStreamOf([{ type: "finish" }]),
          };
    });

    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: { model: "gpt-4o-mini", input: "Hi" },
    });

    await handler(req, res);

    expect(streamText).toHaveBeenCalledTimes(2);
    expect(openaiClient).toHaveBeenNthCalledWith(1, "gpt-4o-mini");
    expect(openaiClient).toHaveBeenNthCalledWith(2, "gpt-4.1-mini");
    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader("X-AI-Model")).toBe("gpt-4.1-mini");
    expect(res.getHeader("X-AI-Fallback-From")).toBe("gpt-4o-mini");
    expect(failover.getSharedCooldownState().get("gpt-4o-mini").kind).toBe(
      "rate_limit",
    );
  });

  it("returns 429 when every candidate hits a usage limit", async () => {
    const { streamText } = require("ai");
    const rateLimitError = Object.assign(new Error("Rate limit reached"), {
      statusCode: 429,
      responseHeaders: {},
    });
    streamText.mockImplementation(() => ({
      toUIMessageStream: () => failingStream(rateLimitError),
    }));

    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: { input: "Hello" },
    });

    await handler(req, res);

    expect(streamText).toHaveBeenCalledTimes(3);
    expect(res._getStatusCode()).toBe(429);
    expect(JSON.parse(res._getData()).error).toBe("Rate limit exceeded");
  });

  it("propagates non-limit provider errors without failover", async () => {
    const { streamText } = require("ai");
    streamText.mockImplementation(() => ({
      toUIMessageStream: () => failingStream(new Error("Provider exploded")),
    }));

    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: { input: "Hello" },
    });

    await handler(req, res);

    expect(streamText).toHaveBeenCalledTimes(1);
    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("AI stream failed");
    expect(data.details).toBe("Provider exploded");
  });

  it("returns 429 immediately when every curated model is cooling down", async () => {
    const { CURATED_MODEL_IDS } = require("../../config/ai-models");
    const state = failover.getSharedCooldownState();
    for (const id of CURATED_MODEL_IDS) {
      state.set(id, { kind: "quota", openUntil: Date.now() + 60000 });
    }

    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: { input: "Hello" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(429);
    expect(JSON.parse(res._getData()).error).toBe("Rate limit exceeded");
  });

  it("returns 400 when convertToModelMessages rejects malformed messages", async () => {
    const { convertToModelMessages, MessageConversionError } = require("ai");
    convertToModelMessages.mockRejectedValueOnce(
      new MessageConversionError("Invalid message role"),
    );

    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: { messages: [{ role: "invalid-role" }] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("Invalid messages");
    expect(data.details).toBe("Invalid message role");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    rateLimit.checkRateLimit.mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 2000,
    });

    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: { input: "Hello" },
      headers: { "x-forwarded-for": "203.0.113.1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(429);
    expect(res.getHeader("X-RateLimit-Remaining")).toBe("0");
    expect(JSON.parse(res._getData()).error).toBe("Rate limit exceeded");
  });

  it("returns 400 for missing prompt payload", async () => {
    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe("Invalid prompt");
  });

  it("returns 500 when stream generation fails before headers", async () => {
    const { streamText } = require("ai");
    streamText.mockRejectedValueOnce(new Error("Provider error"));

    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: { input: "Hello" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("AI stream failed");
    expect(data.details).toBe("Provider error");
  });
});
