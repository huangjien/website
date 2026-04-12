import http from "node:http";

const port = Number(process.env.SIM_PORT || 19090);
const failCount = Number(process.env.SIM_FAIL_COUNT || 0);
const failStatus = Number(process.env.SIM_FAIL_STATUS || 503);
const successBody = process.env.SIM_SUCCESS_BODY || "ok";
const failBody = process.env.SIM_FAIL_BODY || "upstream unavailable";

let remainingFailures = failCount;

const server = http.createServer((req, res) => {
  if (remainingFailures > 0) {
    remainingFailures -= 1;
    res.writeHead(failStatus, { "Content-Type": "text/plain" });
    res.end(failBody);
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(successBody);
});

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(
    `phase32-upstream-sim listening on ${port} with failCount=${failCount}\n`,
  );
});
