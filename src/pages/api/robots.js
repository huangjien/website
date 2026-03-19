export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.status(200).send(`User-agent: *
Allow: /
Sitemap: https://www.huangjien.com/sitemap.xml
`);
}
