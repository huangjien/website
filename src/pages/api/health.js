/**
 * Health check endpoint for Docker container health monitoring
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.status(200).json({ status: "healthy", timestamp: Date.now() });
}
