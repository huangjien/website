// curl command to test api
// curl https://api.openai.com/v1/chat/completions \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer $OPEN_API_KEY" \
//   -d '{
//     "model": "gpt-3.5-turbo",
//     "messages": [{"role": "user", "content": "write a hello world with java, and explain how to run it"}]
//   }'

export const config = {
  api: {
    externalResolver: true,
  },
};

export default function handler(req, res) {
  // console.log(JSON.stringify(req.body))
  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
      res.status(err.status).json({ error: err.message });
    });
}
