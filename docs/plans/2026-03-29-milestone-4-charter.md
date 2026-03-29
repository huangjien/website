# Milestone 4 Charter

**Milestone:** #4 - Performance & Core Web Vitals  
**Created:** 2026-03-29  
**Status:** Active - Focus selected

---

## Executive Summary

Milestones 1-3 established a solid foundation: core features, testing infrastructure, API hardening, observability, performance verification, auth normalization, and tooling consistency. Milestone 4 focuses on achieving excellent Core Web Vitals scores through Lighthouse CI integration and optimization work.

---

## Context: What's Been Accomplished

### Foundation (Milestone 1)

- Core features: blog, AI chat/voice, settings, authentication
- PWA support, i18n, Tailwind styling

### Quality (Milestone 2)

- Testing infrastructure: 93 test suites, 1188 tests
- CI/CD pipeline with lint, type-check, test gates
- API contract coverage for all 19 routes

### Hardening (Milestone 3)

- API hardening: rate limiting, error handling, input validation
- Observability: structured logging, request-id correlation, metrics
- Auth normalization: session requirements for protected routes
- Performance budgets: 7 routes with p95 latency thresholds (server-side)
- Tooling unification: pnpm consistency across Docker/docs

---

## Selected Focus: Performance & Core Web Vitals

**Goal:** Achieve excellent Core Web Vitals scores (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Why This Focus

1. **Measurable**: Core Web Vitals provide clear metrics to track
2. **Impactful**: Performance affects both UX and SEO (Google ranking)
3. **Foundational**: Sets up better baseline for future work
4. **Complementary**: Builds on Milestone 3's server-side performance work
5. **Industry standard**: Lighthouse CI is well-understood tooling

---

## Proposed Workstreams

### Workstream 1: Lighthouse CI Integration

- Add Lighthouse CI to GitHub Actions
- Establish baseline scores for key pages
- Define performance budgets (LCP, FID, CLS thresholds)

### Workstream 2: LCP Optimization

- Optimize image loading (next/image, lazy loading)
- Implement critical CSS extraction
- Optimize font loading (font-display, preloading)
- Reduce render-blocking resources

### Workstream 3: FID/INP Improvements

- Reduce JavaScript bundle size
- Defer non-critical scripts
- Optimize event handlers
- Use web workers for heavy computation

### Workstream 4: CLS Reduction

- Set explicit dimensions on images
- Reserve space for dynamic content
- Stable font loading (font-display: optional/swap)
- Skeleton screens for loading states

### Workstream 5: Bundle Size Analysis

- Analyze current bundle composition
- Identify large dependencies
- Implement code splitting where appropriate
- Tree-shaking optimization

---

## Success Criteria

| Metric           | Target  | Current Baseline |
| ---------------- | ------- | ---------------- |
| LCP              | < 2.5s  | TBD              |
| FID              | < 100ms | TBD              |
| CLS              | < 0.1   | TBD              |
| Lighthouse Score | > 90    | TBD              |

---

## Quality Gates

- `pnpm lint` - must pass
- `pnpm type-check` - must pass
- `pnpm test` - must pass
- Lighthouse CI - must pass all budgets

---

## Phases (Initial Planning)

| Phase    | Workstream   | Focus                     |
| -------- | ------------ | ------------------------- |
| Phase 17 | Workstream 1 | Lighthouse CI integration |
| Phase 18 | Workstream 2 | LCP optimization          |
| Phase 19 | Workstream 3 | FID/INP improvements      |
| Phase 20 | Workstream 4 | CLS reduction             |
| Phase 21 | Workstream 5 | Bundle size analysis      |

---

## Risks & Mitigations

| Risk                                     | Mitigation                                   |
| ---------------------------------------- | -------------------------------------------- |
| Lighthouse scores vary by network        | Use Lighthouse CI with consistent throttling |
| External dependencies affect performance | Audit third-party scripts                    |
| Mobile vs desktop differences            | Set budgets for both form factors            |

---

## Artifacts

- Charter: `docs/plans/2026-03-29-milestone-4-charter.md`
- Phase verification reports: `docs/plans/2026-03-XX-phase-XX-verification-report.md`
- Milestone completion: `docs/plans/2026-XX-XX-milestone-4-completion-report.md`
