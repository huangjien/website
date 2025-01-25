// pages/api/get-ip.js

export default function handler(req, res) {
    const forwardedFor = req.headers['x-forwarded-for'];
    let ip = req.socket.remoteAddress;
  
    if (forwardedFor) {
      const ips = forwardedFor.split(',');
      ip = ips; 
    }
  
    res.status(200).json({ ip });
  }