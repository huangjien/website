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

  it("allows authenticated POST", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
    fetchWithTimeout.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, title: "New issue" }),
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
});
