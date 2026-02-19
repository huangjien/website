import { withErrorHandling, ApiError } from "../../lib/apiClient";

const handler = withErrorHandling(async (req, res) => {
  if (!process.env.GITHUB_TOKEN) {
    throw new ApiError("GitHub token not configured", 500);
  }

  if (!process.env.GITHUB_REPO) {
    throw new ApiError("GitHub repository not configured", 500);
  }

  const response = await fetch(
    `${process.env.GITHUB_REPO}/issues?labels=settings`,
    {
      method: "GET",
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || "GitHub API Error",
      response.status,
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new ApiError("Invalid response from GitHub API", 502);
  }

  const result = data
    .filter((issue) => issue.body != null)
    .map((issue) => issue.body)
    .join("\n");

  res.status(200).json({ result });
});

export default handler;

export const config = {
  api: {
    externalResolver: true,
  },
};
