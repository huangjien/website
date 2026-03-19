import handler from "../../pages/api/settings";
import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
process.env.GITHUB_REPO = "https://api.github.com/repos/test/repo";
process.env.GITHUB_TOKEN = "test-token";

describe("/api/settings", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    fetch.mockClear();
    getServerSession.mockReset();
    process.env = { ...originalEnv };
    process.env.GITHUB_REPO = "https://api.github.com/repos/test/repo";
    process.env.GITHUB_TOKEN = "test-token";
    getServerSession.mockResolvedValue({ user: { email: "test@example.com" } });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should reject non-GET methods", async () => {
    const { req, res } = createMocks({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader("Allow")).toBe("GET");
    expect(JSON.parse(res._getData())).toEqual({
      error: "Method Not Allowed",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should return settings data successfully", async () => {
    const mockIssues = [
      {
        id: 1,
        title: "Test Setting",
        body: "Test setting content",
        labels: [{ name: "settings" }],
      },
    ];

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockIssues),
      ok: true,
    });

    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/test/repo/issues?labels=settings",
      {
        method: "GET",
        headers: {
          Authorization: "token test-token",
          Accept: "application/vnd.github.v3+json",
        },
      },
    );
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      result: "Test setting content",
    });
  });

  it("should return 401 when user is unauthenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData()).error).toBe("Unauthorized");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should return 500 when GitHub token is missing", async () => {
    delete process.env.GITHUB_TOKEN;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData()).error).toBe(
      "GitHub token not configured",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should return 500 when GitHub repository is missing", async () => {
    delete process.env.GITHUB_REPO;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData()).error).toBe(
      "GitHub repository not configured",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should propagate GitHub API status and message", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not found" }),
    });

    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Not found",
      details: null,
    });
  });

  it("should return 502 when GitHub response is not an array", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpected: "shape" }),
    });

    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(502);
    expect(JSON.parse(res._getData()).error).toBe(
      "Invalid response from GitHub API",
    );
  });

  it("should handle fetch errors gracefully", async () => {
    const mockError = new Error("Network failed");

    fetch.mockRejectedValueOnce(mockError);

    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: "Network failed",
    });
  });
});
