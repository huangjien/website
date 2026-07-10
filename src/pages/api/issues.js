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
import { recordRequest } from "../../lib/metrics";
import { createMutationFailureHandler } from "../../lib/api/mutation-telemetry";

const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 65536;
const MAX_LABELS = 20;
const MAX_LABEL_LENGTH = 50;
const MAX_ISSUES_PER_HOUR = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
/**
 * Maximum number of issues for which inline comments are fetched when
 * `includeComments=1` is requested. This caps the per-issue fan-out to the
 * GitHub API (one request per issue), which would otherwise be an N+1 query
 * proportional to the page size. Issues beyond this cap are returned without a
 * `__comments` field; clients that need comments for them should fetch them
 * per-issue via a dedicated call.
 */
export const MAX_ISSUES_WITH_COMMENTS = 10;

export const config = {
  api: {
    externalResolver: true,
  },
};

const handler = withErrorHandling(async (req, res) => {
  if (!ensureMethod(req, res, ["GET", "POST"])) {
    return;
  }

  if (!process.env.GITHUB_TOKEN) {
    throw new ApiError("GitHub token not configured", 500);
  }

  if (!process.env.GITHUB_REPO) {
    throw new ApiError("GitHub repository not configured", 500);
  }

  const method = req.method || "GET";
  const isGet = method === "GET";
  const includeComments = req.query?.includeComments === "1";
  const mutationRoute = "/api/issues";
  let mutationStartMs = null;
  const handleMutationFailure = createMutationFailureHandler({
    route: mutationRoute,
    eventName: "issue_post_failure",
    req,
    getStartMs: () => mutationStartMs,
  });

  if (!isGet) {
    mutationStartMs = Date.now();
    const requestBody = req.body || {};
    logApiEvent("info", "issue_post_attempt", req, {
      rawTitleLength:
        typeof requestBody.title === "string" ? requestBody.title.length : 0,
      rawBodyLength:
        typeof requestBody.body === "string" ? requestBody.body.length : 0,
      rawLabelCount: Array.isArray(requestBody.labels)
        ? requestBody.labels.length
        : 0,
    });

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      handleMutationFailure(new AuthenticationError("Unauthorized"), "auth");
    }

    const userId = session.user?.email || session.user?.name || "anonymous";
    const rateLimitResult = checkRateLimit(
      `issue:${userId}`,
      MAX_ISSUES_PER_HOUR,
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
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      handleMutationFailure(
        new ValidationError("Title is required"),
        "validation",
      );
    }
    const normalizedTitle = body.title.trim();
    if (normalizedTitle.length > MAX_TITLE_LENGTH) {
      handleMutationFailure(
        new ValidationError(
          `Title must be ${MAX_TITLE_LENGTH} characters or less`,
        ),
        "validation",
      );
    }

    if (
      body.body !== undefined &&
      body.body !== null &&
      typeof body.body !== "string"
    ) {
      handleMutationFailure(
        new ValidationError("Body must be a string"),
        "validation",
      );
    }
    const normalizedBody =
      typeof body.body === "string" ? body.body.trim() : undefined;
    if (normalizedBody && normalizedBody.length > MAX_BODY_LENGTH) {
      handleMutationFailure(
        new ValidationError(
          `Body must be ${MAX_BODY_LENGTH} characters or less`,
        ),
        "validation",
      );
    }
    let normalizedLabels;
    if (body.labels !== undefined) {
      if (!Array.isArray(body.labels)) {
        handleMutationFailure(
          new ValidationError("Labels must be an array"),
          "validation",
        );
      }
      normalizedLabels = [
        ...new Set(body.labels.map((label) => label?.trim?.())),
      ];
      if (normalizedLabels.length > MAX_LABELS) {
        handleMutationFailure(
          new ValidationError(`Maximum ${MAX_LABELS} labels allowed`),
          "validation",
        );
      }
      for (const label of normalizedLabels) {
        if (
          typeof label !== "string" ||
          label.length === 0 ||
          label.length > MAX_LABEL_LENGTH
        ) {
          handleMutationFailure(
            new ValidationError(
              `Each label must be a non-empty string of ${MAX_LABEL_LENGTH} characters or less`,
            ),
            "validation",
          );
        }
      }
    }

    req.mutationPayload = {
      title: normalizedTitle,
      ...(normalizedBody ? { body: normalizedBody } : {}),
      ...(normalizedLabels?.length ? { labels: normalizedLabels } : {}),
    };
  }

  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };

  try {
    const response = await fetchWithTimeout(
      `${process.env.GITHUB_REPO}/issues`,
      {
        method,
        headers,
        ...(isGet ? {} : { body: JSON.stringify(req.mutationPayload || {}) }),
      },
      10000,
    );

    if (!response.ok) {
      const message = await parseErrorResponse(response);
      throw new ApiError(message, response.status);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      if (!isGet) {
        const durationMs = Math.max(0, Date.now() - mutationStartMs);
        recordRequest(mutationRoute, "POST", 200, durationMs);
        logApiEvent("info", "issue_post_success", req, {
          status: 200,
          durationMs,
          issueNumber: data?.number || null,
        });
      }
      return res.status(200).send(data);
    }

    if (!isGet) {
      return res.status(200).send(data);
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );

    if (!includeComments) {
      return res.status(200).send(data);
    }

    // N+1 guard: fetching comments is one GitHub API call per issue. To keep
    // this bounded we only enrich the first MAX_ISSUES_WITH_COMMENTS issues that
    // actually have comments. Issues beyond the cap (or with zero comments) are
    // returned as-is, without a `__comments` field. Clients needing comments for
    // later issues should request them per-issue via a separate call.
    const issuesToEnrich = data
      .slice(0, MAX_ISSUES_WITH_COMMENTS)
      .filter((issue) => issue?.number && Number(issue?.comments || 0) > 0);

    const enrichedByNumber = new Map();
    await Promise.all(
      issuesToEnrich.map(async (issue) => {
        const issueNumber = issue.number;
        const commentsResponse = await fetchWithTimeout(
          `${process.env.GITHUB_REPO}/issues/${issueNumber}/comments`,
          {
            method: "GET",
            headers,
          },
          10000,
        );

        if (!commentsResponse.ok) {
          enrichedByNumber.set(issueNumber, []);
          return;
        }

        const comments = await commentsResponse.json();
        enrichedByNumber.set(
          issueNumber,
          Array.isArray(comments) ? comments : [],
        );
      }),
    );

    const issuesWithComments = data.map((issue) => {
      const issueNumber = issue?.number;
      if (!enrichedByNumber.has(issueNumber)) {
        return issue;
      }
      return {
        ...issue,
        __comments: enrichedByNumber.get(issueNumber),
      };
    });

    return res.status(200).send(issuesWithComments);
  } catch (error) {
    const normalizedError =
      error?.name === "AbortError"
        ? new ApiError("Upstream request timed out", 504)
        : error;

    if (!isGet) {
      handleMutationFailure(normalizedError, "upstream");
    }

    throw normalizedError;
  }
});

export default handler;
