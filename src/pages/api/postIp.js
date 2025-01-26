// pages/api/postIp.js

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { ip } = req.body;

      // Store IP in a file (example using fs module)
      const fs = require("fs");
      fs.writeFileSync("stored_ip.txt", ip, "utf-8");

      res.status(200).json({ message: "IP stored successfully" });
    } catch (error) {
      console.error("Error storing IP:", error);
      res.status(500).json({ error: "Failed to store IP" });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
