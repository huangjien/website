export const DEFAULT_AI_MODEL = "gpt-4o-mini";

export const CURATED_AI_MODELS = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    tier: "balanced",
    costLevel: "low",
    capabilityTags: ["chat", "reasoning", "fast"],
  },
  {
    id: "gpt-4.1-mini",
    label: "GPT-4.1 Mini",
    tier: "balanced",
    costLevel: "low",
    capabilityTags: ["chat", "coding", "fast"],
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    tier: "advanced",
    costLevel: "medium",
    capabilityTags: ["chat", "reasoning", "multimodal"],
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    tier: "advanced",
    costLevel: "medium",
    capabilityTags: ["chat", "coding", "quality"],
  },
  {
    id: "o3-mini",
    label: "o3-mini",
    tier: "reasoning",
    costLevel: "medium",
    capabilityTags: ["reasoning", "math", "analysis"],
  },
  {
    id: "o1-mini",
    label: "o1-mini",
    tier: "reasoning",
    costLevel: "medium",
    capabilityTags: ["reasoning", "math", "analysis"],
  },
  {
    id: "o1",
    label: "o1",
    tier: "advanced",
    costLevel: "high",
    capabilityTags: ["reasoning", "quality", "analysis"],
  },
  {
    id: "gpt-4-turbo",
    label: "GPT-4 Turbo",
    tier: "advanced",
    costLevel: "high",
    capabilityTags: ["chat", "coding", "quality"],
  },
  {
    id: "gpt-4",
    label: "GPT-4",
    tier: "advanced",
    costLevel: "high",
    capabilityTags: ["chat", "reasoning", "quality"],
  },
  {
    id: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    tier: "cost",
    costLevel: "low",
    capabilityTags: ["chat", "economy", "fast"],
  },
];

export const CURATED_MODEL_IDS = CURATED_AI_MODELS.map((model) => model.id);

export function getCuratedAiModels() {
  return CURATED_AI_MODELS.map((model) => ({ ...model }));
}

export function isAllowedAiModel(modelId) {
  return CURATED_MODEL_IDS.includes(modelId);
}
