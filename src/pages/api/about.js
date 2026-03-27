// local test url: http://localhost:3000/api/about

import { aboutUrl } from "../../lib/global";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout";
import { withErrorHandling, ApiError } from "../../lib/apiClient";

export const config = {
  api: {
    externalResolver: true,
  },
};

export default withErrorHandling(async function handler(req, res) {
  let response;
  try {
    response = await fetchWithTimeout(
      aboutUrl,
      {
        method: "GET",
      },
      10000,
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError("Upstream request timed out", 504);
    }
    throw error;
  }

  if (!response.ok) {
    return res
      .status(response.status)
      .json({ error: "Failed to load about content" });
  }

  const data = await response.text();
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=3600",
  );
  return res.status(200).send(data);
});
