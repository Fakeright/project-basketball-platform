# COURTSIDE Team And Tournament Registration Design

## Goal

Deliver the first production-persistent operational slice after tournament
review: team managers can maintain teams and apply to published tournaments,
while tournament organizers can review those applications. Tournament, team,
registration, and audit data use Prisma with Supabase PostgreSQL so the next
bracket phase can consume approved entries without replacing a development-only
data model.

## Scope

This phase includes:

1. Replacing the development JSON adapter in active organizer and admin
   tournament workflows with a Prisma-backed tournament operations repository.
2. Supplying stable development identities in PostgreSQL for the existing
   cookie-based local session selector.
3. Letting a team manager create and edit teams they own.
4. Letting a team manager maintain a basic roster of players and coaches.
5. Letting an owned team apply to an eligible tournament and inspect its
   registration status.
6. Letting the owning tournament organizer approve or reject applications.
7. Letting a team manager cancel a pending application.
8. Letting an organizer withdraw an approved team with a mandatory reason.
9. Recording audit events for team-sensitive and registration lifecycle actions.

This phase excludes invitations and invitation acceptance, payments, document
verification, roster locking, waitlists, bracket generation, scheduling,
result entry, and notification delivery. The roster model established here is
designed to support those later phases.

## Roles And Permissions

Permissions remain action-based and are enforced in application use cases.

| Action | Team Manager | Coach | Player | Tournament Organizer | Platform Admin |
| --- | --- | --- | --- | --- | --- |
| `team.create` | Yes | No | No | No | Override |
| `team.update` | Owned team | No | No | No | Override |
| `team.roster.manage` | Owned team | No | No | No | Override |
| `registration.create` | Owned team | No | No | No | Override |
| `registration.cancel` | Owned pending application | No | No | No | Override |
| `registration.view` | Owned team | Assigned team | Own membership | Owned tournament | Global |
| `registration.decide` | No | No | No | Owned tournament | Global |
| `registration.withdraw` | No | No | No | Owned tournament | Global |

The server checks both the action and resource ownership. Hiding a control in
the interface is never considered authorization.

## Registration Lifecycle

The registration state machine is:

```text
Pending -> Approved
        -> Rejected
        -> Cancelled
Approved -> Withdrawn
```

- `PENDING`: submitted and waiting for an organizer decision.
- `APPROVED`: accepted and counted against tournament capacity.
- `REJECTED`: rejected by an organizer with a mandatory reason.
- `CANCELLED`: cancelled by the owning team manager before a decision.
- `WITHDRAWN`: removed after approval by an organizer or platform admin with a
  mandatory reason.

Terminal registrations are retained for audit history. A new application for
the same team and tournament is allowed only after a previous registration is
`REJECTED`, `CANCELLED`, or `WITHDRAWN`; the database keeps attempt history and
enforces at most one active registration per team and tournament.

## Eligibility And Integrity Rules

A registration can be created only when all of the following are true:

- The tournament is `PUBLISHED`.
- The registration deadline has not passed.
- The tournament has fewer approved teams than its capacity.
- The actor owns the selected team.
- The team has no active registration for the tournament.
- The roster satisfies the current format minimum: five players for 5v5 or
  three players for 3v3, plus at most one active coach.

Capacity is checked transactionally again when an organizer approves an
application. Concurrent decisions must not approve more teams than the
tournament capacity. Registration decisions use an integer `version` for
optimistic concurrency and return `409` for stale updates.

Closing registration prevents new applications but still allows an organizer
to approve or reject applications submitted before the deadline. It does not
silently reject pending applications; the organizer must resolve every pending
record before entries are locked or bracket generation begins in the next
phase. Approval is valid while the tournament is `PUBLISHED` or
`REGISTRATION_CLOSED` and remains subject to capacity.

## Data Model Changes

The existing Prisma models remain the foundation with these scoped changes:

- `RegistrationStatus` adds `CANCELLED` and `WITHDRAWN`.
- `Registration` adds `version`, `cancelledAt`, `withdrawnAt`, and a required
  reason when the state is rejected or withdrawn.
- The existing unique constraint on `(tournamentId, teamId)` is replaced with
  attempt-aware history. An application-level transaction and a PostgreSQL
  partial unique index ensure only one `PENDING` or `APPROVED` registration is
  active for a team and tournament.
- `TeamMember` adds a membership role of `PLAYER` or `COACH` and an active-state
  marker so roster history is retained instead of hard-deleting membership.
- `Team` retains one owning `TEAM_MANAGER`; ownership transfer is outside this
  phase.
- `AuditLog` stores registration creation, cancellation, approval, rejection,
  withdrawal, and privileged override events.

The migration is additive where possible and must be applied through Prisma
migrations. No destructive reset or shared-database wipe is allowed.

## Architecture

Dependency direction remains:

```text
presentation -> application -> domain
infrastructure -> application/domain contracts
```

### Domain

- Team ownership and roster policies.
- Tournament registration eligibility.
- Registration transitions and required-reason rules.
- Capacity and roster minimum rules.

Domain modules do not import Next.js, React, Prisma, or Supabase.

### Application

Focused use cases coordinate authentication, authorization, ownership,
transactions, policy checks, and audit records:

- `createTeam`
- `updateTeam`
- `addTeamMember`
- `deactivateTeamMember`
- `applyToTournament`
- `cancelRegistration`
- `decideRegistration`
- `withdrawRegistration`
- `listOwnedTeamRegistrations`
- `listTournamentRegistrations`

Repository contracts expose transaction-level methods rather than leaking
Prisma models into application code.

### Infrastructure

- `PrismaTournamentOperationsRepository` replaces the development JSON adapter
  for active organizer/admin routes.
- `PrismaTeamRepository` maps teams and roster memberships.
- `PrismaRegistrationRepository` performs transactional eligibility, capacity,
  version, decision, and audit operations.
- A composition module selects Prisma for server routes when `DATABASE_URL` is
  configured. Tests continue using focused in-memory adapters.

### Presentation

Route Handlers parse untrusted payloads with Zod and map known failures to Thai
responses. Server Components load view-ready models through application use
cases and do not query Prisma directly.

## User Experience

### Team Dashboard

The `/team` workspace shows the manager's teams as compact bordered rows. It
includes a create-team command and links into `/team/[id]`, where the manager
can edit team identity, maintain player/coach rows, inspect registrations, and
open eligible tournament registration.

The team form uses visible labels for name and province. Roster controls use a
role select and a searchable user selector over development users. Empty,
validation, unauthorized, conflict, loading, and unexpected-error states use
concise Thai copy.

### Tournament Registration

The public tournament detail shows a registration command only for an eligible
signed-in team manager. The command opens a simple team selector when the actor
owns multiple teams. The server remains authoritative and may reject a stale
page when capacity, deadline, status, roster, or ownership changed.

The team dashboard displays each application as a row with tournament name,
submitted date, status, organizer note, and the cancel command only while
pending.

### Organizer Registration Review

The organizer tournament workspace adds a `Registrations` section with counts
for pending, approved, rejected, cancelled, and withdrawn records. Applications
are structured rows rather than repeated cards and show team, province, roster
summary, submitted time, and current decision.

Approval requires confirmation. Rejection and withdrawal require a visible
reason field and confirmation. Pending actions disable only the affected row,
and status feedback uses `aria-live` without changing table dimensions.

## HTTP Boundaries

The phase adds these Route Handlers:

- `POST /api/teams`
- `PATCH /api/teams/[id]`
- `POST /api/teams/[id]/members`
- `DELETE /api/teams/[id]/members/[memberId]`
- `POST /api/tournaments/[id]/registrations`
- `DELETE /api/registrations/[id]` for pending cancellation
- `POST /api/organizer/tournaments/[id]/registrations/[registrationId]/decision`
- `POST /api/organizer/tournaments/[id]/registrations/[registrationId]/withdraw`

Expected failures map to:

- `401`: no authenticated actor.
- `403`: missing permission or ownership.
- `404`: inaccessible team, tournament, member, or registration.
- `409`: duplicate active registration, stale version, full capacity, or an
  illegal lifecycle transition.
- `422`: invalid payload, incomplete roster, expired deadline, or missing
  decision reason.
- `500`: unexpected failure with a correlation id and no sensitive detail.

Errors must not reveal whether another owner's private resource exists.

## Development Identity And Persistence Transition

The local role selector remains a development-only authentication mechanism.
Its stable actor ids must correspond to seeded PostgreSQL users. Existing
organizer/admin pages switch to Prisma composition in the same phase so teams
and registrations always reference persistent tournaments and users.

The ignored development JSON file remains available only as a test/demo
adapter and is not automatically imported into PostgreSQL. The seed supplies
known tournaments at representative lifecycle states and stable team-manager,
coach, and player identities. Existing user-created JSON drafts remain local
development data and are not treated as migrated production records.

## Testing Strategy

- Domain tests cover roster minimums, ownership, deadlines, lifecycle states,
  duplicate active registration, required reasons, capacity, and legal
  transitions.
- Application tests cover role permissions, inaccessible resources, active
  attempt rules, optimistic concurrency, and transactional capacity.
- Prisma repository tests cover mapping, partial uniqueness, transaction
  rollback, audit creation, and concurrent approval behavior.
- Route Handler tests cover `401`, `403`, `404`, `409`, `422`, and successful
  mutations.
- UI tests cover team creation, roster empty/error states, team application,
  pending cancellation, organizer approval/rejection, and accessible
  confirmation behavior.
- Browser QA covers approximately 375px, 768px, and 1440px in light and dark
  modes with no page overflow or unstable operational rows.

## Delivery Sequence

1. Extend registration and membership domain types, permissions, and Prisma
   schema with a migration.
2. Add stable database seed identities and Prisma tournament composition.
3. Build team ownership and roster use cases, routes, and Team Dashboard.
4. Build registration eligibility, application, status, and cancellation.
5. Build organizer decision and withdrawal workflow with transactional
   capacity and audit logs.
6. Integrate the registration command into public tournament detail and perform
   responsive, accessibility, and full regression verification.

## Definition Of Done

- Active organizer/admin tournament workflows and the new registration workflow
  persist to Supabase PostgreSQL through Prisma.
- A team manager can create a valid team, maintain the current basic roster,
  apply to an eligible tournament, inspect status, and cancel while pending.
- An owning organizer can approve, reject, and withdraw registrations without
  exceeding capacity and with complete audit history.
- Every mutation enforces permission, ownership, validation, lifecycle, and
  optimistic concurrency on the server.
- Focused tests, the complete test suite, lint, production build, Prisma
  validation, migration status, `git diff --check`, and responsive Browser QA
  all pass before implementation commits are pushed.
