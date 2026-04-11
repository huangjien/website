import {
  fetchWithTimeout,
  parseErrorResponse,
} from "../../lib/fetchWithTimeout";
import {
  ApiError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ensureMethod,
  logApiEvent,
  withErrorHandling,
} from "../../lib/apiClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { checkRateLimit } from "../../lib/rateLimit";
import { recordError, recordRequest } from "../../lib/metrics";

export const config = {
  api: {
    externalResolver: true,
  },
};

const MAX_BODY_LENGTH = 65536;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_COMMENTS_PER_HOUR = 30;

const handler = withErrorHandling(async (req, res) => {
  if (!ensureMethod(req, res, ["GET", "POST"])) {
    return;
  }
  const method = req.method || "GET";
  const mutationRoute = "/api/comments";
  let mutationStartMs = null;
  const handleMutationFailure = (error, reason) => {
    const status = error?.status || 500;
    const durationMs =
      mutationStartMs === null ? 0 : Math.max(0, Date.now() - mutationStartMs);
    recordRequest(mutationRoute, "POST", status, durationMs);
    recordError(mutationRoute, error?.name || "Error");
    logApiEvent("warn", "comment_post_failure", req, {
      reason,
      status,
      errorName: error?.name || "Error",
      durationMs,
    });
    throw error;
  };

  if (method === "POST") {
    mutationStartMs = Date.now();
    logApiEvent("info", "comment_post_attempt", req, {
      issueNumber: req.query?.issue_number || null,
      rawBodyLength:
        typeof req.body?.body === "string" ? req.body.body.length : 0,
    });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    if (method === "POST") {
      handleMutationFailure(new AuthenticationError("Unauthorized"), "auth");
    }
    throw new AuthenticationError("Unauthorized");
  }

  if (!process.env.GITHUB_TOKEN) {
    throw new ApiError("GitHub token not configured", 500);
  }

  if (!process.env.GITHUB_REPO) {
    throw new ApiError("GitHub repository not configured", 500);
  }

  const { issue_number } = req.query;
  if (!issue_number) {
    throw new ValidationError("issue_number is required");
  }

  if (method === "POST") {
    const userId = session.user?.email || session.user?.name || "anonymous";
    const rateLimitResult = checkRateLimit(
      `comment:${userId}`,
      MAX_COMMENTS_PER_HOUR,
      RATE_LIMIT_WINDOW_MS,
    );

    if (!rateLimitResult.allowed) {
      handleMutationFailure(
        new RateLimitError(
          Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
          rateLimitResult.resetAt,
        ),
        "rate_limit",
      );
    }

    const body = req.body || {};
    if (
      !body.body ||
      typeof body.body !== "string" ||
      body.body.trim().length === 0
    ) {
      handleMutationFailure(
        new ValidationError("Comment body is required"),
        "validation",
      );
    }
    if (body.body.length > MAX_BODY_LENGTH) {
      handleMutationFailure(
        new ValidationError(
          `Comment must be ${MAX_BODY_LENGTH} characters or less`,
        ),
        "validation",
      );
    }
    const normalizedBody = body.body.trim();

    try {
      const response = await fetchWithTimeout(
        `${process.env.GITHUB_REPO}/issues/${issue_number}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github+json",
          },
          body: JSON.stringify({ body: normalizedBody }),
        },
        10000,
      );

      if (!response.ok) {
        const message = await parseErrorResponse(response);
        throw new ApiError(message, response.status);
      }

      const data = await response.json();
      const durationMs = Math.max(0, Date.now() - mutationStartMs);
      recordRequest(mutationRoute, "POST", 201, durationMs);
      logApiEvent("info", "comment_post_success", req, {
        status: 201,
        durationMs,
        issueNumber: req.query?.issue_number || null,
      });
      return res.status(201).send(data);
    } catch (error) {
      const normalizedError =
        error?.name === "AbortError"
          ? new ApiError("Upstream request timed out", 504)
          : error;
      handleMutationFailure(normalizedError, "upstream");
    }
  }

  try {
    const response = await fetchWithTimeout(
      `${process.env.GITHUB_REPO}/issues/${issue_number}/comments`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      },
      10000,
    );

    if (!response.ok) {
      const message = await parseErrorResponse(response);
      throw new ApiError(message, response.status);
    }

    const data = await response.json();
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    return res.status(200).send(data);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError("Upstream request timed out", 504);
    }
    throw error;
  }
});

export default handler;
