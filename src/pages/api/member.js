import { ApiError, ensureMethod, withErrorHandling } from "../../lib/apiClient";
import {
  fetchWithTimeout,
  parseErrorResponse,
} from "../../lib/fetchWithTimeout";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export const config = {
  api: {
    externalResolver: true,
  },
};

const handler = withErrorHandling(async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) {
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    throw new ApiError("Unauthorized", 401);
  }

  if (!process.env.GITHUB_TOKEN) {
    throw new ApiError("GitHub token not configured", 500);
  }

  if (!process.env.GITHUB_MEMBER) {
    throw new ApiError("GitHub member endpoint not configured", 500);
  }

  try {
    const response = await fetchWithTimeout(
      `${process.env.GITHUB_MEMBER}`,
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
    return res.status(200).send(data);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError("Upstream request timed out", 504);
    }
    throw error;
  }
});

export default handler;
