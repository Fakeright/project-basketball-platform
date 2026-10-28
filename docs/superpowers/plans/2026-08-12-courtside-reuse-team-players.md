# Reuse Team Players During Team Creation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ผู้จัดการ/โค้ชค้นหาและเลือกผู้เล่นเดิมจากทีมของบัญชี แล้วสร้างทีมใหม่พร้อม roster ที่แก้ไขได้สูงสุด 30 คนใน transaction เดียว

**Architecture:** อ่านข้อมูลผ่าน Server Component และ application use case ที่จำกัดด้วย `ownerId` จาก actor จากนั้น project `TeamPlayer` หลาย record เป็นรายการ reusable ที่ไม่ซ้ำ ฝั่ง client จัดการ selection และ draft rows เท่านั้น ส่วน `POST /api/teams` ตรวจ payload และใช้ transaction เดิมของ TeamRepository เพื่อสร้าง Team, TeamPlayer และ audit metadata พร้อมกัน

**Tech Stack:** Next.js 16.2.11 App Router, React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui/Base UI, Prisma 7, Supabase PostgreSQL, Zod 4, Vitest 4 และ React Testing Library

## Global Constraints

- ใช้ภาษาไทยเป็นหลักสำหรับข้อความที่ผู้ใช้เห็น และชื่อโค้ดเป็นภาษาอังกฤษที่สื่อความหมาย
- รักษา dependency direction `presentation -> application -> domain` และ `infrastructure -> application/domain contracts`
- Server Component เป็นค่าเริ่มต้น; ใช้ Client Component เฉพาะ state และ event handlers
- อ่านข้อมูลประวัติเฉพาะทีมที่ `ownerId === actor.id`; Platform Admin ไม่เห็นข้อมูลบัญชีอื่นโดยอัตโนมัติ
- ไม่เพิ่ม Prisma model, migration, global player id หรือความสัมพันธ์กับบัญชี `PLAYER`
- ไม่แก้ ลบ หรือย้าย `TeamPlayer` ต้นทาง; ทีมใหม่ได้รับ snapshot แยก
- รวม identity ด้วยชื่อและนามสกุลที่ trim/case-fold แล้วร่วมกับวันเกิด `YYYY-MM-DD`
- รองรับผู้เล่นเริ่มต้น 0-30 คน และบังคับ identity กับเบอร์เสื้อไม่ซ้ำในทีมใหม่
- Team, TeamPlayer และ audit ต้องสำเร็จหรือ rollback ใน transaction เดียว
- Audit ห้ามมีชื่อ นามสกุล ชื่อเล่น วันเกิด หรือเบอร์โทร
- UI ต้องไม่ overflow ที่ประมาณ 375px, 768px และ 1440px และรองรับ light/dark mode กับ keyboard
- ก่อนแก้ Next.js page หรือ Route Handler ให้อ่าน `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` และ `15-route-handlers.md`

---

## File Map

- Create `features/team-management/domain/team-player-history.ts`: normalize, deduplicate และ project history เป็น reusable view model
- Create `features/team-management/domain/team-player-batch-policy.ts`: กฎจำนวน identity และ jersey ของ batch ที่ใช้ร่วมกัน
- Create `features/team-management/application/list-reusable-team-players.ts`: permission boundary และการเรียก repository
- Modify `features/team-management/application/ports/team-repository.ts`: เพิ่ม read contract สำหรับ history
- Modify `features/team-management/infrastructure/prisma-team-repository.ts`: query TeamPlayer ตาม owner และ map source team
- Modify `features/team-management/application/create-team.ts`: สร้างทีมพร้อม initial roster และ audit แบบ atomic
- Modify `features/team-management/application/add-team-players.ts`: ใช้ batch policy เดียวกัน
- Modify `features/team-management/presentation/team-handler.ts`: parse `players` 0-30 และคืน TeamPlayer ที่สร้าง
- Modify `app/api/teams/route.ts`: ส่ง use case result ใหม่ผ่าน Route Handler เดิม
- Create `components/team/reusable-player-selector.tsx`: search, individual/team/global selection และ indeterminate state
- Create `components/team/team-creation-roster-editor.tsx`: draft rows ที่แก้ไขได้ เพิ่ม/ลบได้ และ validation summary
- Modify `components/team/team-editor.tsx`: compose form, submit identity + players และ redirect ไป workspace
- Modify `app/(admin)/team/new/page.tsx`: โหลด reusable history ฝั่ง server แล้วส่ง view model ให้ TeamEditor
- Create `tests/features/team-management/team-player-history.test.ts`: domain projection tests
- Modify `tests/features/team-management/team-policy.test.ts`: shared batch policy tests
- Modify `tests/features/team-management/team-use-cases.test.ts`: history permission และ atomic create tests
- Modify `tests/features/team-management/prisma-team-repository.test.ts`: owner-scoped history query/mapping tests
- Modify `tests/api/teams/team-routes.test.ts`: create payload/status/error mapping tests
- Create `tests/ui/team/reusable-player-selector.test.tsx`: selector behavior/accessibility tests
- Create `tests/ui/team/team-creation-roster-editor.test.tsx`: draft editing/validation tests
- Modify `tests/ui/team/team-editor.test.tsx`: end-to-end form payload and redirect tests
- Modify `docs/ROADMAP.md`: บันทึก workflow ที่เสร็จและข้อจำกัด 30 คน

---

### Task 1: Historical Player Projection And Shared Batch Policy

**Files:**
- Create: `features/team-management/domain/team-player-history.ts`
- Create: `features/team-management/domain/team-player-batch-policy.ts`
- Create: `tests/features/team-management/team-player-history.test.ts`
- Modify: `tests/features/team-management/team-policy.test.ts`

**Interfaces:**
- Produces `TeamPlayerHistorySource`, `ReusableTeamPlayer`, and `projectReusableTeamPlayers(sources): ReusableTeamPlayer[]`
- Produces `assertTeamPlayerBatch(players, { allowEmpty }): void` and `maximumTeamPlayerBatchSize = 30`
- Consumes existing `TeamPlayerDraft` and `TeamPlayer` domain types

- [ ] **Step 1: Write failing projection tests**

Create tests proving duplicate identity projection, deterministic latest snapshot, active status, and unique source teams:

```ts
const sources: TeamPlayerHistorySource[] = [
  historySource({
    id: "older",
    teamId: "team-a",
    teamName: "A Team",
    firstName: " Somchai ",
    lastName: "JAIDEE",
    birthDate: "2010-01-02",
    isActive: false,
    updatedAt: "2026-01-01T00:00:00.000Z",
  }),
  historySource({
    id: "newer",
    teamId: "team-b",
    teamName: "B Team",
    firstName: "somchai",
    lastName: "jaidee",
    birthDate: "2010-01-02",
    nickname: "ชาย",
    isActive: true,
    updatedAt: "2026-02-01T00:00:00.000Z",
  }),
]

expect(projectReusableTeamPlayers(sources)).toEqual([
  expect.objectContaining({
    key: "newer",
    player: expect.objectContaining({ nickname: "ชาย" }),
    isActive: true,
    sourceTeams: [
      { id: "team-a", name: "A Team", playerIsActive: false },
      { id: "team-b", name: "B Team", playerIsActive: true },
    ],
  }),
])
```

Add a tie test where equal `updatedAt` chooses the lexicographically smaller record id and output order remains stable.

- [ ] **Step 2: Run projection tests and verify RED**

Run: `npm run test -- tests/features/team-management/team-player-history.test.ts`

Expected: FAIL because `team-player-history.ts` and exported symbols do not exist.

- [ ] **Step 3: Implement the minimal history projection**

Define explicit domain types and keep the normalized identity private:

```ts
export interface TeamPlayerHistorySource extends TeamPlayer {
  teamName: string
}

export interface ReusableTeamPlayerSourceTeam {
  id: string
  name: string
  playerIsActive: boolean
}

export interface ReusableTeamPlayer {
  key: string
  player: TeamPlayerDraft
  isActive: boolean
  sourceTeams: ReusableTeamPlayerSourceTeam[]
}

export function projectReusableTeamPlayers(
  sources: readonly TeamPlayerHistorySource[],
): ReusableTeamPlayer[] {
  // group by normalized firstName, lastName and birthDate;
  // select newest updatedAt then smallest id; sort sources and output deterministically
}
```

Do not expose the normalized identity string to the browser; use the selected canonical record id as `key`.

- [ ] **Step 4: Write failing shared batch-policy tests**

Add tests to `team-policy.test.ts`:

```ts
expect(() => assertTeamPlayerBatch([], { allowEmpty: true })).not.toThrow()
expect(() => assertTeamPlayerBatch([], { allowEmpty: false })).toThrow("PLAYER_BATCH_INVALID")
expect(() => assertTeamPlayerBatch(Array.from({ length: 31 }, (_, index) => draft(index)), { allowEmpty: true }))
  .toThrow("PLAYER_BATCH_INVALID")
expect(() => assertTeamPlayerBatch([draft(1), { ...draft(2), firstName: " PLAYER 1 " }], { allowEmpty: true }))
  .toThrow("PLAYER_ALREADY_EXISTS")
expect(() => assertTeamPlayerBatch([draft(1), { ...draft(2), jerseyNumber: 1 }], { allowEmpty: true }))
  .toThrow("JERSEY_ALREADY_IN_USE")
```

- [ ] **Step 5: Run policy tests and verify RED**

Run: `npm run test -- tests/features/team-management/team-policy.test.ts`

Expected: FAIL because `assertTeamPlayerBatch` does not exist.

- [ ] **Step 6: Implement the shared policy and verify GREEN**

Export `maximumTeamPlayerBatchSize = 30`; normalize identity with the same trim/case-fold rule as history projection; ignore `null` jerseys when checking duplicates.

Run:

```powershell
npm run test -- tests/features/team-management/team-player-history.test.ts tests/features/team-management/team-policy.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```powershell
git add features/team-management/domain/team-player-history.ts features/team-management/domain/team-player-batch-policy.ts tests/features/team-management/team-player-history.test.ts tests/features/team-management/team-policy.test.ts
git commit -m "feat(team): define reusable player history policies"
```

---

### Task 2: Owner-Scoped Historical Player Read Path

**Files:**
- Create: `features/team-management/application/list-reusable-team-players.ts`
- Modify: `features/team-management/application/ports/team-repository.ts`
- Modify: `features/team-management/infrastructure/prisma-team-repository.ts`
- Modify: `tests/features/team-management/team-use-cases.test.ts`
- Modify: `tests/features/team-management/prisma-team-repository.test.ts`

**Interfaces:**
- Adds `TeamRepository.listPlayerHistoryByOwner(ownerId: string): Promise<TeamPlayerHistorySource[]>`
- Produces `listReusableTeamPlayers(actor, { teams }): Promise<ReusableTeamPlayer[]>`
- Consumes `projectReusableTeamPlayers` from Task 1

- [ ] **Step 1: Write failing use-case permission and projection tests**

Extend the fake repository with `listPlayerHistoryByOwner`. Test that a manager passes their own actor id and that a role without `team.create` receives `FORBIDDEN` before repository access:

```ts
const repository = createRepository({
  listPlayerHistoryByOwner: vi.fn(async () => sources),
})

await expect(listReusableTeamPlayers(teamManager, { teams: repository }))
  .resolves.toEqual(projectReusableTeamPlayers(sources))
expect(repository.listPlayerHistoryByOwner).toHaveBeenCalledWith(teamManager.id)
```

For Platform Admin, assert the same `actor.id` boundary; never add an arbitrary owner parameter.

- [ ] **Step 2: Run use-case tests and verify RED**

Run: `npm run test -- tests/features/team-management/team-use-cases.test.ts`

Expected: FAIL because the use case and repository method do not exist.

- [ ] **Step 3: Add the repository contract and application use case**

Implement:

```ts
export async function listReusableTeamPlayers(
  actor: Actor,
  dependencies: { teams: TeamRepository },
): Promise<ReusableTeamPlayer[]> {
  authorize(actor, "team.create", { organizerId: actor.id })
  const sources = await dependencies.teams.listPlayerHistoryByOwner(actor.id)
  return projectReusableTeamPlayers(sources)
}
```

- [ ] **Step 4: Write failing Prisma query/mapping tests**

Mock two rows, including an inactive TeamPlayer and an inactive Team, and assert both are returned. Require this owner-scoped query shape:

```ts
expect(prisma.teamPlayer.findMany).toHaveBeenCalledWith({
  where: { team: { ownerId: "manager-1" } },
  include: { team: { select: { name: true } } },
  orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
})
```

Assert dates map to date-only/ISO strings and `teamName` is included. Do not filter `Team.isActive` or `TeamPlayer.isActive`.

- [ ] **Step 5: Run Prisma repository tests and verify RED**

Run: `npm run test -- tests/features/team-management/prisma-team-repository.test.ts`

Expected: FAIL because the repository implementation is absent.

- [ ] **Step 6: Implement query/mapping and verify GREEN**

Add the method only to `PrismaTeamRepository` because it is read-only and not needed on `TeamMutationRepository`.

Run:

```powershell
npm run test -- tests/features/team-management/team-use-cases.test.ts tests/features/team-management/prisma-team-repository.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

```powershell
git add features/team-management/application/list-reusable-team-players.ts features/team-management/application/ports/team-repository.ts features/team-management/infrastructure/prisma-team-repository.ts tests/features/team-management/team-use-cases.test.ts tests/features/team-management/prisma-team-repository.test.ts
git commit -m "feat(team): list reusable players by owner"
```

---

### Task 3: Atomic Team Creation With Initial Roster

**Files:**
- Modify: `features/team-management/application/create-team.ts`
- Modify: `features/team-management/application/add-team-players.ts`
- Modify: `features/team-management/presentation/team-handler.ts`
- Modify: `app/api/teams/route.ts`
- Modify: `tests/features/team-management/team-use-cases.test.ts`
- Modify: `tests/api/teams/team-routes.test.ts`
- Modify: `tests/api/shared/route-boundary.test.ts`

**Interfaces:**
- Extends `CreateTeamInput` with `players: readonly TeamPlayerDraft[]`
- Produces `CreateTeamResult = { team: TeamSummary; players: TeamPlayer[] }`
- Reuses `TeamMutationRepository.create`, `addPlayers`, `appendAuditEvent`, and `inTransaction`
- Reuses `assertTeamPlayerBatch` and PII-safe `projectTeamPlayerBatchAuditSnapshot`

- [ ] **Step 1: Write failing atomic create use-case tests**

Cover empty roster, populated roster, duplicate/31-player rejection before transaction, PII-safe audits, rollback propagation, and admin override. Core expectation:

```ts
const result = await createTeam(
  { name: "New Team", provinceCode: "10", format: "THREE_V_THREE", players: [draftPlayer("one", 4)] },
  teamManager,
  { teams: repository },
)

expect(repository.inTransaction).toHaveBeenCalledOnce()
expect(vi.mocked(repository.create).mock.invocationCallOrder[0]).toBeLessThan(
  vi.mocked(repository.addPlayers).mock.invocationCallOrder[0],
)
expect(repository.addPlayers).toHaveBeenCalledWith("team-new", expect.any(Array))
expect(result).toEqual({ team: expect.objectContaining({ id: "team-new" }), players: expect.any(Array) })
expectPlayerAuditPayloadsToOmitPii(repository)
```

Use the existing guarded transaction helper to prove no mutation repository escapes the callback.

- [ ] **Step 2: Run use-case tests and verify RED**

Run: `npm run test -- tests/features/team-management/team-use-cases.test.ts`

Expected: FAIL because `createTeam` does not accept/create initial players.

- [ ] **Step 3: Implement atomic create and shared policy reuse**

Call `assertTeamPlayerBatch(input.players, { allowEmpty: true })` before entering the transaction. Inside the transaction:

```ts
const team = await teams.create({ name, provinceCode, format, ownerId: actor.id })
const players = input.players.length > 0
  ? await teams.addPlayers(team.id, input.players)
  : []

await teams.appendAuditEvent({
  actorId: actor.id,
  action: "team.created",
  entityId: team.id,
  after: { team, initialPlayerCount: players.length },
})
```

When players exist, append `team.players_added` using `projectTeamPlayerBatchAuditSnapshot(players, [])`. Keep admin override audit inside the same transaction. Update `addTeamPlayers` to call `assertTeamPlayerBatch(input.players, { allowEmpty: false })` and remove its local max constant.

- [ ] **Step 4: Write failing Route Handler tests**

Extend create tests to assert:

```ts
expect(create).toHaveBeenCalledWith({
  name: "Bangkok Ballers",
  provinceCode: "10",
  format: "THREE_V_THREE",
  players: [validPlayer],
}, teamManager)
expect(response.status).toBe(201)
await expect(response.json()).resolves.toEqual({ team: createdTeam, players: [storedPlayer] })
```

Add tests for omitted/empty `players`, 31 entries, invalid row, duplicate error mapping `409`, jersey error mapping `409`, and unexpected error diagnostics without player PII.

- [ ] **Step 5: Run route tests and verify RED**

Run:

```powershell
npm run test -- tests/api/teams/team-routes.test.ts tests/api/shared/route-boundary.test.ts
```

Expected: FAIL because create schema/result still handles Team identity only.

- [ ] **Step 6: Implement create schema/result and verify GREEN**

Create `teamCreateSchema` from `teamIdentitySchema`:

```ts
const teamCreateSchema = teamIdentitySchema.extend({
  players: z.array(teamPlayerSchema).max(maximumTeamPlayerBatchSize).default([]),
})
```

Keep `teamUpdateSchema` unchanged. Return `{ team, players }` with status `201`; route remains a native Next.js Route Handler and receives no client-supplied owner id.

Run:

```powershell
npm run test -- tests/features/team-management/team-use-cases.test.ts tests/api/teams/team-routes.test.ts tests/api/shared/route-boundary.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

```powershell
git add features/team-management/application/create-team.ts features/team-management/application/add-team-players.ts features/team-management/presentation/team-handler.ts app/api/teams/route.ts tests/features/team-management/team-use-cases.test.ts tests/api/teams/team-routes.test.ts tests/api/shared/route-boundary.test.ts
git commit -m "feat(team): create teams with initial roster"
```

---

### Task 4: Reusable Player Selector

**Files:**
- Create: `components/team/reusable-player-selector.tsx`
- Create: `tests/ui/team/reusable-player-selector.test.tsx`

**Interfaces:**
- Consumes `players: readonly ReusableTeamPlayer[]`
- Consumes `selectedKeys: ReadonlySet<string>`
- Produces selection through `onSelectionChange(keys: Set<string>): void`
- Consumes `maximumSelection: number` and reports limit through visible Thai copy

- [ ] **Step 1: Write failing selector behavior tests**

Use a fixture where one reusable player has source teams A and B. Test search, individual toggle, select-all by team, global select-all, deselect, shared identity only once, inactive label, limit message, and indeterminate checkbox:

```tsx
render(
  <ReusablePlayerSelector
    maximumSelection={30}
    onSelectionChange={onSelectionChange}
    players={players}
    selectedKeys={new Set()}
  />,
)

await user.click(screen.getByRole("checkbox", { name: "เลือกผู้เล่นทั้งหมดจากทีม A Team" }))
expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["player-one", "shared-player"]))
```

Verify searching nickname hides non-matches without clearing existing selection and all checkboxes have accessible names.

- [ ] **Step 2: Run selector tests and verify RED**

Run: `npm run test -- tests/ui/team/reusable-player-selector.test.tsx`

Expected: FAIL because the selector component does not exist.

- [ ] **Step 3: Implement selector state projection**

Keep selector controlled. Derive team groups from each entry's `sourceTeams`, so a shared player key can appear in multiple visual groups while selection remains one Set entry. Use native checkbox inputs and assign `ref.current.indeterminate` from group selection counts. Add a concise search input and status text; do not create nested cards.

When a selection operation exceeds the limit, add keys in deterministic visible order until the limit and announce:

```text
เลือกได้สูงสุด 30 คน กรุณานำผู้เล่นออกก่อนเลือกเพิ่ม
```

- [ ] **Step 4: Verify selector GREEN and accessibility behavior**

Run: `npm run test -- tests/ui/team/reusable-player-selector.test.tsx`

Expected: PASS with no act warnings.

- [ ] **Step 5: Commit Task 4**

```powershell
git add components/team/reusable-player-selector.tsx tests/ui/team/reusable-player-selector.test.tsx
git commit -m "feat(team): add reusable player selector"
```

---

### Task 5: Team Creation Roster Editor And Page Integration

**Files:**
- Create: `components/team/team-creation-roster-editor.tsx`
- Create: `tests/ui/team/team-creation-roster-editor.test.tsx`
- Modify: `components/team/team-editor.tsx`
- Modify: `app/(admin)/team/new/page.tsx`
- Modify: `tests/ui/team/team-editor.test.tsx`

**Interfaces:**
- `TeamCreationRosterEditor` consumes reusable history and controlled `TeamCreationPlayerRow[]`
- `TeamCreationPlayerRow = { id: string; sourceKey: string | null; values: TeamPlayerFormValues; errors: TeamPlayerFieldErrors }`
- TeamEditor consumes `reusablePlayers?: readonly ReusableTeamPlayer[]`, defaulting to `[]` for edit mode/tests
- NewTeamPage calls `listReusableTeamPlayers(actor, { teams })` and passes its result to TeamEditor

- [ ] **Step 1: Write failing roster editor tests**

Test that selected history becomes editable rows, manual rows can be added, deselect removes only its source row, edited history remains a snapshot, duplicate identity/jersey errors are shown, blank manual rows are omitted, and the first error receives focus.

```tsx
await user.click(screen.getByRole("button", { name: "เลือกจากผู้เล่นเดิม" }))
await user.click(screen.getByRole("checkbox", { name: /สมชาย ใจดี/ }))
expect(screen.getByLabelText("ชื่อ", { selector: "input" })).toHaveValue("สมชาย")
await user.clear(screen.getByLabelText("เบอร์เสื้อ"))
await user.type(screen.getByLabelText("เบอร์เสื้อ"), "12")
expect(onRowsChange).toHaveBeenCalledWith(expect.arrayContaining([
  expect.objectContaining({ values: expect.objectContaining({ jerseyNumber: "12" }) }),
]))
```

- [ ] **Step 2: Run roster editor tests and verify RED**

Run: `npm run test -- tests/ui/team/team-creation-roster-editor.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the controlled roster editor**

Reuse `TeamPlayerFields`, `playerValuesFromDraft`, `validatePlayerValues`, and `playerDraftFromValues`. Add pure helpers for row identity and duplicate jersey errors in the same module only if they remain presentation-specific. Keep row ids stable and never use array index as React key.

Render column headers at desktop and vertical labeled fields below desktop. Keep the 30-person count visible and disable add/select commands at the limit.

- [ ] **Step 4: Write failing TeamEditor integration tests**

Update the create test to select one historical player, edit jersey, add one manual player, and assert one POST:

```ts
expect(fetchMock).toHaveBeenCalledWith("/api/teams", expect.objectContaining({
  method: "POST",
  body: JSON.stringify({
    name: "Bangkok Ballers",
    provinceCode: "10",
    format: "THREE_V_THREE",
    players: [expectPlayerOne, expectPlayerTwo],
  }),
}))
expect(router.push).toHaveBeenCalledWith("/team/team-1")
```

Also test create with `players: []`, server `422` summary, and that edit mode does not render reusable selection or resend roster.

- [ ] **Step 5: Run TeamEditor tests and verify RED**

Run:

```powershell
npm run test -- tests/ui/team/team-creation-roster-editor.test.tsx tests/ui/team/team-editor.test.tsx
```

Expected: FAIL because TeamEditor does not own roster rows or redirect after create.

- [ ] **Step 6: Integrate TeamEditor and server page**

Read the local Next.js Server/Client Component guide before editing the page. Make `NewTeamPage` async:

```tsx
export default async function NewTeamPage() {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) return null
  const reusablePlayers = await listReusableTeamPlayers(actor, { teams: getTeamRepository() })
  return <TeamEditor initialTeam={null} reusablePlayers={reusablePlayers} />
}
```

The parent `(admin)/layout.tsx` remains the redirect boundary. TeamEditor validates nonblank rows, submits `players`, maps returned field issues to rows, calls `router.push(`/team/${result.team.id}`)`, then `router.refresh()` after success. Keep PATCH behavior unchanged.

- [ ] **Step 7: Verify UI integration GREEN**

Run:

```powershell
npm run test -- tests/ui/team/team-creation-roster-editor.test.tsx tests/ui/team/reusable-player-selector.test.tsx tests/ui/team/team-editor.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Task 5**

```powershell
git add components/team/team-creation-roster-editor.tsx components/team/team-editor.tsx 'app/(admin)/team/new/page.tsx' tests/ui/team/team-creation-roster-editor.test.tsx tests/ui/team/team-editor.test.tsx
git commit -m "feat(team): reuse players while creating teams"
```

---

### Task 6: Regression, Responsive QA, Documentation, And Delivery

**Files:**
- Modify: `docs/ROADMAP.md`
- Modify only if QA reveals a tested defect: files from Tasks 1-5 and their focused tests

**Interfaces:**
- No new production interface; this task verifies the complete slice and updates the authoritative roadmap

- [ ] **Step 1: Run the complete automated verification suite**

Run in this order:

```powershell
npm run test
npm run lint
npm run build
npx prisma validate
npx prisma migrate status
git diff --check
git status --short
```

Expected: all independent checks PASS; migration status remains up to date and no migration is created for this feature.

- [ ] **Step 2: Start or reuse the dev server**

Read current terminal/process state first. If port 3000 is free, run `npm run dev -- --hostname 127.0.0.1 --port 3000`; otherwise choose the next free port. Keep the process running through browser QA.

- [ ] **Step 3: Seed an authenticated QA scenario without production mutation**

Use the existing development seed/reset tooling only against the configured development database. Ensure one manager owns:

- Team A with two active players
- Team B with one duplicate identity and one inactive player
- Enough distinct players to exercise team/global selection without exceeding 30

Do not run destructive reset against a shared or production database.

- [ ] **Step 4: Perform browser QA at three viewports**

Using the in-app browser, verify `/team/new` at approximately 375x812, 768x1024, and 1440x1000 in light and dark themes:

- search by name and nickname
- select/deselect individual player
- select all by team and all teams
- verify duplicate identity appears once in roster
- verify `เคยนำออก` and all source team names
- edit a copied snapshot and confirm the old team remains unchanged
- create empty team and create populated team
- keyboard tab order, checkbox names, focus on invalid field
- no horizontal page overflow, clipping, overlap, or layout shift

If a visual/behavior defect appears, first add a failing focused test, verify RED, implement the minimum fix, and rerun focused checks before continuing.

- [ ] **Step 5: Update the roadmap**

Move the following statement into `เสร็จแล้ว`:

```text
- การนำผู้เล่นเดิมจากทุกทีมของบัญชีกลับมาใช้ขณะสร้างทีม พร้อมค้นหา เลือกทั้งหมด แก้ snapshot ก่อนบันทึก และสร้างทีมกับรายชื่อสูงสุด 30 คนแบบ atomic
```

Keep CSV import under `วางแผนไว้` and preserve the legacy `TeamMember` reconciliation warning.

- [ ] **Step 6: Re-run final verification after documentation or QA fixes**

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

Expected: all checks PASS. Report any external-service limitation explicitly.

- [ ] **Step 7: Commit final verified state**

Stage only files belonging to this feature; leave `.agents/`, `.claude/`, `.windsurf/`, and `skills-lock.json` untouched unless the user separately requests them.

```powershell
git add docs/ROADMAP.md
git commit -m "docs(team): record reusable player workflow"
```

- [ ] **Step 8: Push the feature branch**

```powershell
git push origin feat/courtside-public-platform
```

Expected: `origin/feat/courtside-public-platform` points to the final verified commit.
