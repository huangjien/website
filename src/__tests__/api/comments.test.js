import { createMocks } from "node-mocks-http";
import {
  fetchWithTimeout,
  parseErrorResponse,
} from "../../lib/fetchWithTimeout";

jest.mock("../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
  parseErrorResponse: jest.fn(),
}));

describe("/api/comments", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      GITHUB_TOKEN: "test-token",
      GITHUB_REPO: "https://api.github.com/repos/test/repo",
    };
    parseErrorResponse.mockResolvedValue("GitHub API Error");
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 405 for non-GET methods", async () => {
    const handler = require("../../pages/api/comments").default;
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader("Allow")).toBe("GET");
  });

  it("returns 400 when issue_number is missing", async () => {
    const handler = require("../../pages/api/comments").default;
    const { req, res } = createMocks({ method: "GET", query: {} });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe("issue_number is required");
  });

  it("returns 200 and comment payload on success", async () => {
    fetchWithTimeout.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, body: "hello" }],
    });

    const handler = require("../../pages/api/comments").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { issue_number: "1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(fetchWithTimeout).toHaveBeenCalledWith(
      "https://api.github.com/repos/test/repo/issues/1/comments",
      expect.any(Object),
      10000,
    );
  });

  it("returns upstream status when GitHub returns non-ok response", async () => {
    fetchWithTimeout.mockResolvedValueOnce({
      ok: false,
      status: 403,
    });
    parseErrorResponse.mockResolvedValueOnce("Forbidden");

    const handler = require("../../pages/api/comments").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { issue_number: "1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData()).error).toBe("Forbidden");
  });
});
