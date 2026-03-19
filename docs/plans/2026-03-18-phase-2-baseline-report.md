# Phase 2 Baseline Report

## Measurement Setup

- Command: `node scripts/measure-phase2-baseline.mjs`
- Base URL: `http://localhost:8080`
- Runs per target: `5`
- Raw output: `docs/plans/2026-03-18-phase-2-baseline-metrics.json`

## Baseline Snapshot

- `/` median: `13.54ms`, p95: `18.58ms`
- `/ai` median: `9.65ms`, p95: `10.31ms`
- `/settings` median: `7.75ms`, p95: `11.83ms`
- `/api/issues?includeComments=1` status: `500`, median: `22.14ms`
- `/api/ai-models` status: `200`, median: `2.05ms`
- `/api/settings` status: `500`, median: `23.14ms`

## Notes

- API status `500` for `/api/issues` and `/api/settings` is expected in local baseline runs without production secrets.
- This baseline is used as a local relative reference for Phase 2 route and API optimization slices.
