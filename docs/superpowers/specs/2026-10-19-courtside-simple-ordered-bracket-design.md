# COURTSIDE Simple Ordered Bracket Design

## Goal

Make the system-generated single-elimination bracket easy to demonstrate and
explain: the organizer places approved teams in a visible order or shuffles
them, adjacent teams meet, and winners move to the next round. New generated
brackets have no seeding formula and no first-round byes. Scheduling, result
confirmation, and the external PDF/image bracket workflow stay intact.

This focused specification supersedes the seeding, bye, and capacity choices
in the 2026-08-18 competition bracket specification for new system-generated
brackets. Existing bracket records remain historical data.

## User Workflow

1. New tournaments offer maximum team capacities of 8, 16, or 32 only.
2. After registration closes, the organizer locks the approved team snapshot
   as before. Locking remains available for 2-32 approved teams up to the
   tournament capacity, because external-document brackets must continue to
   work even when the number of approved teams does not fill a system bracket.
3. In `SYSTEM_GENERATED` mode, the organizer chooses either `เรียงทีมเอง` or
   `สุ่มลำดับ`. Manual mode displays numbered positions with accessible move-up
   and move-down controls. The initial manual order is the locked entry order.
4. Manual changes remain local until the organizer creates a bracket preview.
   The server validates that every locked entry occurs exactly once in the
   submitted order. The organizer may preview again only while the bracket is
   a draft and no match has been scheduled or started.
5. Random mode shuffles the locked entries on the server. Reopening the same
   draw preserves its order and draw token; an explicit redraw creates a new
   token and order. The UI distinguishes previewing the current draw from
   drawing again and requires confirmation before replacing a draft draw.
6. The organizer reviews the persisted preview before publication. Public
   bracket, schedule, scores, and result advancement use the existing flow.
7. `EXTERNAL_DOCUMENT` mode, including PDF/PNG/JPG/WEBP upload, revisions,
   publication, and its manual schedule/results, remains available and is not
   subject to the 8/16/32 approved-entry rule.

## System Bracket Rules

- Only exactly 8, 16, or 32 approved, locked entries can generate a new system
  bracket, regardless of whether the tournament capacity is higher. For
  example, capacity 16 with 8 approved teams may create an 8-team bracket;
  with 12 approved teams it cannot generate a system bracket, but it may use
  an external document.
- Positions 1 and 2 form match 1, positions 3 and 4 form match 2, and so on.
  Winners of adjacent matches form the next round. The final winner is the
  champion. No ranking, mirrored-seed placement, or bye assignment is used.
- The server, not the browser, enforces the count and the complete, unique
  ordered-entry list. Generation keeps existing ownership, governance,
  optimistic-version, audit, and started-match checks. A published bracket
  must be unpublished through the existing workflow before reordering or
  redrawing. A scheduled match blocks regeneration; this scope adds no
  schedule-clearing action, and generation never silently discards schedules.
- A tournament with an unsupported approved count shows an actionable Thai
  message stating that system generation needs 8, 16, or 32 approved teams.
  It must not silently drop teams or generate a partial bracket.
- Generated matches retain the existing `nextMatchId` and `nextSlot` links.
  Schedule entry, score recording, result confirmation, public views, and
  winner advancement require no behavioral change.

## Data And Compatibility

- Add distinct generation-method values for ordered manual and ordered random
  brackets; keep `SEEDED` and `RANDOM` readable for legacy brackets. A Prisma
  migration extends the enum without rewriting existing rows.
- Existing persisted matches and published brackets are never regenerated
  automatically. Legacy bracket previews and public pages continue to display
  their saved matches. An unscheduled, unstarted legacy draft may be explicitly
  rebuilt with the new ordered method; a published legacy bracket must first
  be unpublished, then the organizer sees the new preview before republishing.
- Existing tournaments whose capacity is not 8/16/32 remain readable. An
  unrelated edit may retain the unchanged legacy capacity, but a capacity
  change must choose 8, 16, or 32. New tournaments always use the new set.
- The new methods may store a 1-based position in the existing `seed` and
  `drawPosition` columns for database compatibility, but code and UI must call
  it `position` or `order`, never a competitive seed. Historical rows keep
  their original meaning.
- External-document mode keeps its existing bracket mode, file storage,
  revision history, and manual-match behavior. No PDF parsing or spreadsheet
  import is introduced.

## Boundaries

- Domain: validate supported system entry counts and ordered positions;
  construct adjacent-pair match links without relying on seed mirroring.
- Application: authorize organizer/admin, choose manual or random ordered
  entries, preserve redraw semantics, and persist a preview transactionally.
- Presentation: validate request payloads and show manual reorder controls,
  random actions, preview, and clear blocking messages. Capacity selects show
  only 8/16/32 for new or changed values.
- Infrastructure: extend the Prisma method enum while retaining all existing
  bracket rows and repository mappings.

## Verification

- Domain tests: direct first-round pairs and full winner links for 8, 16, and
  32 entries; reject 6, 10, 12, 14, duplicate positions, missing entries,
  and out-of-range positions.
- Application and route tests: permissions, stale versions, manual order,
  deterministic repeat of a random draw, explicit redraw, unsupported count,
  and no mutation of published, scheduled, or started legacy matches.
- UI tests: only three capacities for new tournaments, legacy capacity display,
  keyboard-accessible reordering, random preview, disabled system generation
  when the count is unsupported, and external PDF/image choice retained.
- Regression tests: schedule, result advancement, public bracket, and
  external-document upload/publication continue to pass.
- Responsive checks at roughly 375, 768, and 1440 pixels, including long Thai
  team names and no horizontal page overflow outside the bracket itself.

## Out Of Scope

No new tournament format, group stage, competitive seeding, bye logic for
new system brackets, PDF parsing, database reset, or automatic conversion of
legacy tournaments and brackets.
