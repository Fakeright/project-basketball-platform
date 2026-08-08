# Courtside Final Fix Report

## Scope

Implemented only the requested P2 fixes:

- Removed incompatible Base UI trigger/close composition from the real mobile `SiteHeader`.
- Kept mobile navigation links as semantic links, closed the controlled sheet on selection, and provided a hit area above 24px.
- Added an explicit all-formats option that clears the format query parameter.
- Formatted same-day tournaments as one Thai date.
- Migrated the Next 16 error boundary callback from `reset` to `unstable_retry`.

## TDD RED Evidence

1. Real `SiteHeader` integration
   - Command: `npm run test -- tests/ui/interactive-accessibility.test.tsx -t "opens the real mobile navigation"`
   - Expected RED: the real trigger carried both Base UI tooltip and dialog trigger behavior.
   - Failure: `expected true to be false` at the assertion checking `data-base-ui-tooltip-trigger`.

2. Clear tournament format
   - Command: `npm run test -- tests/ui/interactive-accessibility.test.tsx -t "clears the selected tournament format"`
   - Expected RED: no selectable `ทั้งหมด` option existed.
   - Failure: `Unable to find role="option" and name "ทั้งหมด"`.

3. Same-day tournament date
   - Command: `npm run test -- tests/features/tournaments/tournament-view-model.test.ts -t "formats a same-day tournament"`
   - Expected RED: the formatter duplicated the day.
   - Failure: expected `4 ต.ค. 2026`, received `4-4 ต.ค. 2026`.

4. Next 16 error retry
   - Command: `npm run test -- tests/ui/error-boundary.test.tsx`
   - Expected RED: the error boundary ignored `unstable_retry`.
   - Failure: expected the retry spy once, received 0 calls.

## GREEN And Verification

- Focused regression suite:
  - Command: `npm run test -- tests/ui/interactive-accessibility.test.tsx tests/features/tournaments/tournament-view-model.test.ts tests/ui/error-boundary.test.tsx`
  - Result: 3 files passed, 8 tests passed.
- Full tests:
  - Command: `npm run test`
  - Result: 8 files passed, 27 tests passed.
- Lint:
  - Command: `npm run lint`
  - Result: exit 0, no ESLint findings.
- Production build:
  - Command: `npm run build`
  - Result: exit 0; compilation, TypeScript, and static generation completed successfully.
- Whitespace:
  - Command: `git diff --check`
  - Result: exit 0.

## Remaining Caveats

- Vitest reports the existing `vite-tsconfig-paths` deprecation warning.
- Next build reports the existing duplicate-lockfile/workspace-root warning caused by the linked worktree.
- P3 architecture, heading hierarchy, URL contract, and broader coverage findings were intentionally not changed.

---

## Whole-Branch Fix Wave - 9 August 2026

### Scope

- Added read-only per-team legacy reconciliation contexts and Thai workspace notices without converting or counting `TeamMember` rows as eligible players.
- Minimized all TeamPlayer add/reactivate/update/deactivate audit snapshots through one typed domain projection.
- Added a separate read-only audit-PII retention report; no automatic redaction or production rewrite is performed.
- Displayed phone details in active and read-only roster rows with responsive, overflow-safe grids.
- Updated README and ROADMAP production-cutover, reconciliation, and retention wording.

### TDD RED Evidence

1. Legacy compatibility
   - Command: `npm run test -- tests/features/team-management/prisma-team-repository.test.ts tests/features/team-management/team-use-cases.test.ts tests/features/registrations/apply-to-tournament.test.ts tests/ui/team/team-workspace-manager.test.tsx`
   - RED: repository method was absent, workspace summary was absent, and the Thai notice was not rendered. Registration continued to reject an empty TeamPlayer roster with `ROSTER_INCOMPLETE` even when the compatibility fixture contained legacy-member counts.
2. Audit minimization
   - Command: `npm run test -- tests/features/team-management/team-use-cases.test.ts`
   - RED: four tests exposed full TeamPlayer values in update/deactivate audit payloads and non-projected add/reactivate payloads.
   - Command: `npm run test -- tests/features/team-management/team-player-audit-retention.test.ts`
   - RED: the read-only historical PII report did not exist.
3. Phone display
   - Command: `npm run test -- tests/ui/team/team-player-roster.test.tsx`
   - RED: the roster row did not render the stored phone value.
4. Reconciliation copy refinement
   - Command: `npm run test -- tests/ui/team/team-workspace-manager.test.tsx`
   - RED: the notice did not yet require verified data for manual TeamPlayer entry.

### Verification

- Focused regression: `npm run test -- tests/features/team-management tests/features/registrations/apply-to-tournament.test.ts tests/features/registrations/prisma-registration-repository.test.ts tests/api/teams tests/ui/team` - 15 files, 133 tests passed.
- Full suite: `npm run test` - 97 files, 552 tests passed.
- Lint: `npm run lint` - exit 0.
- Production build: `npm run build` - exit 0; compilation, TypeScript, page-data collection, and 25-page static generation completed.
- Prisma: `npx prisma validate` - schema valid.
- Legacy audit: `npx tsx scripts/audit-legacy-team-members.ts` - 5 teams reported, `readyForLegacyRemoval=false`; no rows were changed.
- Audit PII report: `npx tsx scripts/audit-team-player-audit-pii.ts` - 0 events scanned and 0 findings in the current development database; no rows were changed.
- Responsive browser QA: 375px, 768px, and 1440px - notice and phone visible, phone remained inside its row, and no page-level horizontal overflow was detected. The temporary public QA harness was removed before delivery.

### Remaining Gates

- Production cutover remains blocked on manual reconciliation of the 5 reported legacy teams. Do not delete legacy rows, invent birth dates, or treat legacy members as registration-eligible players.
- Any future database whose audit PII report contains findings requires a separately approved retention/redaction operation; the report intentionally does not rewrite audit history.
- Existing Vitest `vite-tsconfig-paths` deprecation and Next linked-worktree root warnings remain unchanged.

---

## Whole-Branch Fix Wave Round 2 - 9 August 2026

### Scope

- Extended the locked team-removal snapshot with total active and inactive `TeamMember` history. Hard delete now requires both zero registration history and zero legacy-member history; otherwise the team is deactivated and legacy rows remain untouched.
- Preserved removal guard precedence: authorization, stale version, confirmation name, inactive team, then active registration. The preservation decision runs only after those guards pass.
- Extended the PII-free reconciliation query and report with active/inactive PLAYER/COACH counts and total legacy history. Inactive-only teams are included and can never report ready while any legacy row exists.
- Distinguished active manual re-entry needs from inactive preserved history in the Thai workspace notice. Neither path changes TeamPlayer-only registration eligibility.

### TDD RED Evidence

1. Legacy-preserving team removal
   - Command: `npm run test -- tests/features/team-management/prisma-team-repository.test.ts tests/features/team-management/team-use-cases.test.ts tests/api/teams/team-routes.test.ts`
   - RED: 3 expected failures. The locked repository snapshot omitted total legacy history, and both use-case and route selected `DELETED` for a no-registration team with legacy rows.
   - GREEN: 3 files, 85 tests passed. Tests assert `DEACTIVATED`, `team.deactivated`, and that `deleteTeam` is not called.
2. Inactive-only reconciliation
   - Command: `npm run test -- tests/features/team-management/prisma-team-repository.test.ts tests/features/team-management/team-use-cases.test.ts tests/ui/team/team-workspace-manager.test.tsx tests/scripts/audit-legacy-team-members.test.ts`
   - RED: 6 expected failures. Inactive-only rows were classified as active, inactive totals/preservation issue were absent, the report formatter was absent, and the workspace did not show preserved inactive history.
   - GREEN: 4 files, 62 tests passed.

### Verification

- Focused bounded suite: `npm run test -- tests/features/team-management tests/api/teams tests/ui/team tests/scripts/audit-legacy-team-members.test.ts` - 14 files, 119 tests passed.
- Full default suite: `npm run test` - 98 files, 558 tests passed.
- Lint: `npm run lint` - exit 0, no ESLint findings.
- Production build: `npm run build` - exit 0; TypeScript and static generation for 25 pages completed.
- Prisma: `npx prisma validate` - schema valid; no migration or schema changes were made.
- Legacy audit: `npx tsx scripts/audit-legacy-team-members.ts` - 5 teams, 28 total legacy rows, all currently active, `readyForLegacyRemoval=false`; no rows changed.
- Audit PII report: `npx tsx scripts/audit-team-player-audit-pii.ts` - 0 events scanned and 0 findings; no rows changed.

### Remaining Gates

- The 5 development teams with legacy history still require manual reconciliation before production cutover. Inactive-only coverage is regression-tested even though the current development audit contains no inactive legacy rows.
- Existing Vitest `vite-tsconfig-paths` deprecation and Next linked-worktree root warnings remain unchanged.
