---
name: convex-review
description: Review Convex schema design, indexing strategy, query patterns, function types, and soft delete consistency. Use when adding tables, modifying schema, reviewing queries, or auditing data access patterns.
---

# Convex Review

Analyze Convex schema design, function patterns, and query optimization.

## Scope

Review schema files and functions for:

### 1. Schema Design
- Appropriate field types
- Proper use of optional vs required fields
- Consistent naming conventions
- Foreign key relationships via `v.id("tableName")`
- Nullable fields that should have defaults

### 2. Indexing Strategy
- Missing indexes on frequently filtered fields
- Missing composite indexes for common query patterns
- Indexes for soft-delete patterns (`by_*_active` with `deletedAt`)
- Over-indexing (indexes that slow writes without read benefit)

### 3. Soft Delete Consistency (per CLAUDE.md)
- All core tables should have `deletedAt` timestamp
- Queries consistently filter with `.eq("deletedAt", undefined)`
- Cascade behavior on soft deletes considered
- `createdAt` and `updatedAt` on all records

### 4. Function Type Usage
- `query` for read-only, reactive data
- `mutation` for write operations, transactional
- `action` for side effects (external APIs, file processing)
- `internalMutation`/`internalQuery` for internal-only functions
- Proper use of `ctx.auth.getUserIdentity()` for auth

### 5. Query Patterns
- N+1 queries (multiple queries that could be combined)
- Missing eager loading opportunities
- Inefficient index usage
- Unbounded queries (should use pagination/limits)
- Overfetching (selecting unused fields)

### 6. File Organization
- Functions organized by domain (per CLAUDE.md)
- Related queries/mutations in same file
- Proper exports from Convex modules

### 7. Versioned Data Patterns
- Gear settings use `schemaVersion` field
- Proper migration strategy for schema evolution
- Backward compatibility considerations

### 8. Rate Limiting Tables
- `uploadRateLimits` properly checked before file uploads
- `aiGenerationLimits` enforced for AI features
- Rate limit windows and thresholds appropriate

## Output Format

For each finding:
```
[TYPE: SCHEMA|INDEXING|QUERY|FUNCTION|SOFT_DELETE|RATE_LIMIT]
Location: table/file reference
Issue: Brief description
Current State: What exists now
Recommendation: How to improve
Migration Required: Yes/No
```

## Index Analysis Summary

```
## Index Usage Summary

| Table | Index | Purpose | Used In |
|-------|-------|---------|---------|
| songs | by_band_active | Filter songs by band, excluding deleted | songs.listByBand |
| users | by_email | User lookup by email | auth flows |
```

## Actions

1. Read `convex/schema.ts` for table definitions
2. Check index definitions for common query patterns
3. Review function files in `convex/` for query patterns
4. Validate soft-delete consistency across tables
5. Check for missing auth guards in mutations

## Common Convex Patterns (from CLAUDE.md)

```typescript
// Querying with soft delete
const activeRecords = await ctx.db
  .query("tableName")
  .withIndex("by_user_active", q =>
    q.eq("userId", userId).eq("deletedAt", undefined)
  )
  .collect();

// Auth check pattern
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");
const userId = identity.subject as Id<"users">;

// Soft delete mutation
await ctx.db.patch(args.id, {
  deletedAt: Date.now(),
  updatedAt: Date.now(),
});
```

## Post-Review

Generate:
- Schema diagram recommendations
- Index creation suggestions
- Query optimization opportunities
- Risk assessment for proposed changes
- Function refactoring suggestions
