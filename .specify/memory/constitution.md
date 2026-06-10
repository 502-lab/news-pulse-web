<!--
SYNC IMPACT REPORT
------------------
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (initial population from template)
Added sections:
  - Core Principles (5 principles)
  - Quality & Standards
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ Constitution Check section is dynamic — no static changes needed
  - .specify/templates/spec-template.md ✅ No constitution-specific placeholders
  - .specify/templates/tasks-template.md ✅ No constitution-specific placeholders
Follow-up TODOs: None — all placeholders resolved
-->

# news-pulse-web Constitution

## Core Principles

### I. Strict Architecture Boundary

This repository is **frontend-only**. The backend (`news-pulse-back`) is an external dependency treated as a third-party API — not a subsystem.

- MUST NOT contain business logic, domain rules, or data persistence of any kind.
- MUST NOT make assumptions about how the backend calculates or stores data.
- MUST decouple release cycles from backend changes.
- All API surface changes MUST be reflected in the spec submodule BEFORE any frontend code is written.
- Frontend MUST NOT read backend source code to infer behavior. Only the OpenAPI spec is authoritative.

### II. API Contract First

The single source of truth for all API response shapes is the OpenAPI definition in the `spec` submodule.

- MUST NOT invent or assume response structures not defined in the spec.
- MUST NOT use fields absent from the spec.
- If the spec is ambiguous, MUST raise a clarification request — never guess.
- API response types MUST be derived from the spec. `any` type is prohibited.
- If `/generated/api-types.ts` diverges from actual API behavior, the correct action is to request a spec amendment from the backend team — not to patch the frontend types.

### III. Complete State Handling (NON-NEGOTIABLE)

Every component that fetches data MUST handle all three states. A component that renders only the happy path is considered incomplete.

1. **Loading** — MUST display a skeleton (shimmer left→right) or spinner.
2. **Error** — MUST display a user-visible message with retry where appropriate. MUST NOT expose server internals (stack traces, raw error objects).
3. **Empty state** — MUST display a meaningful empty state, not a blank screen.

Each page-level component MUST be wrapped in an Error Boundary to prevent full-tree crashes. HTTP error codes MUST be handled contextually:
- `401` → redirect to login
- `403` → unauthorized page (not blank, not generic error)
- `404` → empty state
- `5xx` → error message with retry

### IV. Type Safety

TypeScript strict mode is mandatory and MUST NOT be downgraded.

- `any` type is prohibited. Use `unknown` with type guards when the type cannot be known.
- Type assertions (`as`) MUST be minimized; when used, the reason MUST be documented in an inline comment.
- Props types on all components MUST be explicit.
- API response types MUST reference the spec-derived definitions in `/generated/api-types.ts` — never hand-rolled guesses.

### V. Accessibility by Default

Accessibility is a baseline requirement, not an enhancement. It MUST be addressed during implementation, not deferred.

- MUST use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`, etc.).
- All interactive elements MUST be keyboard-navigable (Tab, Enter, Escape).
- Images MUST have meaningful `alt` text; decorative images MUST use `alt=""`.
- Form inputs MUST be associated with a `<label>`.
- MUST NOT convey meaning through color alone.
- `aria-*` attributes MUST NOT be omitted where they provide essential context.

## Quality & Standards

### Component Design

- MUST separate UI presentation from data fetching. A single component MUST NOT do both.
- Page components MUST live under `src/pages/`. Shared components under `src/components/`. Domain-specific components under `src/components/features/<domain>/`.
- Components exceeding 100 lines SHOULD be decomposed.
- Props types MUST be explicit (`any` prohibited).

### Authentication & Authorization

- JWT tokens MUST be stored in `httpOnly` cookies. `localStorage` storage is prohibited.
- Expired access tokens MUST trigger an automatic refresh attempt. On refresh failure, redirect to login.
- Routes requiring authentication MUST be wrapped in `ProtectedRoute`.
- Routes requiring `ADMIN` role MUST be wrapped in `AdminRoute`.
- A `403` response MUST route to an authorization-denied page — never a blank or generic error screen.

### Performance

- Routes MUST use code splitting (`React.lazy` + `Suspense`).
- MUST avoid unnecessary re-renders: no dependency-array-less `useEffect`, no objects/functions created fresh on every render.
- Images MUST use appropriate formats (WebP preferred) and MUST default to `loading="lazy"`.
- React's `use` hook and Suspense SHOULD be leveraged for async data fetching flows.

### Testing Policy

- **Component tests** MUST be user-interaction-centric (React Testing Library). Test what the user sees, not implementation details.
- **Custom hook tests** for data-fetching hooks MUST mock APIs via MSW.
- **E2E tests** MUST cover core user flows (login, news feed, etc.).

### Styling

- TailwindCSS utility classes are the **only** permitted styling mechanism. Inline `style` props are prohibited.
- Conditional classes MUST use `clsx` or `cn`. Repeated class bundles MUST be abstracted into components.
- Design tokens (colors, spacing, radius, fonts) MUST be defined in `tailwind.config.ts`. Arbitrary values (`[]` syntax) are permitted only when the design token cannot express the value.
- Global styles MUST be written exclusively in `src/styles/global.css`.

### Third-Party Library Criteria

Before adding a library, verify the existing stack (React 19, TanStack Query, TailwindCSS) cannot address the need. A library MUST meet all three criteria:

1. Sufficient weekly downloads and recent maintenance activity.
2. Bundle size increase is proportionate to the functionality gained.
3. License is compatible with this project.

A library MUST NOT be added if an equivalent is already present.

## Development Workflow

### Environment Variables

- All environment-specific settings MUST use `.env` files with the `VITE_` prefix.
- `.env.example` MUST be kept current with every new variable added.
- Secrets, tokens, and credentials MUST NEVER be committed to the repository.
- API base URL MUST be read from `VITE_API_URL`. Hard-coding URLs is prohibited.

### Browser Support

Supported targets (latest 2 versions each):
- Chrome
- Safari
- Firefox

IE and legacy browsers are out of scope. No polyfills. When browser compatibility is uncertain for a CSS property or Web API, consult the [MDN compatibility table](https://developer.mozilla.org) before using.

## Governance

This constitution supersedes all other documented practices for this repository. When other documents conflict with this constitution, this constitution prevails.

**Amendment procedure**:
1. Propose the amendment with rationale.
2. Increment `CONSTITUTION_VERSION` following semantic versioning (MAJOR: incompatible removals/redefinitions; MINOR: new principles or material additions; PATCH: clarifications and wording).
3. Update `LAST_AMENDED_DATE` to the amendment date.
4. Propagate relevant changes to dependent templates (`.specify/templates/`).
5. Document the change in the Sync Impact Report comment at the top of this file.

**Compliance**: All PRs MUST be reviewed against the principles defined here. Non-compliance MUST be resolved before merge. Complexity that violates a principle MUST be explicitly justified in the PR and tracked in the plan's Complexity Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-06-08 | **Last Amended**: 2026-06-08
