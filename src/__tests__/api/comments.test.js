import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

jest.mock("../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
  parseErrorResponse: jest.fn(async () => "GitHub API Error"),
}));

jest.mock("../../lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
}));

describe("/api/comments", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      GITHUB_REPO: "https://api.github.com/repos/test/repo",
      GITHUB_TOKEN: "test-token",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("GET /api/comments", () => {
    it("rejects unauthenticated requests", async () => {
      getServerSession.mockResolvedValueOnce(null);

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "GET",
        query: { issue_number: "123" },
      });

      await handler(req, res);

      expect(getServerSession).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
    });

    it("returns comments from GitHub API", async () => {
      const { fetchWithTimeout } = require("../../lib/fetchWithTimeout");
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      const mockComments = [
        { id: 1, body: "Comment 1" },
        { id: 2, body: "Comment 2" },
      ];
      fetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComments,
      });

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "GET",
        query: { issue_number: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(fetchWithTimeout).toHaveBeenCalled();
      const fetchCall = fetchWithTimeout.mock.calls[0];
      expect(fetchCall[0]).toContain("/issues/123/comments");
    });

    it("returns 500 when token is missing", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      delete process.env.GITHUB_TOKEN;

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "GET",
        query: { issue_number: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });

    it("returns 500 when repo is missing", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      delete process.env.GITHUB_REPO;

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "GET",
        query: { issue_number: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });

    it("returns 400 when issue_number is missing", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("returns 405 for unsupported methods", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "DELETE",
        query: { issue_number: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader("Allow")).toBe("GET, POST");
    });
  });

  describe("POST /api/comments", () => {
    it("rejects unauthenticated POST", async () => {
      getServerSession.mockResolvedValueOnce(null);

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "POST",
        query: { issue_number: "123" },
        body: { body: "Test comment" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it("rejects POST without body", async () => {
      const { checkRateLimit } = require("../../lib/rateLimit");
      checkRateLimit.mockReturnValueOnce({
        allowed: true,
        remaining: 29,
        resetAt: Date.now() + 3600000,
      });
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "POST",
        query: { issue_number: "123" },
        body: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("rejects POST with empty body", async () => {
      const { checkRateLimit } = require("../../lib/rateLimit");
      checkRateLimit.mockReturnValueOnce({
        allowed: true,
        remaining: 29,
        resetAt: Date.now() + 3600000,
      });
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "POST",
        query: { issue_number: "123" },
        body: { body: "   " },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("rejects POST with body too long", async () => {
      const { checkRateLimit } = require("../../lib/rateLimit");
      checkRateLimit.mockReturnValueOnce({
        allowed: true,
        remaining: 29,
        resetAt: Date.now() + 3600000,
      });
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      const longBody = "a".repeat(65537);

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "POST",
        query: { issue_number: "123" },
        body: { body: longBody },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("accepts valid POST with body", async () => {
      const { checkRateLimit } = require("../../lib/rateLimit");
      const { fetchWithTimeout } = require("../../lib/fetchWithTimeout");
      checkRateLimit.mockReturnValueOnce({
        allowed: true,
        remaining: 29,
        resetAt: Date.now() + 3600000,
      });
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      fetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 1, body: "Test comment" }),
      });

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "POST",
        query: { issue_number: "123" },
        body: { body: "Test comment" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(fetchWithTimeout).toHaveBeenCalled();
      const fetchCall = fetchWithTimeout.mock.calls[0];
      expect(fetchCall[0]).toContain("/issues/123/comments");
      const bodySent = JSON.parse(fetchCall[1].body);
      expect(bodySent.body).toBe("Test comment");
    });

    it("normalizes comment body before upstream POST", async () => {
      const { checkRateLimit } = require("../../lib/rateLimit");
      const { fetchWithTimeout } = require("../../lib/fetchWithTimeout");
      checkRateLimit.mockReturnValueOnce({
        allowed: true,
        remaining: 29,
        resetAt: Date.now() + 3600000,
      });
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      fetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 1, body: "trim me" }),
      });

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "POST",
        query: { issue_number: "123" },
        body: { body: "   trim me   " },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const fetchCall = fetchWithTimeout.mock.calls[0];
      const bodySent = JSON.parse(fetchCall[1].body);
      expect(bodySent.body).toBe("trim me");
    });

    it("returns 429 when rate limit exceeded", async () => {
      const { checkRateLimit } = require("../../lib/rateLimit");
      checkRateLimit.mockReturnValueOnce({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 3600000,
      });
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "POST",
        query: { issue_number: "123" },
        body: { body: "Test comment" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(429);
      const response = JSON.parse(res._getData());
      expect(response.error).toContain("Rate limit exceeded");
      expect(response.retryAfter).toBeGreaterThan(0);
    });

    it("returns GitHub error when upstream fails", async () => {
      const { checkRateLimit } = require("../../lib/rateLimit");
      const { fetchWithTimeout } = require("../../lib/fetchWithTimeout");
      checkRateLimit.mockReturnValueOnce({
        allowed: true,
        remaining: 29,
        resetAt: Date.now() + 3600000,
      });
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      fetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        status: 422,
      });

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "POST",
        query: { issue_number: "123" },
        body: { body: "Test comment" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(422);
    });

    it("returns 504 when upstream times out", async () => {
      const { checkRateLimit } = require("../../lib/rateLimit");
      const { fetchWithTimeout } = require("../../lib/fetchWithTimeout");
      checkRateLimit.mockReturnValueOnce({
        allowed: true,
        remaining: 29,
        resetAt: Date.now() + 3600000,
      });
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      fetchWithTimeout.mockRejectedValueOnce(abortError);

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "POST",
        query: { issue_number: "123" },
        body: { body: "Test comment" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(504);
    });

    it("emits mutation attempt and failure observability events", async () => {
      const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      const { checkRateLimit } = require("../../lib/rateLimit");
      checkRateLimit.mockReturnValueOnce({
        allowed: true,
        remaining: 29,
        resetAt: Date.now() + 3600000,
      });
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });

      const handler = require("../../pages/api/comments").default;
      const { req, res } = createMocks({
        method: "POST",
        query: { issue_number: "123" },
        body: { body: "   " },
      });

      await handler(req, res);

      const infoPayloads = infoSpy.mock.calls.map((call) => call[0]);
      const warnPayloads = warnSpy.mock.calls.map((call) => call[0]);
      expect(
        infoPayloads.some((payload) =>
          payload.includes('"event":"comment_post_attempt"'),
        ),
      ).toBe(true);
      expect(
        warnPayloads.some((payload) =>
          payload.includes('"event":"comment_post_failure"'),
        ),
      ).toBe(true);

      infoSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });
});
