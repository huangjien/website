# Phase 10 Implementation Plan: Production-Grade Performance Verification

## Summary

Implement route-level performance budgets with production-like measurement and CI enforcement to block regressions.

## Scope

### In Scope

- Define performance budgets for key routes
- Add measurement runner for production-like runtime
- Add threshold-checking script with non-zero exit on failures
- Integrate performance gate into canonical CI workflow
- Publish benchmark and verification artifacts

### Out of Scope

- Full browser Core Web Vitals lab infrastructure
- Multi-region distributed load testing

## Work Breakdown

### Slice 1: Budget and Measurement Foundation

- Create `scripts/perf-budgets.json` with route-level p95 and error-rate thresholds.
- Create `scripts/measure-phase10-prodlike.mjs` to collect and output benchmark metrics.

### Slice 2: Threshold Enforcement

- Create `scripts/check-perf-thresholds.mjs` to:
  - Start production server
  - Run measurement
  - Evaluate budgets
  - Fail on threshold breach

### Slice 3: CI Integration

- Add `perf:ci` npm script.
- Add `pnpm perf:ci` gate in `.github/workflows/CID.yaml` after build.

### Slice 4: Verification and Reporting

- Run lint/type-check/tests/E2E plus perf gate locally.
- Publish Phase 10 verification report and sync roadmap/state/project docs.

## Definition of Done

- Performance budgets are versioned and enforced.
- CI includes production-like perf verification gate.
- Benchmark artifact generation and threshold evaluation are reproducible.
- Phase 10 execution and verification are documented.
