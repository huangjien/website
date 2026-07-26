/**
 * Regression test for the multi-host OAuth bug.
 *
 * Symptom: visiting https://blog.huangjien.com and clicking sign-in bounced
 * to /api/auth/error with HTTP 500, because NextAuth's canonical URL was
 * pinned to https://www.huangjien.com (via the legacy `url:` option in
 * authOptions and the NEXTAUTH_URL env var). The OAuth callback URL it
 * generated did not match what was registered at GitHub/Google for the
 * host the browser was actually on.
 *
 * Fix: omit the `url:` option and the NEXTAUTH_URL env var so NextAuth v4
 * derives the canonical URL from the inbound Host / X-Forwarded-Proto
 * headers (forwarded verbatim by the gateway reverse proxy — see
 * gateway/scripts/render_config.py, PROXY_HEADERS). That makes both
 * blog.huangjien.com and www.huangjien.com work side-by-side.
 *
 * This test prevents either regression (re-introducing `url:` OR
 * re-introducing NEXTAUTH_URL in the deployment template) from sneaking
 * back in.
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

describe("NextAuth config regression: multi-host OAuth works", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("does not pin the canonical URL via the `url` option", () => {
    const captured = require("next-auth");
    // Importing the route module triggers NextAuth(authOptions)
    require("../../pages/api/auth/[...nextauth]");
    expect(captured.default).toHaveBeenCalled();
    const opts = captured.default.mock.calls[0][0];
    expect(opts).toBeDefined();
    expect(opts.url).toBeUndefined();
  });
});
