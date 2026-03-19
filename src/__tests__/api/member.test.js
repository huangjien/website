import { createMocks } from "node-mocks-http";
import {
  fetchWithTimeout,
  parseErrorResponse,
} from "../../lib/fetchWithTimeout";

jest.mock("../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
  parseErrorResponse: jest.fn(),
}));

describe("/api/member", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      GITHUB_TOKEN: "test-token",
      GITHUB_MEMBER: "https://api.github.com/orgs/test/teams/admin/members",
    };
    parseErrorResponse.mockResolvedValue("GitHub API Error");
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 405 for non-GET methods", async () => {
    const handler = require("../../pages/api/member").default;
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader("Allow")).toBe("GET");
  });

  it("returns 500 when token is missing", async () => {
    delete process.env.GITHUB_TOKEN;
    const handler = require("../../pages/api/member").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData()).error).toBe(
      "GitHub token not configured",
    );
  });

  it("returns 200 and member payload on success", async () => {
    fetchWithTimeout.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ login: "dev" }],
    });

    const handler = require("../../pages/api/member").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(fetchWithTimeout).toHaveBeenCalledWith(
      "https://api.github.com/orgs/test/teams/admin/members",
      expect.any(Object),
      10000,
    );
  });

  it("returns upstream status when GitHub returns non-ok response", async () => {
    fetchWithTimeout.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });
    parseErrorResponse.mockResolvedValueOnce("Not Found");

    const handler = require("../../pages/api/member").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData()).error).toBe("Not Found");
  });
});
