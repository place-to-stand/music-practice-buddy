---
name: performance-review
description: Analyze React/Next.js performance issues, Convex query patterns, bundle size, and Core Web Vitals. Use when optimizing components, checking for slow renders, reviewing data fetching patterns, or when the app feels sluggish.
---

# Performance Review

Analyze code for performance issues targeting Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1).

## Scope

Review the specified files or components for:

### 1. React/Next.js Performance
- Unnecessary client components (should be server components)
- Missing `React.memo()`, `useMemo()`, `useCallback()` where beneficial
- Large component re-renders (check dependency arrays)
- Missing Suspense boundaries for async components
- Heavy components that should use `next/dynamic` (e.g., AlphaTab)
- Improper use of `use client` directive

### 2. Convex Data Fetching
- N+1 query patterns in Convex queries
- Missing `Promise.all()` for parallel fetches in actions
- Overfetching data (selecting unused fields)
- Unnecessary waterfalls in data loading
- Missing or inefficient indexes in `convex/schema.ts`
- Reactive queries that update too frequently

### 3. Bundle Size
- Large dependencies imported synchronously
- Missing code splitting opportunities
- AlphaTab and wavesurfer.js should be lazy loaded
- Importing entire libraries vs. specific modules
- Dead code that should be removed

### 4. Convex Index Performance
- Missing indexes on filtered/joined columns
- Inefficient query patterns
- Large result sets without pagination
- Compound indexes for multi-field queries

### 5. Rendering Performance
- Layout thrashing (reading then writing DOM)
- Missing virtualization for long lists
- Large images without optimization
- Missing `loading="lazy"` on images
- CSS that causes reflows

### 6. Audio/Media Performance
- Waveform peak pre-computation (should happen on upload)
- Audio file streaming vs. full load
- AlphaTab lazy loading patterns

## Output Format

For each finding:
```
[IMPACT: HIGH|MEDIUM|LOW]
File: path/to/file.ts:lineNumber
Issue: Brief description
Current: What's happening now
Recommended: How to optimize
Estimated Impact: Expected improvement
```

## Actions

1. Analyze component render patterns
2. Review Convex queries for N+1 patterns
3. Check for proper server/client component split
4. Identify parallelization opportunities
5. Review image and asset loading
6. Check index definitions in `convex/schema.ts`

## Post-Review

Generate a summary with:
- Quick wins (low effort, high impact)
- Medium-term optimizations
- Architectural improvements for long-term
