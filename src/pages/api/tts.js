import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export const config = {
  api: {
    externalResolver: true,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Support the existing GET query contract: text, languageCode, name
  const {
    text,
    languageCode,
    name,
    voice: voiceQuery,
    format: formatQuery,
  } = req.query || {};

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  // Default to mp3 for broad browser support
  const format = formatQuery === "wav" ? "wav" : "mp3";

  // Basic voice resolution: preserve backward-compatible params but default to OpenAI's 'alloy'
  const voice = resolveVoice(voiceQuery || name, languageCode);

  try {
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      input: text,
      response_format: format,
    });

    // Convert to Buffer and send with appropriate content type
    const buffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader(
      "Content-Type",
      format === "mp3" ? "audio/mpeg" : "audio/wav"
    );
    res.status(200).send(buffer);
  } catch (err) {
    console.error("[api/tts] OpenAI TTS error", err);
    res.status(500).json({ error: "Text-to-speech failed" });
  }
}

function resolveVoice(nameOrVoice, languageCode) {
  const v = (nameOrVoice || "").toLowerCase();
  // If a compatible OpenAI voice is provided, use it; otherwise default.
  // Keeping simple mapping to ensure compatibility without breaking clients.
  if (v.includes("alloy")) return "alloy";
  // You can extend mapping based on languageCode in the future.
  return "alloy";
}
