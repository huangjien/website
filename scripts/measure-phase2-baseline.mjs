import { performance } from "node:perf_hooks";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const RUNS = Number(process.env.RUNS || 5);

const targets = [
  { name: "home", path: "/" },
  { name: "ai", path: "/ai" },
  { name: "settings", path: "/settings" },
  { name: "api-issues", path: "/api/issues?includeComments=1" },
  { name: "api-ai-models", path: "/api/ai-models" },
  { name: "api-settings", path: "/api/settings" },
];

function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95) - 1] || sorted.at(-1);
  const avg = sorted.reduce((sum, v) => sum + v, 0) / sorted.length;
  return { median, p95, avg, min: sorted[0], max: sorted.at(-1) };
}

async function measureTarget(target) {
  const timings = [];
  let status = 0;

  for (let i = 0; i < RUNS; i += 1) {
    const start = performance.now();
    const response = await fetch(`${BASE_URL}${target.path}`);
    await response.text();
    const end = performance.now();
    status = response.status;
    timings.push(end - start);
  }

  return {
    ...target,
    status,
    runs: RUNS,
    timingMs: summarize(timings),
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  const results = [];

  for (const target of targets) {
    try {
      const result = await measureTarget(target);
      results.push(result);
    } catch (error) {
      results.push({
        ...target,
        error: error.message || "Unknown error",
      });
    }
  }

  const report = {
    startedAt,
    baseUrl: BASE_URL,
    runsPerTarget: RUNS,
    results,
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main();
