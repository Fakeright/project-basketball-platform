# Simple Ordered Bracket Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace new system-generated seeded brackets with manually ordered or shuffled full 8/16/32-team brackets while retaining historical brackets and external PDF/image brackets.

**Architecture:** Keep the legacy seed generator and persisted rows readable. Add an ordered path to the domain generator and distinct Prisma generation methods; route new mutations through that path. Restrict new tournament capacities, while grandfathering unchanged legacy capacities and leaving external-document entry locking broad.

**Tech Stack:** Installed Next.js 16.4.0 App Router, React 19, TypeScript, Prisma 7, PostgreSQL, Zod 4, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-19-courtside-simple-ordered-bracket-design.md`

## Global Constraints

- New tournament capacities and new system-bracket entry counts are exactly 8, 16, or 32; external-document entry locking remains 2-32 up to capacity.
- Manual positions pair adjacent teams; random ordering uses the current server shuffle and persistent draw token.
- Keep `SEEDED` and `RANDOM` historical rows readable; never mutate published, scheduled, or started matches while generating.
- Preserve PDF/PNG/JPG/WEBP upload, revisions, schedule, scores, public bracket, and result advancement.
- Keep the current installed Next.js 16.4.0; read relevant `node_modules/next/dist/docs/` pages before editing App Router or Route Handler code. Do not downgrade it to the older version named in `AGENTS.md`.
- Use Thai user-facing copy, focused TDD, explicit Git staging, and no edits to unrelated dirty files or secrets.

## Review Focus

1. Capacity 16 with 12 approved teams: lock and external upload must still work, while new system generation returns 422. Task 3 tests both paths.
2. Forged manual positions with a duplicate or missing entry: return 422 and preserve the previous draft. Tasks 2 and 3 test this.
3. A published, scheduled, or started legacy bracket: new generation must return 409 without deleting its matches. Task 3 tests all three.
4. A legacy 6-team tournament: an unrelated draft edit and later publication retain capacity 6, but a changed capacity must be 8/16/32. Task 1 tests this.
5. Reopening a random preview must reuse its token/order; explicit redraw must change the token and order only after confirmation. Task 3 tests this.

---

### Task 1: Capacity Choices And Legacy Tournament Compatibility

**Files:** `features/tournament-operations/domain/tournament-capacity.ts`, `features/tournament-operations/domain/tournament-workflow.ts`, `features/tournament-operations/application/create-tournament.ts`, `features/admin/presentation/tournament-editor-schema.ts`, `features/admin/presentation/save-tournament-handler.ts`, `components/admin/tournament-capacity-field.tsx`, `components/admin/tournament-editor.tsx`; tests in `tests/features/tournament-operations/tournament-workflow.test.ts`, `tests/api/admin/tournament-submit.test.ts`, and `tests/ui/admin/tournament-capacity-field.test.tsx`.

**Interfaces:** `SUPPORTED_TOURNAMENT_CAPACITIES = [8, 16, 32] as const`; `isValidTournamentCapacity(capacity: number): boolean`; `isLegacyTournamentCapacity(capacity: number): boolean`; `validateTournamentInput(input: TournamentOperationInput, options?: { existingCapacity?: number }): void`; `tournamentEditorSchemaForMode(allowLegacyCapacity: boolean)` returning the current schema shape.

- [ ] **Step 1: Write failing tests.** Assert create accepts 8/16/32 and rejects 6/10/12/14/24; dropdown has exactly three options and no custom input; update of existing capacity 6 with an unrelated title change succeeds, a change from 6 to 10 fails, and publication of a legacy 6-team record succeeds. Route creation with capacity 12 returns 422 and the new Thai capacity message.
- [ ] **Step 2: Run focused tests and confirm expected failures.** `npm run test -- tests/features/tournament-operations/tournament-workflow.test.ts tests/api/admin/tournament-submit.test.ts tests/ui/admin/tournament-capacity-field.test.tsx`.
- [ ] **Step 3: Implement.** New create validation uses only `SUPPORTED_TOURNAMENT_CAPACITIES`; update permits a legacy even 6-32 value only when it equals the persisted existing capacity. Publication validates an already-persisted legacy capacity. Client and server select the permissive editor schema only for editing; application validation remains authoritative. Retain legacy display in the edit form without offering it as a new choice.
- [ ] **Step 4: Run focused tests, then `npm run test`, `npm run lint`, `npm run build`, `git diff --check`, and `git status --short`; expect green.** Resolve any changed expectations before committing.
- [ ] **Step 5: Commit only these files.** `git commit -m "feat(tournaments): limit new capacities to full brackets"`.

### Task 2: Ordered Bracket Domain And Persisted Method Values

**Files:** `features/competition/domain/bracket-policy.ts`, `features/competition/domain/bracket-generator.ts`, `features/competition/domain/competition.ts`, `prisma/schema.prisma`, a new migration under `prisma/migrations/`; tests in `tests/features/competition/bracket-policy.test.ts`, `tests/features/competition/bracket-generator.test.ts`, and `tests/features/competition/competition-schema.test.ts`.

**Interfaces:** `assertSystemBracketEntryCount(count: number): void` throws `BRACKET_ENTRY_COUNT_UNSUPPORTED`; `validateOrderedPositions(entries: readonly { entryId: string; position: number }[]): void` throws `BRACKET_ORDER_INVALID`; `generateOrderedSingleEliminationBracket(input: { entries: readonly { entryId: string; teamId: string; position: number }[] }): GeneratedBracketPlan`; extend `BracketGenerationMethod` with `ORDERED | RANDOM_ORDERED` while retaining `SEEDED | RANDOM`.

- [ ] **Step 1: Write failing tests.** For ordered 8 entries, assert first matches are teams 1-2, 3-4, 5-6, 7-8 and their winner links feed two semifinal matches and one final; assert 8/16/32 yield N-1 matches and one championship; assert 6/10/12/14, duplicate/missing/out-of-range positions fail. Keep legacy mirrored-seed tests green.
- [ ] **Step 2: Run focused tests and confirm expected failures.** `npm run test -- tests/features/competition/bracket-policy.test.ts tests/features/competition/bracket-generator.test.ts tests/features/competition/competition-schema.test.ts`.
- [ ] **Step 3: Implement.** Share the current match-link builder inside `bracket-generator.ts` while leaving the legacy public function's seed mirroring unchanged; the new function supplies direct position order. Add enum values with a non-destructive migration, then run `npm run prisma:generate` without applying a migration to a shared database.
- [ ] **Step 4: Re-run focused tests, then `npm run test`, `npm run lint`, `npm run build`, `git diff --check`, and `git status --short`; expect green.** Confirm legacy generator tests still pass.
- [ ] **Step 5: Commit only domain, schema, migration, and test files.** `git commit -m "feat(competition): build brackets from direct team order"`.

### Task 3: End-To-End Ordered Generation And Organizer UI

**Files:** `features/competition/application/generate-bracket.ts`, `features/competition/application/ports/competition-repository.ts`, `features/competition/infrastructure/prisma-competition-repository.ts`, `features/competition/presentation/competition-handler.ts`, `components/organizer/bracket-workspace.tsx`; tests in `tests/features/competition/competition-use-cases.test.ts`, `tests/features/competition/prisma-competition-repository.test.ts`, `tests/api/competition/competition-routes.test.ts`, `tests/ui/organizer/bracket-workspace.test.tsx`, and `tests/ui/organizer/external-bracket-workspace.test.tsx`. Preserve `components/organizer/bracket-mode-control.tsx` and the external uploader unless a focused regression requires a change.

**Interfaces:** Replace new request variants with `{ method: "ORDERED"; positions: { entryId: string; position: number }[] }` and `{ method: "RANDOM_ORDERED"; redraw: boolean }`, each carrying `tournamentId` and `expectedVersion`. Extend `BracketGenerationContext` with `bracketStatus`, `bracketMode`, and `hasScheduledMatch`. `BracketWorkspace` keeps its current props; manual move controls maintain a local array of entry IDs and submit ordered positions. Return typed 422 for unsupported count/order and 409 for published/scheduled/started or wrong mode.

- [ ] **Step 1: Write failing tests.** Assert ordered/random requests persist direct positions, `redraw: false` reuses token/order, `redraw: true` changes them, legacy method requests are rejected, 12 entries are blocked only for system generation, and external mode still locks 12 entries. Assert unauthorized, stale, wrong-mode, published, scheduled, and started requests preserve matches. UI: move entry 2 above entry 1 and verify posted positions, disabled end controls, keyboard activation, explicit redraw confirmation, unsupported-count message, and external mode choice.
- [ ] **Step 2: Run focused tests and confirm expected failures.** `npm run test -- tests/features/competition/competition-use-cases.test.ts tests/features/competition/prisma-competition-repository.test.ts tests/api/competition/competition-routes.test.ts tests/ui/organizer/bracket-workspace.test.tsx tests/ui/organizer/external-bracket-workspace.test.tsx`.
- [ ] **Step 3: Implement.** Keep server authorization/version checks and existing tokenized shuffle; validate the complete manual ID/position permutation against locked entries. Read bracket status/mode and scheduled-match presence; recheck after acquiring the tournament mutation lock and before deleting rounds. Map Thai HTTP errors and persist new enum values. Replace seed inputs with numbered rows and Lucide move buttons; random preview/redraw submits the new method and requires confirmation before redraw. Reuse current mode control, preview, and external uploader; do not tighten `assertEntriesCanBeLocked`.
- [ ] **Step 4: Re-run focused and external-route tests, then `npm run test`, `npm run lint`, `npm run build`, `git diff --check`, and `git status --short`; expect green.** Inspect organizer at about 375, 768, and 1440 pixels for control/text overlap; bracket columns may scroll.
- [ ] **Step 5: Commit only use-case, adapter, route, UI, and test files.** `git commit -m "feat(competition): let organizers order or shuffle full brackets"`.

### Task 4: Final Regression, Migration Safety, And Thai Walkthrough

**Files:** Only focused fixes to files from Tasks 1-3 if verification reveals defects; no unrelated refactors or seed-data rewrites.

**Interfaces:** Preserve the existing schedule/result/external-document contracts. The final user handoff explains the direct-position code path, shuffle token, match links, and why 8/16/32 need no byes.

- [ ] **Step 1: Run the full test suite.** `npm run test`; fix any new failures with a failing test first and report unrelated failures by name.
- [ ] **Step 2: Run static and build checks.** `npm run lint`, `npm run build`, `git diff --check`, `git status --short`; never run destructive schema commands or deploy the migration without explicit approval.
- [ ] **Step 3: Verify workflows.** Inspect new ordered/random previews, schedule/result advancement, legacy bracket read-only display, and external PDF/image selection. Record any database-dependent check that could not run locally.
- [ ] **Step 4: Commit focused verification fixes if needed.** Stage explicit paths only; do not stage existing user changes.
- [ ] **Step 5: Explain in Thai.** Walk through the key files and one 8-team example: 1 vs 2, 3 vs 4, winners meet; random changes only the order, and the schedule/result workflow remains linked to those matches.
