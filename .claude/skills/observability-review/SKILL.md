---
name: observability-review
description: Evaluate logging coverage, error tracking, debugging capabilities, and monitoring patterns. Use when investigating production issues becomes difficult, after incidents, or when expanding monitoring coverage.
---

# Observability Review

Assess the ability to understand, debug, and monitor the application in production.

## Scope

### 1. Logging Coverage (per AGENTS.md)
- Structured logs with context (user id, request id)
- Sensitive data redacted before logging
- Appropriate log levels (error, warn, info, debug)
- Convex actions logging for external API calls
- No excessive logging impacting performance

### 2. Error Tracking (PostHog)
- PostHog configured for error tracking
- Breadcrumb data for debugging
- Error boundaries on critical routes
- User context attached to errors

### 3. Analytics (PostHog)
- Event tracking for key user actions
- Feature flags with proper naming conventions
- Custom properties for important events
- Key product metrics tracked (practice sessions, uploads, AI generations)

### 4. Convex-Specific Observability
- Query performance monitoring
- Mutation error tracking
- Action failure logging
- Rate limit monitoring (`uploadRateLimits`, `aiGenerationLimits`)

### 5. Health Monitoring
- Convex function health
- External service health (Vercel AI Gateway, Resend)
- File storage operations

### 6. Debugging Capabilities
- Can reproduce issues from error reports?
- Request tracing from client to Convex?
- State inspection available?
- Time-based correlation possible?

### 7. Alerting Readiness
- Critical errors trigger notifications?
- Performance degradation detectable?
- Failed background jobs visible?
- Security events flagged?

## Observability Gaps Analysis

For each area, identify:
- What we CAN see today
- What we CANNOT see
- Impact of blind spots
- Recommended additions

## Output Format

```
[PILLAR: LOGGING|ERRORS|METRICS|TRACES|ANALYTICS]
[PRIORITY: CRITICAL|HIGH|MEDIUM|LOW]
Area: What's being assessed
Current State: What exists
Gap: What's missing
Impact: How this affects debugging/monitoring
Recommendation: What to add
Effort: LOW|MEDIUM|HIGH
```

## Actions

1. Inventory current logging statements
2. Review PostHog configuration and coverage
3. Audit event tracking completeness
4. Check Convex function error handling
5. Identify production debugging pain points

## Observability Patterns

```typescript
// Structured logging in Convex actions
console.log(JSON.stringify({
  level: 'info',
  action: 'ai_lick_generated',
  userId: userId,
  timestamp: new Date().toISOString()
}))

// PostHog client-side tracking
posthog.capture('practice_session_started', {
  songId: song._id,
  duration: sessionDuration
})
```

## Key Questions

1. **When a user reports a bug**: Can we find their session and see what happened?
2. **When a Convex function is slow**: Can we identify the bottleneck?
3. **When data looks wrong**: Can we trace how it got that way?
4. **When a deploy breaks something**: Can we correlate timing with errors?
5. **When we need usage patterns**: Can we answer product questions?

## Post-Review

Generate:
- Observability coverage map
- Blind spot inventory
- Recommended instrumentation additions
- Alerting rule suggestions
- Dashboard recommendations for PostHog
