import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout";

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

describe("/api/issues", () => {
  const originalEnv = process.env;

  beforeEach(() => {
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

  describe("GET /api/issues", () => {
    it("allows unauthenticated GET", async () => {
      fetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({ method: "GET", query: {} });

      await handler(req, res);

      expect(getServerSession).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });

    it("returns issues from GitHub API", async () => {
      const mockIssues = [
        { id: 1, number: 1, title: "Issue 1" },
        { id: 2, number: 2, title: "Issue 2" },
      ];
      fetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIssues,
      });

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({ method: "GET", query: {} });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(fetchWithTimeout).toHaveBeenCalled();
      const fetchCall = fetchWithTimeout.mock.calls[0];
      expect(fetchCall[0]).toContain("/issues");
    });

    it("returns 500 when token is missing", async () => {
      delete process.env.GITHUB_TOKEN;

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({ method: "GET", query: {} });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData()).error).toBe(
        "GitHub token not configured",
      );
    });

    it("returns 500 when repo is missing", async () => {
      delete process.env.GITHUB_REPO;

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({ method: "GET", query: {} });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData()).error).toBe(
        "GitHub repository not configured",
      );
    });

    it("returns 405 for unsupported methods", async () => {
      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({ method: "DELETE", query: {} });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader("Allow")).toBe("GET, POST");
    });
  });

  describe("POST /api/issues", () => {
    it("rejects unauthenticated POST", async () => {
      getServerSession.mockResolvedValueOnce(null);

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "New issue" },
      });

      await handler(req, res);

      expect(getServerSession).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData()).error).toBe("Unauthorized");
      expect(fetchWithTimeout).not.toHaveBeenCalled();
    });

    it("accepts authenticated POST with title only", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      fetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 1, title: "New issue", number: 123 }),
      });

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "New issue" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(fetchWithTimeout).toHaveBeenCalled();
    });

    it("accepts authenticated POST with title and body", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      fetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: 1,
          title: "Bug Report",
          body: "Description here",
        }),
      });

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "Bug Report", body: "Description here" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const fetchCall = fetchWithTimeout.mock.calls[0];
      const bodySent = JSON.parse(fetchCall[1].body);
      expect(bodySent.title).toBe("Bug Report");
      expect(bodySent.body).toBe("Description here");
    });

    it("accepts authenticated POST with labels", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      fetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: 1,
          title: "Feature",
          labels: ["enhancement"],
        }),
      });

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "Feature", labels: ["enhancement", "help wanted"] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const fetchCall = fetchWithTimeout.mock.calls[0];
      const bodySent = JSON.parse(fetchCall[1].body);
      expect(bodySent.labels).toEqual(["enhancement", "help wanted"]);
    });

    it("rejects POST without title", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { body: "Just a body" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData()).error).toBe("Title is required");
      expect(fetchWithTimeout).not.toHaveBeenCalled();
    });

    it("rejects POST with empty title", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "   " },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData()).error).toBe("Title is required");
      expect(fetchWithTimeout).not.toHaveBeenCalled();
    });

    it("rejects POST with title too long (>200 chars)", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      const longTitle = "a".repeat(201);

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: longTitle },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData()).error).toBe(
        "Title must be 200 characters or less",
      );
      expect(fetchWithTimeout).not.toHaveBeenCalled();
    });

    it("accepts POST with title exactly 200 chars", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      fetchWithTimeout.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 1, title: "a".repeat(200) }),
      });
      const maxTitle = "a".repeat(200);

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: maxTitle },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it("rejects POST with body too long (>65536 chars)", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      const longBody = "a".repeat(65537);

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "Valid title", body: longBody },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData()).error).toBe(
        "Body must be 65536 characters or less",
      );
    });

    it("rejects POST with too many labels (>20)", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      const tooManyLabels = Array.from({ length: 21 }, (_, i) => `label${i}`);

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "Valid title", labels: tooManyLabels },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData()).error).toBe(
        "Maximum 20 labels allowed",
      );
    });

    it("rejects POST with labels as non-array", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "Valid title", labels: "bug" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData()).error).toBe("Labels must be an array");
    });

    it("rejects POST with label too long (>50 chars)", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "Valid title", labels: ["a".repeat(51)] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData()).error).toBe(
        "Each label must be 50 characters or less",
      );
    });

    it("returns GitHub error when upstream fails", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      fetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        status: 422,
      });

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "Valid issue" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(422);
      expect(JSON.parse(res._getData()).error).toBe("GitHub API Error");
    });

    it("returns 504 when upstream times out", async () => {
      getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      fetchWithTimeout.mockRejectedValueOnce(abortError);

      const handler = require("../../pages/api/issues").default;
      const { req, res } = createMocks({
        method: "POST",
        body: { title: "Valid issue" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(504);
      expect(JSON.parse(res._getData()).error).toBe(
        "Upstream request timed out",
      );
    });
  });
});
