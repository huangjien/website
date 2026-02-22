import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_DIR = path.join(process.cwd(), ".cache", "images");
const MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Generate a cache key from URL
 * @param {string} url - The URL to hash
 * @returns {string} - Hashed cache key
 */
function getCacheKey(url) {
  return crypto.createHash("sha256").update(url).digest("hex");
}

/**
 * Ensure cache directory exists
 */
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Check if cached file exists and is valid
 * @param {string} cacheKey - The cache key
 * @returns {Object|null} - Cached data with metadata or null
 */
function getCachedImage(cacheKey) {
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);

  try {
    if (!fs.existsSync(cachePath)) {
      return null;
    }

    const cacheData = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    const imagePath = path.join(CACHE_DIR, cacheKey);

    // Check if image file exists
    if (!fs.existsSync(imagePath)) {
      // Clean up stale metadata
      fs.unlinkSync(cachePath);
      return null;
    }

    // Check cache age
    const now = Date.now();
    if (now - cacheData.timestamp > MAX_CACHE_AGE) {
      // Cache expired, clean up
      fs.unlinkSync(cachePath);
      fs.unlinkSync(imagePath);
      return null;
    }

    return {
      data: fs.readFileSync(imagePath),
      contentType: cacheData.contentType,
      cached: true,
    };
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}

/**
 * Save image to cache
 * @param {string} cacheKey - The cache key
 * @param {Buffer} buffer - The image buffer
 * @param {string} contentType - The content type
 */
function saveCachedImage(cacheKey, buffer, contentType) {
  try {
    ensureCacheDir();

    const imagePath = path.join(CACHE_DIR, cacheKey);
    const metaPath = path.join(CACHE_DIR, `${cacheKey}.json`);

    // Save image data
    fs.writeFileSync(imagePath, buffer);

    // Save metadata
    fs.writeFileSync(
      metaPath,
      JSON.stringify({
        timestamp: Date.now(),
        contentType,
      }),
    );
  } catch (error) {
    console.error("Error saving cache:", error);
  }
}

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  try {
    const decodedUrl = decodeURIComponent(url);

    const cacheKey = getCacheKey(decodedUrl);

    // Try to serve from cache first
    const cached = getCachedImage(cacheKey);
    if (cached) {
      res.setHeader("Content-Type", cached.contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("X-Cache", "HIT");
      return res.status(200).send(cached.data);
    }

    // Security check: only allow http/https
    if (!decodedUrl || decodedUrl.trim() === "") {
      return res.status(400).json({ error: "Invalid URL" });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(decodedUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: "Invalid protocol" });
    }

    const headers = {
      "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
      Accept: "image/*, */*",
    };

    // Add GitHub Token if available and if the URL is from github.com
    if (process.env.GITHUB_TOKEN && parsedUrl.hostname.endsWith("github.com")) {
      headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch the image
    const response = await fetch(decodedUrl, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      console.error(
        `Proxy failed: ${response.status} ${response.statusText} for ${decodedUrl}`,
      );
      return res.status(response.status).send("Failed to fetch image");
    }

    // Forward relevant headers
    const contentType = response.headers.get("content-type") || "image/jpeg";

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to cache
    saveCachedImage(cacheKey, buffer, contentType);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("X-Cache", "MISS");
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Proxy handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
