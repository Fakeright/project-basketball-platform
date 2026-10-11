# COURTSIDE Admin Tournament Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a Thai-first organizer and platform-admin workspace that owns the tournament lifecycle from draft submission through published results.

**Architecture:** Add identity, admin, and tournament-operations feature layers while retaining the public feature boundary. Prisma implements repository ports for Supabase PostgreSQL, and Route Handlers are the only mutation boundary. A development-only cookie session implements the `CurrentActorProvider` port until a later email-auth phase replaces that adapter.

**Tech Stack:** Next.js 16.2.11 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Prisma ORM, Supabase PostgreSQL, Zod, Vitest, React Testing Library.

## Global Constraints

- Keep Next.js at `16.2.11`; read `node_modules/next/dist/docs/` before using Next APIs.
- Use Thai as the primary UI language and retain editorial minimal/modern Swiss styling.
- Use Server Components for loading. Presentation modules must not import Prisma.
- Every mutation uses a Route Handler, application use case, server permission/ownership check, optimistic `version`, and audit log.
- Roles are `PLATFORM_ADMIN`, `TOURNAMENT_ORGANIZER`, `TEAM_MANAGER`, `COACH`, and `PLAYER`; there is no referee role.
- Implement single-elimination brackets only. Do not introduce payments, notifications, galleries, or advanced analytics.
- Add a regression test first, observe it fail, then make the minimal production change.

## Planned File Structure

```text
prisma/schema.prisma
prisma/seed.ts
prisma.config.ts
features/identity/{domain,application,infrastructure}/
features/admin/presentation/
features/tournament-operations/{domain,application,infrastructure}/
app/(admin)/admin/
app/(admin)/organizer/
app/api/admin/
components/admin/
tests/features/identity/
tests/features/tournament-operations/
tests/api/admin/
tests/ui/admin/
```

### Task 1: Establish Prisma, Seed Data, And Identity Contracts

**Files:**
- Modify: `package.json`, `package-lock.json`, `.gitignore`
- Create: `prisma/schema.prisma`, `prisma/seed.ts`, `prisma.config.ts`, `.env.example`
- Create: `features/identity/domain/actor.ts`, `features/identity/domain/permission.ts`, `features/identity/application/authorize.ts`
- Test: `tests/features/identity/authorize.test.ts`

**Interfaces:** Produces `Actor`, `Role`, `Permission`, `CurrentActorProvider`, and `authorize(actor, action, resource)`.

- [ ] **Step 1: Write failing authorization tests**

```ts
it("allows an organizer to edit an owned tournament", () => {
  expect(() => authorize({ id: "org-1", role: "TOURNAMENT_ORGANIZER" }, "tournament.update", { organizerId: "org-1" })).not.toThrow()
})

it("rejects an organizer editing another tournament", () => {
  expect(() => authorize({ id: "org-1", role: "TOURNAMENT_ORGANIZER" }, "tournament.update", { organizerId: "org-2" })).toThrow("FORBIDDEN")
})

it("allows a platform admin to review every tournament", () => {
  expect(() => authorize({ id: "admin-1", role: "PLATFORM_ADMIN" }, "tournament.review", { organizerId: "org-2" })).not.toThrow()
})
```

- [ ] **Step 2: Verify tests fail**

Run: `npm run test -- tests/features/identity/authorize.test.ts`

Expected: FAIL because identity modules do not exist.

- [ ] **Step 3: Add database dependencies and configuration**

Run `npm install @prisma/client zod`, `npm install -D prisma tsx`, then `npx prisma init --datasource-provider postgresql`. Set `.env.example` to `DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?schema=public"`. Add `.env` and `prisma/*.db` to `.gitignore`, then add `prisma:generate`, `prisma:migrate`, and `prisma:seed` package scripts using `prisma generate`, `prisma migrate dev`, and `tsx prisma/seed.ts`.

- [ ] **Step 4: Implement identity contracts and Prisma schema**

Define enum-backed models for `User`, `OrganizerProfile`, `Team`, `TeamMember`, `Tournament`, `TournamentReview`, `Registration`, `Bracket`, `BracketRound`, `Match`, `MatchResult`, and `AuditLog`. `Tournament` and `Match` have integer `version`, `createdAt`, and `updatedAt`. Tournament statuses are `DRAFT`, `SUBMITTED`, `CHANGES_REQUESTED`, `APPROVED`, `PUBLISHED`, `REGISTRATION_CLOSED`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`, `REJECTED`, and `SUSPENDED`.

Implement a declared action matrix: platform admins allow all actions; organizers allow owned create/update/submit/read, registration decisions, bracket generation, match scheduling, and result recording; disallowed actions throw `new Error("FORBIDDEN")`.

- [ ] **Step 5: Seed known development actors and data**

Seed one admin, two organizers, six teams, and one tournament at each of draft, submitted, published, registration closed, in progress, and completed. Use stable ids so tests and development sessions can reference them.

- [ ] **Step 6: Verify and commit**

Run `npm run test -- tests/features/identity/authorize.test.ts`, `npm run prisma:generate`, and `npm run lint`; all must exit `0`.

Commit using `git add package.json package-lock.json .gitignore .env.example prisma prisma.config.ts features/identity tests/features/identity` and `git commit -m "feat: add admin identity and prisma foundation"`.

### Task 2: Implement Tournament Lifecycle And Review Use Cases

**Files:**
- Create: `features/tournament-operations/domain/tournament-operation.ts`, `features/tournament-operations/domain/tournament-workflow.ts`
- Create: `features/tournament-operations/application/create-tournament.ts`, `submit-tournament.ts`, `review-tournament.ts`
- Create: `features/tournament-operations/infrastructure/tournament-operations-repository.ts`, `prisma-tournament-operations-repository.ts`
- Test: `tests/features/tournament-operations/tournament-workflow.test.ts`, `tests/features/tournament-operations/review-tournament.test.ts`

**Interfaces:** Consumes Task 1 `Actor` and `authorize`; produces `createTournament`, `submitTournament`, and `reviewTournament`.

- [ ] **Step 1: Write failing lifecycle tests**

```ts
it("submits a complete organizer draft", async () => {
  await expect(submitTournament(repository, "tournament-1", organizer)).resolves.toMatchObject({ status: "SUBMITTED" })
})

it("returns changes requested to a draft with feedback", async () => {
  await reviewTournament(repository, "tournament-1", { decision: "CHANGES_REQUESTED", note: "กรุณาเพิ่มกติกา", version: 1 }, admin)
  await expect(repository.findById("tournament-1")).resolves.toMatchObject({ status: "CHANGES_REQUESTED" })
})

it("requires a note for a rejection", async () => {
  await expect(reviewTournament(repository, "tournament-1", { decision: "REJECTED", note: "", version: 1 }, admin)).rejects.toThrow("REVIEW_NOTE_REQUIRED")
})
```

- [ ] **Step 2: Verify tests fail**

Run: `npm run test -- tests/features/tournament-operations/tournament-workflow.test.ts tests/features/tournament-operations/review-tournament.test.ts`

Expected: FAIL because lifecycle use cases do not exist.

- [ ] **Step 3: Implement legal transitions and the repository port**

Allow `DRAFT` and `CHANGES_REQUESTED` to submit only after title, format, age group, province, venue, start/end dates, registration deadline, capacity, and rules are present. Only platform admins can approve, reject, request changes, suspend, or archive. Require a note for changes requested, rejection, suspension, and removal.

Expose `create`, `findById`, `updateWithVersion`, and `appendAuditEvent`. The Prisma adapter wraps lifecycle update, review creation, and audit append in one transaction. A stale version throws `CONFLICT`.

- [ ] **Step 4: Add a failing concurrency test, implement, and verify**

```ts
it("does not overwrite a newer revision", async () => {
  await expect(repository.updateWithVersion("tournament-1", 0, { title: "ใหม่" })).rejects.toThrow("CONFLICT")
})
```

Run: `npm run test -- tests/features/tournament-operations`

Expected: PASS.

- [ ] **Step 5: Commit lifecycle behavior**

Commit using `git add features/tournament-operations tests/features/tournament-operations` and `git commit -m "feat: add tournament submission and review workflow"`.

### Task 3: Add Development Session, Admin Shell, And Review Queue

**Files:**
- Create: `features/identity/infrastructure/cookie-current-actor-provider.ts`
- Create: `app/(admin)/layout.tsx`, `app/(admin)/admin/page.tsx`, `app/(admin)/admin/reviews/page.tsx`
- Create: `components/admin/admin-sidebar.tsx`, `components/admin/admin-dashboard.tsx`, `components/admin/tournament-review-queue.tsx`
- Create: `features/admin/presentation/admin-dashboard-view-model.ts`, `app/api/admin/tournaments/[id]/review/route.ts`
- Test: `tests/ui/admin/admin-shell.test.tsx`, `tests/ui/admin/review-queue.test.tsx`, `tests/api/admin/review-tournament.test.ts`

**Interfaces:** Consumes Tasks 1-2 and produces protected admin routes plus a review mutation route.

- [ ] **Step 1: Write failing shell and queue tests**

```tsx
it("renders a pending review count and approval action for an admin", () => {
  render(<TournamentReviewQueue actor={admin} items={[submittedTournament]} />)
  expect(screen.getByText("รอตรวจ 1 รายการ")).toBeVisible()
  expect(screen.getByRole("button", { name: "อนุมัติ" })).toBeEnabled()
})

it("hides platform review navigation from an organizer", () => {
  render(<AdminSidebar actor={organizer} />)
  expect(screen.queryByRole("link", { name: "คิวตรวจสอบ" })).toBeNull()
})
```

- [ ] **Step 2: Verify tests fail**

Run: `npm run test -- tests/ui/admin/admin-shell.test.tsx tests/ui/admin/review-queue.test.tsx`

Expected: FAIL because admin components do not exist.

- [ ] **Step 3: Implement protected session and workspace shell**

Read a signed `courtside-actor` cookie through a server-only `CurrentActorProvider`. Development-only seed-account controls set known seed ids through `POST /api/dev/session`; production requests without a verified session yield `UNAUTHENTICATED`. Redirect unauthenticated `(admin)` users to `/login`, and return `notFound()` outside a permitted surface.

Render responsive Thai navigation, dashboard counts, latest audit events, and a review queue. Keep page sections unframed; do not use rounded cards as page layout.

- [ ] **Step 4: Implement review handler and regression**

Use Zod body `{ decision: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED"; note: string; version: number }`. It resolves the actor, invokes `reviewTournament`, returns `200`, and maps `UNAUTHENTICATED`, `FORBIDDEN`, `CONFLICT`, and validation errors to `401`, `403`, `409`, and `422`.

```ts
it("returns 403 when an organizer posts a review decision", async () => {
  const response = await POST(makeRequest({ decision: "APPROVED", note: "", version: 1 }, organizer))
  expect(response.status).toBe(403)
})
```

- [ ] **Step 5: Verify and commit**

Run `npm run test -- tests/ui/admin tests/api/admin`, `npm run lint`, and `npm run build`; all must exit `0`.

Commit using `git add app components/admin features/admin features/identity tests/ui/admin tests/api/admin` and `git commit -m "feat: add admin review workspace"`.

### Task 4: Build Organizer Draft Editor And Submission Flow

**Files:**
- Create: `app/(admin)/organizer/page.tsx`, `app/(admin)/organizer/tournaments/new/page.tsx`, `app/(admin)/organizer/tournaments/[id]/page.tsx`
- Create: `components/admin/tournament-editor.tsx`, `features/admin/presentation/tournament-editor-schema.ts`
- Create: `app/api/admin/tournaments/route.ts`, `app/api/admin/tournaments/[id]/submit/route.ts`
- Test: `tests/ui/admin/tournament-editor.test.tsx`, `tests/api/admin/tournament-submit.test.ts`

**Interfaces:** Consumes Task 2 create/submit use cases and Task 3 actor provider. Produces a saveable organizer form and submit transition route.

- [ ] **Step 1: Write failing editor behavior tests**

```tsx
it("saves a valid tournament draft", async () => {
  render(<TournamentEditor initialTournament={null} />)
  await user.type(screen.getByLabelText("ชื่อรายการ"), "Chiang Rai Cup")
  await user.click(screen.getByRole("button", { name: "บันทึกฉบับร่าง" }))
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: "Chiang Rai Cup" }))
})

it("shows a deadline error before submitting", async () => {
  render(<TournamentEditor initialTournament={validTournamentWithoutDeadline} />)
  await user.click(screen.getByRole("button", { name: "ส่งตรวจสอบ" }))
  expect(await screen.findByText("กรุณาระบุวันปิดรับสมัคร")).toBeVisible()
})
```

- [ ] **Step 2: Verify tests fail**

Run: `npm run test -- tests/ui/admin/tournament-editor.test.tsx tests/api/admin/tournament-submit.test.ts`

Expected: FAIL because the editor and submit route do not exist.

- [ ] **Step 3: Implement shared Zod schema and editor**

Require title, description, `FIVE_V_FIVE`/`THREE_V_THREE`, age group, province, venue, start/end ISO dates, registration deadline before start, capacity from 2 through 64, rules, and version for updates. Save a draft through the create/update route; submit through the dedicated transition route. Client validation mirrors the schema, while the Route Handler remains authoritative.

- [ ] **Step 4: Implement ownership-aware mutation routes**

`POST /api/admin/tournaments` creates a `DRAFT` owned by the actor. `PUT /api/admin/tournaments/[id]` accepts the schema plus `version`. `POST /submit` invokes the workflow use case. Non-owner organizers receive `403`; stale versions receive `409` with recoverable Thai copy.

- [ ] **Step 5: Verify and commit**

Run `npm run test -- tests/ui/admin/tournament-editor.test.tsx tests/api/admin/tournament-submit.test.ts`, `npm run lint`, and `npm run build`; all must exit `0`.

Commit using `git add app components/admin features/admin tests/ui/admin tests/api/admin` and `git commit -m "feat: add organizer tournament editor"`.

### Task 5: Manage Registrations, Brackets, Schedules, And Results

**Files:**
- Create: `features/tournament-operations/domain/bracket.ts`, `application/decide-registration.ts`, `application/generate-single-elimination-bracket.ts`, `application/record-match-result.ts`
- Create: `app/api/admin/tournaments/[id]/registrations/[registrationId]/route.ts`, `app/api/admin/tournaments/[id]/bracket/route.ts`, `app/api/admin/matches/[matchId]/result/route.ts`
- Create: `components/admin/registration-decision-table.tsx`, `components/admin/bracket-manager.tsx`, `components/admin/result-entry-form.tsx`
- Test: `tests/features/tournament-operations/bracket.test.ts`, `tests/features/tournament-operations/result.test.ts`, `tests/api/admin/registration-decision.test.ts`, `tests/ui/admin/bracket-manager.test.tsx`

**Interfaces:** Consumes accepted registrations and ownership rules from Tasks 1-4. Produces `generateSingleEliminationBracket(teamIds)` and `recordMatchResult(matchId, scores, actor)`.

- [ ] **Step 1: Write failing bracket and result tests**

```ts
it("creates quarterfinals, semifinals, and a final for eight accepted teams", () => {
  const bracket = generateSingleEliminationBracket(teamIds)
  expect(bracket.rounds.map((round) => round.name)).toEqual(["รอบก่อนรองชนะเลิศ", "รอบรองชนะเลิศ", "รอบชิงชนะเลิศ"])
  expect(bracket.rounds[0].matches).toHaveLength(4)
})

it("advances a winner to the next match after confirmation", async () => {
  await recordMatchResult(repository, quarterfinal.id, { homeScore: 71, awayScore: 65, version: 1 }, organizer)
  await expect(repository.findMatch(semifinal.id)).resolves.toMatchObject({ homeTeamId: quarterfinal.homeTeamId })
})
```

- [ ] **Step 2: Verify tests fail**

Run: `npm run test -- tests/features/tournament-operations/bracket.test.ts tests/features/tournament-operations/result.test.ts`

Expected: FAIL because bracket and result use cases do not exist.

- [ ] **Step 3: Implement registration decisions and entry lock**

Only an owner or platform admin approves/rejects a pending registration. Require `REGISTRATION_CLOSED` before generation and only use approved teams. Reject generation unless accepted count is a power of two from 2 to 64. Append an audit event for every decision and close action.

- [ ] **Step 4: Implement deterministic single-elimination generation**

Seed first-round pairings by accepted-registration order. Create future matches with null team slots and upstream match ids. Require explicit organizer confirmation before persisting a generated bracket; prohibit a second generated bracket unless an admin archives the first one.

- [ ] **Step 5: Implement scheduling and result confirmation**

Only an owner/admin assigns `scheduledAt` and `court` to bracket matches. Reject incomplete schedule publication. Scores are non-negative integers and cannot tie. Confirming a result transactionally writes `MatchResult`, assigns the winner, advances it downstream, increments version, and appends an audit event.

- [ ] **Step 6: Add UI regression, verify, and commit**

```tsx
it("does not enable bracket generation until eight accepted teams exist", () => {
  render(<BracketManager acceptedTeamCount={7} />)
  expect(screen.getByRole("button", { name: "สร้างสายการแข่งขัน" })).toBeDisabled()
})
```

Run `npm run test -- tests/features/tournament-operations tests/api/admin tests/ui/admin`, `npm run lint`, and `npm run build`; all must exit `0`.

Commit using `git add app/api/admin components/admin features/tournament-operations tests/features/tournament-operations tests/api/admin tests/ui/admin` and `git commit -m "feat: add tournament operations workflow"`.

### Task 6: Integrate Public Read Models And Final Quality Checks

**Files:**
- Modify: `features/tournaments/infrastructure/tournament-repository.ts`, `features/tournaments/infrastructure/mock-tournament-repository.ts`
- Create: `features/tournaments/infrastructure/prisma-tournament-repository.ts`, `features/tournaments/infrastructure/tournament-repository-factory.ts`
- Modify: public route composition files below `app/(public)`
- Test: `tests/features/tournaments/prisma-tournament-repository.test.ts`, `tests/ui/admin/operations-accessibility.test.tsx`

**Interfaces:** Consumes published/completed data from Task 5 and preserves the existing public `TournamentRepository` contract.

- [ ] **Step 1: Write failing public projection tests**

```ts
it("lists only publicly visible published tournaments", async () => {
  await expect(repository.list({})).resolves.toEqual([
    expect.objectContaining({ status: "OPEN", slug: "published-cup" }),
  ])
})

it("projects confirmed bracket scores into the public contract", async () => {
  await expect(repository.findBySlug("completed-cup")).resolves.toMatchObject({
    matches: [expect.objectContaining({ homeScore: 71, awayScore: 65 })],
  })
})
```

- [ ] **Step 2: Verify tests fail**

Run: `npm run test -- tests/features/tournaments/prisma-tournament-repository.test.ts`

Expected: FAIL because the Prisma adapter does not exist.

- [ ] **Step 3: Implement Prisma public projection and composition**

Map production lifecycle states to public `OPEN`, `CLOSED`, `ONGOING`, and `COMPLETED`. Return only publicly visible records, preserve existing filter/sort semantics, and use the same Thai case-insensitive text search. The server-only factory selects `PrismaTournamentRepository` when `DATABASE_URL` exists; it selects the current mock repository otherwise. Public pages import the factory, not either adapter.

- [ ] **Step 4: Run responsive and accessibility checks**

Manually verify `/admin`, `/admin/reviews`, organizer editor, registrations, bracket, schedule, and results at 375px, 768px, and 1440px. Confirm keyboard focus after dialogs, visible Thai labels, permission-hidden navigation, empty/loading/error states, dark-mode contrast, and horizontal bracket scrolling.

- [ ] **Step 5: Run final verification and commit**

Run `npm run test`, `npm run lint`, `npm run build`, `git diff --check`, and `git status --short`; all verification commands must exit `0` and only intended files may be changed.

Commit using `git add app components features prisma tests package.json package-lock.json .env.example prisma.config.ts` and `git commit -m "feat: build courtside tournament administration"`.

## Plan Self-Review

- **Spec coverage:** Task 1 supplies database models, seed data, roles, and permissions. Task 2 supplies lifecycle, review, concurrency, and audit events. Tasks 3-4 add admin/organizer workflows. Task 5 delivers registration, knockout, schedules, and results. Task 6 preserves public discovery behavior and verifies responsive accessibility.
- **Scope:** The plan intentionally excludes payments, notification delivery, galleries, advanced analytics, referees, and non-knockout formats.
- **Type consistency:** Every mutation resolves an `Actor`, authorizes an action, uses a repository port, checks `version`, and writes audit data. Public pages retain the existing `TournamentRepository` contract.
- **Placeholder scan:** The plan declares all roles, lifecycle states, route payloads, test commands, and validation boundaries required for implementation.
