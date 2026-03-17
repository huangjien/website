// local test url: http://localhost:3000/api/about

import { aboutUrl } from "../../lib/global";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout";

export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  try {
    const response = await fetchWithTimeout(
      aboutUrl,
      {
        method: "GET",
      },
      10000,
    );

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
  } catch (error) {
    if (error?.name === "AbortError") {
      return res.status(504).json({ error: "Upstream request timed out" });
    }

    return res
      .status(500)
      .json({ error: error?.message || "Internal Server Error" });
  }
}
