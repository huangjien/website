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

export const config = {
  api: {
    externalResolver: true,
  },
};

const handler = withErrorHandling(async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) {
    return;
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
