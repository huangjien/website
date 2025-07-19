// curl command to test api
// curl https://api.openai.com/v1/chat/completions \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer $OPEN_API_KEY" \
//   -d '{
//     "model": "gpt-3.5-turbo",
//     "messages": [{"role": "user", "content": "write a hello world with java, and explain how to run it"}]
//   }'

import { getServerSession } from "next-auth/react";

export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // console.log(JSON.stringify(req.body))
  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
    },
    body: req.body,
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data)
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(err.status || 500).json({ error: err.message || 'Internal Server Error', body: req.body });
    });
}
