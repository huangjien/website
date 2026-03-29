import {
  fetchWithTimeout,
  parseErrorResponse,
} from "../../lib/fetchWithTimeout";
import {
  ApiError,
  ValidationError,
  ensureMethod,
  withErrorHandling,
} from "../../lib/apiClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { checkRateLimit } from "../../lib/rateLimit";

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

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    throw new ApiError("Unauthorized", 401);
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

  const method = req.method || "GET";

  if (method === "POST") {
    const userId = session.user?.email || session.user?.name || "anonymous";
    const rateLimitResult = await checkRateLimit(
      `comment:${userId}`,
      MAX_COMMENTS_PER_HOUR,
      RATE_LIMIT_WINDOW_MS,
    );

    if (!rateLimitResult.success) {
      throw new ApiError(
        `Rate limit exceeded. Please wait ${Math.ceil(rateLimitResult.retryAfter / 1000)} seconds.`,
        429,
      );
    }

    const body = req.body || {};
    if (
      !body.body ||
      typeof body.body !== "string" ||
      body.body.trim().length === 0
    ) {
      throw new ValidationError("Comment body is required");
    }
    if (body.body.length > MAX_BODY_LENGTH) {
      throw new ValidationError(
        `Comment must be ${MAX_BODY_LENGTH} characters or less`,
      );
    }

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
          body: JSON.stringify({ body: body.body }),
        },
        10000,
      );

      if (!response.ok) {
        const message = await parseErrorResponse(response);
        throw new ApiError(message, response.status);
      }

      const data = await response.json();
      return res.status(201).send(data);
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new ApiError("Upstream request timed out", 504);
      }
      throw error;
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
