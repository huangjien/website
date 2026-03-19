import {
  fetchWithTimeout,
  parseErrorResponse,
} from "../../lib/fetchWithTimeout";
import {
  ApiError,
  AuthenticationError,
  ensureMethod,
  withErrorHandling,
} from "../../lib/apiClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

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

  if (!isGet) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      throw new AuthenticationError("Unauthorized");
    }
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
        ...(isGet ? {} : { body: JSON.stringify(req.body || {}) }),
      },
      10000,
    );

    if (!response.ok) {
      const message = await parseErrorResponse(response);
      throw new ApiError(message, response.status);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
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

    const issuesWithComments = await Promise.all(
      data.map(async (issue) => {
        const issueNumber = issue?.number;
        const commentCount = Number(issue?.comments || 0);
        if (!issueNumber || commentCount <= 0) {
          return issue;
        }

        const commentsResponse = await fetchWithTimeout(
          `${process.env.GITHUB_REPO}/issues/${issueNumber}/comments`,
          {
            method: "GET",
            headers,
          },
          10000,
        );

        if (!commentsResponse.ok) {
          return {
            ...issue,
            __comments: [],
          };
        }

        const comments = await commentsResponse.json();
        return {
          ...issue,
          __comments: Array.isArray(comments) ? comments : [],
        };
      }),
    );

    return res.status(200).send(issuesWithComments);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError("Upstream request timed out", 504);
    }

    throw error;
  }
});

export default handler;
