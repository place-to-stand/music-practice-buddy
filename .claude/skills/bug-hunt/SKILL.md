---
name: bug-hunt
description: Find bugs, logic errors, race conditions, and edge cases in code. Use when investigating issues, reviewing complex logic, checking async code, or looking for potential runtime errors.
---

# Bug Hunt

Systematically analyze code for bugs, logic errors, and potential runtime issues.

## Scope

### 1. Logic Errors
- Off-by-one errors in loops/arrays
- Incorrect boolean logic
- Missing edge cases
- Null/undefined handling gaps
- Race conditions in async code

### 2. State Management Issues
- Stale closures in useEffect/useCallback
- Missing dependency array items
- State updates on unmounted components
- Inconsistent state transitions
- Derived state that should be computed

### 3. Data Handling
- Array mutations instead of immutable updates
- Object reference equality issues
- Missing data validation
- Incorrect data transformations
- Timezone handling errors with date-fns

### 4. Async/Await Pitfalls
- Unhandled promise rejections
- Missing try/catch blocks
- Parallel execution that should be sequential
- Sequential execution that should be parallel
- Missing loading/error states

### 5. React-Specific Issues
- Missing keys in lists
- Conditional hooks (violates rules of hooks)
- Memory leaks (uncleared intervals, subscriptions)
- Incorrect useEffect cleanup
- Re-render loops

### 6. Convex-Specific Issues
- Missing auth checks in mutations/queries
- Incorrect error handling in actions
- Race conditions between optimistic updates and server state
- Missing validation in mutation arguments
- Incorrect index usage in queries

### 7. Type Coercion Issues
- Loose equality (== vs ===)
- Implicit type conversions
- parseInt without radix
- Boolean coercion edge cases

## Output Format

For each finding:
```
[SEVERITY: CRITICAL|HIGH|MEDIUM|LOW]
[TYPE: LOGIC|STATE|DATA|ASYNC|REACT|CONVEX|TYPES]
File: path/to/file.ts:lineNumber
Bug: Brief description
Reproduction: How the bug manifests
Root Cause: Why it happens
Fix: Code snippet or approach
```

## Actions

1. Read through code systematically
2. Trace data flow through functions
3. Check boundary conditions
4. Verify error handling paths
5. Look for common anti-patterns

## Bug Categories by Likelihood

High probability areas:
- Recently changed code
- Complex conditional logic
- Async operations
- User input handling
- Date/time calculations
- Music-related calculations (tempo, time signatures)

## Post-Review

Generate:
- Critical bugs requiring immediate fix
- Medium-priority bugs for next sprint
- Low-priority improvements
- Suggested tests to prevent regression
