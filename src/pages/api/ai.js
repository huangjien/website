// curl command to test api
// curl https://api.openai.com/v1/chat/completions \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer $OPEN_AI_KEY" \
//   -d '{
//     "model": "gpt-3.5-turbo",
//     "messages": [{"role": "user", "content": "write a hello world with java, and explain how to run it"}]
//   }'

import { getServerSession } from "next-auth/next";

export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = await getServerSession(req, res);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Check for API key
  if (!process.env.OPEN_AI_KEY) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }

  try {
    // Validate request body
    if (!req.body || !req.body.messages) {
      res.status(400).json({ error: "Missing required fields: messages" });
      return;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
      },
      body: JSON.stringify({
        model: req.body.model || "gpt-3.5-turbo",
        messages: req.body.messages,
        temperature: req.body.temperature,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API Error:", data);
      res
        .status(response.status)
        .json({ error: data.error || "OpenAI API Error" });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("API Error:", err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
}
