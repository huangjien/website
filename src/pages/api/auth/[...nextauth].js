// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const NEXTAUTH_SECRET =
  (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim()) ||
  "development-secret-do-not-use-in-production";

if (
  process.env.NODE_ENV === "production" &&
  NEXTAUTH_SECRET === "development-secret-do-not-use-in-production"
) {
  throw new Error("NEXTAUTH_SECRET must be set in production");
}

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

export default NextAuth(authOptions);
