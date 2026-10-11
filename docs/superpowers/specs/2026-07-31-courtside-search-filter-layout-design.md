# COURTSIDE Search Filter Layout Design

## Goal

Prevent the province control from crowding adjacent tournament search fields
while keeping every filter readable, touch-friendly, and consistent across
Home and Tournament List.

## Scope

This slice changes only the responsive layout of
`TournamentSearchForm`. It does not change filter values, URL parameters,
province search behavior, database data, or the shared Province Combobox used
by team and tournament management forms.

## Responsive Layout

- At narrow mobile widths, render one field per row.
- At tablet widths, render two equal-width fields per row. The tournament-name
  search spans the full row.
- At desktop widths, retain a compact multi-column filter layout with balanced
  tracks for province, format, age group, venue, date, and the search action.
- Add `min-width: 0` constraints at the grid and field boundaries so long
  province labels cannot expand their track or cover adjacent controls.
- Keep all inputs, selects, the province combobox, and the search button at a
  consistent control height within each breakpoint.

The search action remains at the end of the filter sequence. The layout may
wrap into additional rows when required; preserving readable controls takes
priority over forcing every filter onto one line.

## Component Boundaries

The responsive track and span rules belong to `TournamentSearchForm`.
`ProvinceCombobox` keeps its current searchable 77-province behavior and
shared presentation so organizer and team forms are unaffected.

## Testing And Verification

A focused UI regression test verifies the form's responsive grid contract,
the full-width tournament-name field at tablet size, and shrink constraints on
filter fields. Existing interaction tests continue to cover labels, province
selection, and URL submission.

Visual verification covers approximately 375px, 768px, and 1440px on both
Home and Tournament List, checking for overlap, horizontal overflow, stable
control heights, and a balanced relationship between province and adjacent
fields.
