---
name: architecture-review
description: Evaluate system architecture, module boundaries, coupling, cohesion, and scalability patterns. Use when planning new features, reviewing system design, assessing technical debt at a systemic level, or when the codebase feels tangled.
---

# Architecture Review

Evaluate overall system design for maintainability, scalability, and adherence to established patterns.

## Scope

### 1. Module Boundaries (per AGENTS.md)
- Features grouped by domain inside `/app` and `/components`
- Shared utilities properly placed under `/lib`
- Convex functions organized by domain under `/convex`
- Clear separation between UI, state management, data fetching, and business logic
- No circular dependencies between modules

### 2. Convex Data Layer Architecture (per CLAUDE.md)
- Function types used appropriately:
  - `query` for read-only, reactive data
  - `mutation` for write operations
  - `action` for side effects (external APIs, file processing)
  - `internalMutation`/`internalQuery` for internal-only functions
- Proper use of indexes for query optimization
- Consistent soft delete patterns

### 3. Route Organization
- Consistent patterns in `app/(dashboard)/` routes
- Server Components vs Client Components properly split
- Protected routes using `useConvexAuth()` properly

### 4. Coupling Analysis
- Feature modules should be independently deployable in concept
- Shared components shouldn't have feature-specific logic
- Convex schema changes shouldn't require touching many features
- Look for "shotgun surgery" patterns

### 5. Cohesion Evaluation
- Related functionality grouped together
- Single Responsibility Principle at module level
- Files approaching 300 lines indicate need to split (per AGENTS.md)
- Functions exceeding 50 lines need decomposition

### 6. State Management Patterns
- Convex-first pattern consistency
- Convex queries for server state (reactive by default)
- Local UI state with React useState/useReducer
- No unnecessary state duplication

### 7. Error Handling Architecture
- Consistent error handling in Convex functions
- ErrorBoundary coverage on critical routes
- PostHog error tracking integration
- User-friendly error messages

### 8. Music Domain Patterns
- Gear settings versioning (`schemaVersion` field)
- Transposition utilities in `lib/music/`
- Audio processing patterns (waveform computation)
- Practice tools integration

## Output Format

```
[LAYER: DATA|UI|API|STATE|MODULE]
[SEVERITY: CRITICAL|HIGH|MEDIUM|LOW]
Area: Component/module/pattern affected
Issue: Brief description
Impact: How this affects maintainability/scalability
Current State: What exists now
Recommended: Architectural improvement
Migration Effort: LOW|MEDIUM|HIGH
```

## Actions

1. Map the dependency graph between major modules
2. Identify feature boundaries and cross-cutting concerns
3. Review data flow from Convex to UI
4. Check for proper layer separation
5. Evaluate consistency with established patterns

## Architecture Principles (from AGENTS.md)

- **Modular Architecture**: Group by domain
- **Single Responsibility**: One clear purpose per module
- **Separation of Concerns**: UI != state != data != business logic
- **DRY**: Abstract when pattern appears 3+ times
- **Reuse > Rebuild**: Prefer existing modules before new abstractions

## Post-Review

Generate:
- Architecture diagram of current state
- Dependency heat map (high coupling areas)
- Recommended refactoring roadmap
- Risk assessment for proposed changes
- Suggested module boundary adjustments
