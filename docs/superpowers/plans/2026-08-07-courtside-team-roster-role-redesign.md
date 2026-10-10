# COURTSIDE Team Roster And Combined Team Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทำให้บัญชีผู้จัดการ/โค้ชสร้างทีม `5v5` หรือ `3v3` เพิ่มผู้เล่นหลายคนโดยไม่ต้องสร้างบัญชีให้ผู้เล่น และลบหรือปิดใช้งานทีมตามประวัติได้อย่างปลอดภัย

**Architecture:** แยกบัญชี `User` ออกจากรายชื่อ `TeamPlayer` และรักษาทิศทาง `presentation -> application -> domain` โดย Prisma adapters รับผิดชอบ transaction และ mapping เท่านั้น การเพิ่มผู้เล่นเป็น atomic batch; การแก้ทีมใช้ optimistic concurrency; การสมัครแข่งขันอ่านรูปแบบ สถานะ และรายชื่อ active จากฐานข้อมูลภายใน transaction เดียวกัน

**Tech Stack:** Next.js `16.2.11`, React `19.2.4`, TypeScript strict, Tailwind CSS 4, Base UI/shadcn/ui, Prisma `7.9.0`, Supabase PostgreSQL, Zod `4.4.3`, Vitest `4.1.10`, React Testing Library

## Global Constraints

- ใช้ภาษาไทยเป็นหลักสำหรับข้อความที่ผู้ใช้เห็น และใช้ชื่อภาษาอังกฤษที่สื่อความหมายในโค้ด
- บทบาทบัญชีทีมใช้ `TEAM_MANAGER_COACH`; ห้ามคง workflow ที่ต้องมีบัญชีผู้เล่นหรือเพิ่ม referee role
- หนึ่งทีมมีเจ้าของหลักหนึ่งบัญชี แต่หนึ่งบัญชีเป็นเจ้าของหลายทีมได้
- ทีมหนึ่งเลือกได้เพียง `FIVE_V_FIVE` หรือ `THREE_V_THREE`
- ผู้เล่นบังคับชื่อ นามสกุล และวันเกิด; ไม่เก็บเลขบัตรประชาชนและไม่เพิ่ม CSV
- Batch รับสูงสุด 30 แถวต่อคำขอ และสำเร็จทั้งหมดหรือ rollback ทั้งหมด
- ใช้ Server Components เป็นค่าเริ่มต้น; Client Components มีเฉพาะ state/event/browser APIs
- ทุก mutation ตรวจ authentication, permission, ownership, lifecycle และ validation ฝั่ง server
- ห้ามลบ `TeamMember` ใน migration แรก; ต้องเปลี่ยน active read/write path และตรวจข้อมูลก่อน migration ลบภายหลัง
- ก่อนแก้ Route Handler ให้อ่าน `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- ห้าม stage `.agents/`, `.claude/`, `.windsurf/` หรือ `skills-lock.json`

## File Structure

- `features/identity/domain/actor.ts`: source of truth ของ account roles
- `features/identity/domain/permission.ts`: action permissions ของ role ใหม่
- `features/team-management/domain/team.ts`: `TeamSummary`, `TeamPlayer`, draft และ format types
- `features/team-management/domain/team-policy.ts`: roster, format-change และ team-state policies
- `features/team-management/application/ports/team-repository.ts`: persistence contract สำหรับทีมและผู้เล่น
- `features/team-management/application/add-team-players.ts`: atomic batch use case
- `features/team-management/application/update-team-player.ts`: single-player edit use case
- `features/team-management/application/deactivate-team-player.ts`: soft removal use case
- `features/team-management/application/remove-or-deactivate-team.ts`: server-selected delete/deactivate use case
- `features/team-management/infrastructure/prisma-team-repository.ts`: Prisma mapping, concurrency และ transactions
- `features/team-management/presentation/team-handler.ts`: Zod schemas และ HTTP error mapping
- `components/team/team-player-roster.tsx`: roster list และ mutation orchestration
- `components/team/team-player-batch-form.tsx`: responsive five-row batch form
- `components/team/team-player-fields.tsx`: reusable player field controls
- `components/team/team-delete-dialog.tsx`: typed-name destructive confirmation
- `features/registrations/**`: team-format, active-state, roster และ age checks

---

### Task 1: Merge Coach And Team Manager Account Roles

**Files:**
- Create: `prisma/migrations/20260807090000_merge_team_roles/migration.sql`
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Modify: `features/identity/domain/actor.ts`
- Modify: `features/identity/domain/permission.ts`
- Modify: `features/identity/application/ports/user-profile-repository.ts`
- Modify: `features/identity/infrastructure/cookie-current-actor-provider.ts`
- Modify: `features/identity/presentation/auth-handler.ts`
- Modify: `components/auth/register-form.tsx`
- Modify: `components/account-session-control.tsx`
- Modify: `components/admin/admin-sidebar.tsx`
- Modify: `components/team/team-workspace-header.tsx`
- Modify: `app/(public)/tournaments/[slug]/page.tsx`
- Modify: `features/tournaments/application/get-tournament-registration-options.ts`
- Modify: `features/team-management/application/list-team-member-candidates.ts`
- Modify: `components/team/roster-manager.tsx`
- Test: `tests/features/identity/authorize.test.ts`
- Test: `tests/features/identity/auth-handler.test.ts`
- Test: `tests/features/identity/create-current-actor-provider.test.ts`
- Test: `tests/features/identity/prisma-user-profile-repository.test.ts`
- Test: `tests/features/identity/provision-auth-profile.test.ts`
- Test: `tests/features/identity/supabase-current-actor-provider.test.ts`
- Test: `tests/api/auth/auth-routes.test.ts`
- Test: `tests/api/registrations/registration-routes.test.ts`
- Test: `tests/api/teams/team-routes.test.ts`
- Test: `tests/features/registrations/apply-to-tournament.test.ts`
- Test: `tests/features/registrations/cancel-registration.test.ts`
- Test: `tests/features/team-management/team-use-cases.test.ts`
- Test: `tests/features/tournaments/get-tournament-registration-options.test.ts`
- Test: `tests/ui/auth/register-form.test.tsx`
- Test: `tests/ui/site-header-session.test.tsx`
- Test: `tests/ui/team/team-discovery-link.test.tsx`
- Test: `tests/fixtures/actor.ts`

**Interfaces:**
- Consumes: existing `Role`, `permissionsByRole`, registration/login handlers
- Produces: `Role = "PLATFORM_ADMIN" | "TOURNAMENT_ORGANIZER" | "TEAM_MANAGER_COACH" | "PLAYER"`

- [ ] **Step 1: Write failing role and UI tests**

Update fixtures to use `TEAM_MANAGER_COACH` and assert that old self-registration values are rejected:

```ts
expect(permissionsByRole.TEAM_MANAGER_COACH).toEqual(
  new Set([
    "team.create",
    "team.update",
    "team.roster.manage",
    "registration.create",
    "registration.read",
    "registration.cancel",
  ]),
)

await user.selectOptions(screen.getByLabelText("บทบาท"), "TEAM_MANAGER_COACH")
expect(screen.getByRole("option", { name: "ผู้จัดการ/โค้ช" })).toBeTruthy()
expect(screen.queryByRole("option", { name: "โค้ช" })).toBeNull()
expect(screen.queryByRole("option", { name: "ผู้จัดการทีม" })).toBeNull()
```

- [ ] **Step 2: Run focused tests and verify the expected failure**

Run:

```powershell
npm run test -- tests/features/identity/authorize.test.ts tests/features/identity/auth-handler.test.ts tests/api/auth/auth-routes.test.ts tests/ui/auth/register-form.test.tsx tests/ui/site-header-session.test.tsx tests/ui/team/team-discovery-link.test.tsx
```

Expected: FAIL because `TEAM_MANAGER_COACH` is not a valid role and the UI still exposes two old options.

- [ ] **Step 3: Implement the role source of truth and permissions**

Use this exact role list in `actor.ts`:

```ts
export const roles = [
  "PLATFORM_ADMIN",
  "TOURNAMENT_ORGANIZER",
  "TEAM_MANAGER_COACH",
  "PLAYER",
] as const
```

Replace the `TEAM_MANAGER` permission entry with `TEAM_MANAGER_COACH`; remove `COACH`. Update every active role equality check, default destination, sidebar link, registration visibility check, actor fixture and Thai role label. The registration Zod enum must accept only `PLAYER`, `TEAM_MANAGER_COACH`, and `TOURNAMENT_ORGANIZER` for self-registration.

Until Task 6 replaces the legacy roster UI, make `listTeamMemberCandidates` return only `PLAYER` accounts and remove the `COACH` option from `RosterManager`. `TeamMemberRole.COACH` remains only as legacy database history; it is not an account role or a value that the active UI can add.

- [ ] **Step 4: Add the non-destructive PostgreSQL enum migration**

Use a replacement enum so both old values map to one value while preserving User ids:

```sql
CREATE TYPE "Role_new" AS ENUM (
  'PLATFORM_ADMIN',
  'TOURNAMENT_ORGANIZER',
  'TEAM_MANAGER_COACH',
  'PLAYER'
);

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new"
USING (
  CASE
    WHEN "role"::text IN ('COACH', 'TEAM_MANAGER') THEN 'TEAM_MANAGER_COACH'
    ELSE "role"::text
  END
)::"Role_new";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'PLAYER';
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
```

Update `schema.prisma` and all seed actors. Do not change `TeamMemberRole` yet.

- [ ] **Step 5: Generate Prisma client and run focused tests**

Run:

```powershell
npm run prisma:generate
npx prisma validate
npm run test
```

Expected: Prisma validation succeeds and the complete test suite PASS, proving no fixture or active code still depends on an old account role.

- [ ] **Step 6: Commit the account-role slice**

```powershell
git add prisma/schema.prisma prisma/seed.ts prisma/migrations/20260807090000_merge_team_roles features/identity components/auth/register-form.tsx components/account-session-control.tsx components/admin/admin-sidebar.tsx components/team/team-workspace-header.tsx components/team/roster-manager.tsx 'app/(public)/tournaments/[slug]/page.tsx' features/tournaments/application/get-tournament-registration-options.ts features/team-management/application/list-team-member-candidates.ts tests
git commit -m "feat(identity): merge team manager and coach roles"
```

### Task 2: Add Team Format, State, Version, And TeamPlayer

**Files:**
- Create: `prisma/migrations/20260807100000_add_team_players_and_format/migration.sql`
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Modify: `features/team-management/domain/team.ts`
- Modify: `features/team-management/domain/team-policy.ts`
- Test: `tests/features/team-management/team-policy.test.ts`

**Interfaces:**
- Consumes: `TournamentFormat` values and `TEAM_MANAGER_COACH` users from Task 1
- Produces: `TeamFormat`, `TeamPlayerPosition`, `TeamPlayerDraft`, `TeamPlayer`, expanded `TeamSummary`, `assertRosterEligibility`

- [ ] **Step 1: Write failing domain policy tests**

Use player records without account ids and cover active state and minimums:

```ts
const player = (id: string, isActive = true): TeamPlayer => ({
  id,
  teamId: "team-1",
  firstName: `ผู้เล่น${id}`,
  lastName: "ทดสอบ",
  nickname: null,
  birthDate: "2008-01-01",
  jerseyNumber: Number(id),
  position: null,
  phone: null,
  isActive,
  deactivatedAt: null,
  createdAt: "2026-08-07T00:00:00.000Z",
  updatedAt: "2026-08-07T00:00:00.000Z",
})

expect(() => assertRosterEligibility("FIVE_V_FIVE", [1, 2, 3, 4].map(String).map(player)))
  .toThrow("ROSTER_INCOMPLETE")
expect(() => assertRosterEligibility("THREE_V_THREE", ["1", "2", "3"].map(player)))
  .not.toThrow()
```

Also assert that inactive players do not count and remove the obsolete coach-count test.

- [ ] **Step 2: Run the policy test and verify it fails**

Run: `npm run test -- tests/features/team-management/team-policy.test.ts`

Expected: FAIL because `TeamPlayer` does not exist and policy expects `TeamRosterMember`.

- [ ] **Step 3: Define exact domain types**

```ts
export type TeamFormat = "FIVE_V_FIVE" | "THREE_V_THREE"
export type TeamPlayerPosition = "PG" | "SG" | "SF" | "PF" | "C"

export interface TeamSummary {
  id: string
  name: string
  provinceCode: string
  province: string
  ownerId: string
  format: TeamFormat
  isActive: boolean
  deactivatedAt: string | null
  version: number
}

export interface TeamPlayerDraft {
  firstName: string
  lastName: string
  nickname: string | null
  birthDate: string
  jerseyNumber: number | null
  position: TeamPlayerPosition | null
  phone: string | null
}

export interface TeamPlayer extends TeamPlayerDraft {
  id: string
  teamId: string
  isActive: boolean
  deactivatedAt: string | null
  createdAt: string
  updatedAt: string
}
```

Change `assertRosterEligibility(format, players)` to count active `TeamPlayer` records only.

- [ ] **Step 4: Add Prisma models and migration**

Add `format`, `isActive`, `deactivatedAt`, `version`, and the `players` relation to `Team`. Use this model shape:

```prisma
enum BasketballPosition {
  PG
  SG
  SF
  PF
  C
}

model TeamPlayer {
  id            String              @id @default(cuid())
  teamId        String
  firstName     String
  lastName      String
  nickname      String?
  birthDate     DateTime            @db.Date
  jerseyNumber  Int?
  position      BasketballPosition?
  phone         String?
  isActive      Boolean             @default(true)
  deactivatedAt DateTime?
  team          Team                @relation(fields: [teamId], references: [id], onDelete: Cascade)
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@unique([teamId, firstName, lastName, birthDate])
  @@index([teamId, isActive])
}
```

Backfill existing teams as `FIVE_V_FIVE` before making `format` non-null. Add a raw partial unique index for active non-null jersey numbers:

```sql
CREATE UNIQUE INDEX "TeamPlayer_active_jersey_key"
ON "TeamPlayer" ("teamId", "jerseyNumber")
WHERE "isActive" = true AND "jerseyNumber" IS NOT NULL;
```

Keep `TeamMember` and `TeamMemberRole` unchanged. Replace seed roster creation with stable `TeamPlayer` rows including valid dates; do not seed account-backed coach membership.

- [ ] **Step 5: Verify schema and domain behavior**

Run:

```powershell
npm run prisma:generate
npx prisma validate
npm run test -- tests/features/team-management/team-policy.test.ts
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the data foundation**

```powershell
git add prisma/schema.prisma prisma/seed.ts prisma/migrations/20260807100000_add_team_players_and_format features/team-management/domain tests/features/team-management/team-policy.test.ts
git commit -m "feat(team): add team formats and player records"
```

### Task 3: Implement Atomic Team Player Use Cases And Repository

**Files:**
- Create: `features/team-management/application/add-team-players.ts`
- Create: `features/team-management/application/update-team-player.ts`
- Create: `features/team-management/application/deactivate-team-player.ts`
- Modify: `features/team-management/application/ports/team-repository.ts`
- Modify: `features/team-management/application/get-owned-team-workspace.ts`
- Modify: `features/team-management/infrastructure/prisma-team-repository.ts`
- Test: `tests/features/team-management/team-use-cases.test.ts`
- Test: `tests/features/team-management/prisma-team-repository.test.ts`

**Interfaces:**
- Consumes: `TeamPlayerDraft`, `TeamPlayer`, `TeamSummary` from Task 2
- Produces: `addTeamPlayers`, `updateTeamPlayer`, `deactivateTeamPlayer`, repository methods `addPlayers`, `updatePlayer`, `deactivatePlayer`, `listActivePlayers`

- [ ] **Step 1: Write failing application tests for authorization and atomic batches**

Cover owner success, non-owner `FORBIDDEN`, inactive team `TEAM_INACTIVE`, active duplicate identity, inactive duplicate reactivation, duplicate active jersey, update and soft removal. The batch success assertion is:

```ts
const players = await addTeamPlayers(
  { teamId: team.id, players: [draftPlayer("หนึ่ง", 4), draftPlayer("สอง", 8)] },
  teamManagerCoach,
  { teams: repository },
)

expect(players).toHaveLength(2)
expect(repository.auditEvents).toContainEqual(
  expect.objectContaining({ action: "team.players_added", entityId: team.id }),
)
```

Add a repository test where the second insert throws `P2002`; assert the transaction rejects and the first insert is not persisted.

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```powershell
npm run test -- tests/features/team-management/team-use-cases.test.ts tests/features/team-management/prisma-team-repository.test.ts
```

Expected: FAIL because player use cases and repository methods do not exist.

- [ ] **Step 3: Replace the repository contract with player operations**

Add these exact signatures:

```ts
addPlayers(teamId: string, players: readonly TeamPlayerDraft[]): Promise<TeamPlayer[]>
updatePlayer(
  teamId: string,
  playerId: string,
  input: TeamPlayerDraft,
): Promise<TeamPlayer>
deactivatePlayer(teamId: string, playerId: string, at: string): Promise<TeamPlayer>
listActivePlayers(teamId: string): Promise<TeamPlayer[]>
```

Remove `findUser` and `listUsersByRoles` from the active contract. Keep old member operations only until Task 6 removes the old routes.

- [ ] **Step 4: Implement focused use cases**

`addTeamPlayers` rejects empty arrays and arrays over 30, authorizes `team.roster.manage`, rejects inactive teams, and writes one `team.players_added` audit event containing player ids, reactivated ids and count inside the same transaction. An identity match on an active row throws `PLAYER_ALREADY_EXISTS`; a match on an inactive row updates the optional sports data, sets `isActive=true`, clears `deactivatedAt`, and returns the existing id. `updateTeamPlayer` writes `team.player_updated`; `deactivateTeamPlayer` writes `team.player_deactivated`. Platform admin overrides append `team.admin_override` in the same transaction.

Normalize optional empty strings to `null` at the presentation boundary, not in the repository. Map Prisma unique failures to `PLAYER_ALREADY_EXISTS` or `JERSEY_ALREADY_IN_USE` using the reported constraint target.

- [ ] **Step 5: Map Prisma rows and prove rollback**

Use `@db.Date` mapping as `YYYY-MM-DD` without timezone drift:

```ts
function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10)
}
```

`addPlayers` must run through the existing repository transaction object; do not start a nested Prisma transaction.

- [ ] **Step 6: Run focused tests**

Run:

```powershell
npm run test -- tests/features/team-management/team-use-cases.test.ts tests/features/team-management/prisma-team-repository.test.ts
```

Expected: PASS with atomic rollback, duplicate mapping and audit assertions.

- [ ] **Step 7: Commit player application behavior**

```powershell
git add features/team-management/application features/team-management/infrastructure/prisma-team-repository.ts tests/features/team-management
git commit -m "feat(team): add atomic player roster operations"
```

### Task 4: Expose Player Batch, Update, And Deactivate Routes

**Files:**
- Create: `app/api/teams/[id]/players/batch/route.ts`
- Create: `app/api/teams/[id]/players/[playerId]/route.ts`
- Modify: `features/team-management/presentation/team-handler.ts`
- Test: `tests/api/teams/team-routes.test.ts`

**Interfaces:**
- Consumes: player use cases from Task 3 and `CurrentActorProvider`
- Produces: `handleAddTeamPlayers`, `handleUpdateTeamPlayer`, `handleDeactivateTeamPlayer`

- [ ] **Step 1: Read the installed Next.js Route Handler guide**

Run: `Get-Content -Raw node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`

Confirm dynamic `params` are awaited and keep route composition consistent with existing Next.js 16 routes.

- [ ] **Step 2: Write failing HTTP contract tests**

Cover 201 batch success, 401, 403, malformed JSON, more than 30 rows, indexed field issues, duplicate player 409, jersey conflict 409, player not found 404, update success and delete 204.

```ts
const response = await handleAddTeamPlayers(
  "team-1",
  jsonRequest({ players: [validPlayer, { ...validPlayer, firstName: "" }] }),
  dependencies,
)
expect(response.status).toBe(422)
expect(await response.json()).toMatchObject({
  issues: [expect.objectContaining({ row: 1, field: "firstName" })],
})
```

- [ ] **Step 3: Run route tests and verify failure**

Run: `npm run test -- tests/api/teams/team-routes.test.ts`

Expected: FAIL because the new handlers do not exist.

- [ ] **Step 4: Implement shared Zod schemas and error mapping**

Define `teamPlayerSchema` with trimmed names (1-80), ISO `YYYY-MM-DD` birth date not in the future, optional nickname (40), optional phone (30), integer jersey 1-999, and position enum. Define:

```ts
const teamPlayerBatchSchema = z.object({
  players: z.array(teamPlayerSchema).min(1).max(30),
})
```

Convert `ZodIssue.path` from `["players", row, field]` to `{ row, field, message }`. Map known errors to Thai messages and the approved 401/403/404/409/422 statuses.

- [ ] **Step 5: Compose Route Handlers**

Use `getTeamRepository()` once per request and pass it to the application use case. `DELETE` supplies `new Date().toISOString()` server-side. Return `{ players }` with 201 for batch, `{ player }` with 200 for update, and empty 204 for deactivate.

- [ ] **Step 6: Run route and use-case tests**

Run:

```powershell
npm run test -- tests/api/teams/team-routes.test.ts tests/features/team-management/team-use-cases.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the player HTTP boundary**

```powershell
git add 'app/api/teams/[id]/players' features/team-management/presentation/team-handler.ts tests/api/teams/team-routes.test.ts
git commit -m "feat(team): expose player roster routes"
```

### Task 5: Enforce Team Format, State, Version, And Registration Eligibility

**Files:**
- Modify: `features/team-management/application/create-team.ts`
- Modify: `features/team-management/application/update-team.ts`
- Modify: `features/team-management/application/ports/team-repository.ts`
- Modify: `features/team-management/infrastructure/prisma-team-repository.ts`
- Modify: `features/team-management/presentation/team-handler.ts`
- Modify: `app/api/teams/route.ts`
- Modify: `app/api/teams/[id]/route.ts`
- Modify: `components/team/team-editor.tsx`
- Modify: `features/registrations/domain/registration-policy.ts`
- Create: `features/registrations/domain/player-age-policy.ts`
- Modify: `features/registrations/application/ports/registration-repository.ts`
- Modify: `features/registrations/infrastructure/prisma-registration-repository.ts`
- Modify: `features/registrations/presentation/registration-handler.ts`
- Modify: `features/tournaments/application/get-tournament-registration-options.ts`
- Modify: `components/organizer/registration-review-list.tsx`
- Test: `tests/features/team-management/team-use-cases.test.ts`
- Test: `tests/features/team-management/prisma-team-repository.test.ts`
- Test: `tests/features/registrations/apply-to-tournament.test.ts`
- Create: `tests/features/registrations/player-age-policy.test.ts`
- Test: `tests/features/tournaments/get-tournament-registration-options.test.ts`
- Test: `tests/api/teams/team-routes.test.ts`
- Test: `tests/api/registrations/registration-routes.test.ts`
- Test: `tests/ui/team/team-editor.test.tsx`
- Test: `tests/ui/organizer/registration-review-list.test.tsx`

**Interfaces:**
- Consumes: expanded `TeamSummary`, `TeamPlayer`, role and repositories from Tasks 1-4
- Produces: create/update payloads with format/version; registration context backed by TeamPlayer

- [ ] **Step 1: Write failing team-format and concurrency tests**

Assert create requires `format`, update sends `expectedVersion`, stale writes throw `CONFLICT`, and a format change with active registration throws `TEAM_FORMAT_CHANGE_BLOCKED`.

```ts
await expect(
  updateTeam(
    { teamId: "team-1", name: "A", provinceCode: "10", format: "THREE_V_THREE", expectedVersion: 2 },
    actor,
    dependencies,
  ),
).rejects.toThrow("TEAM_FORMAT_CHANGE_BLOCKED")
```

- [ ] **Step 2: Write failing registration policy and discovery tests**

Assert inactive teams throw `TEAM_INACTIVE`, mismatched team/tournament formats throw `TEAM_FORMAT_MISMATCH`, and tournament detail lists only active owned teams with matching format. Add age-policy tests where `U18` requires age strictly less than 18 on `tournament.startsAt`, leap-day birthdays use completed calendar years, and `Open` skips the age limit. Update review summaries to expect `ผู้เล่น 5 / ผู้จัดการ/โค้ช 1`.

- [ ] **Step 3: Run focused tests and verify failure**

Run:

```powershell
npm run test -- tests/features/team-management/team-use-cases.test.ts tests/features/team-management/prisma-team-repository.test.ts tests/features/registrations/apply-to-tournament.test.ts tests/features/registrations/player-age-policy.test.ts tests/features/tournaments/get-tournament-registration-options.test.ts tests/api/teams/team-routes.test.ts tests/api/registrations/registration-routes.test.ts tests/ui/team/team-editor.test.tsx tests/ui/organizer/registration-review-list.test.tsx
```

Expected: FAIL on missing format/version fields and old TeamMember-backed registration context.

- [ ] **Step 4: Implement create/update concurrency and guards**

Use these input boundaries:

```ts
export interface CreateTeamInput {
  name: string
  provinceCode: string
  format: TeamFormat
}

export interface UpdateTeamInput extends CreateTeamInput {
  teamId: string
  expectedVersion: number
}
```

Repository update uses `updateMany({ where: { id, version: expectedVersion }, data: { ..., version: { increment: 1 } } })`; count 0 maps to `CONFLICT`. Check active registrations only when `format` changes.

- [ ] **Step 5: Update TeamEditor**

Add a visible format select with `5v5` and `3v3`, include `expectedVersion`, and map 409 responses to actionable Thai copy. Keep ProvinceCombobox and responsive two-column layout; no nested cards.

- [ ] **Step 6: Replace registration roster reads**

Change `RegistrationApplicationContext.roster` to `TeamPlayer[]`. Lock `TeamPlayer` active rows instead of `TeamMember`, include `Team.format` and `Team.isActive`, and assert:

```ts
if (!input.team.isActive) throw new Error("TEAM_INACTIVE")
if (input.team.format !== input.tournament.format) {
  throw new Error("TEAM_FORMAT_MISMATCH")
}
assertRosterEligibility(input.team.format, input.roster)
```

Organizer review count comes from `team.players`; manager/coach count is one when owner exists. Remove the old coach-limit error mapping.

Add `ageGroup` and `startsAt` to the locked tournament registration context. Implement `assertRosterAgeEligibility(ageGroup, startsAt, roster)` using completed calendar years on the tournament start date: `U12`, `U14`, `U16`, `U18`, and `U23` require age `< 12`, `< 14`, `< 16`, `< 18`, and `< 23`; `Open` has no limit. Throw `PLAYER_AGE_INELIGIBLE` with player ids in the typed domain error details and map it to 422 without exposing birth dates.

- [ ] **Step 7: Run focused regression tests**

Run the same command from Step 3.

Expected: all listed tests PASS.

- [ ] **Step 8: Commit team format and registration integrity**

```powershell
git add features/team-management features/registrations features/tournaments components/team/team-editor.tsx components/organizer/registration-review-list.tsx app/api/teams tests/features/team-management tests/features/registrations tests/features/tournaments tests/api/teams tests/api/registrations tests/ui/team/team-editor.test.tsx tests/ui/organizer/registration-review-list.test.tsx
git commit -m "feat(team): enforce format and roster eligibility"
```

### Task 6: Build The Responsive Multi-Player Roster Experience

**Files:**
- Create: `components/team/team-player-fields.tsx`
- Create: `components/team/team-player-batch-form.tsx`
- Create: `components/team/team-player-roster.tsx`
- Modify: `app/(admin)/team/[id]/page.tsx`
- Modify: `app/(admin)/team/page.tsx`
- Delete: `components/team/roster-manager.tsx`
- Delete: `features/team-management/application/add-team-member.ts`
- Delete: `features/team-management/application/deactivate-team-member.ts`
- Delete: `features/team-management/application/list-team-member-candidates.ts`
- Delete: `app/api/teams/[id]/members/route.ts`
- Delete: `app/api/teams/[id]/members/[memberId]/route.ts`
- Modify: `features/team-management/application/ports/team-repository.ts`
- Modify: `features/team-management/infrastructure/prisma-team-repository.ts`
- Modify: `features/team-management/presentation/team-handler.ts`
- Create: `tests/ui/team/team-player-batch-form.test.tsx`
- Create: `tests/ui/team/team-player-roster.test.tsx`
- Delete: `tests/ui/team/roster-manager.test.tsx`

**Interfaces:**
- Consumes: player routes, `TeamPlayer`, and team workspace from Tasks 2-5
- Produces: selected B workflow with five initial rows and one atomic save

- [ ] **Step 1: Write failing batch-form UI tests**

Assert five initial fieldsets, adding/removing rows, blank-row omission, one POST with all completed rows, indexed errors, error-summary focus, and pending-state stability.

```ts
render(<TeamPlayerBatchForm teamId="team-1" onPlayersAdded={onPlayersAdded} />)
expect(screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })).toHaveLength(5)
await user.click(screen.getByRole("button", { name: "เพิ่มแถว" }))
expect(screen.getAllByRole("group", { name: /ผู้เล่นคนที่/ })).toHaveLength(6)
```

- [ ] **Step 2: Write failing roster list tests**

Assert active count, Thai empty state, edit PATCH, confirmed DELETE, minimum-roster warning, and no account candidate selector.

- [ ] **Step 3: Run UI tests and verify failure**

Run:

```powershell
npm run test -- tests/ui/team/team-player-batch-form.test.tsx tests/ui/team/team-player-roster.test.tsx
```

Expected: FAIL because the components do not exist.

- [ ] **Step 4: Implement reusable player fields**

Render visible labels and stable controls for first name, last name, birth date, nickname, jersey number, position and phone. Use `Input` and native/select primitive already in the project. Do not introduce a form library or new design system.

- [ ] **Step 5: Implement the five-row atomic batch form**

Store rows with stable local ids. Ignore completely blank rows, reject partially filled rows before fetch, and POST once to `/api/teams/${teamId}/players/batch`. On 422, retain all values and attach returned `issues` to the matching row/field. On success, clear to five new rows and call `onPlayersAdded(players)`.

Desktop uses a column-header grid; mobile stacks fields inside each `<fieldset>`. Use `minmax(0, 1fr)`, explicit gaps and no viewport-based font scaling. Focus the `tabIndex={-1}` error summary after a failed submit.

- [ ] **Step 6: Implement roster list edit/deactivate behavior**

`TeamPlayerRoster` owns the current active list, receives `format`, appends successful batch results, and updates/removes rows after PATCH/DELETE. Use Lucide `Pencil` and `UserMinus` icon buttons with Thai accessible names and tooltips. Show the minimum warning when active count is below 5 or 3.

- [ ] **Step 7: Replace old member UI and active code paths**

Load `workspace.players` directly; remove candidate loading. Team list rows show format and player count, with no separate coach count. Delete old member handlers/routes/use cases and remove their repository methods, but retain the Prisma `TeamMember` model and migration history.

- [ ] **Step 8: Run UI, route and application regression tests**

Run:

```powershell
npm run test -- tests/ui/team tests/api/teams tests/features/team-management
```

Expected: PASS and no active code imports the deleted member modules.

- [ ] **Step 9: Commit the roster experience**

```powershell
git add components/team app/api/teams 'app/(admin)/team' features/team-management tests/ui/team tests/api/teams tests/features/team-management
git commit -m "feat(team): add responsive multi-player roster"
```

### Task 7: Add Safe Team Deletion And Deactivation

**Files:**
- Create: `features/team-management/application/remove-or-deactivate-team.ts`
- Create: `components/team/team-delete-dialog.tsx`
- Create: `components/team/team-list.tsx`
- Modify: `features/team-management/application/ports/team-repository.ts`
- Modify: `features/team-management/infrastructure/prisma-team-repository.ts`
- Modify: `features/team-management/presentation/team-handler.ts`
- Modify: `app/api/teams/[id]/route.ts`
- Modify: `app/(admin)/team/[id]/page.tsx`
- Modify: `app/(admin)/team/page.tsx`
- Modify: `components/team/team-editor.tsx`
- Modify: `components/team/team-player-roster.tsx`
- Test: `tests/features/team-management/team-use-cases.test.ts`
- Test: `tests/features/team-management/prisma-team-repository.test.ts`
- Test: `tests/api/teams/team-routes.test.ts`
- Create: `tests/ui/team/team-delete-dialog.test.tsx`
- Create: `tests/ui/team/team-list.test.tsx`

**Interfaces:**
- Consumes: team owner authorization, Team active/version state and registration statuses
- Produces: `removeOrDeactivateTeam` returning `{ outcome: "DELETED" | "DEACTIVATED" }`

- [ ] **Step 1: Write failing deletion-policy use-case tests**

Cover permanent delete with no registrations, deactivation with terminal history, block on `PENDING`/`APPROVED`, exact-name mismatch, stale version, non-owner and admin override audit.

```ts
expect(await removeOrDeactivateTeam(
  { teamId: "team-1", confirmationName: "ทีมทดสอบ", expectedVersion: 0, at: now },
  actor,
  dependencies,
)).toEqual({ outcome: "DEACTIVATED" })
```

- [ ] **Step 2: Write failing DELETE route and dialog tests**

Assert JSON body `{ confirmationName, expectedVersion }`, 409 for active registrations/stale version, 422 for wrong name, success message by outcome, and disabled confirm until the typed name matches exactly. Add list/detail tests proving that an inactive team remains visible with the status `ปิดใช้งาน` while edit, roster and registration mutations are unavailable.

- [ ] **Step 3: Run focused tests and verify failure**

Run:

```powershell
npm run test -- tests/features/team-management/team-use-cases.test.ts tests/features/team-management/prisma-team-repository.test.ts tests/api/teams/team-routes.test.ts tests/ui/team/team-delete-dialog.test.tsx tests/ui/team/team-list.test.tsx
```

Expected: FAIL because deletion behavior does not exist.

- [ ] **Step 4: Implement server-selected deletion behavior**

Add repository context:

```ts
interface TeamRemovalContext {
  team: TeamSummary
  registrationStatuses: RegistrationStatus[]
}
```

The use case compares the trimmed confirmation name exactly, blocks active registration statuses, permanently deletes only when `registrationStatuses.length === 0`, otherwise updates `isActive=false`, `deactivatedAt=at`, and increments version. The client never chooses the outcome. Record `team.deleted` or `team.deactivated`; admin override is a second audit event in the same transaction.

- [ ] **Step 5: Implement DELETE handler and confirmation dialog**

Use Base UI Dialog as established in `components/team/team-registration-list.tsx`. Require the team name input and display the history-preservation explanation. After success redirect to `/team` and refresh. Use Trash2 icon, visible destructive text and no rounded card wrapper.

Extract team rows into `TeamList` so inactive teams remain in the dashboard with a visible `ปิดใช้งาน` status. On inactive team detail, render identity and history read-only; do not render TeamEditor submit, batch-add, edit, deactivate-player, tournament-registration, or delete commands.

- [ ] **Step 6: Run focused tests**

Run the same command from Step 3.

Expected: PASS.

- [ ] **Step 7: Commit deletion and deactivation**

```powershell
git add features/team-management app/api/teams 'app/(admin)/team' components/team/team-delete-dialog.tsx components/team/team-list.tsx components/team/team-editor.tsx components/team/team-player-roster.tsx tests/features/team-management tests/api/teams/team-routes.test.ts tests/ui/team/team-delete-dialog.test.tsx tests/ui/team/team-list.test.tsx
git commit -m "feat(team): add safe team removal"
```

### Task 8: Integrate, Audit Legacy Data, Document, And Verify

**Files:**
- Create: `scripts/audit-legacy-team-members.ts`
- Modify: `docs/ROADMAP.md`
- Modify: `README.md`
- Modify: all remaining active files returned by the role/member searches below

**Interfaces:**
- Consumes: complete role/team/player/deletion slices
- Produces: migration readiness report and regression-clean feature branch

- [ ] **Step 1: Add a read-only legacy audit script**

The script copies the existing dotenv and `PrismaPg` setup from `prisma/seed.ts`, reads grouped `TeamMember.role` counts, prints JSON, and disconnects in `finally`. It must not update or delete rows:

```ts
import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
import { PrismaClient } from "../lib/generated/prisma/client"

config({ path: ".env.local" })
config()
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_NOT_CONFIGURED")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

try {
  const counts = await prisma.teamMember.groupBy({
    by: ["role", "isActive"],
    _count: { _all: true },
  })
  console.log(JSON.stringify({ legacyTeamMembers: counts }, null, 2))
} finally {
  await prisma.$disconnect()
}
```

Document that removal of `TeamMember` requires a separate approved migration after this report is reviewed.

- [ ] **Step 2: Search for stale role and active-member references**

Run:

```powershell
rg -n '"TEAM_MANAGER"|actor\.role === "COACH"|TeamRosterMember|listActiveMembers|/members' app components features tests prisma/seed.ts
```

Expected: no active old account-role or roster workflow references. The retained `TeamMember` model and `TeamMemberRole.COACH` in Prisma schema/migration history are outside this search. Update every unexpected hit and its focused test.

- [ ] **Step 3: Verify migration and seed behavior against the configured development database**

First inspect the target and migration status without printing credentials:

```powershell
npx prisma validate
npx prisma migrate status
```

If the configured target is confirmed development, apply the two committed migrations with `npm run prisma:migrate`, run `npm run prisma:seed`, then run `npx tsx scripts/audit-legacy-team-members.ts`. Do not reset, drop or delete shared data. If the database is unavailable, report the limitation and continue all independent checks.

- [ ] **Step 4: Update project documentation**

Update README roles/team workflow and ROADMAP status. State explicitly that players are roster data, CSV is not included, and legacy TeamMember removal is a later audited migration.

- [ ] **Step 5: Run the complete automated verification suite**

Run fresh:

```powershell
npm run test
npm run lint
npm run build
npx prisma validate
git diff --check
git status --short
```

Expected: 0 failed tests, lint exit 0, production build exit 0, Prisma validation exit 0, no whitespace errors, and only intended files plus the pre-existing untracked agent-tool files.

- [ ] **Step 6: Perform responsive Browser QA**

Start an unused dev-server port and verify `/register`, `/team`, `/team/new`, `/team/[id]`, and a published tournament detail at approximately 375px, 768px and 1440px in light and dark modes. Confirm:

- five initial roster rows are usable
- mobile fields do not cause page overflow
- desktop column alignment remains stable during errors/loading
- role label reads `ผู้จัดการ/โค้ช`
- team format is visible and selectable
- delete dialog traps focus and requires exact team name
- inactive/mismatched teams are absent from registration options

Capture screenshots for the implementation handoff; fix and retest any overlap or accessibility failure.

- [ ] **Step 7: Commit integration documentation and audit tooling**

```powershell
git add scripts/audit-legacy-team-members.ts README.md docs/ROADMAP.md
git commit -m "docs(team): document roster workflow and migration audit"
```

- [ ] **Step 8: Review commits before push**

Run:

```powershell
git log --oneline --decorate -10
git status --short
```

Confirm each implementation commit is independently understandable and that no environment files, credentials, generated Prisma client, `.next`, screenshots, `.agents`, `.claude`, `.windsurf`, or `skills-lock.json` are staged.
