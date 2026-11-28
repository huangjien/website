import { createMocks } from "node-mocks-http";
import dns from "node:dns";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout";
import { checkRateLimit } from "../../lib/rateLimit";

jest.mock("../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

jest.mock("../../lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
}));

const PUBLIC_IPV4 = "140.82.112.4"; // a public GitHub IP

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

const createRedirectResponse = (location, status = 302) => ({
  ok: false,
  status,
  statusText: "Found",
  headers: {
    get: (key) => {
      const lower = key.toLowerCase();
      if (lower === "location") return location;
      return null;
    },
  },
});

describe("/api/image-proxy", () => {
  let resolve4Spy;
  let resolve6Spy;

  beforeAll(() => {
    resolve4Spy = jest.spyOn(dns.promises, "resolve4");
    resolve6Spy = jest.spyOn(dns.promises, "resolve6");
  });

  afterAll(() => {
    resolve4Spy.mockRestore();
    resolve6Spy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default DNS resolution returns a public IP (no private/internal target).
    resolve4Spy.mockResolvedValue([PUBLIC_IPV4]);
    resolve6Spy.mockResolvedValue([]);
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
      query: { url: encodeURIComponent("https://github.com/rate-limited.png") },
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
      query: { url: encodeURIComponent("https://github.com/not-an-image.png") },
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
      query: { url: encodeURIComponent("https://github.com/oversized.png") },
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
      query: { url: encodeURIComponent("https://github.com/token-header.png") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(fetchWithTimeout).toHaveBeenCalledWith(
      "https://github.com/token-header.png",
      expect.objectContaining({
        redirect: "manual",
        headers: expect.objectContaining({
          Authorization: "token test-token",
        }),
      }),
      10000,
    );
    delete process.env.GITHUB_TOKEN;
  });

  it("rejects an allowed host that resolves to a private IPv4 address", async () => {
    resolve4Spy.mockResolvedValue(["127.0.0.1"]);
    resolve6Spy.mockResolvedValue([]);
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { url: encodeURIComponent("https://github.com/private-ipv4.png") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe("Blocked target host");
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it("rejects an allowed host that resolves to a link-local metadata IP", async () => {
    resolve4Spy.mockResolvedValue(["169.254.169.254"]);
    resolve6Spy.mockResolvedValue([]);
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { url: encodeURIComponent("https://github.com/link-local.png") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe("Blocked target host");
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it("rejects an allowed host that resolves to a private IPv6 address", async () => {
    resolve4Spy.mockResolvedValue([]);
    resolve6Spy.mockResolvedValue(["::1"]);
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { url: encodeURIComponent("https://github.com/private-ipv6.png") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe("Blocked target host");
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it("proxies a normal allowed domain that resolves to a public IP", async () => {
    resolve4Spy.mockResolvedValue([PUBLIC_IPV4]);
    fetchWithTimeout.mockResolvedValueOnce(createImageResponse({ ok: true }));
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: {
        url: encodeURIComponent("https://github.com/public-domain.png"),
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()["x-cache"]).toBe("MISS");
  });

  it("follows a redirect to the GitHub attachment host", async () => {
    resolve4Spy.mockResolvedValue([PUBLIC_IPV4]);
    fetchWithTimeout
      .mockResolvedValueOnce(
        createRedirectResponse(
          "https://github-production-user-asset-6210df.s3.amazonaws.com/asset.png?jwt=token",
        ),
      )
      .mockResolvedValueOnce(createImageResponse({ ok: true }));
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: {
        url: encodeURIComponent(
          "https://github.com/user-attachments/assets/519c2516",
        ),
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(fetchWithTimeout).toHaveBeenCalledTimes(2);
    expect(fetchWithTimeout).toHaveBeenNthCalledWith(
      2,
      "https://github-production-user-asset-6210df.s3.amazonaws.com/asset.png?jwt=token",
      expect.objectContaining({ redirect: "manual" }),
      10000,
    );
  });

  it("follows a redirect to private-user-images.githubusercontent.com", async () => {
    resolve4Spy.mockResolvedValue([PUBLIC_IPV4]);
    fetchWithTimeout
      .mockResolvedValueOnce(
        createRedirectResponse(
          "https://private-user-images.githubusercontent.com/asset.png?jwt=token",
        ),
      )
      .mockResolvedValueOnce(createImageResponse({ ok: true }));
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: {
        url: encodeURIComponent(
          "https://github.com/user-attachments/assets/aabbccdd",
        ),
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(fetchWithTimeout).toHaveBeenCalledTimes(2);
  });

  it("accepts img.youtube.com", async () => {
    resolve4Spy.mockResolvedValue([PUBLIC_IPV4]);
    fetchWithTimeout.mockResolvedValueOnce(createImageResponse({ ok: true }));
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: {
        url: encodeURIComponent("https://img.youtube.com/vi/abc/0.jpg"),
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });

  it("accepts i.ytimg.com", async () => {
    resolve4Spy.mockResolvedValue([PUBLIC_IPV4]);
    fetchWithTimeout.mockResolvedValueOnce(createImageResponse({ ok: true }));
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { url: encodeURIComponent("https://i.ytimg.com/vi/abc/0.jpg") },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });

  describe("cache", () => {
    let originalCaches;
    let originalResponse;

    beforeEach(() => {
      originalCaches = globalThis.caches;
      originalResponse = globalThis.Response;
    });

    afterEach(() => {
      globalThis.caches = originalCaches;
      globalThis.Response = originalResponse;
    });

    // jsdom has no Response constructor. The runtime only needs one to store
    // an image in the platform cache, so a minimal stand-in is enough here.
    const installResponseShim = () => {
      globalThis.Response = class {
        constructor(body, init = {}) {
          this.body = body;
          this.init = init;
          this.headers = {
            get: (key) =>
              key.toLowerCase() === "content-type"
                ? (this.init?.headers?.["content-type"] ?? null)
                : null,
          };
        }

        async arrayBuffer() {
          return new Uint8Array(0).buffer;
        }
      };
    };

    it("serves a cached image without an upstream request", async () => {
      installResponseShim();
      const match = jest.fn(async () => ({
        headers: {
          get: (key) =>
            key.toLowerCase() === "content-type" ? "image/png" : null,
        },
        arrayBuffer: async () => new Uint8Array(3).buffer,
      }));
      globalThis.caches = { default: { match, put: jest.fn() } };

      const handler = require("../../pages/api/image-proxy").default;
      const { req, res } = createMocks({
        method: "GET",
        query: { url: encodeURIComponent("https://github.com/cached.png") },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()["x-cache"]).toBe("HIT");
      expect(fetchWithTimeout).not.toHaveBeenCalled();
    });

    it("stores the image in the platform cache", async () => {
      installResponseShim();
      const put = jest.fn(async () => {});
      globalThis.caches = {
        default: { match: jest.fn(async () => null), put },
      };
      fetchWithTimeout.mockResolvedValueOnce(createImageResponse({ ok: true }));

      const handler = require("../../pages/api/image-proxy").default;
      const { req, res } = createMocks({
        method: "GET",
        query: { url: encodeURIComponent("https://github.com/new.png") },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()["x-cache"]).toBe("MISS");
      expect(put).toHaveBeenCalledTimes(1);
      expect(put.mock.calls[0][0]).toMatch(/^https:\/\//);
    });

    it("returns the image when the runtime has no platform cache", async () => {
      delete globalThis.caches;
      fetchWithTimeout.mockResolvedValueOnce(createImageResponse({ ok: true }));

      const handler = require("../../pages/api/image-proxy").default;
      const { req, res } = createMocks({
        method: "GET",
        query: { url: encodeURIComponent("https://github.com/nocache.png") },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()["x-cache"]).toBe("MISS");
    });
  });

  it("rejects a redirect to an internal IP literal URL", async () => {
    resolve4Spy.mockResolvedValue([PUBLIC_IPV4]);
    fetchWithTimeout.mockResolvedValueOnce(
      createRedirectResponse("http://169.254.169.254/latest/meta-data"),
    );
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: {
        url: encodeURIComponent("https://github.com/redirect-internal.png"),
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    // The redirect must not be followed to the internal target.
    expect(fetchWithTimeout).toHaveBeenCalledTimes(1);
  });

  it("rejects a redirect to a host that resolves to a private IP", async () => {
    resolve4Spy.mockImplementation((host) => {
      if (host === "camo.githubusercontent.com") {
        return Promise.resolve(["169.254.169.254"]);
      }
      return Promise.resolve([PUBLIC_IPV4]);
    });
    fetchWithTimeout.mockResolvedValueOnce(
      createRedirectResponse("https://camo.githubusercontent.com/redirect"),
    );
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: {
        url: encodeURIComponent("https://github.com/redirect-private-host.png"),
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe("Blocked target host");
    expect(fetchWithTimeout).toHaveBeenCalledTimes(1);
  });

  it("follows a redirect to a safe host and returns the image", async () => {
    resolve4Spy.mockResolvedValue([PUBLIC_IPV4]);
    fetchWithTimeout
      .mockResolvedValueOnce(
        createRedirectResponse(
          "https://raw.githubusercontent.com/user/repo/main/b.png",
        ),
      )
      .mockResolvedValueOnce(createImageResponse({ ok: true }));
    const handler = require("../../pages/api/image-proxy").default;
    const { req, res } = createMocks({
      method: "GET",
      query: {
        url: encodeURIComponent("https://github.com/redirect-safe-host.png"),
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(fetchWithTimeout).toHaveBeenCalledTimes(2);
    expect(fetchWithTimeout).toHaveBeenNthCalledWith(
      2,
      "https://raw.githubusercontent.com/user/repo/main/b.png",
      expect.objectContaining({
        redirect: "manual",
      }),
      10000,
    );
  });
});
