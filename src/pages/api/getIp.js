// pages/api/getIp.js
import { promises as fs } from "fs";

export default async function handler(req, res) {
  try {
    const data = await fs.readFile("stored_ip.txt", "utf-8");
    res.status(200).json({ ip: data });
  } catch (error) {
    console.error("Error retrieving IP:", error);
    res.status(500).json({ error: "Failed to retrieve IP" });
  }
}
