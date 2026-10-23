# COURTSIDE Tournament Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มเครื่องมือให้ Platform Admin ระงับ เปิดกลับ นำออก Archive เปิดรับสมัครใหม่ และลบรายการร่างที่ว่างได้ โดยรักษา lifecycle และประวัติ Audit ของการแข่งขัน

**Architecture:** เพิ่ม `TournamentGovernanceStatus` เป็นแกนสถานะแยกจาก `TournamentStatus` และรวมกติกาไว้ใน domain policy ที่ infrastructure เรียกซ้ำภายใน transaction ทุก governance command ผ่าน use case และ Route Handler เดียว ขณะที่ public repositories กรองเฉพาะ `ACTIVE` และ mutation context เดิมทุกกลุ่มบังคับ governance guard ฝั่ง application

**Tech Stack:** Next.js 16.2.11 App Router, React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui/Base UI, Zod 4, Prisma 7.9, Supabase PostgreSQL, Vitest 4, React Testing Library

**Spec:** `docs/superpowers/specs/2026-08-22-courtside-tournament-governance-design.md`

## Global Constraints

- ใช้ภาษาไทยเป็นหลักสำหรับข้อความผู้ใช้ และใช้ชื่อ TypeScript/Prisma เป็นภาษาอังกฤษที่สื่อความหมาย
- Domain ห้าม import React, Next.js, Prisma หรือ browser API
- ทุก mutation ต้องตรวจ authentication, permission, governance state และ optimistic version ฝั่ง server
- Governance command เป็นสิทธิ์ของ `PLATFORM_ADMIN` เท่านั้น และเหตุผลต้องยาว 1-500 ตัวอักษรหลัง trim
- `TournamentStatus` และ `TournamentGovernanceStatus` ต้องไม่เขียนทับหน้าที่ของกันและกัน
- ห้าม reset หรือลบข้อมูล Supabase development; migration ต้อง additive และ default ข้อมูลเดิมเป็น `ACTIVE`
- ห้าม commit `.env`, credentials, generated Prisma client, `.next`, `node_modules`, `.agents`, `.claude`, `.windsurf` หรือ `skills-lock.json`
- ทำ TDD ทุก task: เห็น focused test fail ด้วยเหตุผลที่คาดไว้ก่อนเขียน implementation
- ใช้ Server Components เป็นค่าเริ่มต้น และใช้ Client Component เฉพาะ dialog state, fetch และ refresh
- ตรวจ responsive ที่ประมาณ 375px, 768px และ 1440px รวม light/dark mode

---

## File Structure

### Domain และ application

- `features/tournament-operations/domain/tournament-governance-policy.ts`: types, issue codes, transition matrix และ mutation guard ที่ไม่มี framework dependency
- `features/tournament-operations/application/govern-tournament.ts`: Platform Admin authorization และ orchestration ของ governance command
- `features/tournament-operations/presentation/tournament-governance-handler.ts`: Zod boundary และ governance command HTTP mapping
- `features/tournament-operations/presentation/tournament-governance-error-response.ts`: reusable `409` mapping สำหรับ mutation handlers เดิม
- `features/tournament-operations/domain/tournament-operation.ts`: governance fields และ audit action union ของ aggregate
- `features/identity/domain/permission.ts`: permission `tournament.registration.reopen`

### Persistence

- `prisma/migrations/20260822170000_add_tournament_governance/migration.sql`: enum, columns และ composite index แบบ additive
- `features/tournament-operations/infrastructure/tournament-operations-repository.ts`: governance context และ transactional mutation contracts
- `features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts`: context projection, recheck, transition, deletion และ audit transaction
- development/in-memory tournament operation repositories: behavior contract เดียวกันและ legacy JSON normalization

### Existing mutation boundaries

- tournament operations: update, submit, review, publish, close registration, start และ complete
- registrations: apply, cancel, decide และ withdraw
- tournament media: upload และ delete
- competition: bracket mode/lock/generate/publish, external revision, match create/schedule/purpose และ score/result

แต่ละ context จะส่ง `governanceStatus` และแต่ละ application use case จะเรียก shared guard ก่อน mutation

### Presentation

- `app/api/admin/tournaments/[id]/governance/route.ts`: POST command endpoint
- `app/(admin)/admin/tournaments/[id]/page.tsx`: governance Server Component
- `components/admin/tournament-governance-panel.tsx`: action availability และสถานะคำสั่ง
- `components/admin/tournament-governance-dialog.tsx`: reason/exact-title confirmation
- Admin tournament list, organizer tournament page และ public repositories: navigation, read-only state และ visibility

---

### Task 1: Governance Domain Policy และ Permissions

**Files:**
- Create: `features/tournament-operations/domain/tournament-governance-policy.ts`
- Modify: `features/tournament-operations/domain/tournament-operation.ts`
- Modify: `features/identity/domain/permission.ts`
- Test: `tests/features/tournament-operations/tournament-governance-policy.test.ts`
- Test: `tests/features/identity/permission.test.ts`

**Interfaces:**
- Consumes: existing `TournamentOperationStatus` and `Permission`
- Produces: `TournamentGovernanceStatus`, `TournamentGovernanceAction`, `TournamentGovernanceContext`, `TournamentGovernanceIssueCode`, `TournamentGovernancePolicyError`, `getTournamentGovernanceIssues(action, context, now, confirmationTitle?)`, `assertTournamentGovernanceAllowsOperation(status)`

- [ ] **Step 1: Write the failing policy tests**

```ts
const context: TournamentGovernanceContext = {
  tournamentId: "tournament-1",
  title: "COURTSIDE Open",
  organizerId: "organizer-1",
  status: "REGISTRATION_CLOSED",
  governanceStatus: "ACTIVE",
  version: 4,
  startsAt: "2026-11-15T02:00:00.000Z",
  reviewCount: 0,
  registrationCount: 4,
  bracketCount: 0,
  matchCount: 0,
  mediaAssetCount: 0,
  activeBracket: null,
}

expect(getTournamentGovernanceIssues("REOPEN_REGISTRATION", context, now))
  .toEqual([])
expect(getTournamentGovernanceIssues("PERMANENT_DELETE", context, now, "COURTSIDE Open"))
  .toContain("TOURNAMENT_STATUS_INVALID")
expect(() => assertTournamentGovernanceAllowsOperation("SUSPENDED"))
  .toThrowError(expect.objectContaining({ issues: ["TOURNAMENT_SUSPENDED"] }))
```

ครอบคลุม transition matrix ทั้งหกคำสั่ง, archived exclusions, startsAt, bracket published/locked/matches, dependent counts และ exact trimmed title
เพิ่ม legacy case ที่ `status === "SUSPENDED"` และ governance เป็น `SUSPENDED` แล้ว
คำสั่ง `RESUME` คืน `LEGACY_SUSPENDED_STATUS_REQUIRES_REVIEW` โดยไม่เดาสถานะเดิม

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- tests/features/tournament-operations/tournament-governance-policy.test.ts tests/features/identity/permission.test.ts`

Expected: FAIL เพราะยังไม่มี policy exports และ permission ใหม่

- [ ] **Step 3: Add domain contracts and pure policy**

```ts
export type TournamentGovernanceStatus = "ACTIVE" | "SUSPENDED" | "REMOVED"

export type TournamentGovernanceAction =
  | "SUSPEND"
  | "RESUME"
  | "REMOVE"
  | "ARCHIVE"
  | "REOPEN_REGISTRATION"
  | "PERMANENT_DELETE"

export function assertTournamentGovernanceAllowsOperation(
  status: TournamentGovernanceStatus,
): void {
  if (status === "SUSPENDED") {
    throw new TournamentGovernancePolicyError(["TOURNAMENT_SUSPENDED"])
  }
  if (status === "REMOVED") {
    throw new TournamentGovernancePolicyError(["TOURNAMENT_REMOVED"])
  }
}
```

`getTournamentGovernanceIssues` คืน typed issue array ตาม spec โดยไม่ throw เพื่อให้ Admin UI แสดง prerequisite ได้ ส่วน assertion wrappers throw `TournamentGovernancePolicyError`

- [ ] **Step 4: Extend aggregate and permissions**

เพิ่มใน `TournamentOperation`:

```ts
governanceStatus: TournamentGovernanceStatus
governanceReason: string | null
governanceUpdatedAt: string | null
```

เพิ่ม audit actions ทั้งหก และเพิ่ม `tournament.registration.reopen` เฉพาะ `PLATFORM_ADMIN`; organizer permissions ไม่เปลี่ยน

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm run test -- tests/features/tournament-operations/tournament-governance-policy.test.ts tests/features/identity/permission.test.ts`

Expected: PASS

- [ ] **Step 6: Commit domain checkpoint**

```powershell
git add -- features/tournament-operations/domain/tournament-governance-policy.ts features/tournament-operations/domain/tournament-operation.ts features/identity/domain/permission.ts tests/features/tournament-operations/tournament-governance-policy.test.ts tests/features/identity/permission.test.ts
git commit -m "feat(governance): define tournament control policies"
```

---

### Task 2: Prisma Schema และ Transactional Repository

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260822170000_add_tournament_governance/migration.sql`
- Modify: `features/tournament-operations/infrastructure/tournament-operations-repository.ts`
- Modify: `features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts`
- Modify: `features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts`
- Modify: `features/tournament-operations/infrastructure/development-tournament-operations-repository.ts`
- Test: `tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts`
- Test: `tests/features/tournament-operations/tournament-governance-repository.test.ts`
- Modify fixtures: `tests/features/tournament-operations/review-tournament.test.ts`, `tests/features/tournament-operations/tournament-lifecycle.test.ts`, `tests/features/tournament-operations/tournament-competition-lifecycle.test.ts`, `tests/features/tournament-operations/tournament-workflow.test.ts`
- Modify fixtures: `tests/features/tournament-media/get-public-tournament-media.test.ts`, `tests/features/tournament-media/upload-tournament-media.test.ts`, `tests/api/admin/review-tournament.test.ts`, `tests/api/admin/tournament-lifecycle.test.ts`, `tests/api/admin/tournament-submit.test.ts`, `tests/ui/admin/admin-tournament-list-page.test.tsx`, `tests/ui/admin/review-detail-page.test.tsx`

**Interfaces:**
- Consumes: Task 1 policy types and assertions
- Produces: `findGovernanceContext(id)`, `governWithVersion(input)`, `permanentlyDeleteWithVersion(input)` on `TournamentOperationsRepository`

- [ ] **Step 1: Write failing repository contract tests**

```ts
expect(await repository.findGovernanceContext("tournament-1"))
  .toEqual(expect.objectContaining({
    governanceStatus: "ACTIVE",
    registrationCount: 2,
    activeBracket: expect.objectContaining({ matchCount: 0 }),
  }))

await repository.governWithVersion({
  action: "SUSPEND",
  tournamentId: "tournament-1",
  expectedVersion: 4,
  sourceStatus: "REGISTRATION_CLOSED",
  sourceGovernanceStatus: "ACTIVE",
  targetStatus: "REGISTRATION_CLOSED",
  targetGovernanceStatus: "SUSPENDED",
  reason: "ตรวจสอบข้อมูลผู้จัด",
  actorId: "admin-1",
  at: "2026-08-22T10:00:00.000Z",
})
```

Assert updateMany filters both statuses and version, reason metadata is stored, specific audit plus `tournament.admin_override` are created, and policy is rechecked inside the transaction. Add deletion tests asserting dependencies block delete and an empty draft keeps audit with nullable tournament relation.

- [ ] **Step 2: Run repository tests and verify RED**

Run: `npm run test -- tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts tests/features/tournament-operations/tournament-governance-repository.test.ts`

Expected: FAIL because schema fields and repository methods do not exist

- [ ] **Step 3: Add additive Prisma migration**

```sql
CREATE TYPE "TournamentGovernanceStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REMOVED');

ALTER TABLE "Tournament"
ADD COLUMN "governanceStatus" "TournamentGovernanceStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "governanceReason" TEXT,
ADD COLUMN "governanceUpdatedAt" TIMESTAMP(3);

CREATE INDEX "Tournament_governanceStatus_status_idx"
ON "Tournament"("governanceStatus", "status");

UPDATE "Tournament"
SET "governanceStatus" = 'SUSPENDED',
    "governanceReason" = 'Legacy TournamentStatus.SUSPENDED requires manual review',
    "governanceUpdatedAt" = NOW()
WHERE "status" = 'SUSPENDED';
```

Run: `npx prisma validate && npm run prisma:generate`

Expected: schema valid and generated client supports governance fields; do not stage generated files

- [ ] **Step 4: Implement repository contracts and Prisma transactions**

```ts
export interface TournamentGovernanceTransition {
  action: Exclude<TournamentGovernanceAction, "PERMANENT_DELETE">
  tournamentId: string
  expectedVersion: number
  sourceStatus: TournamentOperationStatus
  sourceGovernanceStatus: TournamentGovernanceStatus
  targetStatus: TournamentOperationStatus
  targetGovernanceStatus: TournamentGovernanceStatus
  reason: string
  actorId: string
  at: string
}
```

`findGovernanceContext` ใช้ `_count` และ active bracket projection เท่านั้น `governWithVersion` โหลด context และเรียก policy ซ้ำใน transaction ก่อน updateMany `permanentlyDeleteWithVersion` recheck counts, สร้าง tombstone audit แล้ว delete ด้วย `id + version` ใช้ interactive transaction ระดับ `Serializable` และ map write conflict เป็น `CONFLICT` เพื่อป้องกัน dependency ที่ถูกเพิ่มพร้อมคำสั่งลบ

อัปเดต `TournamentOperation` literals ใน fixture files ที่ระบุให้มีค่าเริ่มต้นชุดเดียวกัน:

```ts
governanceStatus: "ACTIVE",
governanceReason: null,
governanceUpdatedAt: null,
```

- [ ] **Step 5: Normalize development adapters**

เมื่ออ่าน tournament ที่ไม่มีฟิลด์ใหม่ให้คืน:

```ts
{
  ...tournament,
  governanceStatus: tournament.governanceStatus ?? "ACTIVE",
  governanceReason: tournament.governanceReason ?? null,
  governanceUpdatedAt: tournament.governanceUpdatedAt ?? null,
}
```

เพิ่ม in-memory/development governance transitions, dependency-free context และ permanent delete สำหรับ test/dev contract โดย audit shape เหมือน Prisma

- [ ] **Step 6: Run focused repository tests and verify GREEN**

Run: `npm run test -- tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts tests/features/tournament-operations/tournament-governance-repository.test.ts`

Expected: PASS

- [ ] **Step 7: Commit persistence checkpoint**

```powershell
git add -- prisma/schema.prisma prisma/migrations/20260822170000_add_tournament_governance features/tournament-operations/infrastructure tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts tests/features/tournament-operations/tournament-governance-repository.test.ts
git commit -m "feat(governance): persist tournament controls"
```

---

### Task 3: Governance Use Case และ Route Handler

**Files:**
- Create: `features/tournament-operations/application/govern-tournament.ts`
- Create: `features/tournament-operations/presentation/tournament-governance-handler.ts`
- Create: `features/tournament-operations/presentation/tournament-governance-error-response.ts`
- Create: `app/api/admin/tournaments/[id]/governance/route.ts`
- Test: `tests/features/tournament-operations/govern-tournament.test.ts`
- Test: `tests/api/admin/tournament-governance.test.ts`
- Modify: `tests/api/shared/route-boundary.test.ts`

**Interfaces:**
- Consumes: Task 2 repository methods
- Produces: `governTournament(repository, command, actor, { now })`, `handleTournamentGovernance(request, tournamentId, dependencies)` และ `tournamentGovernanceFailureResponse(error)`

- [ ] **Step 1: Write failing application tests**

```ts
await expect(governTournament(repository, {
  action: "SUSPEND",
  tournamentId: "tournament-1",
  version: 4,
  reason: "ตรวจสอบข้อมูลผู้จัด",
}, organizer, { now })).rejects.toThrow("FORBIDDEN")

expect(await governTournament(repository, reopenCommand, admin, { now }))
  .toEqual(expect.objectContaining({ status: "PUBLISHED", version: 5 }))
```

Cover all command mappings, trimmed reason, stale version, policy errors and exact-title delete.

- [ ] **Step 2: Run application tests and verify RED**

Run: `npm run test -- tests/features/tournament-operations/govern-tournament.test.ts`

Expected: FAIL because use case does not exist

- [ ] **Step 3: Implement Admin-only orchestration**

Use `authorize(actor, permission, { organizerId })`, require `actor.role === "PLATFORM_ADMIN"`, compare input version with context, obtain issues from policy, then map action to a repository transition. Client input never supplies target statuses.

```ts
const permissionByAction = {
  SUSPEND: "tournament.suspend",
  RESUME: "tournament.suspend",
  REMOVE: "tournament.remove",
  ARCHIVE: "tournament.archive",
  REOPEN_REGISTRATION: "tournament.registration.reopen",
  PERMANENT_DELETE: "tournament.remove",
} as const
```

- [ ] **Step 4: Write failing Route Handler tests**

Cover unauthenticated `401`, non-admin `403`, malformed/blank/overlong reason `422`, missing `404`, stale/state conflict `409`, successful transition `200`, successful hard delete `204`, and safe-boundary diagnostics without logging reason payload.

- [ ] **Step 5: Run route tests and verify RED**

Run: `npm run test -- tests/api/admin/tournament-governance.test.ts tests/api/shared/route-boundary.test.ts`

Expected: FAIL because handler and route do not exist

- [ ] **Step 6: Implement Zod discriminated command boundary**

```ts
const baseCommand = {
  version: z.number().int().nonnegative(),
  reason: z.string().trim().min(1).max(500),
}

const governanceCommandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("SUSPEND"), ...baseCommand }),
  z.object({ action: z.literal("RESUME"), ...baseCommand }),
  z.object({ action: z.literal("REMOVE"), ...baseCommand }),
  z.object({ action: z.literal("ARCHIVE"), ...baseCommand }),
  z.object({ action: z.literal("REOPEN_REGISTRATION"), ...baseCommand }),
  z.object({
    action: z.literal("PERMANENT_DELETE"),
    ...baseCommand,
    confirmationTitle: z.string().trim().min(1),
  }),
])
```

Map policy issues to a Thai message plus `issues`, return no body for `204`, and wrap unexpected failures with `withSafeRouteBoundary`

`tournamentGovernanceFailureResponse` รับ `TournamentGovernancePolicyError` และคืน
`409` พร้อมข้อความ "รายการแข่งขันถูกระงับหรือถูกนำออก กรุณาตรวจสอบสถานะล่าสุด"
กับ typed `issues`; error ชนิดอื่นคืน `null` เพื่อให้ handler เดิม map ต่อ

- [ ] **Step 7: Run focused tests and verify GREEN**

Run: `npm run test -- tests/features/tournament-operations/govern-tournament.test.ts tests/api/admin/tournament-governance.test.ts tests/api/shared/route-boundary.test.ts`

Expected: PASS

- [ ] **Step 8: Commit command checkpoint**

```powershell
git add -- features/tournament-operations/application/govern-tournament.ts features/tournament-operations/presentation/tournament-governance-handler.ts features/tournament-operations/presentation/tournament-governance-error-response.ts 'app/api/admin/tournaments/[id]/governance/route.ts' tests/features/tournament-operations/govern-tournament.test.ts tests/api/admin/tournament-governance.test.ts tests/api/shared/route-boundary.test.ts
git commit -m "feat(governance): expose admin tournament commands"
```

---

### Task 4: Block Tournament, Registration และ Media Mutations

**Files:**
- Modify: `features/tournament-operations/application/create-tournament.ts`
- Modify: `features/tournament-operations/application/review-tournament.ts`
- Modify: `features/tournament-operations/application/transition-tournament-lifecycle.ts`
- Modify: `features/tournament-operations/application/transition-tournament-competition.ts`
- Modify: `features/registrations/application/ports/registration-repository.ts`
- Modify: `features/registrations/application/apply-to-tournament.ts`
- Modify: `features/registrations/application/cancel-registration.ts`
- Modify: `features/registrations/application/decide-registration.ts`
- Modify: `features/registrations/application/withdraw-registration.ts`
- Modify: `features/registrations/infrastructure/prisma-registration-repository.ts`
- Modify: `features/tournament-media/application/authorize-tournament-media.ts`
- Modify: `features/admin/presentation/save-tournament-handler.ts`
- Modify: `features/admin/presentation/submit-tournament-handler.ts`
- Modify: `features/admin/presentation/review-tournament-handler.ts`
- Modify: `features/admin/presentation/tournament-lifecycle-handler.ts`
- Modify: `features/registrations/presentation/registration-handler.ts`
- Modify: `app/api/admin/tournaments/[id]/media/route.ts`
- Modify: `app/api/admin/tournaments/[id]/media/[assetId]/route.ts`
- Modify: registration/tournament-operation development test doubles that implement changed contracts
- Test: `tests/features/tournament-operations/tournament-lifecycle.test.ts`
- Test: `tests/features/tournament-operations/tournament-competition-lifecycle.test.ts`
- Test: `tests/features/registrations/apply-to-tournament.test.ts`
- Test: `tests/features/registrations/decide-registration.test.ts`
- Test: `tests/features/registrations/cancel-registration.test.ts`
- Test: `tests/features/registrations/withdraw-registration.test.ts`
- Test: `tests/features/tournament-media/upload-tournament-media.test.ts`
- Test: `tests/features/tournament-media/delete-tournament-media.test.ts`

**Interfaces:**
- Consumes: `assertTournamentGovernanceAllowsOperation`
- Produces: every existing non-competition mutation rejects `SUSPENDED` and `REMOVED`

- [ ] **Step 1: Add failing mutation guard tests**

For each mutation family, add one `SUSPENDED` case and one representative `REMOVED` case, assert repository mutation/storage calls are not made:

```ts
await expect(applyToTournament(input, actor, dependencies))
  .rejects.toThrowError(expect.objectContaining({ issues: ["TOURNAMENT_SUSPENDED"] }))
expect(repository.createPending).not.toHaveBeenCalled()
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test -- tests/features/tournament-operations/tournament-lifecycle.test.ts tests/features/tournament-operations/tournament-competition-lifecycle.test.ts tests/features/registrations tests/features/tournament-media/upload-tournament-media.test.ts tests/features/tournament-media/delete-tournament-media.test.ts`

Expected: new guard assertions fail because mutations still proceed

- [ ] **Step 3: Extend registration contexts and Prisma projections**

Add `governanceStatus: TournamentGovernanceStatus` to `RegistrationApplicationContext.tournament`, `RegistrationReviewTournament`, and the tournament projection used by cancel. Map Prisma `tournament.governanceStatus` in application/review contexts and call the shared guard inside each transaction before create/approve/reject/withdraw/cancel.

- [ ] **Step 4: Guard tournament operation and media use cases**

Call `assertTournamentGovernanceAllowsOperation(tournament.governanceStatus)` after authorization and before lifecycle validation in update, submit, review, publish, close, start and complete. In `authorizeTournamentMediaMutation`, call the same guard before returning the tournament so upload never touches Storage while blocked.

เรียก `tournamentGovernanceFailureResponse(error)` ก่อน unexpected error mapper ใน Admin,
registration และ media presentation boundaries เพื่อให้ direct HTTP mutation ตอบ `409`
พร้อม issue code แทน `500`

- [ ] **Step 5: Run focused tests and verify GREEN**

Run the command from Step 2.

Expected: PASS and all mutation spies remain untouched for non-active governance

- [ ] **Step 6: Commit non-competition guard checkpoint**

```powershell
git add -- features/tournament-operations/application features/registrations features/tournament-media/application tests/features/tournament-operations tests/features/registrations tests/features/tournament-media
git commit -m "feat(governance): block suspended tournament mutations"
```

---

### Task 5: Block Competition Mutations

**Files:**
- Modify: `features/competition/domain/competition.ts`
- Modify: `features/competition/application/ports/competition-repository.ts`
- Modify: `features/competition/application/ports/external-bracket-repository.ts`
- Modify: `features/competition/application/select-bracket-mode.ts`
- Modify: `features/competition/application/lock-bracket-entries.ts`
- Modify: `features/competition/application/generate-bracket.ts`
- Modify: `features/competition/application/publish-bracket.ts`
- Modify: `features/competition/application/upload-external-bracket.ts`
- Modify: `features/competition/application/publish-external-bracket.ts`
- Modify: `features/competition/application/retire-external-bracket.ts`
- Modify: `features/competition/application/create-external-match.ts`
- Modify: `features/competition/application/update-external-match-purpose.ts`
- Modify: `features/competition/application/schedule-match.ts`
- Modify: `features/competition/application/record-match-score.ts`
- Modify: `features/competition/application/confirm-match-result.ts`
- Modify: `features/competition/application/correct-match-result.ts`
- Modify: `features/competition/application/external-bracket-access.ts`
- Modify: `features/competition/application/match-result-access.ts`
- Modify: `features/competition/presentation/competition-handler.ts`
- Modify: `features/competition/presentation/external-bracket-handler.ts`
- Modify: `features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts`
- Modify: `features/competition/infrastructure/prisma-competition-repository.ts`
- Modify: `features/competition/infrastructure/prisma-external-bracket-repository.ts`
- Modify: development/demo competition adapters and fixtures implementing changed contracts
- Test: `tests/features/competition/competition-use-cases.test.ts`
- Test: `tests/features/competition/external-bracket-use-cases.test.ts`
- Test: `tests/features/competition/external-match-operations.test.ts`
- Test: `tests/features/competition/prisma-competition-repository.test.ts`
- Test: `tests/features/competition/prisma-external-bracket-repository.test.ts`

**Interfaces:**
- Consumes: Task 1 shared governance guard
- Produces: every bracket, schedule, score and result mutation carries and enforces `tournamentGovernanceStatus`

- [ ] **Step 1: Write failing competition guard tests**

Add suspended cases for mode selection, lock, generation, publication, external upload/publication/retirement, external match creation/purpose, scheduling, score, confirmation and correction. Assert no persistence or Storage operation happens after context load.

```ts
context.tournamentGovernanceStatus = "SUSPENDED"
await expect(scheduleMatch(input, actor, dependencies))
  .rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
expect(competitions.scheduleMatch).not.toHaveBeenCalled()
```

- [ ] **Step 2: Run competition tests and verify RED**

Run: `npm run test -- tests/features/competition/competition-use-cases.test.ts tests/features/competition/external-bracket-use-cases.test.ts tests/features/competition/external-match-operations.test.ts`

Expected: new cases fail because contexts do not carry governance status

- [ ] **Step 3: Extend all mutation contexts**

Add `tournamentGovernanceStatus: TournamentGovernanceStatus` to lifecycle, lock, generation, publication, workspace, mode, external revision, external match, schedule, result and correction contexts. Select/map Prisma `tournament.governanceStatus` in both competition repositories and test doubles.

- [ ] **Step 4: Enforce guard before each mutation**

Immediately after context/authorization/version checks and before any mutation or Storage upload, call:

```ts
assertTournamentGovernanceAllowsOperation(
  context.tournamentGovernanceStatus,
)
```

Read-only organizer/public competition projections remain available according to Task 6 visibility rules; this step only blocks writes.

เพิ่ม `tournamentGovernanceFailureResponse` ใน competition, external-bracket และ
tournament lifecycle handlers เพื่อ map direct API calls เป็น `409` พร้อม issue code
ชุดเดียวกัน

- [ ] **Step 5: Run application and repository tests**

Run: `npm run test -- tests/features/competition`

Expected: PASS

- [ ] **Step 6: Commit competition guard checkpoint**

```powershell
git add -- features/competition tests/features/competition
git commit -m "feat(governance): protect competition operations"
```

---

### Task 6: Public Visibility, Organizer Read-only State และ Admin Governance Page

**Files:**
- Modify: `features/tournaments/infrastructure/prisma-tournament-repository.ts`
- Modify: `features/tournaments/infrastructure/mock-tournament-repository.ts`
- Modify: `features/tournaments/infrastructure/mock-tournament-data.ts`
- Modify: `features/tournament-media/application/get-public-tournament-media.ts`
- Modify: `features/competition/infrastructure/prisma-external-bracket-repository.ts`
- Modify: `app/(admin)/admin/tournaments/page.tsx`
- Create: `app/(admin)/admin/tournaments/[id]/page.tsx`
- Create: `components/admin/tournament-governance-panel.tsx`
- Create: `components/admin/tournament-governance-dialog.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/page.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/bracket/page.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/registrations/page.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/schedule/page.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/results/page.tsx`
- Modify: `components/admin/tournament-editor.tsx`
- Test: `tests/features/tournaments/prisma-tournament-repository.test.ts`
- Test: `tests/features/tournament-media/get-public-tournament-media.test.ts`
- Test: `tests/features/competition/prisma-external-bracket-repository.test.ts`
- Test: `tests/ui/admin/admin-tournament-list-page.test.tsx`
- Create: `tests/ui/admin/tournament-governance-page.test.tsx`
- Create: `tests/ui/admin/tournament-governance-dialog.test.tsx`
- Modify: `tests/ui/tournaments/public-tournament-states.test.tsx`
- Modify: organizer workspace UI tests affected by read-only state

**Interfaces:**
- Consumes: `findGovernanceContext`, policy issue projection and governance HTTP endpoint
- Produces: protected `/admin/tournaments/[id]`, accessible action dialogs, public filtering and organizer read-only UX

- [ ] **Step 1: Write failing visibility and Admin page tests**

Assert every public Prisma where includes `governanceStatus: "ACTIVE"`, public media returns no links for non-active governance, external bracket public lookup filters active governance, admin list links to `/admin/tournaments/tournament-1`, and governance page rejects non-admin actors.

- [ ] **Step 2: Write failing dialog tests**

```tsx
await user.click(screen.getByRole("button", { name: "ระงับรายการ" }))
await user.type(screen.getByLabelText("เหตุผล"), "ตรวจสอบข้อมูลผู้จัด")
await user.click(screen.getByRole("button", { name: "ยืนยันการระงับ" }))

expect(fetch).toHaveBeenCalledWith(
  "/api/admin/tournaments/tournament-1/governance",
  expect.objectContaining({ method: "POST" }),
)
expect(refresh).toHaveBeenCalled()
```

Cover pending disabled state, Thai API errors, `aria-live`, exact title for permanent delete, and unavailable-action prerequisite copy.

- [ ] **Step 3: Run UI/visibility tests and verify RED**

Run: `npm run test -- tests/features/tournaments/prisma-tournament-repository.test.ts tests/features/tournament-media/get-public-tournament-media.test.ts tests/features/competition/prisma-external-bracket-repository.test.ts tests/ui/admin tests/ui/tournaments/public-tournament-states.test.tsx`

Expected: fail because filters, route and UI do not exist

- [ ] **Step 4: Implement active-only public reads**

Add `governanceStatus: "ACTIVE"` to list, detail, competition and external bracket public Prisma conditions. Mock data gains governance fields and mock repository uses the same filter. `getPublicTournamentMedia` returns `{ posterUrl: undefined, documents: [] }` for non-active governance rather than exposing a poster URL.

- [ ] **Step 5: Implement Admin Server Component and actions**

The page obtains current actor, requires `PLATFORM_ADMIN`, loads `findGovernanceContext`, computes `getTournamentGovernanceIssues` for each action and renders status/dependency rows. `TournamentGovernancePanel` receives view-ready data only; `TournamentGovernanceDialog` owns reason/title input, POST, error announcement and `router.refresh()`.

- [ ] **Step 6: Implement organizer state behavior**

For `SUSPENDED`, owner pages show a bordered Thai notice and read-only tournament identity while omitting editor submit, media, registration decisions, bracket, schedule and result controls. For `REMOVED`, organizer pages call `notFound()`. Platform Admin reaches operations through the governance page and can resume before further edits.

- [ ] **Step 7: Run UI/visibility tests and verify GREEN**

Run the command from Step 3, then:

Run: `npm run test -- tests/ui/organizer tests/ui/tournaments`

Expected: PASS

- [ ] **Step 8: Commit presentation checkpoint**

```powershell
git add -- features/tournaments features/tournament-media/application/get-public-tournament-media.ts features/competition/infrastructure/prisma-external-bracket-repository.ts 'app/(admin)/admin/tournaments' 'app/(admin)/organizer/tournaments' components/admin tests/features/tournaments tests/features/tournament-media/get-public-tournament-media.test.ts tests/features/competition/prisma-external-bracket-repository.test.ts tests/ui/admin tests/ui/organizer tests/ui/tournaments
git commit -m "feat(governance): manage tournament availability"
```

---

### Task 7: Migration, Documentation และ End-to-End Verification

**Files:**
- Modify: `docs/ROADMAP.md`
- Modify: `README.md` only if environment/migration commands need clarification
- Test: full repository test suite and browser workflow

**Interfaces:**
- Consumes: Tasks 1-6 complete implementation
- Produces: migrated development DB, authoritative roadmap and verified responsive workflow

- [ ] **Step 1: Run independent verification before database access**

```powershell
npx prisma validate
npm run test
npm run lint
npm run build
git diff --check
git status --short
```

Expected: Prisma valid, all tests/lint/build pass, no whitespace errors, and only known unrelated tooling paths remain untracked

- [ ] **Step 2: Confirm migration target without printing secrets**

Run a script/command that parses `DATABASE_URL` and prints only host, database and schema. Confirm it is the approved Supabase development project `tospybqevfsihfitwuuf`; do not print username, password, query credentials or service key.

- [ ] **Step 3: Apply migration and verify status**

```powershell
npm run prisma:migrate
npx prisma migrate status
```

Expected: `20260822170000_add_tournament_governance` applied and database schema up to date; do not reset database

- [ ] **Step 4: Update authoritative roadmap**

Move tournament governance out of “กำลังพัฒนา” and record delivered commands, admin-only scope, audit behavior, public filtering and remaining limitation that `REMOVED` restore is not included.

- [ ] **Step 5: Run authenticated browser QA**

Use the development Admin session and verify two cases:

1. `COMPLETED -> ARCHIVED`: reason required, status refreshes, public results remain visible, mutation controls disappear
2. `REGISTRATION_CLOSED -> SUSPENDED -> RESUME -> REOPEN_REGISTRATION`: public page disappears while suspended, direct mutation returns conflict, resume restores the same lifecycle status, reopen is blocked when bracket entries are locked and succeeds for an unlocked no-match tournament

Also verify permanent-delete title confirmation on an empty draft without deleting any populated sample tournament.

- [ ] **Step 6: Verify responsive and theme behavior**

At 375px, 768px and 1440px verify no horizontal page overflow, dialog content fits, Thai reason/error copy wraps, touch controls remain usable, and light/dark status labels do not rely on color alone.

- [ ] **Step 7: Run final evidence suite**

```powershell
npm run test
npm run lint
npm run build
npx prisma validate
npx prisma migrate status
git diff --check
git status --short
```

Expected: all checks pass and generated/build/local tooling files are not staged

- [ ] **Step 8: Commit documentation and push requested branch**

```powershell
git add -- docs/ROADMAP.md README.md
git commit -m "docs(governance): update delivery status"
git push origin feat/courtside-public-platform
```

If `README.md` has no required change, stage only `docs/ROADMAP.md`. Report exact test counts, migration status, QA viewports, commit hashes and any workflow not manually verified.

---

## Plan Completion Criteria

- Admin can execute every approved governance command through UI and API
- Every command is versioned, policy-checked transactionally and audited with reason
- Suspended/removed tournaments are absent from all public discovery and public asset paths
- Existing mutation endpoints cannot bypass governance by direct HTTP calls
- Archive retains public results; reopen never invalidates a locked/published bracket
- Permanent delete cannot remove any tournament with business/media dependencies
- Full automated suite, lint, build, Prisma validation/migration status and responsive browser QA provide completion evidence
