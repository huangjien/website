// local test url: http://localhost:3000/api/settings
export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  try {
    const response = await fetch(
      `${process.env.GITHUB_REPO}/issues?labels=settings`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      res.status(response.status).json({
        error: errorData.message || "GitHub API Error",
      });
      return;
    }

    const data = await response.json();
    let result = "";
    for (let i = 0; i < data.length; i++) {
      if (data[i].body != undefined) {
        result += data[i].body + "\n";
      }
    }
    res.status(200).json({ result: result });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
}
