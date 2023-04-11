export const config = {
  api: {
    externalResolver: true,
  },
};

export default function handler(req, res) {
  //TODO
  fetch('https://api.openai.com/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
    },
    // body: JSON.stringify({audio: audio.blob,
    //     model: 'ada'})
  });
}
