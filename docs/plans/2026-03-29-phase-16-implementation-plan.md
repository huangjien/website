# Phase 16 Implementation Plan: Tooling and Command-Source Unification

## Summary

Fix Docker configuration to use pnpm consistently and align version references across documentation to match the `packageManager` field in package.json.

## Scope

### In Scope

- Update `Dockerfile` to use `pnpm start`
- Update `docker-compose.yml` to use `pnpm dev`
- Update `AGENTS.md` pnpm version reference to 10.33.0
- Update `CONTRIBUTING.md` pnpm version reference to 10.33.0
- Verification and GSD documentation sync

### Out of Scope

- Changing package.json `packageManager` field
- Other script consolidation
- Full documentation audit

## Work Breakdown

### Slice 1: Docker Unification

Targets:

- `Dockerfile`
- `docker-compose.yml`

Objectives:

- Change `CMD ["npm", "start"]` to `CMD ["pnpm", "start"]`
- Change `command: npm run dev` to `command: pnpm dev`

Exit Criteria:

- Docker files use pnpm consistently

### Slice 2: Version Sync

Targets:

- `AGENTS.md`
- `CONTRIBUTING.md`

Objectives:

- Update "pnpm 10.28.2+" to "pnpm 10.33.0+"
- Update "pnpm 10.27.0+" to "pnpm 10.33.0+"

Exit Criteria:

- All version references match packageManager field

### Slice 3: Verification and Reporting

Objectives:

- Run lint, type-check, and test suite
- Verify Docker build still works (if possible)
- Publish Phase 16 verification report
- Update ROADMAP, STATE, and PROJECT

Exit Criteria:

- All quality gates pass
- Phase 16 artifacts are published

## Definition of Done

- Docker configuration uses pnpm consistently
- All version references are aligned
- Quality gates pass
- Phase 16 execution artifacts are published
