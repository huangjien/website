import { createMocks } from "node-mocks-http";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout";
import { checkRateLimit } from "../../lib/rateLimit";

jest.mock("fs", () => ({
  promises: {
    access: jest.fn(async () => {
      throw new Error("missing");
    }),
    mkdir: jest.fn(async () => {}),
    readFile: jest.fn(async () => Buffer.from("")),
    writeFile: jest.fn(async () => {}),
    unlink: jest.fn(async () => {}),
  },
}));

jest.mock("../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

jest.mock("../../lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
}));

const createImageResponse = ({
  ok = true,
  contentType = "image/png",
  bytes = 3,
}) => ({
  ok,
  status: ok ? 200 : 502,
  statusText: ok ? "OK" : "Bad Gateway",
  headers: {
    get: (key) => (key.toLowerCase() === "content-type" ? contentType : null),
  },
  arrayBuffer: async () => new Uint8Array(bytes).buffer,
});

describe("/api/image-proxy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkRateLimit.mockReturnValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 1000,
    });
  });

  it("returns 405 for non-GET methods", async () => {
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    checkRateLimit.mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 1000,
    });
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { url: encodeURIComponent("https://github.com/a.png") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(429);
  });

  it("returns 400 for disallowed host", async () => {
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { url: encodeURIComponent("https://example.com/a.png") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe("URL host is not allowed");
  });

  it("returns 400 for blocked private host", async () => {
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { url: encodeURIComponent("https://127.0.0.1/a.png") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe("URL host is not allowed");
  });

  it("returns 415 when upstream content is not image", async () => {
    fetchWithTimeout.mockResolvedValueOnce(
      createImageResponse({ ok: true, contentType: "text/html" }),
    );
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { url: encodeURIComponent("https://github.com/a.png") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(415);
  });

  it("returns 413 when image is oversized", async () => {
    fetchWithTimeout.mockResolvedValueOnce(
      createImageResponse({ ok: true, bytes: 6 * 1024 * 1024 }),
    );
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { url: encodeURIComponent("https://github.com/a.png") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(413);
  });

  it("adds GitHub token header only for github.com hosts", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    fetchWithTimeout.mockResolvedValueOnce(createImageResponse({ ok: true }));
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { url: encodeURIComponent("https://github.com/a.png") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(fetchWithTimeout).toHaveBeenCalledWith(
      "https://github.com/a.png",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "token test-token",
        }),
      }),
      10000,
    );
  });
});
