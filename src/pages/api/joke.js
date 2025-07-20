export const config = {
  api: {
    externalResolver: true,
  },
};

export default function handler(req, res) {
  fetch(
    'https://v2.jokeapi.dev/joke/Programming?blacklistFlags=religious,racist,sexist&type=twopart',
    {
      method: 'GET',
    }
  )
    .then((response) => response.json())
    .then((data) => {
      // Transform the JokeAPI response to match expected format
      const joke = data.setup && data.delivery 
        ? `${data.setup} ${data.delivery}`
        : data.joke || 'No joke available';
      
      res.status(200).json({ 
        joke,
        category: data.category,
        type: data.type,
        id: data.id
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message || 'Failed to fetch joke' });
    });
}
