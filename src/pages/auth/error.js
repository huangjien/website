"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function AuthError() {
  const router = useRouter();
  const rawError = router?.query?.error;
  const error = Array.isArray(rawError) ? rawError[0] : rawError;

  useEffect(() => {
    console.error("Auth Error:", error);
  }, [error]);

  const description =
    error === "OAuthSignin"
      ? "Sign-in couldn't start."
      : error === "OAuthCallback"
        ? "Sign-in callback failed."
        : error === "SessionRequired"
          ? "Sign in required."
          : error === "Default"
            ? "Authentication error."
            : "An unknown error occurred.";

  const errorCode = error || "Unknown";

  return (
    <div className='hallmark-page' data-route='error'>
      <div className='hallmark-auth-error'>
        <p className='hallmark-error-stat'>
          {errorCode.slice(0, 12)}
          <span className='hallmark-error-stat__dot'>.</span>
        </p>
        <h1 className='hallmark-error-message'>{description}</h1>
        <p className='hallmark-error-lede'>
          Error code:{" "}
          <code className='hallmark-auth-error__code'>{errorCode}</code>
        </p>
        <div className='hallmark-error-actions'>
          <Link href='/' className='hallmark-cta hallmark-cta--primary'>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
