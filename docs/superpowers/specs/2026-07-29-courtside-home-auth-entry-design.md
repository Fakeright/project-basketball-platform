# COURTSIDE Home Authentication Entry Design

## Goal

Make the public Home authentication state unambiguous. Anonymous visitors see
clear Login and Register actions on desktop and mobile. A role is displayed
only for a user authenticated through Supabase and linked to a Prisma profile.

## Scope

This slice includes:

- Anonymous Login and Register actions in the shared header.
- A compact anonymous action row in the Home hero before tournament search.
- Authenticated display name, email, role, workspace link, and logout in the
  shared header.
- Removal of the development-cookie fallback when Supabase public
  configuration is available.
- Responsive, loading-safe rendering at approximately 375px, 768px, and
  1440px.

This slice does not include profile editing, email verification, role changes,
new authentication providers, or database schema changes.

## Authentication State

When Supabase public configuration is available, the current actor provider
uses only the validated Supabase user and linked Prisma profile. An absent,
expired, invalid, or unprovisioned Supabase session resolves to an anonymous
visitor. A `courtside-actor` development cookie must not create an
authenticated product state in this mode.

The development-cookie provider remains available only when running locally
without Supabase public configuration. This preserves isolated fixture use
without allowing it to override real authentication.

## Header Behavior

Anonymous visitors see `เข้าสู่ระบบ` and `สมัครสมาชิก` in the desktop header.
On narrow screens, the same actions remain available in the navigation sheet.
No display name, email, role label, or workspace action is rendered.

Authenticated users see the existing account session control. Its name, email,
role label, workspace destination, and logout action come from the
Supabase-linked Prisma actor. Login and Register actions are hidden.

## Home Hero Behavior

Home resolves the actor in its server composition and passes only the
anonymous/authenticated state needed by the hero. Anonymous visitors see a
compact, unframed action row below the introductory copy and before tournament
search:

- `เข้าสู่ระบบ` is the primary command.
- `สมัครสมาชิก` is the secondary command.

The action row is hidden for authenticated users. Tournament search remains
the primary Home workflow, and no marketing card or additional explanatory
section is introduced.

## Error And Loading Behavior

An ordinary missing Supabase session is anonymous state, not an error.
Unexpected authentication dependency failures continue through the existing
safe correlated error boundary. The server-rendered state prevents a role or
anonymous CTA from flashing during hydration.

## Testing And Verification

Tests cover:

- Supabase mode does not fall back to a development actor cookie.
- Cookie-only local mode remains available when Supabase is not configured.
- Anonymous header and Home hero render Login and Register actions without a
  role label.
- Authenticated header renders the actor role and hides anonymous actions.
- Authenticated Home hides the hero authentication action row.

Verification includes focused tests, the full Vitest suite, lint, production
build, `git diff --check`, and browser checks at approximately 375px, 768px,
and 1440px for anonymous and authenticated states.
