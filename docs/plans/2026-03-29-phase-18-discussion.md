# Phase 18 Discussion: LCP Optimization

## Context

Phase 18 focuses on optimizing Largest Contentful Paint (LCP) to improve Core Web Vitals scores.

## Current LCP Baseline

From Phase 17 Lighthouse CI results:

| Page                 | LCP  | Score | Status               |
| -------------------- | ---- | ----- | -------------------- |
| Home `/`             | 3.6s | 0.6   | ⚠️ Needs improvement |
| About `/about`       | TBD  | TBD   | -                    |
| Settings `/settings` | TBD  | TBD   | -                    |

### Performance Breakdown (Home Page)

| Metric      | Value | Score                |
| ----------- | ----- | -------------------- |
| FCP         | 0.9s  | ✅ Good              |
| LCP         | 3.6s  | ⚠️ Needs improvement |
| TBT         | 32ms  | ✅ Good              |
| CLS         | 0     | ✅ Good              |
| Speed Index | 3.0s  | ✅ Good              |

## Audit Findings

### What's Working Well

- First Contentful Paint (FCP) is excellent at 0.9s
- Total Blocking Time (TBT) is excellent at 32ms
- No Cumulative Layout Shift (CLS)
- Using `next/image` for optimized images
- SmartImage component with proxy fallback

### Areas for Improvement

1. **LCP at 3.6s** - Main opportunity (target: < 2.5s or relaxed < 4.0s)
2. **Font loading** - Need to verify `font-display`
3. **Critical CSS** - Could preload critical styles
4. **Server response** - Already optimized (p95 < 2ms in perf:ci)

## Approaches Considered

### Option A: Image Optimization Focus

- Add `priority` prop to LCP images
- Preload above-the-fold images
- Use modern image formats (WebP/AVIF)

**Pros:**

- Direct impact on LCP
- Next.js makes this easy

**Cons:**

- May not be the actual LCP element

---

### Option B: Font Loading Optimization

- Verify `font-display: swap/optional`
- Preload critical fonts
- Subset fonts to used characters

**Pros:**

- Often the LCP element is text
- Fonts block rendering

**Cons:**

- Current fonts may already be optimized

---

### Option C: Critical CSS & Preloading

- Extract critical CSS
- Preload key resources
- Inline critical styles

**Pros:**

- Improves FCP and LCP
- Industry best practice

**Cons:**

- Complexity vs benefit trade-off

---

### Option D: Measure First, Optimize Second (Recommended)

Run detailed Lighthouse audits to identify exact LCP element, then target optimization.

**Pros:**

- Data-driven approach
- Avoids wasted effort
- Follows scientific method

**Cons:**

- May delay actual fixes

---

## Recommendation

**Option D** (Measure First) is recommended because:

1. The LCP score (0.6) suggests specific elements need targeting
2. We need to identify _what_ the LCP element is before fixing it
3. Other metrics (FCP, TBT, CLS) are already good

## Proposed Scope for Phase 18

1. Run detailed Lighthouse audits to identify LCP element
2. Based on findings, apply targeted optimizations
3. Verify improvements with follow-up Lighthouse runs

## Questions for Discussion

1. Should we prioritize finding the LCP element first?
2. Are there known LCP candidates from the codebase review?
3. Should we set a target LCP (e.g., < 2.5s good, or keep relaxed < 4.0s)?

---

**Recommendation:** Proceed with Option D - run detailed Lighthouse analysis to identify LCP element, then apply targeted optimizations.
