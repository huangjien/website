/**
 * AI Service utilities for handling OpenAI API requests
 */

export const getAnswer = async (
  question,
  lastAnswer,
  model = "gpt-4o-mini",
  temperature = 1
) => {
  const questionArray = [{ role: "user", content: question }];
  // if lastAnswer too long or too long ago, then we don't add it.
  if (lastAnswer && lastAnswer.length < 1024) {
    questionArray.unshift({ role: "assistant", content: lastAnswer });
  }
  const requestBody = {
    model: model,
    messages: questionArray,
    temperature: temperature,
  };

  return await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
};

export const transcribeAudio = async (audioBlob) => {
  const file = new File([audioBlob], "audio.mp3", { type: "audio/mp3" });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");

  return fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((response) => {
      if (response?.error) {
        throw new Error(response.error.message);
      }
      return response.text;
    });
};
