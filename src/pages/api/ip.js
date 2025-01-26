// pages/api/ip.js

export default function handler(req, res) {
  const os = require("os");
  const interfaces = os.networkInterfaces();
  let addresses = [];

  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const addressObj = interfaces[k][k2];
      if (addressObj.family === "IPv4" && !addressObj.internal) {
        addresses.push(addressObj.address);
      }
    }
  }

  res.status(200).json({ serverIp: addresses });
}
