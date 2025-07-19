// local test url: http://localhost:3000/api/settings
export const config = {
  api: {
    externalResolver: true,
  },
};

export default function handler(req, res) {
  fetch(`${process.env.GITHUB_REPO}/issues?labels=settings`, {
    method: "GET",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      var result = "";
      for (var i = 0; i < data.length; i++) {
        if (data[i].body != undefined) {
          result += data[i].body + "\n";
        }
      }
      res.status(200).json({ result: result });
    })
    .catch((err) => {
      res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    });
}
