import { ApiError, ensureMethod, withErrorHandling } from "../../lib/apiClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export const config = {
  api: {
    externalResolver: true,
  },
};

const handler = withErrorHandling(async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    throw new ApiError("Unauthorized", 401);
  }

  if (!process.env.GITHUB_TOKEN) {
    throw new ApiError("GitHub token not configured", 500);
  }

  try {
    const response = await fetch("https://api.github.com/markdown", {
      method: "POST",
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: req.body }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "GitHub API Error",
        response.status,
      );
    }

    const data = await response.text();
    res.status(200).send(data);
  } catch (err) {
    throw new ApiError(err.message || "Network error", err.status || 500);
  }
});

export default handler;
