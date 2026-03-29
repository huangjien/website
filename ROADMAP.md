# ROADMAP

## Current Phase

Milestone 4 COMPLETED - All workstreams executed and verified.

## Completed Milestones

### Milestone 1: Initial Setup ✅

### Milestone 2: Quality Foundation ✅

### Milestone 3: Foundation Hardening & Observability ✅

### Milestone 4: Performance & Core Web Vitals ✅

## Performance Milestone Workstreams

1. ~~Lighthouse CI integration~~ ✅ COMPLETED
   - Add Lighthouse CI to GitHub Actions
   - Establish baseline scores for key pages
   - Define performance budgets

2. ~~LCP optimization~~ ✅ COMPLETED
   - Optimize image loading and critical CSS
   - Optimize font loading
   - **Note:** Render delay (87% of LCP) identified as architectural opportunity for future optimization

3. ~~FID/INP improvements~~ ✅ SKIPPED (metrics already excellent)
   - TBT: 26ms (87% headroom), Max FID: 74ms (26% headroom)
   - No optimization needed

4. ~~CLS reduction~~ ✅ SKIPPED (metrics already excellent)
   - CLS: 0.006 (94% under threshold), Score: 1
   - No optimization needed

5. ~~Bundle size analysis~~ ✅ COMPLETED (documented only)
   - Bundle analysis complete - performance excellent (0.89-0.93)
   - 312 KiB unused JS noted for future optimization

## Prioritized Workstreams (Legacy)

1. ~~Observability expansion beyond baseline~~ ✅ COMPLETED
   - Integrate telemetry backend and distributed tracing strategy.
   - Expand structured request/error telemetry adoption across remaining API routes.

2. ~~API contract coverage completion~~ ✅ COMPLETED
   - Fill remaining untested API contract surfaces and risk-path assertions.
   - Ensure method/auth/validation/upstream-failure behaviors are fully covered.

3. ~~Performance verification v2~~ ✅ COMPLETED
   - Extend checks toward broader route targets and user-perceived signals.
   - Strengthen regression detection beyond current server-route budget set.

4. ~~Auth normalization phase 2~~ ✅ COMPLETED
   - Enforce consistent authorization boundaries across API routes.
   - Define role/policy behavior where privileged access is still implicit.

5. ~~Tooling and command-source unification~~ ✅ COMPLETED
   - Align docs/runtime automation with canonical package-manager commands.
   - Reduce command drift that creates operational and onboarding friction.

## Execution Notes

- Keep changes vertically sliced by user-facing capability.
- Build on existing `AGENTS.md` conventions and repository patterns.
- Verify with lint, type-check, and unit tests before merge.
- Update this roadmap after each completed milestone.
- Milestone 1 completion report: `docs/plans/2026-03-18-milestone-1-completion-report.md`.
- Milestone 2 charter: `docs/plans/2026-03-18-milestone-2-charter.md`.
- Milestone 2 completion report: `docs/plans/2026-03-19-milestone-2-completion-report.md`.
- Milestone 3 charter: `docs/plans/2026-03-19-milestone-3-charter.md`.
- Milestone 3 completion: `docs/plans/2026-03-29-milestone-3-completion-report.md`.
- Milestone 4 charter: `docs/plans/2026-03-29-milestone-4-charter.md`.
- Phase 12 verification: `docs/plans/2026-03-27-phase-12-verification-report.md`.
- Phase 13 verification: `docs/plans/2026-03-29-phase-13-verification-report.md`.
- Phase 14 verification: `docs/plans/2026-03-29-phase-14-verification-report.md`.
- Phase 15 verification: `docs/plans/2026-03-29-phase-15-verification-report.md`.
- Phase 16 verification: `docs/plans/2026-03-29-phase-16-verification-report.md`.
- Phase 17 verification: `docs/plans/2026-03-29-phase-17-verification-report.md`.
- Phase 18 verification: `docs/plans/2026-03-29-phase-18-verification-report.md`.
- Phase 19 discussion: `docs/plans/2026-03-29-phase-19-discussion.md`.
- Phase 20 discussion: `docs/plans/2026-03-29-phase-20-discussion.md`.
- Phase 21 discussion: `docs/plans/2026-03-29-phase-21-discussion.md`.
- **Milestone 4 completion:** `docs/plans/2026-03-29-milestone-4-completion-report.md`.
