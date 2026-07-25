# COURTSIDE Admin Tournament Management Design

## Goal

Add a secure operations workspace for tournament organizers and platform administrators. Organizers can submit and run their own competitions; administrators review submissions and retain platform-wide oversight. The work builds on the existing Thai-first public COURTSIDE experience and prepares clean boundaries for Prisma and Supabase PostgreSQL.

## Scope

The initial admin phase covers the tournament lifecycle from draft through archived results:

1. An organizer creates, saves, edits, and submits a tournament.
2. An administrator approves, requests changes, rejects, suspends, or removes the submission.
3. An approved organizer publishes the tournament and manages applications.
4. The organizer accepts or rejects teams, closes registration, locks entries, and generates a knockout bracket.
5. The organizer schedules matches, enters scores, confirms results, and publishes rankings.

The phase does not include payments, notification delivery, media galleries, advanced analytics, a referee role, or automated bracket formats beyond single-elimination knockout.

## Roles And Permissions

Permissions are action-based and enforced on the server. Roles only grant permission bundles; hidden UI controls are never the authorization boundary.

| Role | Responsibilities |
| --- | --- |
| Platform Admin | Review and govern all tournaments, override organizer actions, manage roles, and inspect audit history. |
| Tournament Organizer | Create and operate only tournaments they own, including team applications, brackets, schedules, and results after approval. |
| Team Manager | Maintain their team, submit tournament registrations, and manage roster submission. |
| Coach | Maintain assigned team roster information and view tournament operations for their team. |
| Player | Maintain their own profile, accept team invitations, and view public competition information. |

The system defines actions such as `tournament.create`, `tournament.submit`, `tournament.review`, `registration.decide`, `bracket.generate`, `match.schedule`, `result.record`, and `result.confirm`. An organizer receives actions scoped to owned tournaments; a platform admin receives global actions.

## Lifecycle

The tournament state machine is:

```text
Draft -> Submitted -> Approved -> Published -> Registration Closed -> In Progress -> Completed -> Archived
                 -> Changes Requested -> Draft
                 -> Rejected
```

An admin may suspend or remove a tournament at any stage. A public page is visible only while a tournament is published, registration is closed, in progress, completed, or archived according to its visibility setting. Every lifecycle transition validates its prerequisites and creates an audit event.

## Data Model

The production implementation uses Prisma models backed by Supabase PostgreSQL. The domain layer owns business types and ports; Prisma implements repository ports in infrastructure.

Core entities:

- `User`, `Role`, and `Permission`: identity and action bundles.
- `OrganizerProfile`: organizer-specific contact and verification metadata.
- `Tournament`: organizer ownership, public details, format, age group, capacity, venue, dates, publication state, and a version field for concurrency control.
- `TournamentReview`: submission decision, reviewer, timestamp, and mandatory feedback for changes requested or rejection.
- `Team` and `TeamMember`: reusable team identity and roster membership.
- `Registration`: a team's application to a tournament, including decision state and decision note.
- `Bracket` and `BracketRound`: a single-elimination bracket and its ordered rounds.
- `Match`: bracket placement, teams, scheduled time, court, result status, and version field.
- `MatchResult`: confirmed scores, winner, confirmation metadata, and ranking impact.
- `Announcement`, `MediaAsset`, and `AuditLog`: extensibility points for later announcements/uploads and immutable operational history.

There is no referee or match-official entity in this phase. Organizers record results; administrators may correct or confirm them.

## Application Architecture

Routes under `app/(admin)` provide the dashboard, review queue, organizer dashboard, and tournament workspace. Server Components load view models through application use cases. Client Components are reserved for interactive forms, editors, tables, and bracket/schedule controls.

Route Handlers call use cases for every mutation. Each use case:

1. Resolves the authenticated actor.
2. Checks the action permission and resource ownership.
3. Validates input and lifecycle preconditions.
4. Applies the domain transition transactionally.
5. Records an audit event.

Prisma repositories, Supabase storage, and authentication providers remain infrastructure adapters. Presentation code imports application contracts rather than Prisma directly.

## Admin And Organizer Experience

### Platform Admin

- Dashboard: review queue counts, registration decisions waiting, active events, and latest operational activity.
- Review Queue: concise submission review with approve, request changes, reject, suspend, and remove actions. Decisions other than approval require a note.
- Tournament Workspace: a single record context with Overview, Registrations, Teams, Bracket, Schedule, Results, Settings, and Audit Log tabs.

### Tournament Organizer

- Organizer Dashboard: owned tournaments, review status, blocking work, and create-tournament action.
- Tournament Editor: a saveable multi-step draft with server-side validation for each step.
- Registration Review: team/application table with accept or reject actions and decision notes.
- Bracket And Schedule: select accepted teams, generate single-elimination rounds, make controlled pairing/schedule adjustments, and explicitly publish changes.
- Results: enter scores, validate a winner, confirm the result, and derive winner/runner-up display data.

All surfaces use Thai as the primary language, remain responsive, include loading/empty/error states, and retain the existing editorial minimal/modern Swiss visual direction.

## Integrity, Security, And Failure Handling

- Server-side permission and ownership checks apply to all mutations.
- Draft/tournament and match versions enable optimistic concurrency. A stale update returns a recoverable conflict state rather than overwriting another user's work.
- Destructive or lifecycle-changing actions require confirmation in the UI, validation on the server, and an audit event with actor, timestamps, old value, and new value.
- Validation covers dates, registration capacity, age-group constraints, score validity, and state-transition prerequisites.
- Media is referenced through assets and soft-deleted only when no active reference remains.
- Expected conflicts, invalid transitions, authorization failures, and incomplete prerequisites map to explicit Thai error states. Unexpected failures are logged with a request correlation id and show a generic recoverable error.

## Testing Strategy

- Domain tests verify permissions, ownership, lifecycle transitions, bracket generation, and result advancement.
- Prisma integration tests verify transactions, repository behavior, uniqueness constraints, and optimistic concurrency.
- Route Handler tests cover authentication, authorization, input validation, and meaningful response statuses.
- UI tests cover create-to-review-to-publish, registration approval, bracket generation, schedule editing, result confirmation, and error/empty/loading states.
- Seed data supplies an admin, organizers, team managers, teams, registrations, and tournaments in each lifecycle state.

## Delivery Sequence

1. Auth/RBAC and Prisma foundation with development seed data.
2. Organizer draft/submission workflow and admin review queue.
3. Registration management and team ownership.
4. Single-elimination bracket, schedule, and results workflow.
5. Admin/organizer dashboards, audit history, responsive QA, and final verification.

This sequencing deliberately keeps existing public pages working while replacing their mock repository only when the relevant production repository and seeded data are ready.
