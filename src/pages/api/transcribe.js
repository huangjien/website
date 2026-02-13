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
    const proxy = httpProxy.createProxy({
      ignorePath: true,
      changeOrigin: true,
      target: "https://api.openai.com/v1/audio/transcriptions",
      headers: { Authorization: `Bearer ${process.env.OPEN_AI_KEY}` },
    });
    proxy.on("proxyReq", function (proxyReq) {
      proxyReq.setHeader("Authorization", `Bearer ${process.env.OPEN_AI_KEY}`);
    });
    proxy.once("proxyRes", resolve).once("error", reject).web(req, res);
  });
