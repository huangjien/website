import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const BUDGET_PATH = process.env.PERF_BUDGET_PATH || "scripts/perf-budgets.json";
const REPORT_PATH =
  process.env.PERF_OUTPUT_PATH ||
  "docs/plans/2026-03-19-phase-10-benchmark-report.json";
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8080";

const readJson = async (filePath) => {
  const raw = await fs.readFile(path.resolve(filePath), "utf8");
  return JSON.parse(raw);
};

const waitForServer = async (url, maxAttempts = 60) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${url}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Timed out waiting for production server readiness");
};

const runCommand = (command, args = [], options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(`${command} ${args.join(" ")} failed with code ${code}`),
      );
    });
  });

const evaluateReport = ({ report, budgets }) => {
  const budgetMap = new Map(
    (budgets.targets || []).map((target) => [target.name, target]),
  );
  const failures = [];

  for (const result of report.results || []) {
    const budget = budgetMap.get(result.name);
    if (!budget) continue;

    if (result.timingMs.p95 > budget.maxP95Ms) {
      failures.push(
        `${result.name}: p95 ${result.timingMs.p95.toFixed(2)}ms exceeds ${budget.maxP95Ms}ms`,
      );
    }
    if (result.errorRate > budget.maxErrorRate) {
      failures.push(
        `${result.name}: errorRate ${(result.errorRate * 100).toFixed(2)}% exceeds ${(budget.maxErrorRate * 100).toFixed(2)}%`,
      );
    }
  }

  return failures;
};

const main = async () => {
  const budgets = await readJson(BUDGET_PATH);

  const server = spawn("pnpm", ["start"], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false,
  });

  try {
    await waitForServer(BASE_URL);
    await runCommand("node", ["scripts/measure-phase10-prodlike.mjs"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        BASE_URL,
        PERF_BUDGET_PATH: BUDGET_PATH,
        PERF_OUTPUT_PATH: REPORT_PATH,
      },
    });

    const report = await readJson(REPORT_PATH);
    const failures = evaluateReport({ report, budgets });
    if (failures.length > 0) {
      process.stderr.write(
        `Performance thresholds failed:\n- ${failures.join("\n- ")}\n`,
      );
      process.exitCode = 1;
      return;
    }
    process.stdout.write("Performance thresholds passed.\n");
  } finally {
    server.kill("SIGTERM");
  }
};

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
