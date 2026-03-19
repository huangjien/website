import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import {
  ApiError,
  AuthenticationError,
  ValidationError,
  ensureMethod,
  getOpenAiApiKey,
  logApiEvent,
  withErrorHandling,
} from "../../lib/apiClient";

export const config = {
  api: {
    externalResolver: true,
  },
};

const handler = withErrorHandling(async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) {
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    throw new AuthenticationError("Unauthorized");
  }

  const key = getOpenAiApiKey();
  if (!key) {
    logApiEvent("error", "tts_missing_api_key", req, {});
    throw new ApiError("OpenAI API key not configured", 500);
  }
  const openai = new OpenAI({ apiKey: key });

  const {
    text,
    languageCode,
    name,
    voice: voiceQuery,
    format: formatQuery,
  } = req.query || {};

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new ValidationError("Text is required");
  }

  const format = formatQuery === "wav" ? "wav" : "mp3";

  const voice = resolveVoice(voiceQuery || name, languageCode);

  try {
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      input: text,
      response_format: format,
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader(
      "Content-Type",
      format === "mp3" ? "audio/mpeg" : "audio/wav",
    );
    res.status(200).send(buffer);
  } catch (err) {
    logApiEvent("error", "tts_upstream_error", req, {
      message: err?.message || "Unknown error",
    });
    throw new ApiError(
      "Text-to-speech failed",
      502,
      err?.message || "Unknown error",
    );
  }
});

export default handler;

function resolveVoice(nameOrVoice, languageCode) {
  const v = (nameOrVoice || "").toLowerCase();
  // If a compatible OpenAI voice is provided, use it; otherwise default.
  // Keeping simple mapping to ensure compatibility without breaking clients.
  if (v.includes("alloy")) return "alloy";
  // You can extend mapping based on languageCode in the future.
  return "alloy";
}
