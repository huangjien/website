export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  try {
    const decodedUrl = decodeURIComponent(url);

    // Security check: only allow http/https
    const parsedUrl = new URL(decodedUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: "Invalid protocol" });
    }

    const headers = {
      "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
      Accept: "image/*, */*",
    };

    // Add GitHub Token if available and if the URL is from github.com
    // Note: private assets usually need the token for the initial request.
    if (process.env.GITHUB_TOKEN && parsedUrl.hostname.endsWith("github.com")) {
      headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Use fetch which handles redirects automatically
    const response = await fetch(decodedUrl, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      console.error(
        `Proxy failed: ${response.status} ${response.statusText} for ${decodedUrl}`
      );
      // Try to read error body if possible
      const text = await response.text().catch(() => "");
      console.error(`Error body: ${text}`);
      return res.status(response.status).send("Failed to fetch image");
    }

    // Forward relevant headers
    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Cache control - cache for 1 hour
    res.setHeader("Cache-Control", "public, max-age=3600");

    // Pipe the response body to the client
    // response.body is a ReadableStream in standard fetch, but in Node it might be slightly different depending on version
    // For Node 18+, response.body is a web stream. We need to convert it or use arrayBuffer.
    // Using arrayBuffer is safer for compatibility if we don't want to deal with stream conversion.
    // But for large images, streaming is better.

    // In Node.js environment (Next.js API routes), we can use the buffer method.
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.status(200).send(buffer);
  } catch (error) {
    console.error("Proxy handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
