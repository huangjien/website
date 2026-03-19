import httpProxy from "http-proxy";
import {
  ApiError,
  ensureMethod,
  getOpenAiApiKey,
  getClientIp,
} from "../../lib/apiClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { checkRateLimit } from "../../lib/rateLimit";

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
    // Limit audio file uploads to 10MB
    bodySizeLimit: "10mb",
  },
};

const proxyToOpenAiTranscribe = (req, res, apiKey) =>
  new Promise((resolve, reject) => {
    const proxy = httpProxy.createProxy({
      ignorePath: true,
      changeOrigin: true,
      target: "https://api.openai.com/v1/audio/transcriptions",
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    proxy.on("proxyReq", (proxyReq) => {
      proxyReq.setHeader("Authorization", `Bearer ${apiKey}`);
    });

    proxy.once("proxyRes", resolve).once("error", (error) => {
      reject(
        new ApiError(
          "Transcription proxy failed",
          502,
          error?.message || "Unknown proxy error",
        ),
      );
    });

    proxy.web(req, res);
  });

export default async function handler(req, res) {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const rateLimit = checkRateLimit(getClientIp(req), 20, 60000);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const contentType = `${req.headers["content-type"] || ""}`.toLowerCase();
  if (!contentType.includes("multipart/form-data")) {
    return res.status(400).json({ error: "Invalid content type" });
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > 10 * 1024 * 1024) {
    return res.status(413).json({ error: "Payload too large" });
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    await proxyToOpenAiTranscribe(req, res, apiKey);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Transcription proxy failed",
      details: error.details,
    });
  }
}
