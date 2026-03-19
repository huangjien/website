# ROADMAP

## Current Phase

Milestone 3 initialized (charter defined and priorities reprioritized).

## Prioritized Workstreams

1. Observability expansion beyond baseline
   - Integrate telemetry backend and distributed tracing strategy.
   - Expand structured request/error telemetry adoption across remaining API routes.

2. CI-grade E2E expansion for critical user journeys
   - Promote additional high-value E2E suites to required CI gates.
   - Increase pre-merge confidence for auth, AI, and failure-path journeys.

3. API contract coverage completion
   - Fill remaining untested API contract surfaces and risk-path assertions.
   - Ensure method/auth/validation/upstream-failure behaviors are fully covered.

4. Performance verification v2
   - Extend checks toward broader route targets and user-perceived signals.
   - Strengthen regression detection beyond current server-route budget set.

5. Auth normalization phase 2
   - Enforce consistent authorization boundaries across API routes.
   - Define role/policy behavior where privileged access is still implicit.

6. Tooling and command-source unification
   - Align docs/runtime automation with canonical package-manager commands.
   - Reduce command drift that creates operational and onboarding friction.

## Execution Notes

- Keep changes vertically sliced by user-facing capability.
- Build on existing `AGENTS.md` conventions and repository patterns.
- Verify with lint, type-check, unit tests, and targeted E2E before merge.
- Update this roadmap after each completed milestone.
- Milestone 1 completion report: `docs/plans/2026-03-18-milestone-1-completion-report.md`.
- Milestone 2 charter: `docs/plans/2026-03-18-milestone-2-charter.md`.
- Milestone 2 completion report: `docs/plans/2026-03-19-milestone-2-completion-report.md`.
- Milestone 3 charter: `docs/plans/2026-03-19-milestone-3-charter.md`.
