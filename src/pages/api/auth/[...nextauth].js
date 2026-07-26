// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

// Single-host OAuth configuration.
//
// This site is currently served from ONE public host:
// `https://blog.huangjien.com` (configured in gateway/config/gateway.yaml,
// and the GitHub/Google OAuth apps were registered with exactly this
// callback URL: `https://blog.huangjien.com/api/auth/callback/{provider}`).
//
// We therefore set `url: process.env.NEXTAUTH_URL` so NextAuth v4 derives
// its canonical base URL consistently regardless of which internal
// interface the request came in on. If `NEXTAUTH_URL` is not set, we fall
// back to letting NextAuth derive it from request headers.
//
// Multi-host future: if the gateway starts routing more subdomains here
// (e.g. `www.huangjien.com`), each must be registered as an OAuth callback
// URL at GitHub/Google first. Then the simplest options are:
//   1. Pick one canonical host and set NEXTAUTH_URL to it (other hosts
//      will need to redirect to the canonical one before the OAuth dance).
//   2. Omit `url:` and rely on the gateway's forwarded `Host` /
//      `X-Forwarded-Proto` headers (PROXY_HEADERS in
//      gateway/scripts/render_config.py already forwards both).

const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

// Read NEXTAUTH_SECRET defensively. The NextAuth v4 default-detect code
// looks for `process.env.NEXTAUTH_SECRET` and falls back to a development
// string when it is missing, throwing on first use in production. We do
// our own check up front so we can log the real state, then return a
// graceful 500 from a request-time handler instead of throwing at
// module-load time (which Next.js's outer handler converts to an opaque
// HTTP 500 with no log output — observed in Jenkins builds #1488 and
// #1490, where `/api/auth/providers` returned 500 in 0ms with empty
// container logs and an apparently-correct NEXTAUTH_SECRET of 64 chars).
const _rawSecret = process.env.NEXTAUTH_SECRET;
const _rawSecretType = typeof _rawSecret;
const _rawSecretLen = _rawSecret == null ? 0 : _rawSecret.length;
const _trimmedSecret = typeof _rawSecret === "string" ? _rawSecret.trim() : "";
const NEXTAUTH_SECRET =
  _trimmedSecret || "development-secret-do-not-use-in-production";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ...add more providers here if needed
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.avatar_url = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.avatar_url = token.avatar_url;
      return session;
    },
  },
  secret: NEXTAUTH_SECRET,
  ...(NEXTAUTH_URL ? { url: NEXTAUTH_URL } : {}),
  pages: {
    error: "/auth/error",
  },
};

let handler = null;
if (
  process.env.NODE_ENV === "production" &&
  NEXTAUTH_SECRET === "development-secret-do-not-use-in-production"
) {
  // Log the real env state once at module-load. The deploy pipeline can
  // surface this line in `docker logs` and turn it into a clear failure
  // message instead of a silent HTTP 500.
  console.error(
    "[nextauth] NEXTAUTH_SECRET missing or invalid in production.",
    "raw type:",
    _rawSecretType,
    "raw length:",
    _rawSecretLen,
    "trimmed length:",
    _trimmedSecret.length,
    "NODE_ENV:",
    process.env.NODE_ENV,
    "NEXTAUTH_URL:",
    NEXTAUTH_URL || "(unset)",
  );
  // Return a request-time handler that always emits a structured 500
  // with the actual error in the body. The route module is now safe to
  // load — it never throws — so any request gets a deterministic
  // response and the route module is not stuck in a failed state.
  handler = function misconfiguredHandler(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.status(500).json({
      error: "ConfigurationError",
      message: "NEXTAUTH_SECRET is missing or invalid in production",
      detail: {
        rawType: _rawSecretType,
        rawLength: _rawSecretLen,
        trimmedLength: _trimmedSecret.length,
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: NEXTAUTH_URL || null,
      },
    });
  };
} else {
  handler = NextAuth(authOptions);
}

export default handler;
