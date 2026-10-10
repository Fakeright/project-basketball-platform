# COURTSIDE Team And Tournament Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist tournament operations in Supabase PostgreSQL and let team managers maintain teams, apply to eligible tournaments, and receive organizer decisions with complete authorization and audit history.

**Architecture:** Domain policies define roster and registration transitions without framework imports. Application use cases enforce action permissions and ownership through repository contracts; Prisma adapters own PostgreSQL mapping and transactions. Next.js Server Components load view models through use cases, while Route Handlers validate mutations with Zod and map typed failures to Thai HTTP responses.

**Tech Stack:** Next.js 16.2.11 App Router, React 19, TypeScript strict mode, Tailwind CSS 4, shadcn/ui, Prisma 7 with `@prisma/adapter-pg`, Supabase PostgreSQL, Zod 4, Vitest, React Testing Library.

## Global Constraints

- Keep service credentials server-only in ignored `.env.local` files and never print or commit them.
- Keep Server Components as the default and read the installed Next.js 16 documentation before changing route, cookie, `params`, or `searchParams` behavior.
- Use Thai for primary interface and error copy; use descriptive English identifiers in code and schema.
- Every mutation checks authentication, action permission, ownership, lifecycle, and optimistic concurrency in application code.
- Team managers operate only teams they own; organizers operate registrations only for tournaments they own; platform admins may override with an audit event.
- Registration is allowed only for `PUBLISHED` tournaments before the deadline with a valid roster and no active duplicate.
- Approval is allowed for `PUBLISHED` or `REGISTRATION_CLOSED` tournaments and must enforce capacity transactionally.
- Rejection and withdrawal require a reason. Pending cancellation is limited to the owning team manager.
- Keep registration attempt history and enforce at most one active `PENDING` or `APPROVED` attempt per tournament and team.
- Use Prisma migrations; do not reset or wipe the connected Supabase database.
- Use TDD and explicit-path staging. Do not stage `.agents/`, `.claude/`, `.windsurf/`, `skills-lock.json`, generated Prisma clients, build output, or secrets.
- Before each implementation commit run focused tests and `git diff --check`; before final completion run `npm run test`, `npm run lint`, `npm run build`, `npx prisma validate`, `npx prisma migrate status`, and `git status --short`.

---

## Planned File Structure

```text
lib/server/
  prisma.ts                                  # server-only Prisma singleton
features/team-management/
  domain/team.ts                             # team and roster contracts
  domain/team-policy.ts                      # ownership and roster rules
  application/ports/team-repository.ts       # persistence contract
  application/create-team.ts
  application/update-team.ts
  application/add-team-member.ts
  application/deactivate-team-member.ts
  application/list-owned-teams.ts
  infrastructure/prisma-team-repository.ts
features/registrations/
  domain/registration.ts
  domain/registration-policy.ts
  application/ports/registration-repository.ts
  application/apply-to-tournament.ts
  application/cancel-registration.ts
  application/decide-registration.ts
  application/withdraw-registration.ts
  infrastructure/prisma-registration-repository.ts
  presentation/registration-handler.ts
features/tournament-operations/infrastructure/
  prisma-tournament-operations-repository.ts
  get-tournament-operations-repository.ts
features/tournament-media/infrastructure/
  prisma-tournament-media-repository.ts
  get-tournament-media-repository.ts
features/tournaments/infrastructure/
  prisma-tournament-repository.ts
  get-tournament-repository.ts
components/team/
  team-editor.tsx
  roster-manager.tsx
  team-registration-list.tsx
components/organizer/
  registration-review-list.tsx
app/(admin)/team/
  page.tsx
  new/page.tsx
  [id]/page.tsx
app/(admin)/organizer/tournaments/[id]/registrations/page.tsx
app/api/teams/route.ts
app/api/teams/[id]/route.ts
app/api/teams/[id]/members/route.ts
app/api/teams/[id]/members/[memberId]/route.ts
app/api/tournaments/[id]/registrations/route.ts
app/api/registrations/[id]/route.ts
app/api/organizer/tournaments/[id]/registrations/[registrationId]/decision/route.ts
app/api/organizer/tournaments/[id]/registrations/[registrationId]/withdraw/route.ts
```

### Task 1: Registration Domain, Permissions, And Database Migration

**Files:**
- Modify: `features/identity/domain/permission.ts`
- Create: `features/team-management/domain/team.ts`
- Create: `features/team-management/domain/team-policy.ts`
- Create: `features/registrations/domain/registration.ts`
- Create: `features/registrations/domain/registration-policy.ts`
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260726120000_team_registration_workflow/migration.sql`
- Test: `tests/features/team-management/team-policy.test.ts`
- Test: `tests/features/registrations/registration-policy.test.ts`
- Modify: `tests/features/identity/authorize.test.ts`

**Interfaces:**
- Produces `TeamMemberRole`, `TeamSummary`, `TeamRosterMember`, `RegistrationStatus`, `TournamentRegistration`, `assertRosterEligibility`, `assertCanApply`, and `transitionRegistration`.
- Produces permissions `team.create`, `team.update`, `team.roster.manage`, `registration.cancel`, and `registration.withdraw` for later use cases.

- [ ] **Step 1: Write failing team and registration policy tests**

```ts
it("requires five active players for a 5v5 application", () => {
  expect(() => assertRosterEligibility("FIVE_V_FIVE", rosterWithPlayers(4))).toThrow("ROSTER_INCOMPLETE")
  expect(() => assertRosterEligibility("FIVE_V_FIVE", rosterWithPlayers(5))).not.toThrow()
})

it("allows an organizer to approve a pending application after registration closes", () => {
  expect(transitionRegistration("PENDING", "APPROVE", {
    tournamentStatus: "REGISTRATION_CLOSED",
    reason: "",
  })).toBe("APPROVED")
})

it("requires a reason when an approved team is withdrawn", () => {
  expect(() => transitionRegistration("APPROVED", "WITHDRAW", {
    tournamentStatus: "REGISTRATION_CLOSED",
    reason: "",
  })).toThrow("REASON_REQUIRED")
})
```

- [ ] **Step 2: Run tests and verify the expected missing-module failures**

Run:

```powershell
npm run test -- tests/features/team-management/team-policy.test.ts tests/features/registrations/registration-policy.test.ts tests/features/identity/authorize.test.ts
```

Expected: FAIL because the team/registration policy modules and new permissions do not exist.

- [ ] **Step 3: Add domain contracts and explicit transition rules**

```ts
export type TeamMemberRole = "PLAYER" | "COACH"
export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "WITHDRAWN"
export type RegistrationAction = "APPROVE" | "REJECT" | "CANCEL" | "WITHDRAW"

const transitions: Record<RegistrationStatus, Partial<Record<RegistrationAction, RegistrationStatus>>> = {
  PENDING: { APPROVE: "APPROVED", REJECT: "REJECTED", CANCEL: "CANCELLED" },
  APPROVED: { WITHDRAW: "WITHDRAWN" },
  REJECTED: {},
  CANCELLED: {},
  WITHDRAWN: {},
}
```

`assertRosterEligibility(format, members)` counts only active members, requires five players for `FIVE_V_FIVE` or three for `THREE_V_THREE`, and rejects more than one active coach. `assertCanApply` requires `PUBLISHED`, `now <= registrationDeadline`, owned team, valid roster, and no active attempt. `transitionRegistration` accepts approval or rejection only while the tournament is `PUBLISHED` or `REGISTRATION_CLOSED`; rejection and withdrawal require `reason.trim().length > 0`.

- [ ] **Step 4: Extend Prisma schema and create a non-destructive migration**

Add:

```prisma
enum TeamMemberRole {
  PLAYER
  COACH
}

enum RegistrationStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
  WITHDRAWN
}
```

Add `role TeamMemberRole`, `isActive Boolean @default(true)`, and `deactivatedAt DateTime?` to `TeamMember`. Add `version Int @default(0)`, `cancelledAt DateTime?`, and `withdrawnAt DateTime?` to `Registration`; retain `decisionNote` as the rejection/withdrawal reason. Remove `@@unique([tournamentId, teamId])`, add `@@index([tournamentId, teamId, createdAt])`, and add this SQL to the generated migration:

```sql
CREATE UNIQUE INDEX "Registration_active_tournamentId_teamId_key"
ON "Registration" ("tournamentId", "teamId")
WHERE "status" IN ('PENDING', 'APPROVED');
```

Run `npx prisma migrate dev --name team_registration_workflow` only after `npx prisma migrate status` confirms the configured project is the expected development database.

- [ ] **Step 5: Generate Prisma client and verify the domain slice**

Run:

```powershell
npm run prisma:generate
npx prisma validate
npm run test -- tests/features/team-management/team-policy.test.ts tests/features/registrations/registration-policy.test.ts tests/features/identity/authorize.test.ts
git diff --check
```

Expected: Prisma schema valid and focused tests PASS.

- [ ] **Step 6: Commit the domain and schema checkpoint**

```powershell
git add -- features/identity/domain/permission.ts features/team-management/domain features/registrations/domain prisma/schema.prisma prisma/migrations tests/features/identity/authorize.test.ts tests/features/team-management tests/features/registrations
git commit -m "feat: add team registration domain"
```

### Task 2: Prisma Composition For Existing Tournament And Media Workflows

**Files:**
- Create: `lib/server/prisma.ts`
- Create: `features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts`
- Create: `features/tournament-operations/infrastructure/get-tournament-operations-repository.ts`
- Create: `features/tournament-media/infrastructure/prisma-tournament-media-repository.ts`
- Create: `features/tournament-media/infrastructure/get-tournament-media-repository.ts`
- Modify: `prisma/seed.ts`
- Modify: `app/(admin)/admin/reviews/page.tsx`
- Modify: `app/(admin)/organizer/page.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/page.tsx`
- Modify: `app/api/admin/tournaments/route.ts`
- Modify: `app/api/admin/tournaments/[id]/route.ts`
- Modify: `app/api/admin/tournaments/[id]/submit/route.ts`
- Modify: `app/api/admin/tournaments/[id]/review/route.ts`
- Modify: `app/api/admin/tournaments/[id]/media/route.ts`
- Modify: `app/api/admin/tournaments/[id]/media/[assetId]/route.ts`
- Test: `tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts`
- Test: `tests/features/tournament-media/prisma-tournament-media-repository.test.ts`

**Interfaces:**
- Consumes existing `TournamentOperationsRepository` and `TournamentMediaRepository` contracts.
- Produces `getPrismaClient()`, `getTournamentOperationsRepository()`, and `getTournamentMediaRepository()` for every server composition root.

- [ ] **Step 1: Write failing adapter mapping and concurrency tests**

```ts
it("maps Prisma dates and increments the tournament version atomically", async () => {
  const updated = await repository.updateWithVersion("tournament-1", 2, { title: "Updated" })
  expect(prisma.tournament.updateMany).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: "tournament-1", version: 2 },
    data: expect.objectContaining({ title: "Updated", version: { increment: 1 } }),
  }))
  expect(updated.version).toBe(3)
})

it("soft-deletes media metadata without exposing retired assets", async () => {
  await repository.retireAsset("asset-1")
  expect(prisma.mediaAsset.update).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: "asset-1" },
    data: { deletedAt: expect.any(Date) },
  }))
})
```

- [ ] **Step 2: Verify adapter tests fail**

Run:

```powershell
npm run test -- tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts tests/features/tournament-media/prisma-tournament-media-repository.test.ts
```

Expected: FAIL because the Prisma adapters do not exist.

- [ ] **Step 3: Add the server-only Prisma singleton and adapters**

```ts
import "server-only"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/lib/generated/prisma/client"

const globalForPrisma = globalThis as unknown as { courtsidePrisma?: PrismaClient }

export function getPrismaClient() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_NOT_CONFIGURED")
  return globalForPrisma.courtsidePrisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
}
```

The tournament adapter maps `Date` values to ISO strings at its boundary. `updateWithVersion` uses `updateMany({ where: { id, version } })`, throws `CONFLICT` when `count !== 1`, then reloads the row. Review creation and state transition execute in one `$transaction`. The media adapter implements all existing metadata methods against `MediaAsset` and writes `AuditLog` with `entityType: "MediaAsset"`.

- [ ] **Step 4: Replace server composition imports and extend stable seed identities**

Replace every active page/route import of `getDevelopmentTournamentOperationsRepository` with `getTournamentOperationsRepository`. Replace `DevelopmentTournamentMediaRepository` in media routes and organizer detail with `getTournamentMediaRepository`.

Update `prisma/seed.ts` to load `.env.local` before `.env`, then upsert these stable actors: `team-manager-1`, `coach-1`, and `player-1` through `player-5`. Upsert one owned development team and memberships using `TeamMemberRole`. Keep all operations idempotent.

- [ ] **Step 5: Apply seed and verify existing workflows**

Run:

```powershell
npm run prisma:seed
npm run test -- tests/features/tournament-operations tests/features/tournament-media tests/api/admin
npm run lint
npm run build
git diff --check
```

Expected: seed exits `0`; organizer editor, review, and media tests remain green; build succeeds.

- [ ] **Step 6: Commit persistent tournament composition**

```powershell
git add -- lib/server features/tournament-operations/infrastructure features/tournament-media/infrastructure app/api/admin app/'(admin)' prisma/seed.ts tests/features/tournament-operations tests/features/tournament-media
git commit -m "feat: persist tournament operations with prisma"
```

### Task 3: Team Ownership And Roster Use Cases

**Files:**
- Create: `features/team-management/application/ports/team-repository.ts`
- Create: `features/team-management/application/create-team.ts`
- Create: `features/team-management/application/update-team.ts`
- Create: `features/team-management/application/add-team-member.ts`
- Create: `features/team-management/application/deactivate-team-member.ts`
- Create: `features/team-management/application/list-owned-teams.ts`
- Create: `features/team-management/infrastructure/prisma-team-repository.ts`
- Create: `features/team-management/presentation/team-handler.ts`
- Create: `app/api/teams/route.ts`
- Create: `app/api/teams/[id]/route.ts`
- Create: `app/api/teams/[id]/members/route.ts`
- Create: `app/api/teams/[id]/members/[memberId]/route.ts`
- Test: `tests/features/team-management/team-use-cases.test.ts`
- Test: `tests/api/teams/team-routes.test.ts`

**Interfaces:**
- Produces `TeamRepository`, `createTeam`, `updateTeam`, `addTeamMember`, `deactivateTeamMember`, and `listOwnedTeams`.
- Produces authenticated team mutation routes for Task 4 UI and registration eligibility in Task 5.

- [ ] **Step 1: Write failing ownership, role, and route tests**

```ts
it("prevents a team manager from editing another manager's team", async () => {
  await expect(updateTeam({ teamId: "team-2", name: "Changed", province: "Bangkok" }, teamManager, dependencies))
    .rejects.toThrow("FORBIDDEN")
})

it("rejects adding a global PLAYER as a coach", async () => {
  await expect(addTeamMember({ teamId: "team-1", userId: "player-1", role: "COACH" }, teamManager, dependencies))
    .rejects.toThrow("MEMBER_ROLE_MISMATCH")
})

it("returns 401 when team creation has no actor", async () => {
  const response = await handleCreateTeam(request, { actorProvider: anonymous, createTeam })
  expect(response.status).toBe(401)
})
```

- [ ] **Step 2: Run tests and verify missing implementations**

Run: `npm run test -- tests/features/team-management/team-use-cases.test.ts tests/api/teams/team-routes.test.ts`

Expected: FAIL because the repository contract, use cases, handlers, and routes do not exist.

- [ ] **Step 3: Implement the repository contract and use cases**

```ts
export interface TeamRepository {
  create(input: { name: string; province: string; ownerId: string }): Promise<TeamSummary>
  findById(id: string): Promise<TeamSummary | null>
  listByOwner(ownerId: string): Promise<TeamSummary[]>
  update(id: string, input: { name: string; province: string }): Promise<TeamSummary>
  findUser(id: string): Promise<{ id: string; displayName: string; role: Role } | null>
  listActiveMembers(teamId: string): Promise<TeamRosterMember[]>
  addMember(input: { teamId: string; userId: string; role: TeamMemberRole }): Promise<TeamRosterMember>
  deactivateMember(teamId: string, memberId: string, at: string): Promise<void>
  appendAuditEvent(input: { actorId: string; action: string; entityId: string; before?: unknown; after?: unknown }): Promise<void>
}
```

Each mutation calls `authorize`, checks `team.ownerId` for team managers,
allows a platform-admin override, validates the selected user's global role
against the roster role, and maps inaccessible teams to `NOT_FOUND` for other
actors. Team creation, identity changes, member additions, member deactivation,
and admin overrides append `AuditLog` records with `entityType: "Team"`.

- [ ] **Step 4: Implement Zod handlers and Route Handlers**

Use `z.object({ name: z.string().trim().min(2).max(80), province: z.string().trim().min(2).max(80) })` for team identity and `z.object({ userId: z.string().min(1), role: z.enum(["PLAYER", "COACH"]) })` for memberships. Map `UNAUTHORIZED` to `401`, `FORBIDDEN` to `403`, inaccessible records to `404`, duplicate members to `409`, and schema/role errors to `422` with Thai messages.

- [ ] **Step 5: Verify team behavior and commit**

Run:

```powershell
npm run test -- tests/features/team-management tests/api/teams
npm run lint
git diff --check
```

```powershell
git add -- features/team-management app/api/teams tests/features/team-management tests/api/teams
git commit -m "feat: add team and roster management"
```

### Task 4: Team Manager Workspace

**Files:**
- Modify: `features/identity/infrastructure/cookie-current-actor-provider.ts`
- Modify: `app/(public)/login/page.tsx`
- Modify: `components/admin/admin-sidebar.tsx`
- Create: `components/team/team-editor.tsx`
- Create: `components/team/roster-manager.tsx`
- Create: `components/team/team-registration-list.tsx`
- Create: `app/(admin)/team/page.tsx`
- Create: `app/(admin)/team/new/page.tsx`
- Create: `app/(admin)/team/[id]/page.tsx`
- Test: `tests/ui/team/team-editor.test.tsx`
- Test: `tests/ui/team/roster-manager.test.tsx`
- Modify: `tests/features/identity/cookie-current-actor-provider.test.ts`

**Interfaces:**
- Consumes Task 3 use cases and routes.
- Produces the Team Dashboard and owned-team editor used to initiate registration in Task 5.

- [ ] **Step 1: Write failing development identity and component tests**

```tsx
it("routes the development team manager to the team workspace", () => {
  expect(getDevelopmentSessionDestination("team-manager-1")).toBe("/team")
})

it("shows a roster empty state and labelled member controls", () => {
  render(<RosterManager teamId="team-1" members={[]} candidates={candidates} />)
  expect(screen.getByText("ยังไม่มีผู้เล่นในทีม")).toBeTruthy()
  expect(screen.getByLabelText("สมาชิก")).toBeTruthy()
  expect(screen.getByLabelText("หน้าที่ในทีม")).toBeTruthy()
})
```

- [ ] **Step 2: Verify the UI tests fail**

Run: `npm run test -- tests/ui/team tests/features/identity/cookie-current-actor-provider.test.ts`

Expected: FAIL because the actor and team components/pages do not exist.

- [ ] **Step 3: Add the development team-manager session and role-aware navigation**

Add `team-manager-1` to development actors and render a third login form. `AdminSidebar` renders `/team` only for `TEAM_MANAGER` and platform admin; organizers retain `/organizer`, and platform admins retain `/admin` links. Keep all server authorization checks unchanged.

- [ ] **Step 4: Build team pages and focused client controls**

`/team` lists owned teams as bordered rows with name, province, active player/coach counts, and registration summary. `TeamEditor` submits create/update JSON to Task 3 routes. `RosterManager` uses a user select, role select, add command, and icon-only deactivate command with an accessible Thai label and confirmation. Only the form and roster manager are Client Components.

- [ ] **Step 5: Verify responsive team UI and commit**

Run:

```powershell
npm run test -- tests/ui/team tests/features/identity/cookie-current-actor-provider.test.ts
npm run lint
npm run build
git diff --check
```

Use Browser QA at approximately 375px and 1440px for `/login`, `/team`, and `/team/team-1`; verify no horizontal page overflow and stable roster rows.

```powershell
git add -- features/identity/infrastructure/cookie-current-actor-provider.ts app/'(public)'/login/page.tsx components/admin/admin-sidebar.tsx components/team app/'(admin)'/team tests/ui/team tests/features/identity/cookie-current-actor-provider.test.ts
git commit -m "feat: add team manager workspace"
```

### Task 5: Tournament Application And Pending Cancellation

**Files:**
- Create: `features/registrations/application/ports/registration-repository.ts`
- Create: `features/registrations/application/apply-to-tournament.ts`
- Create: `features/registrations/application/cancel-registration.ts`
- Create: `features/registrations/application/list-owned-team-registrations.ts`
- Create: `features/registrations/infrastructure/prisma-registration-repository.ts`
- Create: `features/registrations/presentation/registration-handler.ts`
- Create: `app/api/tournaments/[id]/registrations/route.ts`
- Create: `app/api/registrations/[id]/route.ts`
- Modify: `components/team/team-registration-list.tsx`
- Modify: `app/(admin)/team/[id]/page.tsx`
- Test: `tests/features/registrations/apply-to-tournament.test.ts`
- Test: `tests/features/registrations/cancel-registration.test.ts`
- Test: `tests/api/registrations/registration-routes.test.ts`
- Test: `tests/ui/team/team-registration-list.test.tsx`

**Interfaces:**
- Produces `RegistrationRepository`, `applyToTournament`, `cancelRegistration`, and `listOwnedTeamRegistrations`.
- Produces a persistent approved-team input that Task 6 decisions and the later bracket generator consume.

- [ ] **Step 1: Write failing eligibility, duplicate, cancellation, and route tests**

```ts
it("rejects an application after the registration deadline", async () => {
  await expect(applyToTournament({ tournamentId: "tournament-1", teamId: "team-1" }, teamManager, {
    ...dependencies,
    now: () => new Date("2026-11-02T00:00:00Z"),
  })).rejects.toThrow("REGISTRATION_DEADLINE_PASSED")
})

it("rejects a duplicate active application", async () => {
  repository.findActive.mockResolvedValue(pendingRegistration)
  await expect(applyToTournament(input, teamManager, dependencies)).rejects.toThrow("REGISTRATION_ALREADY_ACTIVE")
})

it("allows only the owning manager to cancel a pending application", async () => {
  await expect(cancelRegistration({ registrationId: "registration-1", version: 0 }, anotherManager, dependencies))
    .rejects.toThrow("NOT_FOUND")
})
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test -- tests/features/registrations/apply-to-tournament.test.ts tests/features/registrations/cancel-registration.test.ts tests/api/registrations tests/ui/team/team-registration-list.test.tsx`

Expected: FAIL because the application use cases and routes do not exist.

- [ ] **Step 3: Implement transaction-oriented registration repository and use cases**

```ts
export interface RegistrationRepository {
  getApplicationContext(tournamentId: string, teamId: string): Promise<RegistrationApplicationContext | null>
  findActive(tournamentId: string, teamId: string): Promise<TournamentRegistration | null>
  createPending(input: { tournamentId: string; teamId: string; actorId: string }): Promise<TournamentRegistration>
  findById(id: string): Promise<TournamentRegistrationWithOwnership | null>
  cancelWithVersion(id: string, version: number, actorId: string, at: string): Promise<TournamentRegistration>
  listByTeam(teamId: string): Promise<TournamentRegistration[]>
}
```

`createPending` runs the active-attempt check, context reload, and insert in a transaction; translate PostgreSQL unique error `P2002` to `REGISTRATION_ALREADY_ACTIVE`. `cancelWithVersion` updates only `{ id, status: "PENDING", version }`, increments version, sets `cancelledAt`, and writes `registration.cancelled` audit data transactionally.

- [ ] **Step 4: Add routes and team registration UI**

`POST /api/tournaments/[id]/registrations` accepts `{ teamId }`. `DELETE /api/registrations/[id]` accepts `{ version }`. `TeamRegistrationList` renders tournament, date, status, organizer note, and cancel only for pending rows. It disables only the affected row and renders success/error feedback with `aria-live="polite"`.

- [ ] **Step 5: Verify application workflow and commit**

Run:

```powershell
npm run test -- tests/features/registrations tests/api/registrations tests/ui/team/team-registration-list.test.tsx
npm run lint
npm run build
git diff --check
```

```powershell
git add -- features/registrations app/api/tournaments app/api/registrations components/team/team-registration-list.tsx app/'(admin)'/team/'[id]'/page.tsx tests/features/registrations tests/api/registrations tests/ui/team/team-registration-list.test.tsx
git commit -m "feat: add tournament applications"
```

### Task 6: Organizer Decisions, Withdrawal, And Capacity Integrity

**Files:**
- Create: `features/registrations/application/decide-registration.ts`
- Create: `features/registrations/application/withdraw-registration.ts`
- Create: `features/registrations/application/list-tournament-registrations.ts`
- Extend: `features/registrations/application/ports/registration-repository.ts`
- Extend: `features/registrations/infrastructure/prisma-registration-repository.ts`
- Create: `components/organizer/registration-review-list.tsx`
- Create: `app/(admin)/organizer/tournaments/[id]/registrations/page.tsx`
- Create: `app/api/organizer/tournaments/[id]/registrations/[registrationId]/decision/route.ts`
- Create: `app/api/organizer/tournaments/[id]/registrations/[registrationId]/withdraw/route.ts`
- Modify: `app/(admin)/organizer/tournaments/[id]/page.tsx`
- Test: `tests/features/registrations/decide-registration.test.ts`
- Test: `tests/features/registrations/withdraw-registration.test.ts`
- Test: `tests/api/registrations/organizer-registration-routes.test.ts`
- Test: `tests/ui/organizer/registration-review-list.test.tsx`

**Interfaces:**
- Consumes persistent registrations from Task 5.
- Produces approved entries with deterministic capacity enforcement for the later bracket phase.

- [ ] **Step 1: Write failing ownership, reason, version, and capacity tests**

```ts
it("does not approve beyond capacity during concurrent decisions", async () => {
  repository.approveWithCapacity.mockRejectedValue(new Error("TOURNAMENT_CAPACITY_REACHED"))
  await expect(decideRegistration({ registrationId: "registration-2", decision: "APPROVE", note: "", version: 0 }, organizer, dependencies))
    .rejects.toThrow("TOURNAMENT_CAPACITY_REACHED")
})

it("requires a reason to reject an application", async () => {
  await expect(decideRegistration({ registrationId: "registration-1", decision: "REJECT", note: " ", version: 0 }, organizer, dependencies))
    .rejects.toThrow("REASON_REQUIRED")
})

it("returns a stale conflict when the registration version changed", async () => {
  repository.rejectWithVersion.mockRejectedValue(new Error("CONFLICT"))
  await expect(decideRegistration(rejectInput, organizer, dependencies)).rejects.toThrow("CONFLICT")
})
```

- [ ] **Step 2: Verify organizer tests fail**

Run: `npm run test -- tests/features/registrations/decide-registration.test.ts tests/features/registrations/withdraw-registration.test.ts tests/api/registrations/organizer-registration-routes.test.ts tests/ui/organizer/registration-review-list.test.tsx`

Expected: FAIL because decision use cases, routes, and UI do not exist.

- [ ] **Step 3: Implement transactional decisions and audit records**

Approval transaction locks or conditionally updates the tournament context, counts `APPROVED` registrations, rejects when the count reaches capacity, then updates only a matching `PENDING` registration/version. Rejection updates matching `PENDING`; withdrawal updates matching `APPROVED`. Every transaction writes `AuditLog` with actions `registration.approved`, `registration.rejected`, or `registration.withdrawn`, including before/after JSON and the actor id.

- [ ] **Step 4: Build organizer review routes and structured-row UI**

Decision route accepts:

```ts
z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  note: z.string().trim().max(500),
  version: z.number().int().nonnegative(),
})
```

Withdrawal accepts `{ reason: z.string().trim().min(1).max(500), version }`. The page displays status counts and rows containing team, province, roster counts, submitted date, and decision note. Approval uses confirmation; rejection/withdrawal use a labelled reason field and confirmation.

- [ ] **Step 5: Verify capacity and organizer workflow, then commit**

Run:

```powershell
npm run test -- tests/features/registrations tests/api/registrations tests/ui/organizer
npm run lint
npm run build
git diff --check
```

```powershell
git add -- features/registrations components/organizer app/'(admin)'/organizer/tournaments/'[id]'/registrations app/'(admin)'/organizer/tournaments/'[id]'/page.tsx app/api/organizer tests/features/registrations tests/api/registrations tests/ui/organizer
git commit -m "feat: add organizer registration decisions"
```

### Task 7: Public Prisma Projection, Registration Entry Point, And Final QA

**Files:**
- Modify: `features/tournaments/domain/tournament.ts`
- Create: `features/tournaments/infrastructure/prisma-tournament-repository.ts`
- Create: `features/tournaments/infrastructure/get-tournament-repository.ts`
- Modify: `app/(public)/page.tsx`
- Modify: `app/(public)/tournaments/page.tsx`
- Modify: `app/(public)/tournaments/[slug]/page.tsx`
- Modify: `app/(public)/schedule/page.tsx`
- Modify: `app/(public)/bracket/page.tsx`
- Create: `components/tournaments/tournament-registration-action.tsx`
- Modify: `app/(public)/tournaments/[slug]/page.tsx`
- Test: `tests/features/tournaments/prisma-tournament-repository.test.ts`
- Test: `tests/ui/tournaments/tournament-registration-action.test.tsx`

**Interfaces:**
- Consumes Prisma tournaments, media metadata, owned teams, and Task 5 application route.
- Produces real public tournament discovery and a team-manager registration entry point without direct Prisma access from presentation code.

- [ ] **Step 1: Write failing public projection and action tests**

```ts
it("returns only public lifecycle states and maps them to the public contract", async () => {
  const tournaments = await repository.list({})
  expect(tournaments).toEqual([
    expect.objectContaining({ id: "tournament-published", status: "OPEN" }),
  ])
})

it("submits the selected owned team for the current tournament", async () => {
  render(<TournamentRegistrationAction tournamentId="tournament-1" teams={ownedTeams} />)
  await user.selectOptions(screen.getByLabelText("ทีมที่สมัคร"), "team-1")
  await user.click(screen.getByRole("button", { name: "สมัครแข่งขัน" }))
  expect(fetchMock).toHaveBeenCalledWith("/api/tournaments/tournament-1/registrations", expect.objectContaining({ method: "POST" }))
})
```

- [ ] **Step 2: Run tests and verify missing adapter/action failures**

Run: `npm run test -- tests/features/tournaments/prisma-tournament-repository.test.ts tests/ui/tournaments/tournament-registration-action.test.tsx`

Expected: FAIL because the Prisma public adapter and registration action do not exist.

- [ ] **Step 3: Implement public projection and replace mock composition**

Add required `id: string` to the public `Tournament` contract and stable ids to mock fixtures. Map statuses:

```ts
const publicStatus = {
  PUBLISHED: "OPEN",
  REGISTRATION_CLOSED: "CLOSED",
  IN_PROGRESS: "ONGOING",
  COMPLETED: "COMPLETED",
  ARCHIVED: "COMPLETED",
} as const
```

The Prisma adapter filters only those lifecycle states, preserves existing search semantics, maps confirmed match scores, and includes public poster/media through application composition. A server-only factory selects Prisma when `DATABASE_URL` exists and mock data only when running locally without database configuration. Public pages import the factory.

- [ ] **Step 4: Add the public registration action with server-authoritative feedback**

The detail Server Component resolves the optional development actor. Render `TournamentRegistrationAction` only for `TEAM_MANAGER` with owned teams and an `OPEN` tournament. The client component submits to Task 5, handles `409` and `422` Thai messages, disables during submission, and announces success/error with `aria-live`. Other users see the public detail unchanged.

- [ ] **Step 5: Run full verification and Browser QA**

Run:

```powershell
npm run test
npm run lint
npm run build
npx prisma validate
npx prisma migrate status
git diff --check
git status --short
```

Use Browser QA at approximately 375px, 768px, and 1440px for `/login`, `/team`, a team detail, public tournament detail, organizer registration review, and existing admin/media pages. Verify light/dark contrast, keyboard focus, Thai labels, empty/error states, no page overflow, and that an actual apply/approve flow persists after reload.

- [ ] **Step 6: Commit the public integration checkpoint**

```powershell
git add -- features/tournaments components/tournaments app/'(public)' tests/features/tournaments tests/ui/tournaments
git commit -m "feat: connect public tournaments to registrations"
```

## Plan Self-Review

- **Spec coverage:** Task 1 covers permissions, domain rules, history-preserving statuses, roster shape, concurrency fields, and migration. Task 2 moves active tournament/media workflows to PostgreSQL and seeds stable identities. Tasks 3-4 cover owned teams and roster UX. Task 5 covers application/status/cancellation. Task 6 covers organizer approval/rejection/withdrawal, capacity, and audit. Task 7 covers the public entry point, Prisma projection, signed-media composition, responsive QA, and complete verification.
- **Scope:** Invitations, payments, verification documents, roster locking, waitlists, bracket generation, scheduling, results, and notification delivery remain excluded.
- **Type consistency:** `TeamMemberRole`, `RegistrationStatus`, `RegistrationAction`, `TeamRepository`, and `RegistrationRepository` are defined before consumers. Routes use tournament ids supplied by the public `Tournament.id` projection. Registration version is required for cancellation, decisions, and withdrawal.
- **Persistence consistency:** All foreign-key participants use seeded PostgreSQL actors and Prisma tournament/team/registration/media adapters before registration routes are enabled. Development JSON remains an explicit fallback only when the database is unconfigured.
- **Placeholder scan:** No TBD, TODO, deferred handler, unspecified error mapping, or unnamed test step remains.
