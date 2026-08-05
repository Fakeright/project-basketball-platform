# COURTSIDE Project Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the default Next.js README with an accurate Thai-first developer guide and establish `docs/ROADMAP.md` as the single source of truth for current project status.

**Architecture:** Keep onboarding and operational commands in the repository root README, while separating changing delivery status into one roadmap file. Preserve dated specifications and plans as historical records and link to them instead of rewriting their old checklists.

**Tech Stack:** Markdown, Next.js 16.2.11, React 19.2.4, TypeScript, Tailwind CSS 4, Prisma 7.9, Supabase Auth/PostgreSQL/Storage, Vitest, ESLint.

## Global Constraints

- Use Thai as the primary documentation language while preserving exact English identifiers, commands, roles, and file paths.
- `README.md` is the developer entry point; `docs/ROADMAP.md` is the only authoritative current-status document.
- Use `เสร็จแล้ว`, `กำลังพัฒนา`, and `วางแผนไว้` as roadmap statuses; do not publish percentage completion.
- Do not modify historical checklist state under `docs/superpowers/plans/` or `docs/superpowers/specs/`.
- Do not include credentials, real project URLs, passwords, access tokens, or local `.env` contents.
- Do not describe database foundations or read-only pages as completed mutation workflows.
- Keep the no-referee product decision explicit.
- Stage only the documentation files created or modified by this plan.

---

## File Structure

- Modify: `README.md` — concise project overview, developer setup, architecture, commands, and documentation links.
- Create: `docs/ROADMAP.md` — current capability matrix, limitations, and ordered delivery phases.
- Reference only: `.env.example`, `package.json`, `prisma/schema.prisma`, `features/identity/domain/permission.ts`, `app/`, `features/`, and `tests/` — evidence for documentation claims.

### Task 1: Replace The Default README

**Files:**
- Modify: `README.md`
- Reference: `.env.example`
- Reference: `package.json`
- Reference: `prisma/schema.prisma`

**Interfaces:**
- Consumes: Current package scripts, safe environment-variable names, architecture rules, supported roles, and active repository structure.
- Produces: A stable onboarding entry point linking to `docs/ROADMAP.md`, `docs/superpowers/specs/`, and `docs/superpowers/plans/`.

- [ ] **Step 1: Replace boilerplate with product identity and current scope**

  Start the README with `# COURTSIDE` and describe it as a Thai-first responsive basketball tournament platform for public visitors, players, coaches, team managers, tournament organizers, and platform admins. State that the current release covers discovery, authentication, tournament approval/publication, team rosters, registrations, posters, and documents; bracket generation, scheduling mutations, results, notifications, and advanced analytics remain on the roadmap.

- [ ] **Step 2: Document the technology and architecture**

  List the exact installed stack from `package.json`. Include the dependency direction:

  ```text
  presentation -> application -> domain
  infrastructure -> application/domain contracts
  ```

  Explain that Server Components are the default, Route Handlers own HTTP mutations, application use cases enforce permissions and ownership, and Prisma/Supabase are infrastructure adapters.

- [ ] **Step 3: Document roles without overstating capability**

  Add a table for `PLAYER`, `COACH`, `TEAM_MANAGER`, `TOURNAMENT_ORGANIZER`, and `PLATFORM_ADMIN`. Mark Player and Coach as registered identities whose dedicated self-service workspaces are still planned. State that there is no referee role and organizers record results in the planned competition workflow.

- [ ] **Step 4: Add prerequisites and safe environment setup**

  Require Node.js 20+, npm, a Supabase project, and PostgreSQL connection details. Tell developers to copy `.env.example` to `.env.local` and populate only their local file. List these names without values:

  ```dotenv
  DATABASE_URL=
  APP_URL=
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  AUTH_RECOVERY_SECRET=
  ```

  Add a warning that `.env.local`, service-role keys, and database passwords must never be committed. Advise rotating any credential exposed in chat, logs, screenshots, or source history.

- [ ] **Step 5: Add exact installation and database commands**

  Document the verified sequence:

  ```powershell
  npm install
  npm run prisma:generate
  npm run prisma:migrate
  npm run prisma:seed
  npm run dev
  ```

  Explain that `npm run reset:development` is destructive and may only be used against an explicitly confirmed development database.

- [ ] **Step 6: Add quality commands and project map**

  Document:

  ```powershell
  npm run test
  npm run lint
  npm run build
  ```

  Add concise descriptions for `app/`, `components/`, `features/`, `prisma/`, `tests/`, and `docs/`. Link the roadmap and explain that dated specs/plans are historical implementation records.

- [ ] **Step 7: Check README claims against source**

  Run:

  ```powershell
  rg -n "Bracket|Schedule|Result|Notification|Analytics|Player|Coach|Referee|reset:development|SUPABASE_SERVICE_ROLE_KEY" README.md
  ```

  Expected: every feature label matches the approved wording; no unqualified claim says planned workflows are complete.

- [ ] **Step 8: Commit the README checkpoint**

  ```powershell
  git add -- README.md
  git diff --cached --check
  git commit -m "docs(project): replace default readme"
  ```

### Task 2: Create The Authoritative Roadmap

**Files:**
- Create: `docs/ROADMAP.md`
- Reference: `app/`
- Reference: `features/`
- Reference: `prisma/schema.prisma`
- Reference: `tests/`

**Interfaces:**
- Consumes: The documentation status definitions approved in `docs/superpowers/specs/2026-08-06-courtside-project-documentation-design.md`.
- Produces: The single current-status file linked by the README.

- [ ] **Step 1: Define roadmap semantics and evidence date**

  Start with `# COURTSIDE Roadmap`, an `อัปเดตล่าสุด: 6 สิงหาคม 2026` line, and definitions for the three statuses. Explain that schemas or public read views alone do not make an operational workflow complete.

- [ ] **Step 2: Record completed capabilities**

  Under `เสร็จแล้ว`, list:

  - Supabase email/password registration, login, logout, forgot/reset password routes, profile provisioning, sessions, and role-aware redirects.
  - Server-side action permissions and ownership checks.
  - Tournament draft/create/edit, submit, admin review, publish, close registration, canonical age groups, even capacities, 77-province references, audits, and concurrency checks.
  - Public Home, tournament list/detail, URL-backed search filters, poster/document display, responsive layouts, dark mode, and common loading/empty/error states.
  - Team creation/editing, player/coach roster maintenance, tournament registration, cancellation, approval, rejection, withdrawal, eligibility, and capacity checks.
  - Poster and tournament-document upload/delete through Supabase Storage.
  - Admin operational counts, review queue, and recent audit activity.
  - Prisma migrations, seed/reset tooling, and automated Vitest/RTL coverage.

- [ ] **Step 3: Record partial capabilities**

  Under `กำลังพัฒนา`, list:

  - Email confirmation delivery and callback hardening, including production SMTP and redirect configuration.
  - Player and Coach experiences, because roles exist but dedicated permissions/workspaces do not.
  - Profile management, organizer verification, and platform role administration.
  - Tournament governance gaps: delete/remove, suspend, archive, and reopening registration.
  - Bracket and schedule public read views, which can display published match data but cannot create or edit competition operations.
  - Admin analytics, which currently provides counts and audits but not visitor tracking, province popularity, trends, or charts.
  - Responsive browser verification for every protected workflow and production observability.

- [ ] **Step 4: Record planned capabilities**

  Under `วางแผนไว้`, list:

  - Deterministic single-elimination bracket generation and entry lock.
  - Match pairing, time/court scheduling, score entry, result confirmation, advancement, winner, runner-up, and rankings.
  - Team-logo upload, tournament banners, and galleries.
  - Email notifications and announcements for registration decisions, schedule changes, and results.
  - Visitor analytics, monthly charts, popular provinces, conversion metrics, monitoring, CI/CD, and production deployment.

- [ ] **Step 5: Add ordered delivery phases**

  Add these next phases in order:

  1. Authentication hardening, email verification, and profile management.
  2. Competition operations: entry lock, bracket, schedule, and results.
  3. Remaining media and notification delivery.
  4. Analytics, monitoring, CI/CD, and deployment.

  For each phase, include a one-sentence completion outcome rather than a percentage.

- [ ] **Step 6: Explain historical documentation**

  State that dated files under `docs/superpowers/specs/` and `docs/superpowers/plans/` preserve decisions and execution context. Their checkboxes are not current status; this roadmap is authoritative.

- [ ] **Step 7: Scan the roadmap for ambiguity and unsupported claims**

  Run:

  ```powershell
  rg -n "TODO|TBD|[0-9]+%|เสร็จแล้ว|กำลังพัฒนา|วางแผนไว้|กรรมการ" docs/ROADMAP.md
  ```

  Expected: no placeholders or percentages; the three statuses are present; referee is explicitly out of scope.

- [ ] **Step 8: Commit the roadmap checkpoint**

  ```powershell
  git add -- docs/ROADMAP.md
  git diff --cached --check
  git commit -m "docs(project): add delivery roadmap"
  ```

### Task 3: Verify Documentation As A Cohesive Entry Point

**Files:**
- Modify if verification exposes an error: `README.md`
- Modify if verification exposes an error: `docs/ROADMAP.md`
- Add to final implementation commit: `docs/superpowers/plans/2026-08-06-courtside-project-documentation.md`

**Interfaces:**
- Consumes: The README and roadmap from Tasks 1 and 2.
- Produces: Cross-linked, source-accurate documentation with no leaked secrets or unrelated staged files.

- [ ] **Step 1: Verify links and referenced paths exist**

  Run:

  ```powershell
  Test-Path docs/ROADMAP.md
  Test-Path docs/superpowers/specs
  Test-Path docs/superpowers/plans
  Test-Path prisma/schema.prisma
  Test-Path .env.example
  ```

  Expected: every command prints `True`.

- [ ] **Step 2: Verify documented package commands exist**

  Run:

  ```powershell
  npm run
  ```

  Expected: output includes `dev`, `build`, `start`, `lint`, `test`, `prisma:generate`, `prisma:migrate`, `prisma:seed`, and `reset:development`.

- [ ] **Step 3: Scan documentation for accidental secret material**

  Run:

  ```powershell
  rg -n "sb_secret_|sb_publishable_[A-Za-z0-9_-]{12,}|postgresql://[^[:space:]]+:[^[:space:]@]+@|service_role" README.md docs/ROADMAP.md
  ```

  Expected: no matches containing credential values. A prose mention of a service-role key must use `SUPABASE_SERVICE_ROLE_KEY` only.

- [ ] **Step 4: Run repository documentation checks**

  Run:

  ```powershell
  git diff --check
  git status --short
  ```

  Expected: no whitespace errors; only plan-related documentation is staged or modified, while `.agents/`, `.claude/`, `.windsurf/`, and `skills-lock.json` remain untracked and unstaged.

- [ ] **Step 5: Commit the plan and any verification correction**

  ```powershell
  git add -- README.md docs/ROADMAP.md docs/superpowers/plans/2026-08-06-courtside-project-documentation.md
  git diff --cached --check
  git commit -m "docs(project): finalize onboarding documentation"
  ```

  If README and roadmap have no corrections after Tasks 1 and 2, stage and commit only the plan file.

- [ ] **Step 6: Push the feature branch**

  ```powershell
  git push origin feat/courtside-public-platform
  ```

  Expected: `origin/feat/courtside-public-platform` advances to the final documentation commit without staging unrelated local tooling files.
