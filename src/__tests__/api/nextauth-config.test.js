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
