export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const { text, languageCode, name } = req.query;
  // console.log(languageCode, name)
  const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${process.env.GOOGLE_TEXT_SPEECH_KEY}`;
  const data = {
    audioConfig: {
      audioEncoding: "LINEAR16",
      pitch: 0,
      speakingRate: 1,
    },
    input: {
      text: text,
    },
    voice: {
      languageCode: languageCode,
      name: name,
    },
  };

  const options = {
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
    method: "POST",
  };

  fetch(url, options)
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      return data.audioContent.toString("base64");
    })
    .then((data) => {
      res.setHeader("Content-Type", "audio/mpeg");
      res.status(200).send(Buffer.from(data, "base64"));
    });
}
