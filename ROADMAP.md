# ROADMAP

## Current Phase

Milestone 6 COMPLETED - All mutation hardening workstreams executed and verified.

## Completed Milestones

### Milestone 1: Initial Setup ✅

### Milestone 2: Quality Foundation ✅

### Milestone 3: Foundation Hardening & Observability ✅

### Milestone 4: Performance & Core Web Vitals ✅

### Milestone 5: GitHub Issue & Comment Creation ✅

### Milestone 6: Issue & Comment Flow Hardening ✅

## Milestone 5: GitHub Issue & Comment Creation (Completed)

1. ~~Issue POST API contract tests (Phase 22)~~ ✅ COMPLETED
   - Add tests for POST /api/issues ✅
   - Verify authentication required ✅
   - Test validation (title 1-200 chars) ✅

2. ~~Comment POST implementation (Phase 23)~~ ✅ COMPLETED
   - Add POST method to /api/comments.js ✅
   - Add authentication check ✅
   - Add input validation ✅
   - Add rate limiting (30/hr per user) ✅

3. ~~Frontend UI integration (Phase 24)~~ ✅ COMPLETED
   - Create issue form/modal ✅
   - Create comment form ✅
   - Add loading states ✅
   - Add success/error notifications ✅

## Milestone 6: Issue & Comment Flow Hardening (Completed)

1. ~~Submission reliability (Phase 25)~~ ✅ COMPLETED
   - Prevent duplicate issue/comment mutations on repeated submit actions ✅
   - Preserve form input safely across recoverable failures ✅

2. ~~Error semantics and UX (Phase 26)~~ ✅ COMPLETED
   - Standardize actionable messaging for auth, validation, rate-limit, and upstream failures ✅
   - Align success/error lifecycle handling across mutation UI ✅

3. ~~API mutation hardening (Phase 27)~~ ✅ COMPLETED
   - Tighten validation boundaries and normalize error envelopes ✅
   - Revalidate abuse-protection expectations for mutation endpoints ✅

4. ~~Mutation observability (Phase 28)~~ ✅ COMPLETED
   - Add structured telemetry for mutation attempts and outcomes ✅
   - Improve triage signal quality without exposing sensitive payload content ✅

5. ~~Verification expansion (Phase 29)~~ ✅ COMPLETED
   - Add regression coverage for unhappy paths and boundary conditions ✅
   - Ensure lint, type-check, and full unit test gates pass ✅

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
- Milestone 4 completion: `docs/plans/2026-03-29-milestone-4-completion-report.md`.
- Phase 24 discussion: `docs/plans/2026-03-29-phase-24-discussion.md`.
- Phase 24 verification: `docs/plans/2026-03-29-phase-24-verification-report.md`.
- Milestone 5 charter: `docs/plans/2026-03-29-milestone-5-charter.md`.
- Milestone 5 completion: `docs/plans/2026-03-29-milestone-5-completion-report.md`.
- Milestone 6 charter: `docs/plans/2026-04-11-milestone-6-charter.md`.
- Phase 25 verification: `docs/plans/2026-04-11-phase-25-verification-report.md`.
- Phase 26 verification: `docs/plans/2026-04-11-phase-26-verification-report.md`.
- Phase 27 verification: `docs/plans/2026-04-11-phase-27-verification-report.md`.
- Phase 28 verification: `docs/plans/2026-04-11-phase-28-verification-report.md`.
- Phase 29 verification: `docs/plans/2026-04-11-phase-29-verification-report.md`.
- Milestone 6 completion: `docs/plans/2026-04-11-milestone-6-completion-report.md`.
- Phase 14 verification: `docs/plans/2026-03-29-phase-14-verification-report.md`.
- Phase 15 verification: `docs/plans/2026-03-29-phase-15-verification-report.md`.
- Phase 16 verification: `docs/plans/2026-03-29-phase-16-verification-report.md`.
- Phase 17 verification: `docs/plans/2026-03-29-phase-17-verification-report.md`.
- Phase 18 verification: `docs/plans/2026-03-29-phase-18-verification-report.md`.
- Phase 19 discussion: `docs/plans/2026-03-29-phase-19-discussion.md`.
- Phase 20 discussion: `docs/plans/2026-03-29-phase-20-discussion.md`.
- Phase 21 discussion: `docs/plans/2026-03-29-phase-21-discussion.md`.
- **Milestone 4 completion:** `docs/plans/2026-03-29-milestone-4-completion-report.md`.
