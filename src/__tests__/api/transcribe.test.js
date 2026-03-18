import { createMocks } from "node-mocks-http";

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

describe("/api/transcribe", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockHandlers).forEach((key) => delete mockHandlers[key]);
    process.env = { ...originalEnv };
    mockShouldFailProxy = true;
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
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "OpenAI API key not configured",
    });
  });

  it("returns 502 when proxy fails", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const handler = require("../../pages/api/transcribe").default;
    const { req, res } = createMocks({ method: "POST" });

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
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });
});
