import { createMocks } from "node-mocks-http";
import {
  fetchWithTimeout,
  parseErrorResponse,
} from "../../lib/fetchWithTimeout";

jest.mock("../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
  parseErrorResponse: jest.fn(),
}));

describe("/api/labels", () => {
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
    const handler = require("../../pages/api/labels").default;
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader("Allow")).toBe("GET");
  });

  it("returns 500 when repository is missing", async () => {
    delete process.env.GITHUB_REPO;
    const handler = require("../../pages/api/labels").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData()).error).toBe(
      "GitHub repository not configured",
    );
  });

  it("returns 200 and labels payload on success", async () => {
    fetchWithTimeout.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: "bug" }],
    });

    const handler = require("../../pages/api/labels").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(fetchWithTimeout).toHaveBeenCalledWith(
      "https://api.github.com/repos/test/repo/labels",
      expect.any(Object),
      10000,
    );
  });

  it("returns upstream status when GitHub returns non-ok response", async () => {
    fetchWithTimeout.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });
    parseErrorResponse.mockResolvedValueOnce("Unauthorized");

    const handler = require("../../pages/api/labels").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData()).error).toBe("Unauthorized");
  });
});
