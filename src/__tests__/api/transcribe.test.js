import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";
import { checkRateLimit } from "../../lib/rateLimit";

const mockHandlers = {};
let mockShouldFailProxy = true;

jest.mock("http-proxy", () => ({
  createProxy: jest.fn(() => {
    const proxy = {
      on: jest.fn((event, cb) => {
        mockHandlers[event] = cb;
        return proxy;
      }),
      once: jest.fn((event, cb) => {
        mockHandlers[event] = cb;
        return proxy;
      }),
      web: jest.fn((_req, _res) => {
        if (mockShouldFailProxy && mockHandlers.error) {
          mockHandlers.error(new Error("proxy failed"));
        }
        if (!mockShouldFailProxy && mockHandlers.proxyRes) {
          mockHandlers.proxyRes({});
        }
      }),
    };
    return proxy;
  }),
}));

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

jest.mock("../../lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
}));

describe("/api/transcribe", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockHandlers).forEach((key) => delete mockHandlers[key]);
    process.env = { ...originalEnv };
    mockShouldFailProxy = true;
    getServerSession.mockResolvedValue({ user: { email: "a@test.com" } });
    checkRateLimit.mockReturnValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 1000,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 405 for non-POST methods", async () => {
    const handler = require("../../pages/api/transcribe").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader("Allow")).toBe("POST");
  });

  it("returns 500 when OpenAI key is missing", async () => {
    delete process.env.OPEN_AI_KEY;
    delete process.env.OPENAI_API_KEY;
    const handler = require("../../pages/api/transcribe").default;
    const { req, res } = createMocks({
      method: "POST",
      headers: { "content-type": "multipart/form-data; boundary=x" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "OpenAI API key not configured",
    });
  });

  it("returns 502 when proxy fails", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const handler = require("../../pages/api/transcribe").default;
    const { req, res } = createMocks({
      method: "POST",
      headers: { "content-type": "multipart/form-data; boundary=x" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(502);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: "Transcription proxy failed",
    });
  });

  it("returns success when proxy returns response", async () => {
    mockShouldFailProxy = false;
    process.env.OPENAI_API_KEY = "test-key";
    const handler = require("../../pages/api/transcribe").default;
    const { req, res } = createMocks({
      method: "POST",
      headers: { "content-type": "multipart/form-data; boundary=x" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);
    process.env.OPENAI_API_KEY = "test-key";
    const handler = require("../../pages/api/transcribe").default;
    const { req, res } = createMocks({
      method: "POST",
      headers: { "content-type": "multipart/form-data; boundary=x" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData()).error).toBe("Unauthorized");
  });

  it("returns 429 when rate limit exceeded", async () => {
    checkRateLimit.mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 1000,
    });
    process.env.OPENAI_API_KEY = "test-key";
    const handler = require("../../pages/api/transcribe").default;
    const { req, res } = createMocks({
      method: "POST",
      headers: { "content-type": "multipart/form-data; boundary=x" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(429);
    expect(JSON.parse(res._getData()).error).toBe("Rate limit exceeded");
  });

  it("returns 400 for invalid content type", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const handler = require("../../pages/api/transcribe").default;
    const { req, res } = createMocks({
      method: "POST",
      headers: { "content-type": "application/json" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe("Invalid content type");
  });

  it("returns 413 for oversized payload", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const handler = require("../../pages/api/transcribe").default;
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=x",
        "content-length": `${11 * 1024 * 1024}`,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(413);
    expect(JSON.parse(res._getData()).error).toBe("Payload too large");
  });
});
