# Milestone 6 Charter

**Milestone:** #6 - Issue & Comment Flow Hardening  
**Created:** 2026-04-11  
**Status:** Active - Confirmed Scope

---

## Executive Summary

Milestone 5 delivered issue and comment creation end-to-end. Milestone 6 strengthens reliability, usability, and observability of these new mutation flows so they behave predictably under real usage, error conditions, and rate-limit boundaries.

---

## Confirmed Scope

| Workstream                     | Include | Notes                                                      |
| ------------------------------ | ------- | ---------------------------------------------------------- |
| Mutation UX reliability        | ✅      | Keep form state resilient and avoid accidental duplicates  |
| Error semantics and messaging  | ✅      | Standardize actionable user feedback on API failures       |
| API mutation hardening         | ✅      | Strengthen validation edges and abuse protection behaviors |
| Observability for mutations    | ✅      | Add focused telemetry for issue/comment create paths       |
| Regression and contract safety | ✅      | Expand tests for unhappy paths and boundary conditions     |

---

## Target Outcomes

| Outcome                       | Target                                                          |
| ----------------------------- | --------------------------------------------------------------- |
| Duplicate mutation prevention | No duplicate submissions from repeated user clicks              |
| Rate-limit UX clarity         | User receives clear limit and retry guidance                    |
| API boundary consistency      | Validation and status code behavior is deterministic            |
| Mutation-path observability   | Structured events and key counters available for investigations |
| Regression confidence         | Contract and component tests cover primary error paths          |

---

## Proposed Workstreams

### Workstream 1: Submission Reliability

- Ensure submit controls are consistently guarded while requests are in flight
- Prevent accidental duplicate issue/comment creation on retries
- Keep user input intact for recoverable failure scenarios

### Workstream 2: Error Semantics and UX

- Normalize mutation error payload handling in UI components
- Map common error classes (auth, validation, rate-limit, upstream) to clear user-facing messages
- Ensure success and failure states are consistently reset and rendered

### Workstream 3: API Mutation Hardening

- Tighten mutation payload boundary checks and normalization
- Verify rate-limit behavior for comment creation and align issue mutation constraints
- Ensure method/auth/validation failure envelopes are consistent with existing route standards

### Workstream 4: Observability for Mutation Routes

- Add/create structured logs for issue/comment POST attempts and outcomes
- Capture minimal mutation counters useful for triage and alerting
- Preserve security posture by excluding sensitive payload contents

### Workstream 5: Verification Expansion

- Add contract tests for mutation unhappy paths and key edge cases
- Add component tests for loading, retry, and error-state transitions
- Validate quality gates via lint, type-check, and full test run

---

## Phases

| Phase    | Workstream                  | Focus                                    |
| -------- | --------------------------- | ---------------------------------------- |
| Phase 25 | Submission Reliability      | Duplicate-prevention and form resilience |
| Phase 26 | Error Semantics and UX      | Consistent failure/success messaging     |
| Phase 27 | API Mutation Hardening      | Validation/rate-limit boundary behavior  |
| Phase 28 | Observability for Mutations | Logs and counters for POST flows         |
| Phase 29 | Verification Expansion      | Contract + component regression safety   |

---

## Success Criteria

| Criteria                                                       | Status  |
| -------------------------------------------------------------- | ------- |
| Issue/comment submit flows prevent duplicate requests          | Pending |
| Mutation error messages are specific and user-actionable       | Pending |
| API mutation failure envelopes remain deterministic and tested | Pending |
| Mutation route observability coverage added                    | Pending |
| All quality gates pass                                         | Pending |

---

## Quality Gates

- `pnpm lint` must pass
- `pnpm type-check` must pass
- `pnpm test` must pass
