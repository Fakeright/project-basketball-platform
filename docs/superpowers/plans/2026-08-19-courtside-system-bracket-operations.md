# COURTSIDE System Bracket Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ส่งมอบ workflow ล็อกรายชื่อ สร้างและเผยแพร่ Single-elimination Bracket จัดตาราง บันทึกและยืนยันคะแนน และเลื่อนผู้ชนะอัตโนมัติสำหรับ Tournament ที่ผู้จัดเป็นเจ้าของ

**Architecture:** เพิ่ม feature boundary `features/competition` ตาม Clean Architecture โดย Domain สร้าง bracket plan แบบ deterministic, Application บังคับ permission/ownership/lifecycle/transaction และ Infrastructure map plan ลง Prisma models ระบบเก็บ Match จริงจำนวน `N-1`; Bye ถูกเก็บเป็น `BracketEntry.startRoundSequence` และเติมทีมเข้ารอบที่เริ่มโดยไม่สร้าง MatchResult ปลอม

**Tech Stack:** Next.js 16.2.11 App Router, React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui/Base UI, Prisma ORM, Supabase PostgreSQL, Vitest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-08-18-courtside-competition-bracket-design.md`

## Global Constraints

- รองรับเฉพาะ Single-elimination จำนวน 2-32 ทีมในแผนนี้
- ใช้ทีมจาก Registration สถานะ `APPROVED` หลัง Tournament เป็น `REGISTRATION_CLOSED` เท่านั้น
- Organizer ดำเนินการได้เฉพาะ Tournament ที่ตนเป็นเจ้าของ; Platform Admin ใช้ override พร้อมเหตุผล
- ทุก mutation ตรวจ expected version และบันทึก audit event
- การยืนยันผลและเลื่อนผู้ชนะต้องอยู่ใน database transaction เดียว
- คะแนนเป็นจำนวนเต็มไม่ติดลบและห้ามเสมอ
- ห้ามเปลี่ยน Entry, Mode หรือโครงสร้างหลัง Match เริ่ม
- User-facing copy เป็นภาษาไทยและ server validation เป็น authoritative
- Server Components เป็นค่าเริ่มต้น; ใช้ Client Components เฉพาะ interaction
- ตรวจ responsive ที่ประมาณ 375px, 768px และ 1440px ทั้ง light/dark mode
- ห้ามเพิ่มบทบาทกรรมการ และยังไม่ทำ External Bracket File ในแผนนี้

---

## File Structure

### Domain

- `features/competition/domain/competition.ts`: shared domain types และ state shapes
- `features/competition/domain/bracket-policy.ts`: lifecycle, entry, seed และ score assertions
- `features/competition/domain/bracket-generator.ts`: deterministic mirrored placement, Bye และ `N-1` match plan
- `features/competition/domain/match-result-policy.ts`: winner selection และ next-slot advancement decision

### Application

- `features/competition/application/ports/competition-repository.ts`: query/mutation/transaction contracts
- `features/competition/application/get-organizer-competition.ts`: protected workspace query
- `features/competition/application/lock-bracket-entries.ts`: approved registration snapshot lock/unlock
- `features/competition/application/generate-bracket.ts`: Seed/Random generation orchestration
- `features/competition/application/publish-bracket.ts`: publish/unpublish lifecycle
- `features/competition/application/schedule-match.ts`: schedule mutation
- `features/competition/application/record-match-score.ts`: draft score mutation
- `features/competition/application/confirm-match-result.ts`: atomic confirmation and advancement
- `features/competition/application/get-competition-summary.ts`: Winner/Runner-up/elimination summary

### Infrastructure

- `features/competition/infrastructure/prisma-competition-repository.ts`: Prisma adapter and transaction implementation
- `features/competition/infrastructure/get-competition-repository.ts`: composition factory
- `features/competition/infrastructure/development-competition-repository.ts`: development fallback matching current repository pattern

### Presentation

- `features/competition/presentation/competition-handler.ts`: Zod parsing and HTTP mapping
- `components/organizer/competition-workspace-nav.tsx`: local tournament operation navigation
- `components/organizer/bracket-entry-lock.tsx`: lock/unlock controls
- `components/organizer/bracket-generation-form.tsx`: Seed/Random configuration
- `components/organizer/bracket-preview.tsx`: protected draft preview
- `components/organizer/match-schedule-editor.tsx`: schedule table/form
- `components/organizer/match-result-editor.tsx`: draft score and confirm controls
- `components/bracket-view.tsx`: public generated bracket rendering

### Routes And Pages

- `app/(admin)/organizer/tournaments/[id]/bracket/page.tsx`
- `app/(admin)/organizer/tournaments/[id]/schedule/page.tsx`
- `app/(admin)/organizer/tournaments/[id]/results/page.tsx`
- `app/api/organizer/tournaments/[id]/bracket/entries/route.ts`
- `app/api/organizer/tournaments/[id]/bracket/generate/route.ts`
- `app/api/organizer/tournaments/[id]/bracket/publication/route.ts`
- `app/api/organizer/tournaments/[id]/matches/[matchId]/schedule/route.ts`
- `app/api/organizer/tournaments/[id]/matches/[matchId]/score/route.ts`
- `app/api/organizer/tournaments/[id]/matches/[matchId]/confirm/route.ts`

---

### Task 1: Competition Domain Types And Policies

**Files:**
- Create: `features/competition/domain/competition.ts`
- Create: `features/competition/domain/bracket-policy.ts`
- Create: `features/competition/domain/match-result-policy.ts`
- Create: `tests/features/competition/bracket-policy.test.ts`
- Create: `tests/features/competition/match-result-policy.test.ts`

**Interfaces:**
- Produces: `BracketMode`, `BracketGenerationMethod`, `CompetitionTournamentStatus`, `LockedBracketEntry`, `CompetitionMatch`, `assertEntriesCanBeLocked`, `assertBracketStructureMutable`, `validateSeeds`, `assertScoreCanBeConfirmed`, `decideMatchAdvancement`
- Consumes: no framework or infrastructure imports

- [x] **Step 1: Write failing lifecycle, seed, and score policy tests**

```ts
import { describe, expect, it } from "vitest"

import {
  assertBracketStructureMutable,
  assertEntriesCanBeLocked,
  assertScoreCanBeConfirmed,
  validateSeeds,
} from "@/features/competition/domain/bracket-policy"

describe("competition bracket policy", () => {
  it("allows locking 2-32 approved teams after registration closes", () => {
    expect(() => assertEntriesCanBeLocked({
      tournamentStatus: "REGISTRATION_CLOSED",
      approvedTeamIds: ["team-1", "team-2"],
      capacity: 6,
    })).not.toThrow()
  })

  it.each([1, 33])("rejects %s entries", (count) => {
    expect(() => assertEntriesCanBeLocked({
      tournamentStatus: "REGISTRATION_CLOSED",
      approvedTeamIds: Array.from({ length: count }, (_, index) => `team-${index}`),
      capacity: 32,
    })).toThrow("BRACKET_ENTRY_COUNT_INVALID")
  })

  it("rejects duplicate seeds", () => {
    expect(() => validateSeeds([
      { entryId: "entry-1", seed: 1 },
      { entryId: "entry-2", seed: 1 },
    ])).toThrow("BRACKET_SEED_INVALID")
  })

  it("locks structure after a match starts", () => {
    expect(() => assertBracketStructureMutable({ hasStartedMatch: true }))
      .toThrow("BRACKET_STRUCTURE_LOCKED")
  })

  it.each([[10, 10], [-1, 2], [1.5, 2]])(
    "rejects invalid score %s-%s",
    (homeScore, awayScore) => {
      expect(() => assertScoreCanBeConfirmed({ homeScore, awayScore }))
        .toThrow("MATCH_SCORE_INVALID")
    },
  )
})
```

- [x] **Step 2: Run policy tests and verify missing-module failures**

Run: `npx vitest run tests/features/competition/bracket-policy.test.ts tests/features/competition/match-result-policy.test.ts`

Expected: FAIL because the competition domain modules do not exist.

- [x] **Step 3: Define framework-free domain types**

```ts
export type BracketMode = "SYSTEM_GENERATED" | "EXTERNAL_DOCUMENT"
export type BracketGenerationMethod = "SEEDED" | "RANDOM"
export type MatchSlot = "HOME" | "AWAY"
export type CompetitionTournamentStatus =
  | "REGISTRATION_CLOSED"
  | "IN_PROGRESS"
  | "COMPLETED"

export interface LockedBracketEntry {
  id: string
  bracketId: string
  registrationId: string
  teamId: string
  teamNameSnapshot: string
  seed: number
  drawPosition: number
  startRoundSequence: number
}
```

- [x] **Step 4: Implement explicit policy errors and advancement decision**

```ts
export function assertScoreCanBeConfirmed(input: {
  homeScore: number
  awayScore: number
}) {
  if (
    !Number.isInteger(input.homeScore) ||
    !Number.isInteger(input.awayScore) ||
    input.homeScore < 0 ||
    input.awayScore < 0 ||
    input.homeScore === input.awayScore
  ) {
    throw new Error("MATCH_SCORE_INVALID")
  }
}

export function decideMatchAdvancement(input: {
  homeTeamId: string
  awayTeamId: string
  homeScore: number
  awayScore: number
  nextMatchId: string | null
  nextSlot: "HOME" | "AWAY" | null
}) {
  assertScoreCanBeConfirmed(input)
  return {
    winnerTeamId:
      input.homeScore > input.awayScore ? input.homeTeamId : input.awayTeamId,
    nextMatchId: input.nextMatchId,
    nextSlot: input.nextSlot,
  }
}
```

- [x] **Step 5: Run focused tests**

Run: `npx vitest run tests/features/competition/bracket-policy.test.ts tests/features/competition/match-result-policy.test.ts`

Expected: PASS.

- [x] **Step 6: Commit domain policy checkpoint**

```powershell
git add -- features/competition/domain tests/features/competition/bracket-policy.test.ts tests/features/competition/match-result-policy.test.ts
git commit -m "feat(competition): define bracket integrity policies"
```

### Task 2: Deterministic Single-Elimination Generator

**Files:**
- Create: `features/competition/domain/bracket-generator.ts`
- Create: `tests/features/competition/bracket-generator.test.ts`

**Interfaces:**
- Consumes: `LockedBracketEntry`, `MatchSlot` from Task 1
- Produces: `generateSingleEliminationBracket(input): GeneratedBracketPlan`
- `GeneratedBracketPlan` contains rounds, real matches, entry start rounds, and `matchCount === entries.length - 1`

- [ ] **Step 1: Write failing known-vector and Bye tests**

```ts
import { describe, expect, it } from "vitest"
import {
  generateSingleEliminationBracket,
  mirroredSeedOrder,
} from "@/features/competition/domain/bracket-generator"

describe("single elimination generator", () => {
  it.each([
    [2, [1, 2]],
    [4, [1, 4, 2, 3]],
    [8, [1, 8, 4, 5, 2, 7, 3, 6]],
    [16, [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11]],
  ])("creates mirrored order for size %s", (size, expected) => {
    expect(mirroredSeedOrder(size)).toEqual(expected)
  })

  it.each([2, 6, 10, 14, 32])("creates N-1 real matches for %s teams", (count) => {
    const plan = generateSingleEliminationBracket({
      entries: Array.from({ length: count }, (_, index) => ({
        entryId: `entry-${index + 1}`,
        teamId: `team-${index + 1}`,
        seed: index + 1,
      })),
    })
    expect(plan.matches).toHaveLength(count - 1)
  })

  it("starts seeds 1 and 2 in the semifinal for six teams", () => {
    const plan = generateSingleEliminationBracket({ entries: seededEntries(6) })
    expect(plan.entryStarts).toEqual(expect.arrayContaining([
      { entryId: "entry-1", roundSequence: 2 },
      { entryId: "entry-2", roundSequence: 2 },
    ]))
  })
})
```

- [ ] **Step 2: Run generator tests and verify failure**

Run: `npx vitest run tests/features/competition/bracket-generator.test.ts`

Expected: FAIL because `bracket-generator.ts` is missing.

- [ ] **Step 3: Implement mirrored seed order recursively**

```ts
export function mirroredSeedOrder(size: number): number[] {
  if (size === 2) return [1, 2]
  if (!Number.isInteger(Math.log2(size)) || size < 2 || size > 32) {
    throw new Error("BRACKET_SIZE_INVALID")
  }
  const previous = mirroredSeedOrder(size / 2)
  return previous.flatMap((seed) => [seed, size + 1 - seed])
}
```

- [ ] **Step 4: Implement real-match planning without fake Bye results**

The implementation must allocate stable references by `{ roundSequence, sequence }`, propagate direct Bye entrants into their next slots, then create only nodes that will eventually contain two real entrants/winners. Every non-final match receives `nextMatchRef` and `nextSlot`.

```ts
export interface GeneratedMatchPlan {
  key: string
  roundSequence: number
  sequence: number
  homeTeamId: string | null
  awayTeamId: string | null
  homeSourceMatchKey: string | null
  awaySourceMatchKey: string | null
  nextMatchKey: string | null
  nextSlot: "HOME" | "AWAY" | null
}

export interface GeneratedBracketPlan {
  bracketSize: number
  rounds: Array<{ sequence: number; name: string }>
  matches: GeneratedMatchPlan[]
  entryStarts: Array<{ entryId: string; roundSequence: number }>
}
```

Assert after generation that keys are unique, all next references resolve, the final has no destination, and match count equals `entries.length - 1`; otherwise throw `BRACKET_PLAN_INVALID` before returning.

- [ ] **Step 5: Run generator tests**

Run: `npx vitest run tests/features/competition/bracket-generator.test.ts`

Expected: PASS for 2, 6, 10, 14, and 32 teams plus full seed vectors.

- [ ] **Step 6: Commit generator checkpoint**

```powershell
git add -- features/competition/domain/bracket-generator.ts tests/features/competition/bracket-generator.test.ts
git commit -m "feat(competition): generate deterministic elimination brackets"
```

### Task 3: Prisma Competition Schema And Repository Contracts

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260819090000_add_competition_operations/migration.sql`
- Create: `features/competition/application/ports/competition-repository.ts`
- Create: `features/competition/infrastructure/prisma-competition-repository.ts`
- Create: `features/competition/infrastructure/get-competition-repository.ts`
- Create: `features/competition/infrastructure/development-competition-repository.ts`
- Create: `tests/features/competition/prisma-competition-repository.test.ts`

**Interfaces:**
- Consumes: domain types and `GeneratedBracketPlan`
- Produces: `CompetitionRepository`, `CompetitionRepositoryTransaction`, `PrismaCompetitionRepository`, `getCompetitionRepository`

- [ ] **Step 1: Write failing repository contract tests**

Cover approved-registration snapshot loading, one active bracket, version conflict, atomic plan persistence, schedule update, draft score, and atomic result advancement.

```ts
expect(prisma.$transaction).toHaveBeenCalledOnce()
expect(transaction.bracketEntry.createMany).toHaveBeenCalled()
expect(transaction.match.createMany).toHaveBeenCalled()
expect(transaction.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
  data: expect.objectContaining({ action: "BRACKET_GENERATED" }),
}))
```

- [ ] **Step 2: Run repository tests and verify missing contract failure**

Run: `npx vitest run tests/features/competition/prisma-competition-repository.test.ts`

Expected: FAIL because the repository modules and schema fields are absent.

- [ ] **Step 3: Extend Prisma schema**

Add enums and fields with explicit relations and indexes:

```prisma
enum BracketMode {
  SYSTEM_GENERATED
  EXTERNAL_DOCUMENT
}

enum BracketGenerationMethod {
  SEEDED
  RANDOM
}

enum MatchSlot {
  HOME
  AWAY
}

model BracketEntry {
  id                 String       @id @default(cuid())
  bracketId          String
  registrationId     String
  teamId             String
  teamNameSnapshot   String
  seed               Int
  drawPosition       Int
  startRoundSequence Int
  bracket            Bracket      @relation(fields: [bracketId], references: [id], onDelete: Cascade)
  registration       Registration @relation(fields: [registrationId], references: [id], onDelete: Restrict)
  team               Team         @relation(fields: [teamId], references: [id], onDelete: Restrict)
  createdAt          DateTime      @default(now())

  @@unique([bracketId, registrationId])
  @@unique([bracketId, teamId])
  @@unique([bracketId, seed])
  @@index([bracketId, drawPosition])
}
```

Extend `Bracket` with `mode`, `version`, `entriesLockedAt`, `generationMethod`, `drawToken`, `publishedAt`, `archivedAt`, and `entries`. Extend `Match` with `nextMatchId`, `nextSlot`, a named self-relation, `updatedAt`, and index on `nextMatchId`. Add inverse relations to Registration and Team.

- [ ] **Step 4: Create migration with active-bracket partial unique index**

After Prisma-generated SQL, append and verify:

```sql
CREATE UNIQUE INDEX "Bracket_one_active_per_tournament"
ON "Bracket" ("tournamentId")
WHERE "status" <> 'ARCHIVED';
```

Do not drop existing Bracket, Round, Match, or Result rows. New required fields must use safe defaults or be nullable for existing development rows, followed by repository mapping that treats legacy rows as read-only until regenerated.

- [ ] **Step 5: Define repository contracts with transaction boundary**

```ts
export interface CompetitionRepositoryTransaction {
  findLockContext(tournamentId: string): Promise<BracketLockContext | null>
  lockEntries(input: LockEntriesMutation): Promise<CompetitionWorkspace>
  unlockEntries(input: UnlockEntriesMutation): Promise<CompetitionWorkspace>
  persistGeneratedPlan(input: PersistGeneratedPlanInput): Promise<CompetitionWorkspace>
  publishBracket(input: PublicationMutation): Promise<CompetitionWorkspace>
  scheduleMatch(input: ScheduleMatchMutation): Promise<CompetitionMatch>
  recordScore(input: RecordScoreMutation): Promise<CompetitionMatch>
  confirmResultAndAdvance(input: ConfirmResultMutation): Promise<CompetitionMatch>
  correctResultAndReplaceAdvancement(input: CorrectResultMutation): Promise<CompetitionMatch>
}

export interface CompetitionRepository extends CompetitionRepositoryTransaction {
  inTransaction<T>(operation: (repository: CompetitionRepositoryTransaction) => Promise<T>): Promise<T>
  findOrganizerWorkspace(tournamentId: string): Promise<CompetitionWorkspaceContext | null>
  findPublicByTournamentSlug(slug: string): Promise<PublicCompetitionBracket | null>
}
```

- [ ] **Step 6: Implement Prisma mapping and conditional update conflicts**

Use `updateMany({ where: { id, version }, data: { version: { increment: 1 } } })` and throw `CONFLICT` when count is not 1. `persistGeneratedPlan` resolves stable match keys to generated database IDs inside one transaction before setting `nextMatchId`.

- [ ] **Step 7: Generate Prisma client and validate migration**

Run:

```powershell
npx prisma generate
npx prisma validate
npx prisma migrate status
```

Expected: schema valid; migration is detected. Apply only to the approved development database with `npx prisma migrate dev` after confirming the datasource is the development Supabase project.

- [ ] **Step 8: Run repository tests**

Run: `npx vitest run tests/features/competition/prisma-competition-repository.test.ts`

Expected: PASS, including rollback assertions and safe legacy-row mapping.

- [ ] **Step 9: Commit schema/repository checkpoint**

```powershell
git add -- prisma/schema.prisma prisma/migrations/20260819090000_add_competition_operations features/competition/application/ports features/competition/infrastructure tests/features/competition/prisma-competition-repository.test.ts
git commit -m "feat(competition): persist bracket operations"
```

### Task 4: Entry Lock And Organizer Workspace Query

**Files:**
- Create: `features/competition/application/get-organizer-competition.ts`
- Create: `features/competition/application/lock-bracket-entries.ts`
- Create: `features/competition/presentation/competition-handler.ts`
- Create: `app/api/organizer/tournaments/[id]/bracket/entries/route.ts`
- Create: `tests/features/competition/competition-use-cases.test.ts`
- Create: `tests/api/competition/competition-routes.test.ts`

**Interfaces:**
- Consumes: `CompetitionRepository` from Task 3, `authorize`, current actor provider
- Produces: `getOrganizerCompetition`, `lockBracketEntries`, `unlockBracketEntries`, `handleLockEntries`, `handleUnlockEntries`

- [ ] **Step 1: Write failing use-case tests for ownership and lifecycle**

```ts
await expect(lockBracketEntries({ tournamentId: "t-2", expectedVersion: 0 }, organizer, deps))
  .rejects.toThrow("NOT_FOUND")

await expect(lockBracketEntries({ tournamentId: "t-1", expectedVersion: 0 }, organizer, deps))
  .resolves.toMatchObject({ entries: [{ teamId: "team-1" }, { teamId: "team-2" }] })
```

Assert `REGISTRATION_CLOSED`, approved-only entries, capacity, duplicate team rejection, 2-32 range, Admin ownership override audit flag, and unlock reason.

- [ ] **Step 2: Run use-case tests and verify failure**

Run: `npx vitest run tests/features/competition/competition-use-cases.test.ts`

Expected: FAIL because use cases do not exist.

- [ ] **Step 3: Implement protected workspace and lock use cases**

```ts
export async function lockBracketEntries(
  input: { tournamentId: string; expectedVersion: number },
  actor: Actor,
  dependencies: { competitions: CompetitionRepository; now: () => Date },
) {
  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await competitions.findLockContext(input.tournamentId)
    if (!context || (actor.role !== "PLATFORM_ADMIN" && context.organizerId !== actor.id)) {
      throw new Error("NOT_FOUND")
    }
    authorize(actor, "bracket.generate", { organizerId: context.organizerId })
    assertEntriesCanBeLocked(context)
    return competitions.lockEntries({
      ...input,
      actorId: actor.id,
      at: dependencies.now().toISOString(),
      adminOverride: actor.role === "PLATFORM_ADMIN",
    })
  })
}
```

- [ ] **Step 4: Write Route Handler tests before handlers**

Cover malformed JSON, `401`, non-owner `404`, invalid lifecycle/count `422`, stale version `409`, success `200`, unlock missing reason `422`, and unexpected safe diagnostics.

- [ ] **Step 5: Implement Zod handlers and route composition**

`POST` locks entries with `{ expectedVersion }`; `DELETE` unlocks with `{ expectedVersion, reason }`. Map domain errors to Thai messages without exposing another organizer's tournament.

- [ ] **Step 6: Run focused tests**

Run: `npx vitest run tests/features/competition/competition-use-cases.test.ts tests/api/competition/competition-routes.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit entry-lock checkpoint**

```powershell
git add -- features/competition/application/get-organizer-competition.ts features/competition/application/lock-bracket-entries.ts features/competition/presentation/competition-handler.ts app/api/organizer/tournaments tests/features/competition/competition-use-cases.test.ts tests/api/competition/competition-routes.test.ts
git commit -m "feat(competition): lock approved bracket entries"
```

### Task 5: Seeded And Random Draft Generation

**Files:**
- Create: `features/competition/application/generate-bracket.ts`
- Modify: `features/competition/presentation/competition-handler.ts`
- Create: `app/api/organizer/tournaments/[id]/bracket/generate/route.ts`
- Modify: `tests/features/competition/competition-use-cases.test.ts`
- Modify: `tests/api/competition/competition-routes.test.ts`

**Interfaces:**
- Consumes: locked entries, generator, repository transaction
- Produces: `generateBracketDraft`, `handleGenerateBracket`

- [ ] **Step 1: Add failing application tests**

Cover complete Seed list, duplicate/missing Seed, random order injection, stable redraw with same frozen order, explicit reroll token, structure locked after Match start, and atomic persistence.

```ts
const result = await generateBracketDraft({
  tournamentId: "t-1",
  expectedVersion: 2,
  method: "SEEDED",
  seeds: [
    { entryId: "entry-1", seed: 1 },
    { entryId: "entry-2", seed: 2 },
  ],
}, organizer, dependencies)
expect(result.matches).toHaveLength(1)
```

- [ ] **Step 2: Run generation use-case tests and verify failure**

Run: `npx vitest run tests/features/competition/competition-use-cases.test.ts -t "generate bracket"`

Expected: FAIL because `generateBracketDraft` is missing.

- [ ] **Step 3: Implement generation orchestration**

Inject `createDrawToken(): string` and `shuffle<T>(items: readonly T[], token: string): T[]` so tests never depend on ambient randomness. Persist both draw token and frozen entry order. Pass normalized seeds to `generateSingleEliminationBracket`, then persist within the same repository transaction.

- [ ] **Step 4: Add and implement handler contract**

```ts
const generateSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("SEEDED"),
    expectedVersion: z.number().int().nonnegative(),
    seeds: z.array(z.object({ entryId: z.string().min(1), seed: z.number().int().positive() })),
  }),
  z.object({
    method: z.literal("RANDOM"),
    expectedVersion: z.number().int().nonnegative(),
    redraw: z.boolean().default(false),
  }),
])
```

Return `200` with Draft workspace, `409` for stale/locked structure, and `422` for seed errors.

- [ ] **Step 5: Run generation route/use-case tests**

Run: `npx vitest run tests/features/competition/competition-use-cases.test.ts tests/api/competition/competition-routes.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit draft-generation checkpoint**

```powershell
git add -- features/competition/application/generate-bracket.ts features/competition/presentation/competition-handler.ts app/api/organizer/tournaments tests/features/competition/competition-use-cases.test.ts tests/api/competition/competition-routes.test.ts
git commit -m "feat(competition): generate bracket drafts"
```

### Task 6: Organizer Bracket Workspace UI

**Files:**
- Create: `components/organizer/competition-workspace-nav.tsx`
- Create: `components/organizer/bracket-entry-lock.tsx`
- Create: `components/organizer/bracket-generation-form.tsx`
- Create: `components/organizer/bracket-preview.tsx`
- Create: `app/(admin)/organizer/tournaments/[id]/bracket/page.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/page.tsx`
- Create: `tests/ui/organizer/bracket-workspace.test.tsx`
- Create: `tests/ui/organizer/bracket-page.test.tsx`

**Interfaces:**
- Consumes: `getOrganizerCompetition`, entry/generation routes
- Produces: accessible three-step workspace matching the approved mockup

- [ ] **Step 1: Write failing UI tests for the three-step workflow**

Test locked/unlocked states, approved-team count, Seed rows, Random option, duplicate Seed summary/focus, pending buttons, conflict recovery, Preview, and disabled mutation after Match start.

```tsx
expect(screen.getByRole("heading", { name: "จัดการสายการแข่งขัน" })).toBeTruthy()
expect(screen.getByText("01 ล็อกรายชื่อทีม")).toBeTruthy()
expect(screen.getByRole("radio", { name: "กำหนด Seed" })).toBeChecked()
```

- [ ] **Step 2: Run UI tests and verify missing components**

Run: `npx vitest run tests/ui/organizer/bracket-workspace.test.tsx tests/ui/organizer/bracket-page.test.tsx`

Expected: FAIL because the workspace is absent.

- [ ] **Step 3: Build Server Component page and local navigation**

Read async `params`, redirect anonymous users, map `FORBIDDEN/NOT_FOUND` to `notFound()`, and pass view-ready data to Client Components. Add links for registrations, bracket, schedule, and results to the Tournament workspace without changing global admin navigation.

- [ ] **Step 4: Build entry and generation controls**

Use native radio/segmented controls for Seed/Random, stable numeric inputs for Seed, visible labels, confirmation dialog for Unlock/Regenerate/Redraw, Thai errors, and focus the first invalid field. Do not implement drag-only sorting.

- [ ] **Step 5: Build protected draft preview**

Render rounds with fixed `auto-cols-[16rem]`, explicit Bye notes from `startRoundSequence`, horizontal scrolling only inside the bracket region, and no nested cards.

- [ ] **Step 6: Run UI tests**

Run: `npx vitest run tests/ui/organizer/bracket-workspace.test.tsx tests/ui/organizer/bracket-page.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit workspace UI checkpoint**

```powershell
git add -- components/organizer 'app/(admin)/organizer/tournaments' tests/ui/organizer
git commit -m "feat(competition): add organizer bracket workspace"
```

### Task 7: Bracket Publication And Public View

**Files:**
- Create: `features/competition/application/publish-bracket.ts`
- Modify: `features/competition/presentation/competition-handler.ts`
- Create: `app/api/organizer/tournaments/[id]/bracket/publication/route.ts`
- Modify: `features/tournaments/infrastructure/prisma-tournament-repository.ts`
- Modify: `components/bracket-view.tsx`
- Modify: `app/(public)/bracket/page.tsx`
- Modify: `tests/features/tournaments/prisma-tournament-repository.test.ts`
- Create: `tests/ui/tournaments/public-bracket.test.tsx`

**Interfaces:**
- Consumes: generated Draft and public repository
- Produces: `publishBracket`, `unpublishBracket`, public source label and generated bracket view

- [ ] **Step 1: Add failing publication lifecycle tests**

Cover publish only when entries/rounds/matches complete, unpublish reason, stale version, started-match block, owner/admin audit, and public invisibility while Draft.

- [ ] **Step 2: Run publication tests and verify failure**

Run: `npx vitest run tests/features/competition/competition-use-cases.test.ts -t "publish" tests/api/competition/competition-routes.test.ts -t "publication"`

Expected: FAIL because publication use cases/routes are missing.

- [ ] **Step 3: Implement publication use cases and route**

`POST` publishes `{ expectedVersion }`; `DELETE` unpublishes `{ expectedVersion, reason }`. Persist `publishedAt`, increment version, and audit in transaction.

- [ ] **Step 4: Write failing public repository/UI tests**

Assert only `PUBLISHED` bracket data appears, team names come from `BracketEntry.teamNameSnapshot`, source label is `สายการแข่งขันที่ระบบสร้าง`, Bye notes render, and empty state remains for unpublished Tournament.

- [ ] **Step 5: Extend public mapping and BracketView**

Do not infer rounds by insertion order. Sort by `round.sequence` then `match.sequence`. Add view-ready `source`, `status`, `winnerTeamId`, and Bye entry projections while preserving current `/bracket?tournament=<slug>` API.

- [ ] **Step 6: Run publication and public tests**

Run: `npx vitest run tests/features/competition/competition-use-cases.test.ts tests/api/competition/competition-routes.test.ts tests/features/tournaments/prisma-tournament-repository.test.ts tests/ui/tournaments/public-bracket.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit publication checkpoint**

```powershell
git add -- features/competition/application/publish-bracket.ts features/competition/presentation/competition-handler.ts app/api/organizer/tournaments features/tournaments/infrastructure/prisma-tournament-repository.ts components/bracket-view.tsx 'app/(public)/bracket/page.tsx' tests
git commit -m "feat(competition): publish generated brackets"
```

### Task 8: Match Scheduling

**Files:**
- Create: `features/competition/application/schedule-match.ts`
- Modify: `features/competition/presentation/competition-handler.ts`
- Create: `app/api/organizer/tournaments/[id]/matches/[matchId]/schedule/route.ts`
- Create: `components/organizer/match-schedule-editor.tsx`
- Create: `app/(admin)/organizer/tournaments/[id]/schedule/page.tsx`
- Create: `tests/ui/organizer/match-schedule-editor.test.tsx`
- Modify: `tests/features/competition/competition-use-cases.test.ts`
- Modify: `tests/api/competition/competition-routes.test.ts`

**Interfaces:**
- Produces: `scheduleMatch`, `handleScheduleMatch`, `MatchScheduleEditor`
- Consumes: Competition repository and Bangkok calendar helpers

- [ ] **Step 1: Write failing scheduling tests**

Cover owner permission, expected version, valid Bangkok datetime, court trim/length, Tournament date-range validation, override reason for Admin outside range, completed-match block, and audit.

- [ ] **Step 2: Run focused scheduling tests**

Run: `npx vitest run tests/features/competition/competition-use-cases.test.ts -t "schedule" tests/api/competition/competition-routes.test.ts -t "schedule"`

Expected: FAIL because scheduling modules are missing.

- [ ] **Step 3: Implement use case and handler**

```ts
const scheduleSchema = z.object({
  scheduledAt: z.iso.datetime(),
  court: z.string().trim().min(1).max(120),
  expectedVersion: z.number().int().nonnegative(),
  overrideReason: z.string().trim().max(500).optional(),
})
```

Store UTC, present Bangkok local time, and return `409` on stale/completed Match.

- [ ] **Step 4: Write and implement Schedule UI tests**

Use an operational table with Round, Match, teams, court, date/time, status, and Edit action. On mobile stack each edit form but keep Schedule list readable without page-level horizontal overflow.

- [ ] **Step 5: Run scheduling test slice**

Run: `npx vitest run tests/features/competition/competition-use-cases.test.ts tests/api/competition/competition-routes.test.ts tests/ui/organizer/match-schedule-editor.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit scheduling checkpoint**

```powershell
git add -- features/competition/application/schedule-match.ts features/competition/presentation/competition-handler.ts app/api/organizer/tournaments 'app/(admin)/organizer/tournaments' components/organizer/match-schedule-editor.tsx tests
git commit -m "feat(competition): schedule tournament matches"
```

### Task 9: Draft Score, Result Confirmation, Correction, And Atomic Advancement

**Files:**
- Create: `features/competition/application/record-match-score.ts`
- Create: `features/competition/application/confirm-match-result.ts`
- Create: `features/competition/application/correct-match-result.ts`
- Modify: `features/identity/domain/permission.ts`
- Modify: `features/competition/presentation/competition-handler.ts`
- Create: `app/api/organizer/tournaments/[id]/matches/[matchId]/score/route.ts`
- Create: `app/api/organizer/tournaments/[id]/matches/[matchId]/confirm/route.ts`
- Create: `app/api/admin/tournaments/[id]/matches/[matchId]/result-correction/route.ts`
- Create: `components/organizer/match-result-editor.tsx`
- Create: `components/admin/match-result-correction-dialog.tsx`
- Create: `app/(admin)/organizer/tournaments/[id]/results/page.tsx`
- Create: `app/(admin)/admin/tournaments/[id]/results/page.tsx`
- Create: `tests/ui/organizer/match-result-editor.test.tsx`
- Create: `tests/ui/admin/match-result-correction-dialog.test.tsx`
- Modify: `tests/features/identity/permission.test.ts`
- Modify: `tests/features/competition/competition-use-cases.test.ts`
- Modify: `tests/features/competition/prisma-competition-repository.test.ts`
- Modify: `tests/api/competition/competition-routes.test.ts`

**Interfaces:**
- Produces: `recordMatchScore`, `confirmMatchResult`, `correctMatchResult`, atomic repository mutations, Organizer/Admin Result UI
- Consumes: Task 1 advancement policy and Task 3 transaction contract

- [ ] **Step 1: Add failing permission and result tests**

Assert Organizer receives `result.confirm` for owned tournaments, non-owner remains hidden, draft score does not advance, confirmation advances exactly once, occupied slot conflicts, and repeated same confirmation is idempotent or returns current result. Add Platform Admin correction cases: reason required, Organizer forbidden, old winner replaced in the downstream slot when that match has not started, and correction blocked once downstream is `IN_PROGRESS`, `COMPLETED`, or has a confirmed result.

- [ ] **Step 2: Run result tests and verify failure**

Run: `npx vitest run tests/features/identity/permission.test.ts tests/features/competition/competition-use-cases.test.ts -t "result" tests/features/competition/prisma-competition-repository.test.ts -t "advance"`

Expected: FAIL because Organizer lacks permission and result use cases are missing.

- [ ] **Step 3: Add Organizer result confirmation permission**

Add `result.confirm` to `organizerPermissions`; retain server ownership checks and Platform Admin override behavior.

- [ ] **Step 4: Implement draft score use case**

Draft score validates integer/nonnegative values but may temporarily be tied only while Match is `SCHEDULED` or `IN_PROGRESS`; it updates `Match.homeScore/awayScore`, status, version, and audit without creating MatchResult or updating downstream slots.

- [ ] **Step 5: Implement atomic confirmation use case**

```ts
export async function confirmMatchResult(input, actor, dependencies) {
  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await competitions.findResultContext(input.matchId)
    assertOwnedCompetition(context, actor)
    authorize(actor, "result.confirm", { organizerId: context.tournament.organizerId })
    const advancement = decideMatchAdvancement({
      ...context.match,
      homeScore: input.homeScore,
      awayScore: input.awayScore,
    })
    return competitions.confirmResultAndAdvance({
      ...input,
      ...advancement,
      actorId: actor.id,
      at: dependencies.now().toISOString(),
      adminOverride: actor.role === "PLATFORM_ADMIN",
    })
  })
}
```

- [ ] **Step 6: Add handler and route tests, then implement routes**

Score route accepts `{ homeScore, awayScore, expectedVersion }`; confirm route accepts the same plus explicit `confirm: true`. Map tied/invalid score to `422`, stale/occupied slot to `409`, ownership to `404`, and return confirmed Match/Result.

- [ ] **Step 7: Implement atomic Platform Admin correction**

`correctMatchResult` requires Platform Admin, a nonblank reason, valid non-tied scores, and the current expected Match version. In one transaction update the existing MatchResult, winner, score and audit; if the winner changes, replace the old winner only in the exact linked downstream slot. Reject with `409` when that downstream Match has started, completed, been scored, or no longer contains the old winner. Never delete downstream results.

- [ ] **Step 8: Add correction route and Admin UI tests, then implement**

The correction route accepts `{ homeScore, awayScore, expectedVersion, reason, confirm: true }`. Build the Admin result page and confirmation dialog with the current result, corrected winner preview, mandatory reason, conflict refresh action and irreversible-impact copy. Organizer pages must not render correction controls.

- [ ] **Step 9: Build Organizer Result UI using failing RTL tests**

Test numeric controls, winner preview, confirmation dialog, pending lock, success advancement text, conflict refresh action, and disabled state when teams are incomplete. Keep score controls dimensionally stable.

- [ ] **Step 10: Run result test slice**

Run: `npx vitest run tests/features/identity/permission.test.ts tests/features/competition tests/api/competition tests/ui/organizer/match-result-editor.test.tsx tests/ui/admin/match-result-correction-dialog.test.tsx`

Expected: PASS including rollback when advancement or correction slot replacement fails.

- [ ] **Step 11: Commit result checkpoint**

```powershell
git add -- features/identity/domain/permission.ts features/competition app/api/organizer/tournaments app/api/admin/tournaments 'app/(admin)/organizer/tournaments' 'app/(admin)/admin/tournaments' components/organizer/match-result-editor.tsx components/admin/match-result-correction-dialog.tsx tests
git commit -m "feat(competition): confirm results and advance winners"
```

### Task 10: Winner Summary, Roadmap, And End-To-End Verification

**Files:**
- Create: `features/competition/application/get-competition-summary.ts`
- Create: `components/tournaments/competition-result-summary.tsx`
- Modify: `app/(public)/bracket/page.tsx`
- Modify: `app/(public)/schedule/page.tsx`
- Modify: `docs/ROADMAP.md`
- Create: `tests/features/competition/competition-summary.test.ts`
- Modify: `tests/ui/tournaments/public-bracket.test.tsx`
- Create: `tests/ui/tournaments/public-schedule-results.test.tsx`

**Interfaces:**
- Produces: public Winner/Runner-up/elimination-round summary
- Consumes: confirmed final and published bracket data

- [ ] **Step 1: Write failing summary tests**

Assert no winner before confirmed Final, Winner/Runner-up after Final, other teams grouped by elimination round, and no invented ordinal rank or third place.

- [ ] **Step 2: Run summary tests and verify failure**

Run: `npx vitest run tests/features/competition/competition-summary.test.ts tests/ui/tournaments/public-bracket.test.tsx tests/ui/tournaments/public-schedule-results.test.tsx`

Expected: FAIL because summary use case/component are missing.

- [ ] **Step 3: Implement summary projection and public UI**

Return:

```ts
interface CompetitionSummary {
  winner: { teamId: string; teamName: string } | null
  runnerUp: { teamId: string; teamName: string } | null
  eliminatedByRound: Array<{
    roundSequence: number
    roundName: string
    teams: Array<{ teamId: string; teamName: string }>
  }>
}
```

Use concise Thai copy and do not mark Tournament `COMPLETED` automatically.

- [ ] **Step 4: Update roadmap accurately**

Move only delivered System Mode capabilities to `เสร็จแล้ว`; keep External Bracket File under the next plan and keep result correction limitations explicit.

- [ ] **Step 5: Run all automated verification**

```powershell
npm run test
npm run lint
npm run build
npx prisma validate
npx prisma migrate status
git diff --check
git status --short
```

Expected: all commands pass. Report multiple-lockfile warning separately if still present.

- [ ] **Step 6: Run database and browser QA**

On the approved PostgreSQL development database:

1. Close registration for a test Tournament.
2. Approve 6 teams and lock entries.
3. Generate Seeded Draft and verify two Bye placements.
4. Publish, schedule matches, record and confirm results through Final.
5. Verify each winner advances once and Winner/Runner-up are correct.
6. Repeat a 10-team Random draw and verify frozen order after reload.
7. Check 375px, 768px, 1440px, light/dark, keyboard navigation, no page overflow.

- [ ] **Step 7: Commit final System Mode checkpoint**

```powershell
git add -- features/competition/application/get-competition-summary.ts components/tournaments/competition-result-summary.tsx 'app/(public)' docs/ROADMAP.md tests
git commit -m "feat(competition): complete generated bracket workflow"
```

- [ ] **Step 8: Push the verified branch**

Run: `git push origin feat/courtside-public-platform`

Expected: remote branch points to the final verified commit.
