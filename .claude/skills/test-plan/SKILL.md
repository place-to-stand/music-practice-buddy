---
name: test-plan
description: Generate manual test plans with test cases, role-based scenarios, and edge cases. Use when preparing for QA, before releases, after completing features, or when asked to create test documentation.
---

# Manual Test Plan Generator

Generate comprehensive manual test plans for features, changes, or releases.

## Scope

Create test plans covering:

### 1. Functional Testing
- Happy path scenarios
- Edge cases and boundary conditions
- Error handling and validation
- State transitions
- Data persistence via Convex

### 2. User Flow Testing
- Complete user journeys
- Multi-step workflows
- Navigation and routing
- Form submissions
- File uploads (audio, tabs, charts)

### 3. Role-Based Testing
- Authenticated user scenarios
- Band member access
- Personal vs. band content separation
- Permission boundaries

### 4. Cross-Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### 5. Responsive Testing
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Per AGENTS.md: no horizontal scroll

### 6. Accessibility Testing
- Keyboard-only navigation
- Screen reader compatibility
- Focus management
- Color contrast

### 7. Music-Specific Testing
- AlphaTab rendering (Guitar Pro files)
- Waveform display and playback
- Metronome accuracy
- Drone player functionality
- Transposition calculations
- Setlist duration calculations

### 8. Integration Points
- Convex Auth flows
- Convex Storage operations
- AI lick generation (Vercel AI Gateway)
- Email sending (Resend)

## Output Format

```markdown
# Test Plan: [Feature Name]

## Overview
Brief description of what's being tested

## Prerequisites
- Required test data
- User accounts needed
- Environment setup

## Test Cases

### TC-001: [Test Case Name]
**Priority:** P0|P1|P2
**Type:** Functional|UI|Integration|Security
**Condition:** Authenticated|Unauthenticated|Band Member

**Preconditions:**
- List of required states

**Steps:**
1. Step-by-step instructions
2. Be specific about clicks/inputs
3. Include expected intermediate states

**Expected Result:**
- What should happen

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue)

---
```

## Actions

1. Analyze the feature or change scope
2. Identify all user-facing behaviors
3. Map permission requirements
4. Consider failure modes
5. Include regression scenarios

## Test Plan Principles

- Cover both positive and negative cases
- Include data boundary conditions
- Test with different user states
- Verify soft delete behavior
- Check loading and empty states
- Test rate limiting for uploads and AI generation

## Post-Generation

Provide:
- Prioritized test case list (P0 first)
- Estimated testing time
- Required test data setup scripts
- Automation candidates for future
