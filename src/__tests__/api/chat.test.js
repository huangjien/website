import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";

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
  return {
    streamText: jest.fn(),
    convertToModelMessages: jest.fn(async (messages) => messages),
    MessageConversionError,
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
  const { getServerSession } = require("next-auth/next");

  beforeEach(() => {
    jest.clearAllMocks();
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

    const pipeUIMessageStreamToResponse = jest.fn(async () => {});
    streamText.mockResolvedValue({ pipeUIMessageStreamToResponse });

    const handler = require("../../pages/api/chat").default;
    const { req, res } = createMocks({
      method: "POST",
      body: {
        model: "gpt-4o-mini",
        input: "Hi",
      },
    });

    await handler(req, res);

    expect(openaiClient).toHaveBeenCalledWith("gpt-4o-mini");
    expect(convertToModelMessages).toHaveBeenCalledWith([
      { role: "user", parts: [{ type: "text", text: "Hi" }] },
    ]);
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "MODEL:gpt-4o-mini",
      }),
    );
    expect(pipeUIMessageStreamToResponse).toHaveBeenCalledWith(res);
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
