# COURTSIDE Tournament Age Group Selector Design

## Goal

Replace free-form tournament age-group entry with one canonical set of choices
across tournament creation, editing, public search, HTTP validation, and domain
validation.

The supported age groups are exactly:

- `U12`
- `U14`
- `U16`
- `U18`
- `U23`
- `Open`

Custom age groups are not supported.

## Scope

- Apply the selector to the existing `TournamentEditor` for create and edit.
- Apply the selector to `TournamentSearchForm` on Home and Tournament List.
- Reject unsupported values at presentation and domain boundaries.
- Restrict parsed search filters to the canonical values.
- Keep the Prisma `ageGroup` column as `String`; no migration is required.
- Do not alter tournament formats, registration eligibility, brackets, or
  existing tournament records in this slice.

## Source Of Truth

Create a small tournament domain module that exports the ordered canonical
values and a predicate:

```ts
export const TOURNAMENT_AGE_GROUPS = [
  "U12",
  "U14",
  "U16",
  "U18",
  "U23",
  "Open",
] as const

export function isTournamentAgeGroup(value: string): boolean
```

Presentation components, URL parsing, and domain validation consume this
module. The database remains a storage detail and does not define UI options.

## Tournament Editor

Replace the age-group text input with a native select labeled `รุ่นอายุ`.

For a new tournament, the first selected option is an empty prompt:
`เลือกรุ่นอายุ`. It is not a valid submitted value. The organizer must make a
deliberate choice before the draft can be saved.

For an existing tournament whose value is supported, select the matching
canonical option. For an existing legacy value such as `U20` or `35+`, show
the empty prompt and require the organizer to choose a supported value before
the next successful save. Do not silently map or overwrite a legacy value.

The editor continues to submit one `ageGroup` string through the existing
`FormData` and mutation flow.

## Public Search

Replace the age-group search text input with the existing shadcn/Base UI
select pattern used by the format filter.

The search choices are:

- `ทั้งหมด`, represented by no `ageGroup` query parameter;
- the six canonical age groups in their defined order.

An initial valid `ageGroup` URL value selects its matching option. Missing,
empty, or unsupported URL values select `ทั้งหมด` and are omitted when the
next URL is generated.

Repository filtering uses an exact case-insensitive age-group match instead of
substring matching. This prevents a canonical filter from accidentally
matching unrelated legacy text. The general keyword query may continue to
search the age-group text as it does today.

## Validation And Errors

`tournamentEditorSchema` keeps `ageGroup` as a string at its module boundary
but refines it with `isTournamentAgeGroup`. Invalid values receive the Thai
message:

`กรุณาเลือกรุ่นอายุจากรายการ`

`validateTournamentInput` independently enforces the same domain policy and
throws the stable code `AGE_GROUP_INVALID`. Direct create and update requests
therefore cannot bypass the selector.

`parseTournamentSearchParams` accepts only canonical values. Search filtering
does not return an error for an unsupported URL value; it safely ignores that
filter and canonicalizes the next generated URL.

## Legacy Data

- Existing unsupported values remain unchanged in PostgreSQL.
- Public tournament rows and details may continue displaying those values.
- Legacy values remain discoverable through the general keyword search.
- The dedicated age-group dropdown does not expose legacy values.
- Editing a legacy tournament requires choosing a supported value before save.
- No automatic data migration or destructive cleanup is performed.

## Testing

- Domain tests accept all six canonical values and reject empty, custom, and
  legacy values.
- Schema and Route Handler tests verify the Thai validation response for an
  unsupported direct request.
- Editor tests verify the empty create prompt, supported edit initialization,
  legacy edit fallback, and submitted payload.
- Search tests verify all options, `ทั้งหมด`, URL serialization, invalid URL
  handling, and exact repository filtering.
- Accessibility tests verify visible labels and the select control contract.
- Browser verification covers Home, Tournament List, create, and edit layouts
  at approximately 375px, 768px, and 1440px without overlap or horizontal page
  overflow where authenticated pages are available.

## Acceptance Criteria

- Create and edit offer only U12, U14, U16, U18, U23, and Open.
- New tournaments require an explicit age-group selection.
- Unsupported direct mutation payloads return a 422 response with actionable
  Thai copy.
- Home and Tournament List offer `ทั้งหมด` plus the six canonical values.
- A supported search selection survives URL navigation and page reload.
- Unsupported URL values are ignored rather than queried.
- Age-group filtering is exact and case-insensitive.
- Existing legacy records are neither migrated nor deleted.
