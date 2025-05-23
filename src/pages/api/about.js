// local test url: http://localhost:3000/api/about

import { aboutUrl } from "../../lib/global";

export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

  try {
    console.log(`Fetching from aboutUrl: ${aboutUrl}`); // Log the URL being fetched
    const response = await fetch(aboutUrl, {
      method: "GET",
      signal: controller.signal, // Attach AbortSignal
    });
    clearTimeout(timeoutId); // Clear timeout if fetch completes

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not retrieve error text from upstream.");
      console.error(`Error fetching from aboutUrl '${aboutUrl}': ${response.status} - ${errorText}`);
      // Propagate client errors (4xx) as is, server errors (5xx from upstream) as 502 Bad Gateway
      const statusToSend = response.status >= 500 ? 502 : response.status;
      res.status(statusToSend).send(errorText || `Failed to fetch from external resource. Status: ${response.status}`);
      return;
    }

    const data = await response.text();
    res.status(200).send(data);
  } catch (error) {
    clearTimeout(timeoutId); // Clear timeout if fetch fails
    if (error.name === 'AbortError') {
      console.error(`Fetch to aboutUrl '${aboutUrl}' timed out.`);
      res.status(504).json({ error: 'The request to the external service timed out.' });
    } else {
      console.error(`Network or other error in /api/about for URL '${aboutUrl}':`, error.message);
      res.status(500).json({ error: (error && error.message) || 'An unexpected server error occurred while fetching the about content.' });
    }
  }
}
