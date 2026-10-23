import { createMocks } from "node-mocks-http";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next-auth/jwt", () => ({
  encode: jest.fn(async () => "fake-session-token"),
}));

jest.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

const originalEnv = process.env;

const loadHandler = () => {
  jest.resetModules();
  return require("../../pages/api/dev/session").default;
};

const setEnv = (overrides) => {
  process.env = {
    ...originalEnv,
    ...overrides,
  };
};

describe("/api/dev/session", () => {
  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  it("refuses to run in production NODE_ENV", async () => {
    setEnv({
      NODE_ENV: "production",
      GITHUB_REPO: "https://api.github.com/repos/test/repo",
      GITHUB_TOKEN: "test-token",
      BLOG_AUTHOR_EMAILS: "owner@example.com",
    });
    const handler = loadHandler();
    const { req, res } = createMocks({
      method: "POST",
      body: { email: "owner@example.com" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });

  it("refuses to run when remote address is not loopback", async () => {
    setEnv({
      NODE_ENV: "development",
      GITHUB_REPO: "https://api.github.com/repos/test/repo",
      GITHUB_TOKEN: "test-token",
      BLOG_AUTHOR_EMAILS: "owner@example.com",
    });
    const handler = loadHandler();
    const { req, res } = createMocks({
      method: "POST",
      body: { email: "owner@example.com" },
      headers: { "x-forwarded-for": "203.0.113.7" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });

  it("issues a session for an allowlisted email from loopback", async () => {
    setEnv({
      NODE_ENV: "development",
      GITHUB_REPO: "https://api.github.com/repos/test/repo",
      GITHUB_TOKEN: "test-token",
      BLOG_AUTHOR_EMAILS: "owner@example.com,reader@example.com",
    });
    const handler = loadHandler();
    const { req, res } = createMocks({
      method: "POST",
      body: { email: "OWNER@EXAMPLE.com" },
      headers: { "x-forwarded-for": "127.0.0.1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      canPublish: true,
    });
    const setCookie = res.getHeader("Set-Cookie") || [];
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    expect(
      cookies.some((c) => String(c).includes("next-auth.session-token=")),
    ).toBe(true);
  });

  it("reports canPublish=false but 200 when email is not allowlisted", async () => {
    setEnv({
      NODE_ENV: "development",
      GITHUB_REPO: "https://api.github.com/repos/test/repo",
      GITHUB_TOKEN: "test-token",
      BLOG_AUTHOR_EMAILS: "owner@example.com",
    });
    const handler = loadHandler();
    const { req, res } = createMocks({
      method: "POST",
      body: { email: "stranger@example.com" },
      headers: { "x-forwarded-for": "127.0.0.1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      canPublish: false,
    });
  });

  it("rejects non-POST methods", async () => {
    setEnv({
      NODE_ENV: "development",
      GITHUB_REPO: "https://api.github.com/repos/test/repo",
      GITHUB_TOKEN: "test-token",
    });
    const handler = loadHandler();
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
