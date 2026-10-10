import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

describe("GET /api/author", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      BLOG_AUTHOR_EMAILS: "owner@example.com",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns a public unauthenticated capability response", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const handler = require("../../pages/api/author").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      authenticated: false,
      canPublish: false,
    });
  });

  it("allows only the configured owner", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "OWNER@example.com" },
    });
    const handler = require("../../pages/api/author").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(JSON.parse(res._getData())).toEqual({
      authenticated: true,
      canPublish: true,
    });
  });

  it("does not expose the configured email to another signed-in user", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "reader@example.com" },
    });
    const handler = require("../../pages/api/author").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(JSON.parse(res._getData())).toEqual({
      authenticated: true,
      canPublish: false,
    });
    expect(res._getData()).not.toContain("owner@example.com");
  });

  it("rejects unsupported methods", async () => {
    const handler = require("../../pages/api/author").default;
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
