import { createMocks } from "node-mocks-http";

jest.mock("ai", () => ({
  streamText: jest.fn(),
  convertToCoreMessages: jest.fn((messages) => messages),
}));

jest.mock("@ai-sdk/openai", () => ({
  createOpenAI: jest.fn(),
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

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, OPENAI_API_KEY: "test-key" };
  });

  afterEach(() => {
    process.env = originalEnv;
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
    const { streamText } = require("ai");
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
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "MODEL:gpt-4o-mini",
      }),
    );
    expect(pipeUIMessageStreamToResponse).toHaveBeenCalledWith(res);
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
