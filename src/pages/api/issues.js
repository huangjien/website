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
  const method = req.method || "GET";
  const isGet = method === "GET";
  const includeComments = req.query?.includeComments === "1";

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
      return res.status(response.status).json({ error: message });
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
        if (!issueNumber) {
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
      return res.status(504).json({ error: "Upstream request timed out" });
    }

    return res
      .status(500)
      .json({ error: error?.message || "Internal Server Error" });
  }
}
