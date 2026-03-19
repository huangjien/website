# Milestone 2 Charter

## Objective

Advance the codebase from feature-complete hardening to production-grade resilience by focusing on remaining security exposure, CI enforcement, and operational quality gaps.

## Baseline

Milestone 1 (workstreams 1-5) is completed and verified.  
Milestone 2 starts from that baseline with risk-first prioritization.

## Prioritized Workstreams

1. API surface reduction and auth normalization
   - Lock down or retire legacy unauthenticated utility endpoints.
   - Normalize remaining APIs onto hardened auth/error/validation patterns.
2. Outbound request security hardening
   - Add stronger URL/host boundary controls and abuse protections for proxy-like routes.
3. CI/CD hardening and pipeline consolidation
   - Enforce canonical workflow gates and remove duplicate/stale pipeline definitions.
4. Test strategy expansion for remaining risk areas
   - Increase contract and E2E coverage on high-value flows not yet deeply covered.
5. Production-grade performance verification
   - Move from local-dev timing checks to repeatable production-like benchmarks and thresholds.
6. Observability baseline
   - Add structured request/error telemetry to improve diagnosability and incident response.

## Execution Model

- Continue vertical-slice delivery with discuss → plan → execute → verify per phase.
- Keep quality gates mandatory for each phase: lint, type-check, tests, and targeted E2E where relevant.

## Success Criteria

- Milestone 2 workstreams have documented execution and verification artifacts.
- Remaining high-risk security and operability gaps are materially reduced.
- CI guardrails become strong enough to prevent common regressions by default.
