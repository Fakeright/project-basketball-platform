# COURTSIDE Tournament Age Group Selectors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace free-form age-group entry and filtering with the canonical choices U12, U14, U16, U18, U23, and Open across tournament mutations and public discovery.

**Architecture:** Define the ordered choices and membership predicate in the tournament domain, then consume that policy from presentation validation, the editor, search-parameter parsing, and search controls. Keep PostgreSQL storage as `String`, reject unsupported mutation values, ignore unsupported URL filters, and use exact case-insensitive repository filtering.

**Tech Stack:** Next.js 16.2.11 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, shadcn/Base UI Select, Zod, Prisma ORM, Vitest, React Testing Library.

## Global Constraints

- Supported values are exactly `U12`, `U14`, `U16`, `U18`, `U23`, and `Open` in this order.
- Custom age groups are not supported.
- A new tournament must require an explicit age-group selection.
- Search must offer `ทั้งหมด` plus the six canonical values.
- Mutation validation must reject unsupported values in presentation and domain layers.
- Search URL parsing must ignore unsupported age-group values without returning an error.
- Dedicated age-group filtering must be exact and case-insensitive.
- Keep Prisma `ageGroup` as `String`; do not migrate or delete legacy records.
- Legacy records remain publicly displayable and keyword-searchable but require a canonical selection on edit.
- Do not stage `.agents/`, `.claude/`, `.windsurf/`, or `skills-lock.json`.

---

## File Structure

- Create `features/tournament-operations/domain/tournament-age-group.ts`: canonical ordered values and membership predicate.
- Modify `features/tournament-operations/domain/tournament-workflow.ts`: enforce canonical age groups for create/update operations.
- Modify `features/admin/presentation/tournament-editor-schema.ts`: return actionable Thai validation for mutation payloads.
- Modify `tests/features/admin/tournament-editor-schema.test.ts`: schema acceptance and rejection coverage.
- Modify `tests/features/tournament-operations/tournament-workflow.test.ts`: domain policy coverage.
- Modify `tests/api/admin/tournament-submit.test.ts`: direct-request 422 coverage.
- Modify `components/admin/tournament-editor.tsx`: native required selector with safe legacy fallback.
- Modify `tests/ui/admin/tournament-editor.test.tsx`: create/edit options, initialization, and payload behavior.
- Modify `components/tournament-search-form.tsx`: public `ทั้งหมด` plus canonical selector.
- Modify `features/tournaments/presentation/tournament-search-params.ts`: whitelist URL age groups.
- Modify `features/tournaments/infrastructure/prisma-tournament-repository.ts`: exact case-insensitive database filter.
- Modify `features/tournaments/infrastructure/mock-tournament-repository.ts`: mirror exact matching in development data.
- Modify `tests/features/tournaments/tournament-search-params.test.ts`: valid and unsupported URL behavior.
- Modify `tests/features/tournaments/prisma-tournament-repository.test.ts`: Prisma query contract.
- Modify `tests/features/tournaments/search-tournaments.test.ts`: mock exact-match behavior.
- Create `tests/ui/tournament-age-group-filter.test.tsx`: search selector options and URL submission behavior.
- Modify `tests/ui/tournament-search-layout.test.tsx`: stable selector dimensions in the responsive search grid.

### Task 1: Canonical Age Group Policy And Mutation Validation

**Files:**
- Create: `features/tournament-operations/domain/tournament-age-group.ts`
- Modify: `features/tournament-operations/domain/tournament-workflow.ts`
- Modify: `features/admin/presentation/tournament-editor-schema.ts`
- Modify: `tests/features/admin/tournament-editor-schema.test.ts`
- Modify: `tests/features/tournament-operations/tournament-workflow.test.ts`
- Modify: `tests/api/admin/tournament-submit.test.ts`

**Interfaces:**
- Produces: `TOURNAMENT_AGE_GROUPS`, `TournamentAgeGroup`, and `isTournamentAgeGroup(value: string): boolean`.
- Consumes: existing `TournamentOperationInput`, `tournamentEditorSchema`, `createTournament`, and `saveTournamentHandler` boundaries.

- [ ] **Step 1: Write failing schema tests for canonical and unsupported values**

Extend `tests/features/admin/tournament-editor-schema.test.ts` with a separate describe block:

```ts
describe("tournamentEditorSchema age group", () => {
  it.each(["U12", "U14", "U16", "U18", "U23", "Open"])(
    "accepts %s",
    (ageGroup) => {
      const result = tournamentEditorSchema.safeParse({
        ...validInput,
        ageGroup,
        capacity: "16",
      })

      expect(result.success).toBe(true)
      if (result.success) expect(result.data.ageGroup).toBe(ageGroup)
    },
  )

  it.each(["", "U20", "35+", "open"])("rejects %s", (ageGroup) => {
    const result = tournamentEditorSchema.safeParse({
      ...validInput,
      ageGroup,
      capacity: "16",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "กรุณาเลือกรุ่นอายุจากรายการ",
      )
    }
  })
})
```

- [ ] **Step 2: Write failing domain and direct API tests**

Add these cases inside `tests/features/tournament-operations/tournament-workflow.test.ts`:

```ts
it.each(["U12", "U14", "U16", "U18", "U23", "Open"])(
  "accepts the canonical age group %s",
  async (ageGroup) => {
    const repository = new InMemoryTournamentOperationsRepository()

    await expect(
      createTournament(repository, { ...validInput, ageGroup }, organizer),
    ).resolves.toMatchObject({ ageGroup })
  },
)

it.each(["", "U20", "35+", "open"])(
  "rejects the unsupported age group %s",
  async (ageGroup) => {
    const repository = new InMemoryTournamentOperationsRepository()

    await expect(
      createTournament(repository, { ...validInput, ageGroup }, organizer),
    ).rejects.toThrow("AGE_GROUP_INVALID")
  },
)
```

Add this direct-request case to the `saveTournamentHandler` describe block in `tests/api/admin/tournament-submit.test.ts`:

```ts
it("returns 422 for an unsupported age group", async () => {
  const response = await saveTournamentHandler({
    actor: organizer,
    request: new Request("http://localhost/api/admin/tournaments", {
      method: "POST",
      body: JSON.stringify({ ...validTournament, ageGroup: "U20" }),
    }),
    repository: new InMemoryTournamentOperationsRepository(),
  })

  expect(response.status).toBe(422)
  await expect(response.json()).resolves.toEqual({
    message: "กรุณาเลือกรุ่นอายุจากรายการ",
  })
})
```

- [ ] **Step 3: Run mutation tests to verify RED**

Run:

```powershell
npm run test -- tests/features/admin/tournament-editor-schema.test.ts tests/features/tournament-operations/tournament-workflow.test.ts tests/api/admin/tournament-submit.test.ts
```

Expected: FAIL because free-form non-empty age groups such as `U20`, `35+`, and `open` are currently accepted.

- [ ] **Step 4: Add the canonical domain module**

Create `features/tournament-operations/domain/tournament-age-group.ts`:

```ts
export const TOURNAMENT_AGE_GROUPS = [
  "U12",
  "U14",
  "U16",
  "U18",
  "U23",
  "Open",
] as const

export type TournamentAgeGroup = (typeof TOURNAMENT_AGE_GROUPS)[number]

const tournamentAgeGroups = new Set<string>(TOURNAMENT_AGE_GROUPS)

export function isTournamentAgeGroup(
  value: string,
): boolean {
  return tournamentAgeGroups.has(value)
}
```

- [ ] **Step 5: Enforce the policy in domain and Zod validation**

In `tournament-workflow.ts`, remove `ageGroup` from `requiredFields`, import the predicate, and validate before capacity:

```ts
if (!isTournamentAgeGroup(input.ageGroup)) {
  throw new Error("AGE_GROUP_INVALID")
}
```

In `tournament-editor-schema.ts`, import the predicate and replace the existing `requiredText` age-group field:

```ts
ageGroup: z
  .string()
  .trim()
  .refine(isTournamentAgeGroup, {
    message: "กรุณาเลือกรุ่นอายุจากรายการ",
  }),
```

Keep the schema output as a string-compatible canonical value and do not change Prisma types.

- [ ] **Step 6: Run mutation tests to verify GREEN**

Run:

```powershell
npm run test -- tests/features/admin/tournament-editor-schema.test.ts tests/features/tournament-operations/tournament-workflow.test.ts tests/api/admin/tournament-submit.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the mutation policy checkpoint**

```powershell
git add -- features/tournament-operations/domain/tournament-age-group.ts features/tournament-operations/domain/tournament-workflow.ts features/admin/presentation/tournament-editor-schema.ts tests/features/admin/tournament-editor-schema.test.ts tests/features/tournament-operations/tournament-workflow.test.ts tests/api/admin/tournament-submit.test.ts
git commit -m "feat(tournament): enforce canonical age groups"
```

### Task 2: Tournament Editor Age Group Selector

**Files:**
- Modify: `components/admin/tournament-editor.tsx`
- Modify: `tests/ui/admin/tournament-editor.test.tsx`

**Interfaces:**
- Consumes: `TOURNAMENT_AGE_GROUPS` and `isTournamentAgeGroup` from Task 1.
- Produces: a native select named `ageGroup` that submits one canonical string through the existing editor flow.

- [ ] **Step 1: Write failing create and edit selector tests**

Update the editor import and define a complete fixture before the describe block
in `tests/ui/admin/tournament-editor.test.tsx`:

```tsx
import {
  TournamentEditor,
  type EditableTournament,
} from "@/components/admin/tournament-editor"

const editableTournament: EditableTournament = {
  id: "tournament-1",
  title: "Chiang Rai Cup",
  description: "การแข่งขันระดับชุมชน",
  provinceCode: "57",
  venue: "สนามกีฬากลาง",
  format: "FIVE_V_FIVE",
  ageGroup: "Open",
  startsAt: "2026-12-10T09:00",
  endsAt: "2026-12-11T18:00",
  registrationDeadline: "2026-12-01T23:59",
  capacity: 16,
  rules: "ใช้กติกามาตรฐาน",
  version: 1,
}
```

Add these cases:

```tsx
it("requires a canonical age group for a new tournament", () => {
  render(<TournamentEditor initialTournament={null} />)

  const select = screen.getByLabelText("รุ่นอายุ") as HTMLSelectElement
  expect(select.tagName).toBe("SELECT")
  expect(select.value).toBe("")
  expect(
    Array.from(select.options).map((option) => option.textContent),
  ).toEqual([
    "เลือกรุ่นอายุ",
    "U12",
    "U14",
    "U16",
    "U18",
    "U23",
    "Open",
  ])
})

it("selects a supported edit value", () => {
  render(
    <TournamentEditor
      initialTournament={{
        ...editableTournament,
        ageGroup: "U23",
      }}
    />,
  )

  expect((screen.getByLabelText("รุ่นอายุ") as HTMLSelectElement).value).toBe(
    "U23",
  )
})

it("does not silently map a legacy edit value", () => {
  render(
    <TournamentEditor
      initialTournament={{
        ...editableTournament,
        ageGroup: "U20",
      }}
    />,
  )

  expect((screen.getByLabelText("รุ่นอายุ") as HTMLSelectElement).value).toBe(
    "",
  )
})
```

After the RED run, replace the existing inline deadline-test fixture with
`{ ...editableTournament, registrationDeadline: "" }` and change
`fillValidTournament` to select `Open` instead of typing it.

- [ ] **Step 2: Run the editor tests to verify RED**

Run:

```powershell
npm run test -- tests/ui/admin/tournament-editor.test.tsx
```

Expected: FAIL because `รุ่นอายุ` is still a text input and does not expose canonical options.

- [ ] **Step 3: Replace the text field with a native select**

Import the domain values and predicate into `components/admin/tournament-editor.tsx`:

```tsx
import {
  TOURNAMENT_AGE_GROUPS,
  isTournamentAgeGroup,
} from "@/features/tournament-operations/domain/tournament-age-group"
```

Derive a safe edit default before returning JSX:

```ts
const selectedAgeGroup =
  tournament?.ageGroup && isTournamentAgeGroup(tournament.ageGroup)
    ? tournament.ageGroup
    : ""
```

Replace the age-group `Field` with:

```tsx
<label className="space-y-2 text-sm">
  <span>รุ่นอายุ</span>
  <select
    className={fieldClassName}
    defaultValue={selectedAgeGroup}
    name="ageGroup"
  >
    <option disabled value="">
      เลือกรุ่นอายุ
    </option>
    {TOURNAMENT_AGE_GROUPS.map((ageGroup) => (
      <option key={ageGroup} value={ageGroup}>
        {ageGroup}
      </option>
    ))}
  </select>
</label>
```

Update `fillValidTournament`:

```ts
await user.selectOptions(screen.getByLabelText("รุ่นอายุ"), "Open")
```

- [ ] **Step 4: Verify editor behavior GREEN**

Run:

```powershell
npm run test -- tests/ui/admin/tournament-editor.test.tsx tests/features/admin/tournament-editor-schema.test.ts tests/api/admin/tournament-submit.test.ts
```

Expected: PASS, including existing save, custom capacity, deadline, and sequential-save cases.

- [ ] **Step 5: Commit the editor checkpoint**

```powershell
git add -- components/admin/tournament-editor.tsx tests/ui/admin/tournament-editor.test.tsx
git commit -m "feat(tournament): add age group editor selector"
```

### Task 3: Public Search Selector And Exact Filtering

**Files:**
- Modify: `components/tournament-search-form.tsx`
- Modify: `features/tournaments/presentation/tournament-search-params.ts`
- Modify: `features/tournaments/infrastructure/prisma-tournament-repository.ts`
- Modify: `features/tournaments/infrastructure/mock-tournament-repository.ts`
- Modify: `tests/features/tournaments/tournament-search-params.test.ts`
- Modify: `tests/features/tournaments/prisma-tournament-repository.test.ts`
- Modify: `tests/features/tournaments/search-tournaments.test.ts`
- Create: `tests/ui/tournament-age-group-filter.test.tsx`
- Modify: `tests/ui/tournament-search-layout.test.tsx`
- Include in final commit: `docs/superpowers/plans/2026-08-05-courtside-tournament-age-group-selectors.md`

**Interfaces:**
- Consumes: `TOURNAMENT_AGE_GROUPS` and `isTournamentAgeGroup` from Task 1, existing `TournamentSearchFilters`, and existing shadcn/Base UI `Select` primitives.
- Produces: canonical `ageGroup` URL values and exact case-insensitive repository filters.

- [ ] **Step 1: Write failing search-parameter tests**

Extend `tests/features/tournaments/tournament-search-params.test.ts`:

```ts
it.each(["U12", "U14", "U16", "U18", "U23", "Open"])(
  "parses the canonical age group %s",
  (ageGroup) => {
    expect(parseTournamentSearchParams({ ageGroup })).toEqual({ ageGroup })
  },
)

it.each(["U20", "35+", "open"])(
  "ignores the unsupported age group %s",
  (ageGroup) => {
    expect(parseTournamentSearchParams({ ageGroup })).toEqual({})
  },
)
```

- [ ] **Step 2: Write failing exact repository tests**

In `tests/features/tournaments/search-tournaments.test.ts`, add:

```ts
test("does not partially match an age group", async () => {
  await expect(repository.list({ ageGroup: "U1" })).resolves.toEqual([])
})
```

In the existing Prisma query assertion in `tests/features/tournaments/prisma-tournament-repository.test.ts`, change the expected filter to:

```ts
ageGroup: { equals: "u18", mode: "insensitive" },
```

The mock test fails because `U1` currently matches U14/U16/U18 by substring. The Prisma test fails because the adapter still emits `contains`.

- [ ] **Step 3: Write the failing search selector UI test**

Create `tests/ui/tournament-age-group-filter.test.tsx`:

```tsx
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TournamentSearchForm } from "@/components/tournament-search-form"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

describe("TournamentSearchForm age group filter", () => {
  beforeEach(() => push.mockReset())
  afterEach(cleanup)

  it("offers all canonical age groups", async () => {
    const user = userEvent.setup()
    render(<TournamentSearchForm initialFilters={{}} />)

    await user.click(screen.getByLabelText("รุ่นอายุ"))
    for (const option of [
      "ทั้งหมด",
      "U12",
      "U14",
      "U16",
      "U18",
      "U23",
      "Open",
    ]) {
      expect(await screen.findByRole("option", { name: option })).toBeTruthy()
    }
  })

  it("submits a canonical age group in the URL", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <TournamentSearchForm initialFilters={{ query: "Bangkok" }} />,
    )

    await user.click(screen.getByLabelText("รุ่นอายุ"))
    await user.click(await screen.findByRole("option", { name: "U23" }))
    await user.click(within(container).getByRole("button", { name: "ค้นหา" }))

    expect(push).toHaveBeenCalledWith(
      "/tournaments?q=Bangkok&ageGroup=U23",
    )
  })

  it("restores a canonical age group from initial filters", () => {
    render(<TournamentSearchForm initialFilters={{ ageGroup: "U18" }} />)

    expect(screen.getByLabelText("รุ่นอายุ").textContent).toContain("U18")
  })

  it("clears an initial age group with all", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <TournamentSearchForm
        initialFilters={{ ageGroup: "U18", query: "Bangkok" }}
      />,
    )

    await user.click(screen.getByLabelText("รุ่นอายุ"))
    await user.click(await screen.findByRole("option", { name: "ทั้งหมด" }))
    await user.click(within(container).getByRole("button", { name: "ค้นหา" }))

    expect(push).toHaveBeenCalledWith("/tournaments?q=Bangkok")
  })
})
```

- [ ] **Step 4: Run search tests to verify RED**

Run:

```powershell
npm run test -- tests/features/tournaments/tournament-search-params.test.ts tests/features/tournaments/search-tournaments.test.ts tests/features/tournaments/prisma-tournament-repository.test.ts tests/ui/tournament-age-group-filter.test.tsx tests/ui/tournament-search-layout.test.tsx
```

Expected: FAIL because URL parsing accepts arbitrary text, repositories use substring matching, and the search form exposes a text input.

- [ ] **Step 5: Whitelist URL age groups and use exact repository matching**

In `tournament-search-params.ts`, import `isTournamentAgeGroup` and change result construction:

```ts
...(ageGroup && isTournamentAgeGroup(ageGroup) ? { ageGroup } : {}),
```

In `prisma-tournament-repository.ts`, replace only the dedicated age-group condition:

```ts
...(filters.ageGroup
  ? {
      ageGroup: {
        equals: filters.ageGroup,
        mode: "insensitive" as const,
      },
    }
  : {}),
```

Keep general keyword search using `containsText` so legacy values remain discoverable.

In `mock-tournament-repository.ts`, add:

```ts
function matchesExactText(value: string, filter: string): boolean {
  return normalize(value) === normalize(filter)
}
```

Then replace only the dedicated age-group condition:

```ts
(!filters.ageGroup || matchesExactText(tournament.ageGroup, filters.ageGroup))
```

- [ ] **Step 6: Replace the public text input with the existing Select pattern**

Import `TOURNAMENT_AGE_GROUPS` into `components/tournament-search-form.tsx`. Replace the age-group `Input` block with:

```tsx
<div className="grid min-w-0 gap-1 sm:gap-1.5">
  <label className="text-xs font-medium" htmlFor="ageGroup">
    รุ่นอายุ
  </label>
  <Select
    defaultValue={initialFilters.ageGroup ?? null}
    items={[
      { label: "ทั้งหมด", value: null },
      ...TOURNAMENT_AGE_GROUPS.map((ageGroup) => ({
        label: ageGroup,
        value: ageGroup,
      })),
    ]}
    name="ageGroup"
  >
    <SelectTrigger className="h-10! w-full" id="ageGroup">
      <SelectValue placeholder="ทั้งหมด" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value={null}>ทั้งหมด</SelectItem>
      {TOURNAMENT_AGE_GROUPS.map((ageGroup) => (
        <SelectItem key={ageGroup} value={ageGroup}>
          {ageGroup}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

In `tests/ui/tournament-search-layout.test.tsx`, capture the age-group control and assert `h-10!` so the selector remains aligned with format and adjacent fields:

```ts
const ageGroupControl = screen.getByLabelText("รุ่นอายุ")
expect(ageGroupControl.className).toContain("h-10!")
```

- [ ] **Step 7: Run all focused tests to verify GREEN**

Run:

```powershell
npm run test -- tests/features/tournaments/tournament-search-params.test.ts tests/features/tournaments/search-tournaments.test.ts tests/features/tournaments/prisma-tournament-repository.test.ts tests/ui/tournament-age-group-filter.test.tsx tests/ui/tournament-search-layout.test.tsx tests/ui/interactive-accessibility.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Verify responsive behavior in the browser**

Inspect Home and Tournament List at 375px, 768px, and 1440px. With an organizer development session where available, inspect create and edit at the same widths. Confirm:

```text
Home and Tournament List show ทั้งหมด plus six canonical age groups
the selected filter survives navigation to ?ageGroup=U18
new tournament editor starts at เลือกรุ่นอายุ
supported edit values remain selected
age-group controls stay inside their grid tracks
document.scrollWidth <= document.clientWidth
```

- [ ] **Step 9: Run complete project verification**

Run each command and inspect the complete output:

```powershell
npm run test
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all commands pass. Only feature files, this plan, and the pre-existing user-owned untracked tool files appear before the final commit.

- [ ] **Step 10: Commit and push the search integration**

```powershell
git add -- components/tournament-search-form.tsx features/tournaments/presentation/tournament-search-params.ts features/tournaments/infrastructure/prisma-tournament-repository.ts features/tournaments/infrastructure/mock-tournament-repository.ts tests/features/tournaments/tournament-search-params.test.ts tests/features/tournaments/prisma-tournament-repository.test.ts tests/features/tournaments/search-tournaments.test.ts tests/ui/tournament-age-group-filter.test.tsx tests/ui/tournament-search-layout.test.tsx docs/superpowers/plans/2026-08-05-courtside-tournament-age-group-selectors.md
git commit -m "feat(search): add age group selector"
git push origin feat/courtside-public-platform
```

Expected: the approved design commit and all three implementation checkpoints are available on `origin/feat/courtside-public-platform`.
