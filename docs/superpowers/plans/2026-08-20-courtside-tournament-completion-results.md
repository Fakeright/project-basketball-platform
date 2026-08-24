# COURTSIDE Tournament Completion And Results Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่ม workflow เริ่มและจบการแข่งขันที่ตรวจสอบได้ พร้อม Match purpose, อันดับ 1-3 และหน้าผลการแข่งขันสาธารณะ

**Architecture:** Pure domain policies ใน `features/competition/domain` ตัดสินความพร้อมและอันดับ ส่วน application use cases ใน `features/tournament-operations` ตรวจ permission/ownership ก่อนส่ง mutation ไป repository Prisma จะตรวจ prerequisite ซ้ำและเปลี่ยน Tournament พร้อม AuditLog ใน transaction เดียว Presentation ใช้ Route Handlers และ Server Components โดยไม่เรียก Prisma โดยตรง

**Tech Stack:** Next.js 16.2.11 App Router, React 19.2.4, TypeScript strict, Tailwind CSS 4, shadcn/ui/Base UI, Prisma 7.9, Supabase PostgreSQL, Zod 4, Vitest 4 และ React Testing Library

**Spec:** `docs/superpowers/specs/2026-08-20-courtside-tournament-completion-results-design.md`

## Global Constraints

- อ่าน `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` ก่อนแก้ Route Handler และใช้ async `params` ตาม Next.js 16.2.11
- ใช้ TDD ทุก behavior: เขียน focused failing test, ยืนยันว่า fail ด้วยเหตุผลที่คาดไว้, implement ขั้นต่ำ และรันให้ผ่าน
- Domain ห้าม import React, Next.js, Prisma หรือ browser API
- Presentation ห้าม query Prisma โดยตรง
- Server Components เป็นค่าเริ่มต้น; ใช้ `"use client"` เฉพาะ interaction ที่ต้องใช้ browser state
- User-facing copy ใช้ภาษาไทยเป็นหลัก และไม่ใช้สีเป็นสัญญาณสถานะเพียงอย่างเดียว
- Mutations ต้องตรวจ authentication, permission, ownership, lifecycle prerequisite และ optimistic version ฝั่ง server
- Platform Admin override ต้องมีเหตุผลและ audit; Organizer ทำได้เฉพาะ Tournament ของตน
- ห้าม parse PDF/รูปเพื่อเดาคู่แข่งขัน และห้ามเดาคู่ชิงจากชื่อรอบ
- ห้าม commit `.env`, credentials, `lib/generated/prisma`, `.next`, `node_modules`, `.agents`, `.claude`, `.windsurf` หรือ `skills-lock.json`
- ก่อน commit implementation แต่ละชุดให้รัน focused tests และ `git diff --check`
- ก่อนส่งมอบให้รัน `npm run test`, `npm run lint`, `npm run build`, `npx prisma validate`, `npx prisma migrate status`, `git diff --check`, `git status --short`

---

## File Map

### Domain And Data

- `prisma/schema.prisma`: ประกาศ `MatchPurpose` และ `Match.purpose`
- `prisma/migrations/20260820090000_add_match_purpose/migration.sql`: เพิ่ม enum/column, backfill system finals และ partial unique index
- `features/competition/domain/competition.ts`: shared purpose และ lifecycle context types
- `features/competition/domain/bracket-generator.ts`: tag terminal generated match เป็น championship
- `features/competition/domain/tournament-competition-policy.ts`: pure readiness policy และ structured issue codes
- `features/competition/application/get-competition-summary.ts`: deterministic ranking projection

### Application And Infrastructure

- `features/tournament-operations/application/transition-tournament-competition.ts`: start/complete use cases
- `features/tournament-operations/infrastructure/tournament-operations-repository.ts`: lifecycle context/transaction contracts
- `features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts`: transactional prerequisite re-check, status update และ audit
- `features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts`: test adapter behavior
- `features/tournament-operations/infrastructure/development-tournament-operations-repository.ts`: demo adapter behavior
- `features/competition/application/update-external-match-purpose.ts`: purpose mutation policy
- `features/competition/application/ports/competition-repository.ts`: purpose context/mutation contracts
- `features/competition/infrastructure/prisma-competition-repository.ts`: persist/generated/create/update purpose mapping

### HTTP And UI

- `features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts`: Zod boundary และ status mapping
- `app/api/organizer/tournaments/[id]/start/route.ts`: start POST composition
- `app/api/organizer/tournaments/[id]/complete/route.ts`: complete POST composition
- `app/api/organizer/tournaments/[id]/matches/[matchId]/purpose/route.ts`: purpose PATCH composition
- `features/competition/presentation/competition-handler.ts`: create/update external purpose payload validation
- `components/organizer/tournament-competition-lifecycle-panel.tsx`: readiness checklist และ commands
- `components/organizer/external-match-editor.tsx`: purpose selector
- `components/organizer/external-match-purpose-control.tsx`: แก้ purpose ของคู่ภายนอกที่ยังไม่เริ่ม
- `components/organizer/match-result-editor.tsx`: placement labels
- `app/(admin)/organizer/tournaments/[id]/results/page.tsx`: lifecycle panel composition
- `app/(public)/results/page.tsx`: public results
- `app/(public)/results/loading.tsx`: loading state
- `app/(public)/results/error.tsx`: recoverable error state
- `components/site-header.tsx`: public results navigation
- `components/tournaments/competition-result-summary.tsx`: winner/runner-up/third-place presentation
- `features/tournaments/domain/tournament.ts`: public Match purpose/status contract
- `features/tournaments/infrastructure/prisma-tournament-repository.ts`: public projection mapping
- `features/tournaments/infrastructure/mock-tournament-data.ts`: purpose-aware fallback fixtures

---

### Task 1: Add Match Purpose To The Domain And Generated Brackets

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260820090000_add_match_purpose/migration.sql`
- Modify: `features/competition/domain/competition.ts`
- Modify: `features/competition/domain/bracket-generator.ts`
- Modify: `features/competition/infrastructure/prisma-competition-repository.ts`
- Test: `tests/features/competition/bracket-generator.test.ts`
- Test: `tests/features/competition/competition-schema.test.ts`
- Test: `tests/features/competition/prisma-competition-repository.test.ts`

**Interfaces:**
- Consumes: `GeneratedBracketPlan`, `PersistGeneratedPlanInput` และ Prisma `Match`
- Produces: `MatchPurpose = "STANDARD" | "THIRD_PLACE" | "CHAMPIONSHIP"`; `GeneratedMatchPlan.purpose: MatchPurpose`

- [ ] **Step 1: Write failing generator and schema tests**

Add assertions that every generated plan has exactly one championship and all non-terminal matches are standard:

```ts
const plan = generateSingleEliminationBracket({ entries: createEntries(6) })
expect(plan.matches.filter((match) => match.purpose === "CHAMPIONSHIP"))
  .toHaveLength(1)
expect(plan.matches.find((match) => match.purpose === "CHAMPIONSHIP")?.nextMatchKey)
  .toBeNull()
expect(plan.matches.filter((match) => match.nextMatchKey !== null))
  .toEqual(expect.arrayContaining([
    expect.objectContaining({ purpose: "STANDARD" }),
  ]))
```

Update the Prisma schema text test to expect `enum MatchPurpose`, `purpose MatchPurpose @default(STANDARD)` and migration text containing the partial unique index.

- [ ] **Step 2: Run tests and verify the purpose contract is missing**

Run:

```powershell
npx vitest run tests/features/competition/bracket-generator.test.ts tests/features/competition/competition-schema.test.ts
```

Expected: FAIL because `GeneratedMatchPlan.purpose` and `MatchPurpose` do not exist.

- [ ] **Step 3: Add enum, column, backfill and uniqueness migration**

Add to `schema.prisma`:

```prisma
enum MatchPurpose {
  STANDARD
  THIRD_PLACE
  CHAMPIONSHIP
}

model Match {
  purpose MatchPurpose @default(STANDARD)
}
```

Create migration SQL:

```sql
CREATE TYPE "MatchPurpose" AS ENUM ('STANDARD', 'THIRD_PLACE', 'CHAMPIONSHIP');

ALTER TABLE "Match"
ADD COLUMN "purpose" "MatchPurpose" NOT NULL DEFAULT 'STANDARD';

UPDATE "Match" AS match
SET "purpose" = 'CHAMPIONSHIP'
FROM "Bracket" AS bracket
WHERE match."bracketId" = bracket."id"
  AND bracket."mode" = 'SYSTEM_GENERATED'
  AND match."nextMatchId" IS NULL;

CREATE UNIQUE INDEX "Match_bracketId_placementPurpose_key"
ON "Match" ("bracketId", "purpose")
WHERE "purpose" IN ('THIRD_PLACE', 'CHAMPIONSHIP');
```

- [ ] **Step 4: Tag generated terminal matches explicitly**

Export the type in `competition.ts` and add purpose to the generated plan after advancement links are known:

```ts
export type MatchPurpose = "STANDARD" | "THIRD_PLACE" | "CHAMPIONSHIP"

const purposeTaggedMatches = matches.map((match) => ({
  ...match,
  purpose: match.nextMatchKey === null ? "CHAMPIONSHIP" as const : "STANDARD" as const,
}))
```

Use `purposeTaggedMatches` in `GeneratedBracketPlan` and include `purpose: match.purpose` in Prisma `match.createMany` data.

- [ ] **Step 5: Generate Prisma client and run focused tests**

Run:

```powershell
npm run prisma:generate
npx vitest run tests/features/competition/bracket-generator.test.ts tests/features/competition/competition-schema.test.ts tests/features/competition/prisma-competition-repository.test.ts
npx prisma validate
git diff --check
```

Expected: all focused tests pass and Prisma schema validates.

- [ ] **Step 6: Commit Task 1**

```powershell
git add -- prisma/schema.prisma prisma/migrations/20260820090000_add_match_purpose/migration.sql features/competition/domain/competition.ts features/competition/domain/bracket-generator.ts features/competition/infrastructure/prisma-competition-repository.ts tests/features/competition/bracket-generator.test.ts tests/features/competition/competition-schema.test.ts tests/features/competition/prisma-competition-repository.test.ts
git commit -m "feat(competition): classify tournament matches"
```

---

### Task 2: Replace Last-Match Inference With Deterministic Result Projection

**Files:**
- Modify: `features/competition/application/get-competition-summary.ts`
- Modify: `components/tournaments/competition-result-summary.tsx`
- Modify: `features/tournaments/domain/tournament.ts`
- Modify: `features/tournaments/infrastructure/prisma-tournament-repository.ts`
- Modify: `features/tournaments/infrastructure/mock-tournament-data.ts`
- Modify: `features/competition/infrastructure/demo-competition-fixtures.ts`
- Test: `tests/features/competition/competition-summary.test.ts`
- Test: `tests/features/tournaments/prisma-tournament-repository.test.ts`
- Test: `tests/ui/tournaments/public-schedule-results.test.tsx`

**Interfaces:**
- Consumes: confirmed match fields plus `purpose: MatchPurpose`
- Produces: `CompetitionSummary` with `winner`, `runnerUp`, `thirdPlace`, `eliminatedByRound`

- [ ] **Step 1: Rewrite summary tests around explicit purposes**

Mark semifinals `STANDARD`, the final `CHAMPIONSHIP`, and add a confirmed third-place match:

```ts
expect(getCompetitionSummary(matchesWithPlacement)).toMatchObject({
  winner: { teamId: "team-1", teamName: "Bangkok Five" },
  runnerUp: { teamId: "team-4", teamName: "Khon Kaen Rise" },
  thirdPlace: { teamId: "team-2", teamName: "Chiang Mai Hoops" },
})
```

Add a regression where the championship is not the last sequence and verify it still supplies winner/runner-up. Add another where placement matches are unconfirmed and all three placement fields remain correct/null without false announcements.

- [ ] **Step 2: Run the summary test and verify third place is unsupported**

Run:

```powershell
npx vitest run tests/features/competition/competition-summary.test.ts
```

Expected: FAIL because `thirdPlace` and purpose-based selection are absent.

- [ ] **Step 3: Implement purpose-based projection**

Change the input contract:

```ts
interface CompetitionSummaryMatch {
  purpose: MatchPurpose
  // retain id, round, sequence, teams, scores and winnerTeamId
}

export interface CompetitionSummary {
  winner: CompetitionSummaryTeam | null
  runnerUp: CompetitionSummaryTeam | null
  thirdPlace: CompetitionSummaryTeam | null
  eliminatedByRound: Array<{
    roundSequence: number
    roundName: string
    teams: CompetitionSummaryTeam[]
  }>
}
```

Select `CHAMPIONSHIP` and `THIRD_PLACE` by purpose, call the existing confirmed-result helper, process elimination only from `STANDARD`, and remove winner/runner-up/third-place team IDs from elimination rows before returning.

- [ ] **Step 4: Thread purpose through public repository projections and fixtures**

Select/map `Match.purpose` in the Prisma public competition query and add purpose to the public `Match` type, mock tournaments and demo fixtures. Do not infer purpose in presentation code.

- [ ] **Step 5: Render optional third place accessibly**

Extend `CompetitionResultSummary` with a third definition row:

```tsx
{summary.thirdPlace ? (
  <div className="border-l border-border pl-4">
    <dt className="text-xs text-muted-foreground">อันดับ 3</dt>
    <dd className="mt-1 text-lg font-medium">{summary.thirdPlace.teamName}</dd>
  </div>
) : null}
```

Keep the pending-final copy when championship result is missing.

- [ ] **Step 6: Run result projection and public UI tests**

Run:

```powershell
npx vitest run tests/features/competition/competition-summary.test.ts tests/features/tournaments/prisma-tournament-repository.test.ts tests/ui/tournaments/public-schedule-results.test.tsx
git diff --check
```

Expected: all focused tests pass.

- [ ] **Step 7: Commit Task 2**

```powershell
git add -- features/competition/application/get-competition-summary.ts components/tournaments/competition-result-summary.tsx features/tournaments/domain/tournament.ts features/tournaments/infrastructure/prisma-tournament-repository.ts features/tournaments/infrastructure/mock-tournament-data.ts features/competition/infrastructure/demo-competition-fixtures.ts tests/features/competition/competition-summary.test.ts tests/features/tournaments/prisma-tournament-repository.test.ts tests/ui/tournaments/public-schedule-results.test.tsx
git commit -m "feat(results): project tournament placements"
```

---

### Task 3: Add Pure Start And Completion Policies

**Files:**
- Create: `features/competition/domain/tournament-competition-policy.ts`
- Modify: `features/competition/domain/competition.ts`
- Modify: `features/identity/domain/permission.ts`
- Modify: `features/tournament-operations/domain/tournament-operation.ts`
- Create: `tests/features/competition/tournament-competition-policy.test.ts`
- Create: `tests/features/identity/permission.test.ts`

**Interfaces:**
- Consumes: lifecycle context with status, active bracket, entry count and matches
- Produces: `TournamentCompetitionIssueCode`, `getStartIssues(context)`, `getCompletionIssues(context)`, `assertTournamentCanStart(context)`, `assertTournamentCanComplete(context)`

Use this shared context without Prisma types:

```ts
export interface TournamentCompetitionLifecycleContext {
  tournamentId: string
  organizerId: string
  status: string
  version: number
  activeBracket: null | {
    id: string
    status: string
    entriesLockedAt: string | null
    entryCount: number
    matches: Array<{
      id: string
      purpose: MatchPurpose
      status: string
      homeTeamId: string | null
      awayTeamId: string | null
      winnerTeamId: string | null
      resultConfirmed: boolean
    }>
  }
}
```

- [ ] **Step 1: Write the policy matrix as failing tests**

Define a valid context fixture and table-test one mutation at a time:

```ts
expect(getStartIssues(validClosedContext)).toEqual([])
expect(getStartIssues({ ...validClosedContext, bracketStatus: "DRAFT" }))
  .toContain("BRACKET_NOT_PUBLISHED")
expect(getStartIssues({ ...validClosedContext, matches: [] }))
  .toContain("MATCH_MISSING")
expect(getCompletionIssues(validCompletedMatchContext)).toEqual([])
expect(getCompletionIssues(contextWithPendingMatch))
  .toContain("MATCH_RESULT_PENDING")
```

Cover wrong Tournament status, unlocked entries, entry count below two, missing/duplicate championship, duplicate third-place match, incomplete placement teams, missing MatchResult and invalid winner.

- [ ] **Step 2: Run the new policy test and verify the module is absent**

Run:

```powershell
npx vitest run tests/features/competition/tournament-competition-policy.test.ts
```

Expected: FAIL with module resolution error.

- [ ] **Step 3: Implement structured issues and assertion wrappers**

Use a stable union:

```ts
export type TournamentCompetitionIssueCode =
  | "TOURNAMENT_STATUS_INVALID"
  | "BRACKET_MISSING"
  | "BRACKET_NOT_PUBLISHED"
  | "ENTRIES_NOT_LOCKED"
  | "ENTRY_COUNT_INVALID"
  | "MATCH_MISSING"
  | "CHAMPIONSHIP_MISSING"
  | "CHAMPIONSHIP_DUPLICATE"
  | "THIRD_PLACE_DUPLICATE"
  | "PLACEMENT_TEAMS_INCOMPLETE"
  | "MATCH_RESULT_PENDING"
  | "MATCH_RESULT_INVALID"
```

Assertions throw `TournamentCompetitionPolicyError` containing readonly `issues`, while readiness functions return all actionable issues instead of stopping at the first one.

- [ ] **Step 4: Add explicit permissions and audit actions**

Append `tournament.start` and `tournament.complete` to `permissions`, grant both to `organizerPermissions`, and add `tournament.started`/`tournament.completed` to `TournamentAuditAction`.

- [ ] **Step 5: Run domain and permission tests**

Run:

```powershell
npx vitest run tests/features/competition/tournament-competition-policy.test.ts tests/features/identity/permission.test.ts
git diff --check
```

Expected: all focused tests pass.

- [ ] **Step 6: Commit Task 3**

```powershell
git add -- features/competition/domain/tournament-competition-policy.ts features/competition/domain/competition.ts features/identity/domain/permission.ts features/tournament-operations/domain/tournament-operation.ts tests/features/competition/tournament-competition-policy.test.ts tests/features/identity/permission.test.ts
git commit -m "feat(competition): define tournament readiness policies"
```

---

### Task 4: Implement Transactional Tournament Start And Completion

**Files:**
- Create: `features/tournament-operations/application/transition-tournament-competition.ts`
- Modify: `features/tournament-operations/infrastructure/tournament-operations-repository.ts`
- Modify: `features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts`
- Modify: `features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts`
- Modify: `features/tournament-operations/infrastructure/development-tournament-operations-repository.ts`
- Create: `tests/features/tournament-operations/tournament-competition-lifecycle.test.ts`
- Test: `tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts`

**Interfaces:**
- Consumes: Task 3 readiness assertions and permissions
- Produces: `startTournamentCompetition(repository, input, actor, dependencies)` and `completeTournamentCompetition(...)`; repository `findCompetitionLifecycleContext` and `transitionCompetitionWithVersion`

- [ ] **Step 1: Write failing use-case tests for ownership, reason and version**

Use a mocked repository and assert exact mutation input:

```ts
await startTournamentCompetition(repository, {
  tournamentId: "tournament-1",
  version: 4,
}, organizer, { now: fixedNow })

expect(repository.transitionCompetitionWithVersion).toHaveBeenCalledWith(
  expect.objectContaining({
    sourceStatus: "REGISTRATION_CLOSED",
    status: "IN_PROGRESS",
    action: "tournament.started",
    actorId: organizer.id,
    adminOverride: false,
  }),
)
```

Add cases for non-owner `NOT_FOUND`, missing admin override reason `REASON_REQUIRED`, stale version `CONFLICT`, policy issues and successful completion.

- [ ] **Step 2: Run the use-case test and verify exports are missing**

Run:

```powershell
npx vitest run tests/features/tournament-operations/tournament-competition-lifecycle.test.ts
```

Expected: FAIL because the lifecycle use-case module does not exist.

- [ ] **Step 3: Add repository contracts and use cases**

Define mutation input:

```ts
export interface TournamentCompetitionTransition {
  tournamentId: string
  version: number
  sourceStatus: "REGISTRATION_CLOSED" | "IN_PROGRESS"
  status: "IN_PROGRESS" | "COMPLETED"
  actorId: string
  action: "tournament.started" | "tournament.completed"
  adminOverride: boolean
  reason: string | null
}
```

Both use cases load context, hide non-owned resources from Organizer, call `authorize`, compare version, require a trimmed reason for an admin acting on another organizer's Tournament, run the appropriate domain assertion and call the transition method.

- [ ] **Step 4: Add in-memory/development parity**

Store lifecycle context alongside Tournament fixtures, return copies from `findCompetitionLifecycleContext`, and re-run the domain assertion inside `transitionCompetitionWithVersion` before status/version/audit mutation.

- [ ] **Step 5: Write failing Prisma transaction tests**

Mock the transaction client so the first query returns Tournament plus active bracket entries/matches/results. Assert that an incomplete Match rejects before `tournament.updateMany`, and a valid completion performs update and audit inside the same `$transaction`.

- [ ] **Step 6: Implement Prisma context mapping and transactional re-check**

Inside `transitionCompetitionWithVersion`:

1. Load Tournament with the non-archived bracket, entries and Match result fields.
2. Map to `TournamentCompetitionLifecycleContext`.
3. Run start/complete assertion based on `input.status`.
4. Call `tournament.updateMany` with id, expected version and source status.
5. Insert lifecycle audit including reason/adminOverride.
6. Insert the existing `tournament.admin_override` audit when applicable.
7. Reload and return the updated Tournament.

Throw `CONFLICT` when update count is not one; transaction rollback must prevent audit persistence.

- [ ] **Step 7: Run lifecycle application and repository tests**

Run:

```powershell
npx vitest run tests/features/tournament-operations/tournament-competition-lifecycle.test.ts tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts
git diff --check
```

Expected: all focused tests pass.

- [ ] **Step 8: Commit Task 4**

```powershell
git add -- features/tournament-operations/application/transition-tournament-competition.ts features/tournament-operations/infrastructure/tournament-operations-repository.ts features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts features/tournament-operations/infrastructure/development-tournament-operations-repository.ts tests/features/tournament-operations/tournament-competition-lifecycle.test.ts tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts
git commit -m "feat(tournaments): transition active competitions"
```

---

### Task 5: Add Lifecycle HTTP Boundaries And Enforce Match Status Rules

**Files:**
- Create: `features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts`
- Create: `app/api/organizer/tournaments/[id]/start/route.ts`
- Create: `app/api/organizer/tournaments/[id]/complete/route.ts`
- Modify: `features/competition/application/ports/competition-repository.ts`
- Modify: `features/competition/application/match-result-access.ts`
- Modify: `features/competition/application/schedule-match.ts`
- Modify: `features/competition/infrastructure/prisma-competition-repository.ts`
- Create: `tests/api/competition/tournament-competition-lifecycle-routes.test.ts`
- Test: `tests/features/competition/competition-use-cases.test.ts`
- Test: `tests/features/competition/prisma-competition-repository.test.ts`

**Interfaces:**
- Consumes: Task 4 lifecycle use cases
- Produces: POST start/complete responses and Tournament status in schedule/result contexts

- [ ] **Step 1: Write failing Route Handler tests**

Cover malformed JSON, anonymous request, structured policy issues, stale version and success:

```ts
expect(response.status).toBe(422)
expect(await response.json()).toEqual({
  message: "ยังไม่สามารถเริ่มการแข่งขันได้",
  issues: ["CHAMPIONSHIP_MISSING"],
})
```

Assert non-owner Organizer receives `404`, unpermitted role receives `403`, and admin override without reason receives `422`.

- [ ] **Step 2: Run the route test and verify routes are missing**

Run:

```powershell
npx vitest run tests/api/competition/tournament-competition-lifecycle-routes.test.ts
```

Expected: FAIL with route/handler module resolution errors.

- [ ] **Step 3: Implement Zod handler and route composition**

Use this boundary schema:

```ts
const lifecycleCommandSchema = z.object({
  version: z.number().int().nonnegative(),
  reason: z.string().trim().min(1).max(500).nullable().optional(),
})
```

Map `TournamentCompetitionPolicyError.issues` to `422`, `REASON_REQUIRED` to `422`, illegal source status/stale version to `409`, and reuse `withSafeRouteBoundary` for unexpected failures. Route files await `context.params` before calling the handler.

- [ ] **Step 4: Write failing operation-boundary tests**

Add Tournament status to schedule/result contexts and test:

```ts
await expect(recordMatchScore(input, organizer, dependencies))
  .rejects.toThrow("TOURNAMENT_NOT_IN_PROGRESS")
```

Verify schedule permits `REGISTRATION_CLOSED` and `IN_PROGRESS`, score/confirm requires `IN_PROGRESS`, and Organizer operations reject `COMPLETED`.

- [ ] **Step 5: Implement and persist Tournament status context**

Select `tournament.status` in `findMatchScheduleContext`/`findResultContext`, add it to repository port types, and enforce status in application policies before mutation. Keep Platform Admin correction behavior unchanged.

- [ ] **Step 6: Run HTTP and match-operation tests**

Run:

```powershell
npx vitest run tests/api/competition/tournament-competition-lifecycle-routes.test.ts tests/features/competition/competition-use-cases.test.ts tests/features/competition/prisma-competition-repository.test.ts
git diff --check
```

Expected: all focused tests pass.

- [ ] **Step 7: Commit Task 5**

```powershell
git add -- features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts app/api/organizer/tournaments/[id]/start/route.ts app/api/organizer/tournaments/[id]/complete/route.ts features/competition/application/ports/competition-repository.ts features/competition/application/match-result-access.ts features/competition/application/schedule-match.ts features/competition/infrastructure/prisma-competition-repository.ts tests/api/competition/tournament-competition-lifecycle-routes.test.ts tests/features/competition/competition-use-cases.test.ts tests/features/competition/prisma-competition-repository.test.ts
git commit -m "feat(competition): expose tournament lifecycle commands"
```

---

### Task 6: Let External Brackets Classify And Correct Match Purpose

**Files:**
- Modify: `features/competition/application/create-external-match.ts`
- Create: `features/competition/application/update-external-match-purpose.ts`
- Modify: `features/competition/application/ports/competition-repository.ts`
- Modify: `features/competition/infrastructure/prisma-competition-repository.ts`
- Modify: `features/competition/presentation/competition-handler.ts`
- Create: `app/api/organizer/tournaments/[id]/matches/[matchId]/purpose/route.ts`
- Modify: `components/organizer/external-match-editor.tsx`
- Create: `components/organizer/external-match-purpose-control.tsx`
- Modify: `components/organizer/match-result-editor.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/results/page.tsx`
- Test: `tests/features/competition/external-match-operations.test.ts`
- Test: `tests/api/competition/external-match-route.test.ts`
- Test: `tests/ui/organizer/external-match-editor.test.tsx`
- Create: `tests/ui/organizer/external-match-purpose-control.test.tsx`
- Test: `tests/ui/organizer/match-result-editor.test.tsx`

**Interfaces:**
- Consumes: Task 1 `MatchPurpose`
- Produces: create payload `purpose`; `updateExternalMatchPurpose(input, actor, dependencies)`; PATCH purpose endpoint

- [ ] **Step 1: Write failing create/update purpose tests**

Assert create defaults to `STANDARD`, accepts `THIRD_PLACE`/`CHAMPIONSHIP`, and rejects a duplicate placement purpose. Test update only when external bracket Match is `SCHEDULED`, has null scores/result, expected version matches and actor owns the Tournament.

- [ ] **Step 2: Run focused external-match tests**

Run:

```powershell
npx vitest run tests/features/competition/external-match-operations.test.ts tests/api/competition/external-match-route.test.ts
```

Expected: FAIL because purpose is not accepted or persisted.

- [ ] **Step 3: Extend ports, use cases and Prisma mutation**

Add `purpose` to `CreateExternalMatchInput`, creation context and mutation. Add update context/mutation:

```ts
export interface UpdateExternalMatchPurposeInput {
  tournamentId: string
  matchId: string
  purpose: MatchPurpose
  expectedVersion: number
  overrideReason?: string
}
```

Prisma update must filter id, tournament, version, external bracket mode, `SCHEDULED`, null score and null result. Catch partial-index uniqueness as `MATCH_PURPOSE_CONFLICT`, increment Match version and write `MATCH_PURPOSE_UPDATED` audit with before/after purpose.

- [ ] **Step 4: Add Zod payloads and PATCH route**

Use `z.enum(["STANDARD", "THIRD_PLACE", "CHAMPIONSHIP"])`; map duplicate purpose/stale data to `409`, invalid payload/required admin reason to `422`, and ownership to hidden `404`.

- [ ] **Step 5: Write failing UI tests for the purpose selector and labels**

Select “ชิงชนะเลิศ”, submit, and assert:

```ts
expect(JSON.parse(String(request?.body))).toMatchObject({
  purpose: "CHAMPIONSHIP",
})
```

Render result rows and assert visible labels “ชิงชนะเลิศ” and “ชิงอันดับ 3”. Render
`ExternalMatchPurposeControl`, choose a new purpose, confirm the mutation and assert the
PATCH body contains `purpose` and `expectedVersion`.

- [ ] **Step 6: Implement selector and view-model threading**

Use existing shadcn `Select` in `ExternalMatchEditor`, default `STANDARD`, keep form dimensions stable at xl, and pass purpose through organizer workspace match mapping. Add a compact text badge beside round/sequence; do not add a nested card. Render `ExternalMatchPurposeControl` only for external matches that are `SCHEDULED` with no score/result; it PATCHes the dedicated endpoint and refreshes on success.

- [ ] **Step 7: Run external workflow tests**

Run:

```powershell
npx vitest run tests/features/competition/external-match-operations.test.ts tests/api/competition/external-match-route.test.ts tests/ui/organizer/external-match-editor.test.tsx tests/ui/organizer/external-match-purpose-control.test.tsx tests/ui/organizer/match-result-editor.test.tsx
git diff --check
```

Expected: all focused tests pass.

- [ ] **Step 8: Commit Task 6**

```powershell
git add -- features/competition/application/create-external-match.ts features/competition/application/update-external-match-purpose.ts features/competition/application/ports/competition-repository.ts features/competition/infrastructure/prisma-competition-repository.ts features/competition/presentation/competition-handler.ts 'app/api/organizer/tournaments/[id]/matches/[matchId]/purpose/route.ts' components/organizer/external-match-editor.tsx components/organizer/external-match-purpose-control.tsx components/organizer/match-result-editor.tsx 'app/(admin)/organizer/tournaments/[id]/results/page.tsx' tests/features/competition/external-match-operations.test.ts tests/api/competition/external-match-route.test.ts tests/ui/organizer/external-match-editor.test.tsx tests/ui/organizer/external-match-purpose-control.test.tsx tests/ui/organizer/match-result-editor.test.tsx
git commit -m "feat(competition): classify external matches"
```

---

### Task 7: Add Organizer Readiness And Lifecycle Controls

**Files:**
- Create: `components/organizer/tournament-competition-lifecycle-panel.tsx`
- Modify: `features/competition/application/get-organizer-competition.ts`
- Modify: `features/competition/application/ports/competition-repository.ts`
- Modify: `features/competition/infrastructure/prisma-competition-repository.ts`
- Modify: `app/(admin)/organizer/tournaments/[id]/results/page.tsx`
- Create: `tests/ui/organizer/tournament-competition-lifecycle-panel.test.tsx`
- Create: `tests/ui/organizer/organizer-results-page.test.tsx`

**Interfaces:**
- Consumes: Task 3 readiness issue codes and Task 5 endpoints
- Produces: lifecycle panel props `{ tournamentId, status, version, startIssues, completionIssues, requiresOverrideReason }`

- [ ] **Step 1: Write failing lifecycle panel tests**

Cover closed/ready, closed/blocked, in-progress/ready, pending request, success refresh, conflict copy and admin reason:

```tsx
expect(screen.getByRole("button", { name: "เริ่มการแข่งขัน" })).toBeEnabled()
expect(screen.getByText("ยังไม่มีคู่ชิงชนะเลิศ")).toBeTruthy()
expect(screen.getByRole("button", { name: "เริ่มการแข่งขัน" })).toBeDisabled()
```

For admin override, assert the dialog requires “เหตุผลที่ดำเนินการแทนผู้จัด”.

- [ ] **Step 2: Run UI tests and verify the component is missing**

Run:

```powershell
npx vitest run tests/ui/organizer/tournament-competition-lifecycle-panel.test.tsx tests/ui/organizer/organizer-results-page.test.tsx
```

Expected: FAIL with missing component/page behavior.

- [ ] **Step 3: Expose readiness from the organizer workspace**

Include purpose and confirmed-result presence in workspace matches. In `getOrganizerCompetition`, call `getStartIssues` or `getCompletionIssues` against the mapped context and return a view-ready `lifecycle` object without exposing repository internals to React.

- [ ] **Step 4: Implement the lifecycle panel**

Render a bordered full-width section with status label, issue rows and one primary command. Use a confirmation dialog; POST `{ version, reason }`; show Thai errors; call `router.refresh()` on success. Stable issue labels:

```ts
const issueLabels: Record<TournamentCompetitionIssueCode, string> = {
  TOURNAMENT_STATUS_INVALID: "สถานะรายการไม่พร้อมสำหรับขั้นตอนนี้",
  BRACKET_MISSING: "ยังไม่มีสายการแข่งขัน",
  BRACKET_NOT_PUBLISHED: "ยังไม่ได้เผยแพร่สายการแข่งขัน",
  ENTRIES_NOT_LOCKED: "ยังไม่ได้ล็อกรายชื่อทีม",
  ENTRY_COUNT_INVALID: "ต้องมีทีมอย่างน้อย 2 ทีม",
  MATCH_MISSING: "ยังไม่มีคู่แข่งขัน",
  CHAMPIONSHIP_MISSING: "ยังไม่มีคู่ชิงชนะเลิศ",
  CHAMPIONSHIP_DUPLICATE: "มีคู่ชิงชนะเลิศมากกว่าหนึ่งคู่",
  THIRD_PLACE_DUPLICATE: "มีคู่ชิงอันดับ 3 มากกว่าหนึ่งคู่",
  PLACEMENT_TEAMS_INCOMPLETE: "คู่จัดอันดับยังมีทีมไม่ครบ",
  MATCH_RESULT_PENDING: "ยังมีคู่แข่งขันที่ไม่ได้ยืนยันผล",
  MATCH_RESULT_INVALID: "มีผลการแข่งขันที่ไม่สมบูรณ์",
}
```

- [ ] **Step 5: Compose the panel on Organizer Results**

Place it below `CompetitionWorkspaceNav` and above `MatchResultEditor`; set `requiresOverrideReason` only when actor is Platform Admin and not the Tournament owner.

- [ ] **Step 6: Run organizer UI tests**

Run:

```powershell
npx vitest run tests/ui/organizer/tournament-competition-lifecycle-panel.test.tsx tests/ui/organizer/organizer-results-page.test.tsx tests/ui/organizer/match-result-editor.test.tsx
git diff --check
```

Expected: all focused tests pass.

- [ ] **Step 7: Commit Task 7**

```powershell
git add -- components/organizer/tournament-competition-lifecycle-panel.tsx features/competition/application/get-organizer-competition.ts features/competition/application/ports/competition-repository.ts features/competition/infrastructure/prisma-competition-repository.ts 'app/(admin)/organizer/tournaments/[id]/results/page.tsx' tests/ui/organizer/tournament-competition-lifecycle-panel.test.tsx tests/ui/organizer/organizer-results-page.test.tsx tests/ui/organizer/match-result-editor.test.tsx
git commit -m "feat(organizer): operate tournament lifecycle"
```

---

### Task 8: Publish A Dedicated Results Experience And Finish Delivery

**Files:**
- Create: `app/(public)/results/page.tsx`
- Create: `app/(public)/results/loading.tsx`
- Create: `app/(public)/results/error.tsx`
- Modify: `components/site-header.tsx`
- Modify: `app/(public)/schedule/page.tsx`
- Modify: `app/(public)/bracket/page.tsx`
- Modify: `app/(public)/tournaments/[slug]/page.tsx`
- Modify: `README.md`
- Modify: `docs/ROADMAP.md`
- Create: `tests/ui/tournaments/public-results-page.test.tsx`
- Test: `tests/ui/site-header-session.test.tsx`
- Test: `tests/ui/tournaments/public-tournament-states.test.tsx`

**Interfaces:**
- Consumes: Task 2 summary projection and existing `getTournamentCompetitionBySlug`
- Produces: `/results?tournament=:slug`, public navigation and cross-links

- [ ] **Step 1: Write failing public results tests**

Mock repository composition and cover:

- ongoing Tournament shows “การแข่งขันยังไม่จบ” and confirmed partial results
- completed Tournament shows champion, runner-up and optional third place
- no selected/available Tournament shows `StatePanel`
- query slug selects the requested Tournament
- SiteHeader contains “ผลการแข่งขัน” on desktop and mobile

- [ ] **Step 2: Run public UI tests and verify the route is missing**

Run:

```powershell
npx vitest run tests/ui/tournaments/public-results-page.test.tsx tests/ui/site-header-session.test.tsx
```

Expected: FAIL because the Results page/navigation do not exist.

- [ ] **Step 3: Implement the Server Component and states**

Follow the async Next.js 16 search params pattern already used by Schedule/Bracket:

```tsx
export default async function ResultsPage({ searchParams }: PageProps<"/results">) {
  const { tournament } = await searchParams
  const slug = typeof tournament === "string" ? tournament : undefined
  // Resolve a public ONGOING/COMPLETED tournament and render its summary.
}
```

Resolve requested slug first; otherwise choose the latest `ONGOING`, then `COMPLETED`. Render Tournament title/status, `CompetitionResultSummary`, progress copy and `StatePanel`. Loading/error components use the existing state patterns and concise Thai copy.

- [ ] **Step 4: Add navigation and contextual links**

Append `{ href: "/results", label: "ผลการแข่งขัน" }` to `SiteHeader`. Add text links preserving `?tournament=${slug}` from Schedule, Bracket and Tournament detail. Keep links as commands, not promotional cards.

- [ ] **Step 5: Run the public regression tests**

Run:

```powershell
npx vitest run tests/ui/tournaments/public-results-page.test.tsx tests/ui/site-header-session.test.tsx tests/ui/tournaments/public-tournament-states.test.tsx tests/ui/tournaments/public-schedule-results.test.tsx tests/ui/tournaments/public-bracket.test.tsx
git diff --check
```

Expected: all focused tests pass.

- [ ] **Step 6: Apply and verify the development migration**

Confirm `.env.local` points to the intended Supabase development project, then run:

```powershell
npx prisma migrate deploy
npx prisma migrate status
```

Expected: `20260820090000_add_match_purpose` is applied and migration status reports the database schema is up to date. Do not print connection strings or secrets.

- [ ] **Step 7: Update README and roadmap**

Document Tournament lifecycle commands, result page URL, optional third place, external purpose selection, migration name and the remaining governance slice. Mark only verified items complete.

- [ ] **Step 8: Run full automated verification**

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

Expected: all tests/lint/build/schema checks pass; status contains only intended tracked changes plus the known unrelated untracked tooling files.

- [ ] **Step 9: Start the development server and perform browser QA**

Run `npm run dev` on an unused port. Verify:

- public `/results` at 375px, 768px and 1440px
- no page-level horizontal overflow
- Thai text does not overlap controls
- light/dark themes remain readable
- ongoing and completed results states
- Organizer Results start/complete checklist with a valid Supabase session
- external purpose selector keyboard interaction

Record any protected flow that cannot be tested due to missing session as a limitation rather than claiming it passed.

- [ ] **Step 10: Commit Task 8**

```powershell
git add -- 'app/(public)/results/page.tsx' 'app/(public)/results/loading.tsx' 'app/(public)/results/error.tsx' components/site-header.tsx 'app/(public)/schedule/page.tsx' 'app/(public)/bracket/page.tsx' 'app/(public)/tournaments/[slug]/page.tsx' README.md docs/ROADMAP.md tests/ui/tournaments/public-results-page.test.tsx tests/ui/site-header-session.test.tsx tests/ui/tournaments/public-tournament-states.test.tsx
git commit -m "feat(results): publish tournament results page"
```

- [ ] **Step 11: Review final history and push only the feature branch**

Run:

```powershell
git log --oneline --decorate -12
git status --short
git push origin feat/courtside-public-platform
```

Expected: origin advances without force push; unrelated untracked tooling files remain uncommitted.
