/**
 * Regression test for the OAuth canonical-URL alignment bug.
 *
 * Symptom: clicking sign-in bounced to /api/auth/error (HTTP 500) because
 * the canonical URL NextAuth used did not match the callback URL registered
 * at the OAuth provider.
 *
 * Fix: keep NEXTAUTH_URL / `url:` aligned with the single registered host.
 * The site is currently served from exactly one public host
 * (https://blog.huangjien.com), and that host's callback URL is what's
 * registered at GitHub/Google. Setting `url: NEXTAUTH_URL` makes the
 * canonical base URL deterministic regardless of which internal interface
 * the request came in on.
 *
 * This test pins two behaviors:
 *   1. When NEXTAUTH_URL is set in env, authOptions.url mirrors it exactly
 *      (no defaulting, no trimming, no trailing slash surprises).
 *   2. When NEXTAUTH_URL is unset in env, authOptions.url is undefined
 *      (defensive — should not silently fall back to a hardcoded value).
 */

jest.mock("next-auth", () => {
  // Capture the options object handed to NextAuth() so we can assert on it
  // without actually initializing the full OAuth state machine.
  const mock = jest.fn((options) => ({
    options,
    handlers: { GET: jest.fn(), POST: jest.fn() },
  }));
  return { __esModule: true, default: mock };
});

jest.mock("next-auth/providers/github", () => {
  const g = jest.fn(() => ({ id: "github" }));
  return { __esModule: true, default: g };
});

jest.mock("next-auth/providers/google", () => {
  const g = jest.fn(() => ({ id: "google" }));
  return { __esModule: true, default: g };
});

const ENV_BACKUP = { ...process.env };

afterEach(() => {
  process.env = { ...ENV_BACKUP };
});

describe("NextAuth config: canonical URL mirrors NEXTAUTH_URL when set", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "test-secret";
    process.env.NODE_ENV = "test";
  });

  it("passes NEXTAUTH_URL through to authOptions.url exactly when set", () => {
    process.env.NEXTAUTH_URL = "https://blog.huangjien.com";
    const captured = require("next-auth");
    require("../../pages/api/auth/[...nextauth]");
    expect(captured.default).toHaveBeenCalled();
    const opts = captured.default.mock.calls[0][0];
    expect(opts.url).toBe("https://blog.huangjien.com");
  });

  it("leaves authOptions.url undefined when NEXTAUTH_URL is not set", () => {
    delete process.env.NEXTAUTH_URL;
    const captured = require("next-auth");
    require("../../pages/api/auth/[...nextauth]");
    expect(captured.default).toHaveBeenCalled();
    const opts = captured.default.mock.calls[0][0];
    expect(opts.url).toBeUndefined();
  });
});

/**
 * Regression test for the silent-failure bug that produced opaque HTTP 500s
 * on /api/auth/providers in Jenkins builds #1488 and #1490.
 *
 * Earlier behavior: when NEXTAUTH_SECRET was missing in production, the
 * route module threw at load time. Next.js's outer handler caught the
 * throw and converted it to an HTML "500: Internal Server Error" page,
 * with no log output. The deploy pipeline saw the 500 but had no way to
 * tell what was wrong (the env file looked correct, the container logs
 * showed only "Ready in 0ms").
 *
 * Fix: route module never throws. If NEXTAUTH_SECRET is missing or empty
 * in production, the handler emits a structured JSON 500 with the actual
 * env state in the body. The deploy pipeline can curl this endpoint and
 * see the real error without having to attach to the container.
 */
describe("NextAuth config: misconfiguration in production never throws", () => {
  let consoleErrorSpy;
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NODE_ENV = "production";
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    delete process.env.NEXTAUTH_SECRET;
  });

  it("does not throw at module load when NEXTAUTH_SECRET is missing", () => {
    delete process.env.NEXTAUTH_SECRET;
    expect(() => {
      require("../../pages/api/auth/[...nextauth]");
    }).not.toThrow();
  });

  it("does not throw at module load when NEXTAUTH_SECRET is whitespace", () => {
    process.env.NEXTAUTH_SECRET = "   ";
    expect(() => {
      require("../../pages/api/auth/[...nextauth]");
    }).not.toThrow();
  });

  it("returns a structured 500 JSON from the request handler when misconfigured", () => {
    delete process.env.NEXTAUTH_SECRET;
    const mod = require("../../pages/api/auth/[...nextauth]");
    const handler = mod.default;
    const req = {
      method: "GET",
      query: { nextauth: ["providers"] },
      body: {},
      headers: {},
    };
    let body = null;
    let status = null;
    let ctype = null;
    const res = {
      setHeader: (k, v) => {
        if (k.toLowerCase() === "content-type") ctype = v;
      },
      status: (s) => {
        status = s;
        return res;
      },
      json: (j) => {
        body = j;
        return res;
      },
    };
    expect(typeof handler).toBe("function");
    handler(req, res);
    expect(status).toBe(500);
    expect(ctype).toBe("application/json");
    expect(body.error).toBe("ConfigurationError");
    expect(body.message).toMatch(/NEXTAUTH_SECRET/);
    expect(body.detail.rawType).toBe("undefined");
    expect(body.detail.trimmedLength).toBe(0);
  });

  it("logs the actual env state to console.error at module load when misconfigured", () => {
    delete process.env.NEXTAUTH_SECRET;
    require("../../pages/api/auth/[...nextauth]");
    expect(consoleErrorSpy).toHaveBeenCalled();
    const msg = consoleErrorSpy.mock.calls[0].join(" ");
    expect(msg).toMatch(/NEXTAUTH_SECRET/);
    expect(msg).toMatch(/production/);
  });
});
