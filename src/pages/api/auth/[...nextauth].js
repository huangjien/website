// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
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
  },
  async session({ session, token }) {
    session.user.avatar_url = token.avatar_url;
    return session;
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Optional: Customize pages, callbacks, etc.
  // pages: {
  //   signIn: '/auth/signin',
  // },
});
