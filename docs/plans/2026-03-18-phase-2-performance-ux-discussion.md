# Phase 2 Discussion: Performance and UX

## Context

Phase 2 in `ROADMAP.md` focuses on:

- Optimizing expensive list-rendering paths and interaction latency
- Expanding performance checks on `/`, `/ai`, and `/settings`

Current measurable hotspots:

- Home route triggers N+1 upstream comment fetching in `/api/issues?includeComments=1`
- AI route repeatedly renders markdown/highlight pipelines and auto-scrolls during streaming
- Settings route uses client-only auth gating and non-resilient filter/pagination patterns for large lists
- Global settings fetch runs across routes from the app provider baseline

## Desired Outcome

Reduce user-visible latency and interaction jank on key routes while keeping behavior stable and testable.

## Approaches Considered

### Approach A: Route-by-Route Tactical Optimizations

Apply narrow fixes directly inside each route and component:

- Add memoization and selective rendering in `/ai`
- Reduce list filtering and rendering overhead in `/` and `/settings`
- Add targeted endpoint timeouts/caching where missing

Pros:

- Fast initial wins with low coordination overhead
- Minimal architectural change

Cons:

- Higher risk of fragmented patterns
- Harder to maintain and benchmark consistently

### Approach B: Performance Budget + Shared Patterns

Define route-level performance budgets and apply common optimization primitives:

- Shared measurement harness for `/`, `/ai`, `/settings`
- Shared list/search optimization patterns
- Shared API timeout/cache strategy for high-traffic routes

Pros:

- Better consistency and long-term maintainability
- Clear pass/fail criteria for regression prevention

Cons:

- More upfront design and instrumentation work
- Slightly slower first visible change than A

### Approach C: Data-Flow Restructure First

Rework data acquisition model before UI tuning:

- Remove N+1 issue-comment loading pattern first
- Route-level server-side shaping for hot payloads
- Delay/defer non-critical content fetches

Pros:

- Largest potential backend-to-frontend latency reduction
- Cleaner scalability characteristics

Cons:

- Higher blast radius and integration risk
- Requires broader validation across API and UI paths

## Recommendation

Choose **Approach B**, incorporating C selectively for the highest-cost data paths.

Rationale:

- Balances fast wins with stable standards
- Prevents one-off optimizations from drifting over time
- Keeps execution measurable through budgets and route-level checks

## Proposed Vertical Slices

1. Baseline measurement slice
   - Define metrics and thresholds for `/`, `/ai`, `/settings` (TTFB, LCP proxy, interaction latency, API p95)
   - Add repeatable local verification script/profile checklist
2. Home route slice
   - Reduce N+1 comment-fetch overhead and optimize issue search/filter path
   - Defer non-critical joke/content fetch where it blocks perceived rendering
3. AI route slice
   - Optimize streaming-message rendering, markdown work, and auto-scroll behavior
   - Limit high-frequency localStorage writes during active streaming
4. Settings route slice
   - Improve auth/loading transition UX and resilient search behavior
   - Optimize large-list pagination/render strategy and endpoint consistency
5. Guardrail slice
   - Add route-focused regression checks and performance assertions to CI-ready test flows

## Success Criteria

- `/`, `/ai`, `/settings` each have documented baseline and post-change metrics
- Key user interactions on target routes show reduced latency or reduced re-render cost
- High-cost data paths (notably issue/comments) no longer exhibit avoidable request amplification
- New performance changes are protected by repeatable checks and do not regress existing behavior
- Lint, type-check, and relevant tests pass after each slice

## Risks and Mitigations

- Risk: Measurement noise leads to false confidence  
  Mitigation: use fixed scenario scripts and compare median + p95 across repeated runs.

- Risk: UX regressions while chasing micro-optimizations  
  Mitigation: keep route-level behavior tests and visual/manual checks for critical flows.

- Risk: Over-optimization in low-impact areas  
  Mitigation: prioritize by measured bottlenecks first, then secondary improvements.
