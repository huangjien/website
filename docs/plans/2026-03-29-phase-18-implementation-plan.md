# Phase 18 Implementation Plan: LCP Optimization

## Summary

Optimize Largest Contentful Paint (LCP) using a data-driven approach: identify the exact LCP element first, then apply targeted optimizations.

## Scope

### In Scope

- Analyze Lighthouse reports to identify exact LCP element(s)
- Apply targeted optimizations based on findings
- Re-run Lighthouse CI to verify improvements
- Update Lighthouse CI budgets if needed

### Out of Scope

- General performance optimization (not LCP-specific)
- Bundle size optimization (Phase 21)
- Mobile-specific optimizations

## Work Breakdown

### Slice 1: LCP Element Identification

Objectives:

- Examine Lighthouse HTML reports to identify LCP element
- Look for the element with largest render time
- Document findings

Exit Criteria:

- LCP element identified
- Root cause understood

### Slice 2: Targeted Optimization

Objectives:

- Based on LCP element identification, apply specific fix:
  - If image: Add `priority` prop, preload, or optimize format
  - If text: Optimize font loading, preload critical fonts
  - If element: Optimize critical rendering path

Exit Criteria:

- Optimization applied
- Code changes verified

### Slice 3: Verification

Objectives:

- Run Lighthouse CI to verify improvements
- Compare LCP before/after
- Update budgets if appropriate

Exit Criteria:

- LCP improved or documented as optimal
- Phase 18 verification report created

## LCP Optimization Strategies (by Element Type)

### If LCP is an Image

1. Add `priority` prop to `next/image`
2. Preload critical images in `_document.js`
3. Use modern formats (WebP/AVIF)
4. Optimize image dimensions

### If LCP is Text

1. Preload critical fonts in `_document.js`
2. Verify `font-display: swap` is set
3. Subset fonts to used characters
4. Use `next/font` for optimization

### If LCP is a Render-Blocking Element

1. Defer non-critical JavaScript
2. Inline critical CSS
3. Remove render-blocking resources
4. Optimize server response

## Success Criteria

| Metric | Before | Target               |
| ------ | ------ | -------------------- |
| LCP    | 3.6s   | < 3.0s (improvement) |

Note: Full "good" threshold (< 2.5s) may require additional work beyond Phase 18 scope.

## Definition of Done

- LCP element identified
- Targeted optimization applied
- Lighthouse CI verification completed
- Phase 18 artifacts published
