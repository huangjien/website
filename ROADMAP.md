# ROADMAP

## Current Phase

Milestone 2 initialized (charter defined and workstreams reprioritized).

## Prioritized Workstreams

1. API surface reduction and auth normalization
   - Lock down or retire legacy unauthenticated utility/debug endpoints.
   - Normalize remaining APIs onto hardened auth/error/validation patterns.

2. Outbound request security hardening
   - Tighten URL/host boundary controls for proxy-like routes.
   - Add abuse protections on high-cost external request paths.

3. CI/CD hardening and pipeline consolidation
   - Enforce canonical gates (lint, type-check, tests, targeted E2E).
   - Remove duplicate or stale workflow definitions.

4. Test strategy expansion for remaining risk areas
   - Extend scenario and contract coverage for uncovered critical routes.
   - Expand targeted E2E to additional auth and error-path journeys.

5. Production-grade performance verification
   - Introduce repeatable production-like benchmark checks and thresholds.
   - Guard against route-level performance regressions in CI-ready flows.

6. Observability baseline
   - Add structured request/error telemetry for API diagnostics.
   - Improve incident triage with consistent correlation and failure context.

## Execution Notes

- Keep changes vertically sliced by user-facing capability.
- Build on existing `AGENTS.md` conventions and repository patterns.
- Verify with lint, type-check, unit tests, and targeted E2E before merge.
- Update this roadmap after each completed milestone.
- Milestone 1 completion report: `docs/plans/2026-03-18-milestone-1-completion-report.md`.
- Milestone 2 charter: `docs/plans/2026-03-18-milestone-2-charter.md`.
