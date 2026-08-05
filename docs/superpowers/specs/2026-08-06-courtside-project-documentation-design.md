# COURTSIDE Project Documentation Design

## Goal

Replace the default Next.js README with a Thai-first project guide and create
one durable roadmap that communicates the current implementation status
without requiring readers to interpret historical implementation plans.

## Documentation Roles

### `README.md`

The README is the entry point for developers. It will contain:

- A concise description of COURTSIDE and its current product scope.
- The supported roles and the responsibilities currently available to each.
- The approved technology stack and architectural dependency direction.
- Local prerequisites and safe environment-variable setup.
- Installation, Prisma, development, test, lint, and build commands.
- A short source-tree guide.
- Links to the roadmap, specifications, and historical implementation plans.
- Security guidance that forbids committing credentials and recommends
  rotating any credential exposed outside its intended secret store.

The README will not claim that planned competition or notification features
are production-ready.

### `docs/ROADMAP.md`

The roadmap is the sole current-status document. It will use three statuses:

- `เสร็จแล้ว`: implemented and connected to the active architecture.
- `กำลังพัฒนา`: partially implemented or requiring production hardening.
- `วางแผนไว้`: not yet implemented beyond supporting schema or read-only UI.

It will cover authentication, tournament operations, teams, registrations,
public discovery, media, bracket/schedule/results, notifications, analytics,
quality, and deployment. Each item will distinguish complete workflows from
read-only screens or database foundations.

The roadmap will recommend the next delivery order:

1. Authentication hardening, email verification, and profile management.
2. Bracket generation, schedule management, and result confirmation.
3. Remaining media capabilities and notifications.
4. Analytics, monitoring, CI/CD, and production deployment.

No percentage completion will be published because percentages become stale
and hide differences in feature risk and depth.

## Historical Plans

Files under `docs/superpowers/plans/` and `docs/superpowers/specs/` remain
historical design and execution records. Their unchecked steps will not be
rewritten after the fact. Both the README and roadmap will explain that
`docs/ROADMAP.md` is authoritative for current status.

## Accuracy Rules

- Supabase Auth routes, Prisma persistence, and Supabase Storage are described
  as implemented only where active composition uses them.
- Bracket and schedule pages are described as public read views; generation,
  scheduling mutations, score entry, advancement, and rankings remain planned.
- Player and Coach are described as registered roles without dedicated
  workspaces or meaningful permission bundles yet.
- Poster and tournament-document uploads are implemented; team logos, banners,
  and galleries remain planned.
- The Admin dashboard is described as operational counts and recent audits,
  not the requested full analytics dashboard.
- No referee role is included, matching the approved product decision.

## Verification

Documentation completion requires:

- Checking every referenced command against `package.json`.
- Checking role, model, route, and feature claims against current source code.
- Scanning for placeholders and contradictory status labels.
- Running `git diff --check`.
- Confirming no credential values or local `.env` contents are included.

