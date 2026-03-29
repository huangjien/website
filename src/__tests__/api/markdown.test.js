import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

global.fetch = jest.fn();

describe("/api/markdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_TOKEN = "test-token";
    getServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });
  });

  it("returns 405 for non-POST methods", async () => {
    const handler = require("../../pages/api/markdown").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader("Allow")).toBe("POST");
  });

  it("returns 401 when session is missing", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const handler = require("../../pages/api/markdown").default;
    const { req, res } = createMocks({ method: "POST", body: "# Test" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData()).error).toBe("Unauthorized");
  });

  it("should convert markdown text to HTML successfully", async () => {
    const mockHtml = "<h1>Hello World</h1>\n<p>This is a test.</p>";
    const markdownText = "# Hello World\nThis is a test.";

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
      ok: true,
    });

    const handler = require("../../pages/api/markdown").default;
    const { req, res } = createMocks({
      method: "POST",
      body: markdownText,
    });

    await handler(req, res);

    expect(fetch).toHaveBeenCalledWith("https://api.github.com/markdown", {
      method: "POST",
      headers: {
        Authorization: "token test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: markdownText }),
    });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toBe(mockHtml);
  });

  it("should handle GitHub API errors", async () => {
    const markdownText = "# Test";

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: "GitHub API Error" }),
    });

    const handler = require("../../pages/api/markdown").default;
    const { req, res } = createMocks({
      method: "POST",
      body: markdownText,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("GitHub API Error");
  });

  it("should handle missing GitHub token", async () => {
    delete process.env.GITHUB_TOKEN;

    const handler = require("../../pages/api/markdown").default;
    const { req, res } = createMocks({
      method: "POST",
      body: "# Test",
    });

    await handler(req, res);

    expect(fetch).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("GitHub token not configured");
  });
});
