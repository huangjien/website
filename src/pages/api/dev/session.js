import { encode } from "next-auth/jwt";
import {
  ApiError,
  withErrorHandling,
  getClientIp,
} from "../../../lib/apiClient";
import { parseBlogAuthorEmails } from "../../../lib/blogAuthor";

const isLoopbackAddress = (ip) => {
  if (!ip) return false;
  if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("::ffff:127.")) return true;
  return false;
};

const isDevEnvironment = () => process.env.NODE_ENV !== "production";

const buildSessionCookie = (token, maxAge) => {
  const useSecureCookies = Boolean(
    process.env.NEXTAUTH_URL?.startsWith("https://"),
  );
  const name = useSecureCookies
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
  const parts = [
    `${name}=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAge}`,
  ];
  if (useSecureCookies) parts.push("Secure");
  return parts.join("; ");
};

/**
 * Dev-only session injection endpoint.
 *
 * Only responds when ALL of the following are true:
 * - NODE_ENV is not "production"
 * - request originates from a loopback address (127.0.0.1 / ::1)
 * - the requested email matches BLOG_AUTHOR_EMAILS
 *
 * In all other cases it returns 404 (indistinguishable from a missing route).
 */
const handler = withErrorHandling(async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    throw new ApiError("Method Not Allowed", 405);
  }

  if (!isDevEnvironment() || !isLoopbackAddress(getClientIp(req))) {
    res.status(404);
    return;
  }

  const rawEmail =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";
  if (!rawEmail) {
    res.status(200).json({ canPublish: false });
    return;
  }

  const normalizedEmail = rawEmail.toLowerCase();
  const allowlist = parseBlogAuthorEmails(process.env.BLOG_AUTHOR_EMAILS);
  const isOwner = allowlist.includes(normalizedEmail);

  if (!isOwner) {
    res.status(200).json({ canPublish: false });
    return;
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new ApiError("NEXTAUTH_SECRET is not configured", 500);
  }

  const maxAge = 60 * 60;
  const token = await encode({
    token: {
      name: "Local Dev",
      email: normalizedEmail,
      sub: `dev|${normalizedEmail}`,
      picture: null,
      avatar_url: null,
    },
    secret,
    maxAge,
  });

  res.setHeader("Set-Cookie", buildSessionCookie(token, maxAge));
  res.status(200).json({ canPublish: true });
});

export default handler;
