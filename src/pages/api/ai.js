import { getServerSession } from "next-auth/next";
import { withErrorHandling, withMethod, ApiError } from "../../lib/apiClient";
import {
  validateObject,
  validateEnum,
  validateArray,
} from "../../lib/validation";

const ALLOWED_MODELS = ["gpt-3.5-turbo", "gpt-4", "gpt-4o", "gpt-4o-mini"];

const messageSchema = {
  role: (value) =>
    validateEnum(value, ["system", "user", "assistant"], {
      fieldName: "role",
      required: true,
    }),
  content: (value) => ({
    valid: typeof value === "string" && value.length > 0,
    error: "content must be a non-empty string",
  }),
};

const requestBodySchema = {
  messages: (value) => {
    if (!Array.isArray(value) || value.length === 0) {
      return { valid: false, error: "messages must be a non-empty array" };
    }

    for (let i = 0; i < value.length; i++) {
      const msg = value[i];
      const result = validateObject(msg, messageSchema);
      if (!result.valid) {
        return {
          valid: false,
          error: `messages[${i}]: ${result.errors.join(", ")}`,
        };
      }
    }

    return { valid: true };
  },
  model: (value) =>
    validateEnum(value, ALLOWED_MODELS, {
      fieldName: "model",
      required: false,
    }),
  temperature: (value) => ({
    valid:
      value === undefined ||
      (typeof value === "number" && value >= 0 && value <= 2),
    error: "temperature must be between 0 and 2",
  }),
};

const handler = withErrorHandling(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!process.env.OPEN_AI_KEY) {
    return res.status(500).json({ error: "Internal Server Error" });
  }

  const validationResult = validateObject(req.body, requestBodySchema);

  if (!validationResult.valid) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationResult.errors,
    });
  }

  const {
    messages,
    model = "gpt-3.5-turbo",
    temperature,
  } = validationResult.data;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenAI API Error:", data);
    throw new ApiError(
      data.error?.message || "OpenAI API Error",
      response.status,
    );
  }

  res.status(200).json(data);
});

export default handler;

export const config = {
  api: {
    externalResolver: true,
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};
