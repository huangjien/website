/**
 * Health check endpoint for Docker container health monitoring
 */
import { withErrorHandling } from "../../lib/apiClient";

const healthHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.status(200).json({ status: "healthy", timestamp: Date.now() });
};

export default withErrorHandling(healthHandler);
