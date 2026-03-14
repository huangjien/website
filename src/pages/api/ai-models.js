import { CURATED_AI_MODELS, getCuratedAiModels } from "../../config/ai-models";

const MODELS_CACHE_TTL_MS = 1000 * 60 * 15;

let modelsCache = {
  expiresAt: 0,
  payload: null,
};

async function fetchOpenAiModelIds(apiKey) {
  const response = await fetch("https://api.openai.com/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenAI models API failed with status ${response.status}`);
  }

  const data = await response.json();
  const list = Array.isArray(data?.data) ? data.data : [];
  return new Set(list.map((item) => item?.id).filter(Boolean));
}

function buildFallbackPayload() {
  return {
    source: "fallback",
    updatedAt: new Date().toISOString(),
    models: getCuratedAiModels(),
  };
}

function buildLivePayload(availableIds) {
  const filtered = CURATED_AI_MODELS.filter((model) =>
    availableIds.has(model.id),
  );

  if (filtered.length === 0) {
    return buildFallbackPayload();
  }

  return {
    source: "live",
    updatedAt: new Date().toISOString(),
    models: filtered.map((model) => ({ ...model })),
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const now = Date.now();
  if (modelsCache.payload && modelsCache.expiresAt > now) {
    return res.status(200).json(modelsCache.payload);
  }

  const apiKey = process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const payload = buildFallbackPayload();
    modelsCache = {
      payload,
      expiresAt: now + MODELS_CACHE_TTL_MS,
    };
    return res.status(200).json(payload);
  }

  try {
    const availableIds = await fetchOpenAiModelIds(apiKey);
    const payload = buildLivePayload(availableIds);
    modelsCache = {
      payload,
      expiresAt: now + MODELS_CACHE_TTL_MS,
    };
    return res.status(200).json(payload);
  } catch (error) {
    console.warn("[api/ai-models] fallback to curated model list", error);
    const payload = buildFallbackPayload();
    modelsCache = {
      payload,
      expiresAt: now + MODELS_CACHE_TTL_MS,
    };
    return res.status(200).json(payload);
  }
}
