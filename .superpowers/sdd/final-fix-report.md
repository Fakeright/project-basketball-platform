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
