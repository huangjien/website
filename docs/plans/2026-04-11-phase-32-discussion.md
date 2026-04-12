# Phase 32 Discussion: Proxy Reliability and Fallback

## Context

Phase 31 established sidecar-relay connectivity for Cloud Run edge runtime to home-hosted Next.js.  
Phase 32 focuses on tuning proxy reliability behavior so user-facing outcomes remain predictable during transient home-upstream instability.

## Goal for Phase 32

Define and implement proxy timeout/retry/fallback behavior that balances:

- low-cost runtime profile,
- acceptable user experience,
- controlled recovery under intermittent upstream failures.

## Reliability Options Considered

### Option A: Fast Fail to Maintenance

- Short connect/read timeouts.
- No retry attempts.
- Immediate `503` maintenance fallback on first upstream failure.

**Pros**

- Deterministic response latency under failure.
- Lowest resource pressure on edge runtime.

**Cons**

- More visible maintenance responses for short transient blips.
- Can underutilize recoverable upstream opportunities.

### Option B: Retry Before Maintenance (Selected)

- Keep bounded connect/read timeouts.
- Apply limited retry attempts for transient upstream errors.
- Fall back to maintenance page if retries are exhausted.

**Pros**

- Better resilience to brief network/home runtime hiccups.
- Fewer unnecessary maintenance responses during short interruptions.
- Preserves controlled fallback when instability persists.

**Cons**

- Slightly longer response time when retries are attempted.
- Requires careful retry bounds to avoid cascading queue pressure.

### Option C: Long Wait for Upstream Recovery

- Large timeout windows with minimal fallback.

**Pros**

- Maximizes chance of eventual upstream response.

**Cons**

- Higher tail latency and worse user-perceived responsiveness.
- Not aligned with low-cost/controlled-failure operating model.

## Selected Approach

Proceed with **Option B (Retry Before Maintenance)** using strict retry limits and bounded timeout values.

## Execution Slices for Phase 32

### Slice 1: Timeout and Retry Policy Definition

- Define explicit values for:
  - connect timeout,
  - read timeout,
  - send timeout,
  - retry conditions and retry count.
- Keep policy minimal and deterministic for low-traffic profile.

### Slice 2: Nginx Reliability Wiring

- Apply retry policy in Nginx upstream/proxy directives.
- Ensure retries are limited to safe idempotent/transient failure classes.
- Keep maintenance fallback mapping for exhausted attempts.

### Slice 3: Route-Safety Boundaries

- Ensure API and page routes do not enter unbounded retry loops.
- Confirm fallback behavior remains consistent across major route groups.

### Slice 4: Verification and Failure Simulation

- Add simple failure simulation checks for:
  - transient failure with successful retry,
  - persistent failure ending in maintenance fallback.
- Capture values/behavior in Phase 32 verification artifact.

## Required Inputs for Plan Phase

- Preferred max retry count (initial recommendation: 2)
- Retry-eligible status classes (initial recommendation: 502/503/504)
- Timeout baseline acceptance for low-cost profile

## Risks and Controls

- Over-retrying can increase latency and edge resource usage.
  - Control: strict low retry count and short timeout bounds.
- Under-retrying can over-trigger maintenance responses.
  - Control: bounded retry before fallback.
- Mixed route behavior can cause inconsistent UX.
  - Control: unified fallback and route-level validation checks.

## Recommendation

Move to `/gsd:plan-phase 32` to define exact retry/timeout values and validation checks for transient vs persistent failure behavior.
