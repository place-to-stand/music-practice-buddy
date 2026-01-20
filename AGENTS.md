# Technical Specifications & Requirements

## 0. LLM Implementation Workflow

- **Read First:** Inspect this file, CLAUDE.md, open issues, and recent commits before making changes. Confirm there are no conflicting high-priority tasks.
- **Clarify Scope:** Summarize the requested change in your own words and highlight unknowns back to the user before coding anything significant.
- **Design Before Code:** Propose the approach (data flow, component ownership, API shape) and wait for approval when impact is medium or higher.
- **Reuse > Rebuild:** Prefer existing modules, utilities, and shadcn components. Flag gaps before introducing new abstractions.
- **Guardrails:** Do not edit `package.json`, lockfiles, or Convex schema directly without using prescribed workflows. Use the CLIs when dependencies or schema changes are required.
- **Verification:** Always run build, linting, type-checking, and targeted tests for any touched surface. Share command results or blockers with the user.
- **Documentation:** Update or create README snippets, inline comments, and changelog notes whenever behavior or interfaces shift.

## 1. Technical Stack

### 1.1 Core Technologies

- **Version Control:** Git with GitHub
- **Package Manager:** npm
- **Runtime Environment:** Node.js (LTS)
- **Language:** TypeScript (strict mode)
- **Framework:** Next.js (App Router)
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Form Management:** React Hook Form
- **Schema Validation:** Zod
- **Database & Backend:** Convex (reactive database with realtime subscriptions)
- **Authentication:** Convex Auth with Password provider
- **File Storage:** Convex Storage
- **Tab Rendering:** AlphaTab (lazy loaded)
- **Waveform:** wavesurfer.js
- **Date Handling:** date-fns

### 1.2 Platform Services

- **Deployment & Hosting:** Vercel (Next.js) + Convex Cloud (backend)
- **Analytics & Monitoring:** PostHog (client and server-side)
- **Email Service:** Resend (for password reset)
- **AI Services:** Vercel AI Gateway (for lick generation)

### 1.3 Tooling & Testing

- **Linting:** ESLint with Next.js recommended config
- **Formatting:** Prettier (project config)
- **Unit & Integration Tests:** Vitest + Testing Library (React)
- **End-to-End Tests:** Playwright
- **Static Analysis:** TypeScript `tsc --noEmit`

## 2. Development Practices

- **Modular Architecture:** Group features by domain inside `/app` and `/components`. Shared utilities live under `/lib`. Convex functions organized by domain under `/convex`.
- **Single Responsibility Principle:** As files approach 300 lines, consider splitting by responsibility. Each component, function, or module should have one clear purpose.
- **Separation of Concerns:** Distinguish between UI, state management, data fetching, and business logic layers.
- **DRY Principle:** Reuse code via shared utilities, hooks, and components. Abstract common patterns when they appear in 3+ places.
- **Git Hygiene:** Create topic branches, use conventional commit messages, and keep PRs scoped to a single feature or bug fix.
- **Performance Mindset:** Prefer server components where possible, defer client components, leverage Convex indexes, and use `next/dynamic` for heavy widgets (e.g., AlphaTab).
- **Error Handling & Resiliency:** Wrap external calls with retry logic, fail gracefully with sensible fallbacks, and log structured errors to PostHog.
- **Type Safety:** Avoid `any`; model domain data with shared TypeScript types and Zod schemas to keep server-client parity. Convex generates types from schema automatically.

### Dependency Management

- **Install packages with latest versions:** `npm install <package>@latest`
- Record rationale for new dependencies in PRs
- Remove unused dependencies promptly
- Review package updates periodically for security patches

### Component Strategy

- **Use shadcn before building custom UI:** `npx shadcn@latest add <component>`
- Extend via composition rather than heavy overrides
- Custom components go in `components/` organized by feature
- shadcn base components stay in `components/ui/`

### Convex Workflow

- Manage schema updates in `convex/schema.ts`
- Convex dev server automatically syncs schema changes during development
- For production: `npx convex deploy`
- Import the Convex client from `convex/_generated/` for type-safe queries and mutations

### Form Handling

- Use React Hook Form for form state management
- Use Zod for validation schemas
- Surface field-level errors from Zod on each field (not just a single form error)
- For every disabled button, add a tooltip explaining why it's disabled

### Secrets & Config

- Reference environment variables through `process.env`
- Never hardcode secrets
- Maintain `.env.example` with required variables

## 3. Non-Functional Requirements

- **Deletion & Data Retention:** Implement soft deletes for all records. All delete actions should have a confirmation step.
- **UI/UX:** Maintain a clean, professional aesthetic using shadcn/ui. Favor consistent spacing, typography, and interactive states sourced from Tailwind design tokens.
- **Responsiveness:** Support 320px+ viewports with mobile-first layouts, accessible navigation, and no horizontal scroll.
- **Accessibility:** Meet WCAG 2.1 AA. Provide keyboard access, ARIA labels when semantic HTML is insufficient, focus outlines, and respect `prefers-reduced-motion`.
- **Performance:** Target Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1). Use lazy loading for heavy libraries (AlphaTab), pre-compute waveform peaks on upload, and leverage Convex indexes.
- **Security:** Sanitize all inputs, escape user-generated content, validate file sizes both client and server-side, and follow OWASP Top 10 guidance.
- **Loading & Empty States:** Use skeletons or shimmer placeholders for async content, and provide helpful empty/error states.
- **Rate Limiting:** Enforce rate limits on file uploads and AI generation to prevent abuse.

## 4. Observability & Operations

- **Logging:** Emit structured logs with context (user id, request id) for server actions. Redact sensitive data before logging.
- **Monitoring:** Configure PostHog for error tracking, performance monitoring, and user analytics. Capture breadcrumb data for debugging.
- **Metrics:** Track key product metrics (practice sessions, file uploads, AI generations) via PostHog events.
- **Feature Flags:** Use PostHog feature flags for guarded rollouts to de-risk large changes.

## 5. Environment & Deployment

- **Environment Parity:** Maintain `.env.example` with required variables, noting default or mock values for local use.
- **Deployment Workflow:** Use Vercel previews for PRs. Merge only after automated checks pass.
- **Convex Deployment:** Use `npx convex deploy` for production schema and function updates.

## 6. Documentation & Knowledge Sharing

- **Living Docs:** Update CLAUDE.md and relevant documentation when behavior changes.
- **Developer Notes:** Add inline comments sparingly to explain non-obvious logic, especially around performance or security decisions.
- **Changelogs:** Record noteworthy updates (features, migrations, dependency bumps) in commit messages or release notes.
