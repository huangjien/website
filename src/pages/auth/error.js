"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AuthError({ searchParams }) {
  const error = searchParams?.error;

  useEffect(() => {
    console.error("Auth Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-destructive">
          Authentication Error
        </h1>
        <p className="mb-4 text-muted-foreground">
          {error === "OAuthSignin" && "Error starting sign in flow."}
          {error === "OAuthCallback" && "Error during OAuth callback."}
          {error === "Default" && "Default error."}
          {error === "SessionRequired" && "Please sign in to view this page."}
          {!error && "An unknown error occurred."}
        </p>
        <p className="text-sm text-muted-foreground">
          Error code: {error || "unknown"}
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
