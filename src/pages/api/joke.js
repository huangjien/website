import { withErrorHandling } from "../../lib/apiClient";

export const config = {
  api: {
    externalResolver: true,
  },
};

const fetchJoke = async () => {
  const response = await fetch(
    "https://v2.jokeapi.dev/joke/Programming?blacklistFlags=religious,racist,sexist&type=twopart",
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error(`Joke API failed with status ${response.status}`);
  }

  const data = await response.json();

  const joke =
    data.setup && data.delivery
      ? `${data.setup} ${data.delivery}`
      : data.joke || "No joke available";

  return {
    joke,
    category: data.category,
    type: data.type,
    id: data.id,
  };
};

const jokeHandler = async (req, res) => {
  const data = await fetchJoke();
  res.status(200).json(data);
};

export default withErrorHandling(jokeHandler);
