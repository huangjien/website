import {
  fetchWithTimeout,
  parseErrorResponse,
} from "../../lib/fetchWithTimeout";

export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const { issue_number } = req.query;
  if (!issue_number) {
    return res.status(400).json({ error: "issue_number is required" });
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
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    return res.status(200).send(data);
  } catch (error) {
    if (error?.name === "AbortError") {
      return res.status(504).json({ error: "Upstream request timed out" });
    }

    return res
      .status(500)
      .json({ error: error?.message || "Internal Server Error" });
  }
}
