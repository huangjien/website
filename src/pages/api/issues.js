export const config = {
  api: {
    externalResolver: true,
  },
};

export default function handler(req, res, action = "GET") {
  const post_body = req.body ? req.body : {};
  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
  };
  if (action === "GET") {
    fetch(`${process.env.GITHUB_REPO}/issues`, {
      method: action,
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
  } else {
    fetch(`${process.env.GITHUB_REPO}/issues`, {
      method: action,
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      body: post_body,
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
}
