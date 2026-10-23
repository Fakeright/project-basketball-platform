# COURTSIDE Province Overlap Correction Design

## Goal

Prevent the province combobox's internal Base UI input group from overflowing
its assigned tournament-search grid track at desktop widths.

## Root Cause

The tournament search form correctly assigns the province field a constrained
outer grid track. However, the province wrapper is itself a CSS grid with an
implicit `auto` column. Its Base UI input group therefore keeps an intrinsic
width of approximately 258px even when the outer track is only 90-102px wide.
The input group visually overlaps the format and age-group fields while the
outer wrapper bounds remain correct.

## Correction

Add an explicit `minmax(0, 1fr)` inner grid column through the existing
`className` passed to `ProvinceCombobox` by `TournamentSearchForm`. This makes
the Base UI input group shrink to the assigned outer track without clipping
the field, changing its value, or changing province search behavior.

The shared `ProvinceCombobox` component remains unchanged so team and
organizer forms retain their existing layout. No overflow clipping is added,
because clipping would hide focus indicators and mask the sizing defect.

## Testing And Verification

Extend the existing tournament-search layout regression test to require the
explicit shrinkable inner grid track on the province field. Verify the test
fails before implementation and passes after the call-site class change.

Browser verification covers Home and Tournament List at 1080px, 1280px,
1440px, and 1920px. At every width, the province input group must be no wider
than its wrapper, must not intersect the format field, and must not create
horizontal document overflow.

Run the focused UI tests, full Vitest suite, lint, production build,
`git diff --check`, and `git status --short` before committing.
