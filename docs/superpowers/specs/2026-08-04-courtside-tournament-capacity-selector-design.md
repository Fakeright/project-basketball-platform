# COURTSIDE Tournament Capacity Selector Design

## Goal

Replace the free-form tournament capacity input with a guided selector that
keeps tournament capacity within an even-numbered range from 6 through 32
teams. Organizers can select a common capacity quickly or enter another valid
even capacity through an explicit custom mode.

## Scope

- Apply the behavior to both tournament creation and tournament editing
  through the existing `TournamentEditor`.
- Keep `16` teams as the default for a new tournament.
- Do not change registration capacity counting, approval workflows, database
  columns, or bracket generation in this slice.
- Existing tournaments with a capacity outside the new rule must choose a new
  valid capacity before their next successful save.

## Interaction Design

Introduce a focused `TournamentCapacityField` component with a visible label
of `จำนวนทีมสูงสุด`.

The select contains these choices:

- `6 ทีม`
- `8 ทีม`
- `12 ทีม`
- `16 ทีม`
- `24 ทีม`
- `32 ทีม`
- `กำหนดเอง`

Selecting a standard value submits that number as `capacity`. Selecting
`กำหนดเอง` reveals a numeric input beneath the select. The custom input accepts
whole even numbers from 6 through 32, including values such as 10, 14, 18, 20,
22, 26, 28, and 30.

When editing, a standard capacity selects its matching option. A valid
non-standard even capacity opens custom mode and pre-fills the custom input.
The control remains dimensionally stable and uses native select and number
input behavior for keyboard and mobile accessibility.

## Component Boundary

`TournamentCapacityField` owns only presentation state:

- the selected standard option or custom mode;
- the current custom value;
- exposing exactly one successful form value under the name `capacity`.

`TournamentEditor` continues to collect `FormData` and parse it through
`tournamentEditorSchema`. The capacity component does not call APIs or contain
business policy.

## Validation And Data Flow

The browser control improves input ergonomics, but validation remains
authoritative at both existing server boundaries:

1. `TournamentCapacityField` constrains the custom input with `min=6`,
   `max=32`, and `step=2`.
2. `tournamentEditorSchema` coerces the submitted value to a number and rejects
   non-integers, odd values, and values outside 6 through 32.
3. `validateTournamentInput` enforces the same rule independently in the
   tournament domain before create or update operations proceed.

All invalid capacity cases use the Thai message:

`จำนวนทีมต้องเป็นเลขคู่ตั้งแต่ 6 ถึง 32 ทีม`

This rule applies to create and edit requests, including direct API requests
that bypass the UI.

## Error Handling

- Empty, non-numeric, decimal, odd, below-range, and above-range values fail
  before a mutation request is sent from the editor.
- Direct requests with an invalid capacity fail through the existing typed
  validation response path.
- Switching between standard and custom modes must not submit duplicate
  `capacity` fields or retain a stale hidden value.
- Other tournament validation and error messages remain unchanged.

## Testing

- Component tests verify the standard options, the default value, custom-field
  visibility, and edit-mode initialization.
- Editor tests verify that standard and custom capacities produce the expected
  numeric API payload and that an odd custom value prevents submission.
- Schema tests accept 6, 10, and 32, and reject 5, 7, 33, and decimal values.
- Domain tests enforce the same accepted and rejected boundaries.
- Browser verification covers create and edit layouts at approximately 375px,
  768px, and 1440px without overlap or horizontal page overflow.

## Acceptance Criteria

- A new tournament starts with `16 ทีม` selected.
- Organizers can select 6, 8, 12, 16, 24, or 32 teams directly.
- Organizers can use custom mode for any other even capacity from 6 through 32.
- No odd, decimal, below-range, or above-range capacity reaches persistence.
- Create and edit behavior use the same component and validation policy.
- Registration and database behavior remain unchanged apart from receiving a
  capacity that satisfies the stricter rule.
