# Phase 16 Discussion: Tooling and Command-Source Unification

## Context

ROADMAP Workstream 5 targets aligning docs/runtime automation with canonical package-manager commands and reducing command drift.

## Command Drift Audit

### Docker Configuration Issues

| File                        | Issue                                    |
| --------------------------- | ---------------------------------------- |
| `Dockerfile` line 51        | Uses `npm start` instead of `pnpm start` |
| `docker-compose.yml` line 9 | Uses `npm run dev` instead of `pnpm dev` |

### Version Inconsistencies

| Location          | Version                          |
| ----------------- | -------------------------------- |
| `AGENTS.md`       | States pnpm 10.28.2+             |
| `package.json`    | `packageManager: "pnpm@10.33.0"` |
| `Dockerfile`      | Uses pnpm@10.28.2                |
| `CONTRIBUTING.md` | States pnpm 10.27.0+             |

## Approaches Considered

### Approach A: Fix Docker Configuration

### Approach B: Version Unification

### Approach C: Script Consolidation

### Approach D: Full Documentation Audit

## Chosen Approach

**Approach A + B: Docker fix + version sync (Consensus)**

## Proposed Scope

1. Fix `Dockerfile` to use `pnpm start`
2. Fix `docker-compose.yml` to use `pnpm dev`
3. Update version references to match `packageManager` field (10.33.0)
4. Run verification

## Proposed Slices

1. Docker unification slice
2. Version sync slice
3. Verification slice
