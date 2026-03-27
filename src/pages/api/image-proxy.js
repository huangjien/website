import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout";
import {
  ensureMethod,
  getClientIp,
  withErrorHandling,
} from "../../lib/apiClient";
import { checkRateLimit } from "../../lib/rateLimit";

const CACHE_DIR = path.join(process.cwd(), ".cache", "images");
const MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const IMAGE_PROXY_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_PROXY_RATE_LIMIT = 60;
const IMAGE_PROXY_WINDOW_MS = 60000;
const DEFAULT_ALLOWED_HOSTS = [
  "github.com",
  "raw.githubusercontent.com",
  "avatars.githubusercontent.com",
  "media.githubusercontent.com",
  "user-images.githubusercontent.com",
  "camo.githubusercontent.com",
  "github.githubassets.com",
];

const parseAllowedHosts = () => {
  const raw = process.env.IMAGE_PROXY_ALLOWED_HOSTS?.trim();
  if (!raw) return DEFAULT_ALLOWED_HOSTS;
  return raw
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
};

const isHostAllowed = (hostname) => {
  const normalized = (hostname || "").toLowerCase();
  const allowedHosts = parseAllowedHosts();
  return allowedHosts.some(
    (host) => normalized === host || normalized.endsWith(`.${host}`),
  );
};

const isPrivateIpv4 = (value) => {
  const octets = value.split(".").map((part) => Number(part));
  if (octets.length !== 4 || octets.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = octets;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
};

const isPrivateIpv6 = (value) => {
  const normalized = value.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("::ffff:127.")
  );
};

const isBlockedHost = (hostname) => {
  const value = (hostname || "").toLowerCase();
  if (value === "localhost") return true;
  if (isPrivateIpv4(value)) return true;
  if (isPrivateIpv6(value)) return true;
  return false;
};

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
async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

/**
 * Check if cached file exists and is valid
 * @param {string} cacheKey - The cache key
 * @returns {Object|null} - Cached data with metadata or null
 */
async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getCachedImage(cacheKey) {
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);

  try {
    if (!(await pathExists(cachePath))) {
      return null;
    }

    const cacheData = JSON.parse(await fs.readFile(cachePath, "utf8"));
    const imagePath = path.join(CACHE_DIR, cacheKey);

    // Check if image file exists
    if (!(await pathExists(imagePath))) {
      // Clean up stale metadata
      await fs.unlink(cachePath).catch(() => {});
      return null;
    }

    // Check cache age
    const now = Date.now();
    if (now - cacheData.timestamp > MAX_CACHE_AGE) {
      // Cache expired, clean up
      await fs.unlink(cachePath).catch(() => {});
      await fs.unlink(imagePath).catch(() => {});
      return null;
    }

    return {
      data: await fs.readFile(imagePath),
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
async function saveCachedImage(cacheKey, buffer, contentType) {
  try {
    await ensureCacheDir();

    const imagePath = path.join(CACHE_DIR, cacheKey);
    const metaPath = path.join(CACHE_DIR, `${cacheKey}.json`);

    // Save image data
    await fs.writeFile(imagePath, buffer);

    // Save metadata
    await fs.writeFile(
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

export default withErrorHandling(async function handler(req, res) {
  if (!ensureMethod(req, res, ["GET"])) {
    return;
  }

  const rateLimit = checkRateLimit(
    getClientIp(req),
    IMAGE_PROXY_RATE_LIMIT,
    IMAGE_PROXY_WINDOW_MS,
  );
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  const decodedUrl = decodeURIComponent(url);

  const cacheKey = getCacheKey(decodedUrl);

  const cached = await getCachedImage(cacheKey);
  if (cached) {
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("X-Cache", "HIT");
    return res.status(200).send(cached.data);
  }

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
  if (!isHostAllowed(parsedUrl.hostname)) {
    return res.status(400).json({ error: "URL host is not allowed" });
  }
  if (isBlockedHost(parsedUrl.hostname)) {
    return res.status(400).json({ error: "Blocked target host" });
  }

  const headers = {
    "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
    Accept: "image/*, */*",
  };

  if (
    process.env.GITHUB_TOKEN &&
    (parsedUrl.hostname === "github.com" ||
      parsedUrl.hostname.endsWith(".github.com"))
  ) {
    headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetchWithTimeout(
    decodedUrl,
    {
      method: "GET",
      headers: headers,
    },
    10000,
  );

  if (!response.ok) {
    console.error(
      `Proxy failed: ${response.status} ${response.statusText} for ${decodedUrl}`,
    );
    return res.status(response.status).send("Failed to fetch image");
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  if (!contentType.toLowerCase().startsWith("image/")) {
    return res.status(415).json({ error: "Unsupported content type" });
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.length > IMAGE_PROXY_MAX_BYTES) {
    return res.status(413).json({ error: "Image too large" });
  }

  await saveCachedImage(cacheKey, buffer, contentType);

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("X-Cache", "MISS");
  res.status(200).send(buffer);
});
