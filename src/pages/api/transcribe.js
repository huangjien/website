import httpProxy from "http-proxy";

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
    // Limit audio file uploads to 10MB
    bodySizeLimit: "10mb",
  },
};

export default (req, res) =>
  new Promise((resolve, reject) => {
    const apiKey = process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      res.status(500).json({ error: "OpenAI API key not configured" });
      return resolve();
    }

    const proxy = httpProxy.createProxy({
      ignorePath: true,
      changeOrigin: true,
      target: "https://api.openai.com/v1/audio/transcriptions",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    proxy.on("proxyReq", function (proxyReq) {
      proxyReq.setHeader("Authorization", `Bearer ${apiKey}`);
    });
    proxy.once("proxyRes", resolve).once("error", reject).web(req, res);
  });
