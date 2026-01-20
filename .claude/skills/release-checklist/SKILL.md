---
name: release-checklist
description: Pre-deployment verification checklist covering build health, schema changes, feature flags, rollback readiness, and environment parity. Use before deploying to production, after major features, or when preparing releases.
---

# Release Checklist

Comprehensive pre-deployment verification to ensure safe, successful releases.

## Pre-Release Verification

### 1. Build Health
- [ ] `npm run build` completes without errors
- [ ] `npm run type-check` passes (TypeScript strict mode)
- [ ] `npm run lint` passes with no errors
- [ ] No console warnings in build output
- [ ] Bundle size within acceptable limits

### 2. Convex Schema & Functions (per CLAUDE.md workflow)
- [ ] Schema changes tested with `npx convex dev`
- [ ] Indexes added for new query patterns
- [ ] Soft delete patterns maintained (`deletedAt`)
- [ ] Backward compatible schema changes (or coordinated deploy)
- [ ] Production deploy planned: `npx convex deploy`

### 3. Environment Configuration
- [ ] All required env vars documented in `.env.example`
- [ ] No hardcoded secrets in codebase
- [ ] Environment parity: dev/staging/prod configs aligned
- [ ] New env vars added to Vercel project settings
- [ ] Convex environment variables set

### 4. Feature Flags (per AGENTS.md)
- [ ] New features behind flags if risky
- [ ] Flag defaults appropriate for production
- [ ] Gradual rollout plan defined
- [ ] Kill switch ready for new features

### 5. Authentication & Authorization
- [ ] New Convex functions check `ctx.auth.getUserIdentity()`
- [ ] Data access properly scoped to user/band ownership
- [ ] No new privilege escalation paths
- [ ] Session handling unchanged or tested

### 6. Data Integrity
- [ ] Soft delete patterns maintained
- [ ] No orphaned records from new relationships
- [ ] Existing data compatible with schema changes
- [ ] Rate limits configured (`uploadRateLimits`, `aiGenerationLimits`)

### 7. Performance Verification
- [ ] No N+1 queries introduced
- [ ] Heavy libraries lazy loaded (AlphaTab)
- [ ] Waveform pre-computation on upload
- [ ] Convex indexes optimized

### 8. Observability (per AGENTS.md)
- [ ] PostHog events for new user actions
- [ ] Error boundaries on new routes
- [ ] Logging for new Convex actions
- [ ] No sensitive data in logs

### 9. Rollback Readiness
- [ ] Previous deployment noted
- [ ] Convex schema rollback plan if needed
- [ ] Feature flags can disable new functionality
- [ ] Vercel instant rollback available

## Deployment Process

### Staging Verification
1. Deploy to Vercel preview
2. Run Convex dev against staging
3. Verify new features work as expected
4. Check for console errors
5. Test with multiple user accounts

### Production Deployment
1. Merge to main branch
2. Deploy Convex: `npx convex deploy`
3. Monitor Vercel deployment
4. Verify production URL
5. Check PostHog for new errors

### Post-Deployment
- [ ] Smoke test critical paths
- [ ] Verify Convex schema deployed
- [ ] Check external integrations (email, AI)
- [ ] Monitor error rates for 30 minutes
- [ ] Communicate release to stakeholders

## Output Format

```markdown
# Release Checklist: [Feature/Version]

## Summary
- Release date: YYYY-MM-DD
- Key changes: [list]
- Risk level: LOW|MEDIUM|HIGH

## Verification Status
[Checklist with pass/fail status]

## Rollback Plan
[Steps to revert if issues found]

## Stakeholder Communication
[Who to notify, what to communicate]
```

## Actions

1. Run all build/lint/type-check commands
2. Review pending Convex schema changes
3. Check environment variable changes
4. Verify feature flag configurations
5. Document rollback procedure

## Post-Release

- Monitor error rates in PostHog
- Watch for user behavior changes
- Keep rollback option ready for 24 hours
- Update changelog per AGENTS.md guidelines
