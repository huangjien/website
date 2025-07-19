export const config = {
  api: {
    externalResolver: true,
  },
};

export default function handler(req, res) {
  fetch(`${process.env.GITHUB_REPO}/labels`, {
    method: "GET",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data)
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    });
}
