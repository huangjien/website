// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const NEXTAUTH_URL =
  (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim()) ||
  "http://localhost:3000";
const NEXTAUTH_SECRET =
  (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim()) ||
  "development-secret-do-not-use-in-production";

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
  url: NEXTAUTH_URL,
  pages: {
    error: "/api/auth/error",
  },
};

export default NextAuth(authOptions);
