# COURTSIDE Supabase Auth And Team Manager Discovery Design

## Goal

Replace the development-only role cookie with Supabase email/password
authentication, preserve the existing Prisma-backed authorization model, make
the current role visible in the product shell, and complete the Team Manager
discovery-to-application path using persisted public tournament data.

## Scope

This slice includes:

- Email/password registration, login, logout, forgot-password, and
  reset-password flows through Supabase Auth.
- Self-selected registration roles: `PLAYER`, `COACH`, `TEAM_MANAGER`, and
  `TOURNAMENT_ORGANIZER`.
- A prohibition on self-assigning `PLATFORM_ADMIN`.
- Prisma profile provisioning keyed by Supabase Auth user id.
- A server-side current actor provider that resolves the Supabase session and
  loads the authoritative role from Prisma.
- A visible session and role indicator in the shared navigation.
- Team Manager tournament discovery and application entry points using the
  existing public Prisma projection and registration use case.
- A Home section that lists teams with `APPROVED` registrations for visible
  tournaments.
- Responsive, loading, validation, expired-link, unauthorized, and unexpected
  error states for the affected flows.

This slice does not include email verification, organizer approval workflow,
social login, profile editing, or payments.

## Roles And Provisioning

Supabase Auth owns credentials, password recovery tokens, and session cookies.
Prisma owns display identity and authorization. A new profile record is created
or reconciled after successful registration and keyed by the Supabase user id.

The registration request accepts one of the four allowed self-service roles.
`PLATFORM_ADMIN` is rejected at the server boundary even if a client crafts the
request manually. Existing platform admins remain database-managed only.

The resolved actor is:

```ts
type Actor = {
  id: string // Prisma user id
  role: Role
  email: string
  displayName: string
}
```

The current actor provider obtains the Supabase session from server cookies,
looks up the matching Prisma user by `supabaseUserId`, and returns `null` for
an absent, invalid, or unprovisioned session. Route Handlers continue to rely
on the existing application permission and ownership checks.

## Authentication Flows

### Registration

1. Visitor submits display name, email, password, password confirmation, and
   an allowed role.
2. A Route Handler validates the request with Zod and creates the Supabase
   account.
3. The server provisions the Prisma profile and returns a safe result.
4. The user is signed in when Supabase issues a session; otherwise the page
   explains the sign-in next step without claiming email verification exists.

### Login And Logout

Login sends credentials to a Route Handler that delegates to Supabase Auth.
Successful login redirects to the role-appropriate destination: Team workspace
for Team Managers, organizer workspace for organizers, and admin workspace for
platform admins. Logout clears the Supabase session server-side and returns to
the public home page.

### Password Recovery

The forgot-password form sends a recovery email through Supabase with the
application reset URL. The reset page only permits password changes after a
valid recovery session is present. Invalid or expired links render a concise
Thai recovery state rather than exposing token details.

## Product Shell

The shared header displays the authenticated display name and a Thai role label
such as `กำลังใช้งาน: Team Manager`. It provides an account menu with the
role-appropriate workspace link and logout. Anonymous visitors see Login and
Register links.

The indicator is usability-only. It never substitutes for server-side
authorization.

## Team Manager Tournament Journey

Team Managers can use the public tournament list to search and filter persisted
visible tournaments by the existing query, province, format, age group, venue,
date, and public status fields. The team workspace also links directly to that
discovery page.

On an `OPEN` tournament detail page, a Team Manager can select an owned team
and submit the existing application request. The server remains authoritative
for status, capacity, deadline, roster eligibility, ownership, and duplicate
attempts. Anonymous visitors can browse but are directed to Login before a
protected action.

## Home Approved Teams

Home loads a small public read model from Prisma that contains approved teams
for visible tournaments. The section groups teams by tournament and shows team
name, province, format, and tournament status. It excludes pending, rejected,
cancelled, withdrawn, draft, and private tournament records. It renders a
meaningful empty state when no approved teams exist.

## Error Handling And Security

- Auth payloads are validated at Route Handler boundaries.
- Supabase errors are mapped to concise Thai messages without leaking provider
  details.
- Session, profile, and dependency failures use the established safe correlated
  error boundary.
- Password values are never written to Prisma, logs, audit JSON, or client
  responses.
- Profile provisioning is idempotent and handles an existing Supabase email or
  an existing Prisma profile safely.
- Development role switching is excluded from production authentication. It may
  remain explicitly isolated for local test fixtures only.

## Testing And Verification

Tests cover auth request validation, allowed-role enforcement, session-to-actor
mapping, provisioning idempotency, logout, recovery/reset boundaries, header
role visibility, protected Team Manager discovery/application, and Home
approved-team projection.

Verification includes focused tests, the full Vitest suite, lint, production
build, Prisma validation, migration status, `git diff --check`, and responsive
browser QA at approximately 375px, 768px, and 1440px for anonymous and Team
Manager sessions.
