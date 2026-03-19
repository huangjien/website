import { performance } from "node:perf_hooks";
import fs from "node:fs/promises";
import path from "node:path";

const BUDGET_PATH = process.env.PERF_BUDGET_PATH || "scripts/perf-budgets.json";
const OUTPUT_PATH =
  process.env.PERF_OUTPUT_PATH ||
  "docs/plans/2026-03-19-phase-10-benchmark-report.json";

const summarize = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)];
  const avg = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg,
    median,
    p95,
  };
};

const loadBudgets = async () => {
  const filePath = path.resolve(BUDGET_PATH);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const measureTarget = async ({ baseUrl, runs, warmupRuns, target }) => {
  const timings = [];
  const statuses = [];
  const url = `${baseUrl}${target.path}`;

  for (let i = 0; i < warmupRuns; i += 1) {
    const response = await fetch(url);
    await response.text();
  }

  for (let i = 0; i < runs; i += 1) {
    const startedAt = performance.now();
    const response = await fetch(url);
    await response.text();
    const endedAt = performance.now();

    timings.push(endedAt - startedAt);
    statuses.push(response.status);
  }

  const failures = statuses.filter((status) => status < 200 || status >= 400);
  return {
    ...target,
    runs,
    statuses,
    failureCount: failures.length,
    errorRate: failures.length / statuses.length,
    timingMs: summarize(timings),
  };
};

const main = async () => {
  const budgets = await loadBudgets();
  const baseUrl = process.env.BASE_URL || budgets.baseUrl;
  const runs = Number(process.env.RUNS || budgets.runs || 10);
  const warmupRuns = Number(process.env.WARMUP_RUNS || budgets.warmupRuns || 2);

  const results = [];
  for (const target of budgets.targets || []) {
    results.push(
      await measureTarget({
        baseUrl,
        runs,
        warmupRuns,
        target,
      }),
    );
  }

  const report = {
    measuredAt: new Date().toISOString(),
    baseUrl,
    runs,
    warmupRuns,
    results,
  };

  await fs.mkdir(path.dirname(path.resolve(OUTPUT_PATH)), { recursive: true });
  await fs.writeFile(
    path.resolve(OUTPUT_PATH),
    JSON.stringify(report, null, 2),
  );
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
};

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
