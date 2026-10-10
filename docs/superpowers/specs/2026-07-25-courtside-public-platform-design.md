# COURTSIDE Public Platform Design

**Date:** 2026-07-25

## Purpose and Scope

COURTSIDE is a Thai-first basketball tournament platform. This specification
covers the first delivery: a responsive public experience that lets visitors
discover tournaments, inspect a tournament, and view its schedule and bracket.

This delivery deliberately excludes authentication, role-protected workflows,
database connectivity, upload handling, email, notifications, and analytics.
It establishes the contracts and page structure that those phases will extend.

## Decisions

- Use the existing Next.js 16.2.11, React 19, TypeScript, and Tailwind CSS 4
  project. Do not downgrade to Next.js 15.
- Build a feature-first foundation with Clean Architecture boundaries.
- Use in-memory mock repositories with contracts shaped for a later Prisma and
  Supabase implementation.
- Make Thai the primary language. Keep copy and data structures ready for a
  later English localization layer; do not introduce an i18n framework yet.
- Name the temporary product brand `COURTSIDE`.
- Use the `Tournament Atlas` and `Poster Court` hybrid visual direction:
  discovery and filtering lead the experience, while a graphic poster block
  gives the brand a distinct presence.

## Product Experience

The design uses editorial minimalism and modern Swiss design. It is built from
typography, rules, measured spacing, and a restrained palette rather than
gradients, glassmorphism, or repeated rounded cards. The home page carries a
search-first hero beside a compact poster treatment. Information-dense lists
and rows replace decorative card grids.

Dark mode is user-controlled. Navigation, focus states, contrast, and all
responsive behavior work in both themes.

### Public Routes

| Route | Responsibility |
| --- | --- |
| `/` | Hero, primary tournament search, open-registration tournaments, and a link to all tournaments. It does not show ongoing or completed sections. |
| `/tournaments` | Search and filter tournaments by name, province, 5v5/3v3, age division, venue, and date. Filter state is URL-backed and shareable. |
| `/tournaments/[slug]` | Show tournament overview, teams, venue, dates, registration status, and links to its schedule and bracket. |
| `/schedule` | Show match rows grouped by date and court, filtered by tournament. |
| `/bracket` | Show a single-elimination bracket filtered by tournament; preserve usable horizontal scrolling on small screens. |

Every route supplies loading, empty, error, and not-found states. Desktop,
tablet, and phone layouts are validated at 1440px, 768px, and 375px widths.

## Architecture

Next.js App Router uses Server Components by default. Client Components are
limited to controls that need browser state: search and filters, dark-mode
selection, and interactive bracket controls.

```text
app/
  (public)/
  tournaments/
  schedule/
  bracket/
  loading.tsx, error.tsx, not-found.tsx

features/
  tournaments/
    domain/            entities and value types
    application/       use cases
    infrastructure/    mock repository implementation
    presentation/      feature-specific components and view models

components/            shared UI only
lib/                   shared utilities, constants, and types
```

The page layer calls an application use case. The use case depends on a
repository interface, never a mock-data module or Prisma directly. Phase 1
binds that interface to `MockTournamentRepository`; a future Prisma adapter
binds the same interface to PostgreSQL without changing page or component
contracts.

## Domain and Database Direction

The future Supabase PostgreSQL schema is designed around these entities:

| Entity | Key fields and relationships |
| --- | --- |
| `User` | Identity, email, display name, profile image, verification date. |
| `Team` | Name, slug, province, logo, biography, owner. |
| `TeamMember` | User-to-team membership, player/coach/manager team role, jersey number, and position. |
| `Tournament` | Slug, title, lifecycle status, 5v5/3v3 format, age division, province, venue, dates, cover, and banner. |
| `Registration` | One team application to one tournament, lifecycle status, applicant timestamp, and review audit fields. |
| `Match` | Tournament round, date/time, court, referee, opponents, scores, and match status. |
| `Role`, `Permission`, `RolePermission`, `UserRole` | Expandable global authorization, including admin access. |

`User` is not limited to one role. Player, coach, and team manager are scoped
through `TeamMember`; global administration comes through `UserRole`. Route
handlers in later phases check both the requested permission and the resource
scope. For example, a team manager may update only their own team's roster;
an administrator may manage all tournaments.

Prisma models, migrations, Supabase connection settings, storage buckets, and
route handlers are intentionally deferred until the backend phase. Mock data
will match the public shape of the entities above from the first delivery.

## Quality and Testing

- Keep mock data behind repository interfaces; UI components do not import
  raw data files.
- Validate search and filter use cases, repository behavior, and URL state.
- Verify keyboard navigation, visible focus, semantic headings, and contrast.
- Run lint, type checking, and production build before delivery.
- Use route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` rather than
  burying error handling inside large page components.

## Delivery Sequence

1. **Public foundation:** this specification's routes, shared layout, mock
   repository, responsive states, and dark mode.
2. **Platform backend:** Prisma schema, Supabase PostgreSQL, authentication,
   email verification, profile, RBAC, and protected route handlers.
3. **Operations:** teams, tournament creation, applications, review workflow,
   match management, results, and bracket generation.
4. **Platform services:** media uploads, notifications, analytics dashboards,
   reporting, and advanced search.

## Definition of Done for Phase 1

A visitor can find an open tournament, refine results with shareable filters,
open a tournament detail page, and inspect its schedule and bracket on a phone
or desktop browser. The codebase has clear domain boundaries and all checks in
the quality section pass. No backend, authentication, or private management
workflow is implied by the first release.
