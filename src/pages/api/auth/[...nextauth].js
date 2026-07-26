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

// NOTE: DO NOT set NEXTAUTH_URL / DO NOT pass `url:` here.
//
// This site is served via the gateway from BOTH blog.huangjien.com and
// www.huangjien.com (see gateway/config/gateway.yaml), and may rotate
// between subdomains. NextAuth v4 derives its canonical base URL in one
// of two ways:
//
//   1. From the `url:` option / `NEXTAUTH_URL` env var  (NOT what we want —
//      it pins auth to ONE host, breaking OAuth callbacks on the others).
//   2. From the inbound request headers `x-forwarded-host` / `host`,
//      combined with `x-forwarded-proto`. (Needed when `url`/env are unset.)
//
// The gateway already forwards these correctly via `proxy_set_header Host
// $host;` and `proxy_set_header X-Forwarded-Proto $scheme;` (see
// gateway/scripts/render_config.py, PROXY_HEADERS). So omitting `url:`
// is what makes both https://blog.huangjien.com and https://www.huangjien.com
// work side-by-side.
//
// Prerequisite: register the OAuth callback URL for EACH host you'll use at
// GitHub and Google:
//   https://blog.huangjien.com/api/auth/callback/github
//   https://www.huangjien.com/api/auth/callback/github
//   (and the google equivalents)

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
  pages: {
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);
