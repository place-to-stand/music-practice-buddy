---
name: security-review
description: Perform OWASP Top 10 security audit, check auth/authz guards, find injection vulnerabilities, and identify data exposure. Use when reviewing security-sensitive code, before merging auth changes, or when asked to check for vulnerabilities.
---

# Security Review

Perform a comprehensive security audit focusing on OWASP Top 10 vulnerabilities and application-specific risks.

## Scope

Review the specified files or recent changes for:

### 1. Injection Vulnerabilities
- Command injection in Bash/shell commands
- XSS in React components (raw HTML rendering, unsanitized user input)
- NoSQL injection patterns in Convex queries

### 2. Authentication & Authorization
- Verify `ctx.auth.getUserIdentity()` checks in all protected Convex functions
- Check that mutations validate user ownership before modifying data
- Review auth flows in `convex/auth.ts`
- Verify role-based access control is properly enforced

### 3. Data Exposure
- Sensitive data in query responses (passwords, tokens, PII)
- Overly permissive data fetching
- Missing field-level access control
- Secrets in client-side code or logs

### 4. Security Misconfigurations
- Missing rate limiting on sensitive endpoints (check `uploadRateLimits`, `aiGenerationLimits`)
- Environment variable exposure
- File upload validation (size limits, type checks)

### 5. Cryptographic Issues
- Weak or missing encryption
- Hardcoded secrets
- Insecure token generation

### 6. Business Logic Vulnerabilities
- Privilege escalation paths
- IDOR (Insecure Direct Object References)
- Race conditions in state changes
- Bypassing soft delete restrictions

## Output Format

For each finding:
```
[SEVERITY: CRITICAL|HIGH|MEDIUM|LOW]
File: path/to/file.ts:lineNumber
Issue: Brief description
Risk: What could happen if exploited
Fix: Recommended remediation
```

## Actions

1. If reviewing staged changes: `git diff --cached`
2. If reviewing a PR: Use the Greptile MCP tools to fetch PR details
3. If reviewing specific files: Read and analyze each file
4. Cross-reference with auth patterns in `convex/auth.ts`
5. Check for missing guards by comparing with similar protected functions

## Post-Review

Generate a summary with:
- Total findings by severity
- Priority remediation order
- Architectural recommendations if systemic issues found
