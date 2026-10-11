# COURTSIDE Tournament Capacity Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the tournament capacity free-form input with common capacity choices and a custom even-number input constrained to 6 through 32 teams.

**Architecture:** Put the capacity invariant in a small tournament-domain policy and reuse it from the presentation schema while retaining domain enforcement during create and update. Add a focused controlled `TournamentCapacityField` for select/custom presentation state, then integrate it through the existing `TournamentEditor` and `FormData` mutation flow.

**Tech Stack:** Next.js 16.2.11 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, Zod, Vitest, React Testing Library, Base UI project conventions.

## Global Constraints

- Capacity must be a whole even number from 6 through 32, inclusive.
- Direct options are exactly 6, 8, 12, 16, 24, and 32 teams.
- Other valid even values use an explicit `กำหนดเอง` mode.
- A new tournament defaults to 16 teams.
- Create, edit, schema, and domain behavior must enforce the same rule.
- Do not change the Prisma schema, registration capacity counting, approval workflow, or bracket generation.
- Keep Thai as the primary user-facing language and preserve accessible visible labels.
- Do not stage `.agents/`, `.claude/`, `.windsurf/`, or `skills-lock.json`.

---

## File Structure

- Create `features/tournament-operations/domain/tournament-capacity.ts`: owns the numeric capacity invariant and range constants.
- Modify `features/tournament-operations/domain/tournament-workflow.ts`: delegates capacity validation to the domain policy.
- Modify `features/admin/presentation/tournament-editor-schema.ts`: applies the domain policy with actionable Thai copy at the HTTP/form boundary.
- Create `tests/features/admin/tournament-editor-schema.test.ts`: covers coercion, valid boundaries, odd values, decimals, and range failures.
- Modify `tests/features/tournament-operations/tournament-workflow.test.ts`: protects domain create validation independently of the UI.
- Modify `tests/api/admin/tournament-submit.test.ts`: proves direct API requests receive a 422 response and Thai capacity message.
- Create `components/admin/tournament-capacity-field.tsx`: owns standard/custom selection state and exposes one `capacity` form value.
- Create `tests/ui/admin/tournament-capacity-field.test.tsx`: covers standard choices, custom mode, edit initialization, and form field uniqueness.
- Modify `components/admin/tournament-editor.tsx`: replaces the numeric `Field` with `TournamentCapacityField` and lets Zod provide Thai validation feedback.
- Modify `tests/ui/admin/tournament-editor.test.tsx`: covers standard/custom payloads and invalid custom submission.

### Task 1: Capacity Domain Policy And Server Validation

**Files:**
- Create: `features/tournament-operations/domain/tournament-capacity.ts`
- Modify: `features/tournament-operations/domain/tournament-workflow.ts`
- Modify: `features/admin/presentation/tournament-editor-schema.ts`
- Create: `tests/features/admin/tournament-editor-schema.test.ts`
- Modify: `tests/features/tournament-operations/tournament-workflow.test.ts`
- Modify: `tests/api/admin/tournament-submit.test.ts`

**Interfaces:**
- Produces: `MIN_TOURNAMENT_CAPACITY`, `MAX_TOURNAMENT_CAPACITY`, and `isValidTournamentCapacity(capacity: number): boolean`.
- Consumes: the existing `TournamentOperationInput`, `tournamentEditorSchema`, `createTournament`, and `saveTournamentHandler` flows.

- [ ] **Step 1: Write failing schema tests for valid and invalid capacities**

Create `tests/features/admin/tournament-editor-schema.test.ts` with a complete valid payload and table-driven assertions:

```ts
import { describe, expect, it } from "vitest"

import { tournamentEditorSchema } from "@/features/admin/presentation/tournament-editor-schema"

const validInput = {
  title: "Capacity Cup",
  description: "การแข่งขันสำหรับทดสอบจำนวนทีม",
  provinceCode: "10",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE",
  ageGroup: "Open",
  startsAt: "2026-12-10T09:00",
  endsAt: "2026-12-11T18:00",
  registrationDeadline: "2026-12-01T23:59",
  rules: "ใช้กติกามาตรฐาน",
}

describe("tournamentEditorSchema capacity", () => {
  it.each([6, 10, 32])("accepts %i teams", (capacity) => {
    const result = tournamentEditorSchema.safeParse({
      ...validInput,
      capacity: String(capacity),
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.capacity).toBe(capacity)
  })

  it.each(["", "abc", "5", "7", "10.5", "33"])(
    "rejects %s teams",
    (capacity) => {
      const result = tournamentEditorSchema.safeParse({
        ...validInput,
        capacity,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "จำนวนทีมต้องเป็นเลขคู่ตั้งแต่ 6 ถึง 32 ทีม",
        )
      }
    },
  )
})
```

- [ ] **Step 2: Extend domain and API tests before production code**

Add domain cases to `tests/features/tournament-operations/tournament-workflow.test.ts`:

```ts
it.each([6, 10, 32])("accepts an even capacity of %i", async (capacity) => {
  const repository = new InMemoryTournamentOperationsRepository()

  await expect(
    createTournament(repository, { ...validInput, capacity }, organizer),
  ).resolves.toMatchObject({ capacity })
})

it.each([5, 7, 10.5, 33])("rejects an invalid capacity of %s", async (capacity) => {
  const repository = new InMemoryTournamentOperationsRepository()

  await expect(
    createTournament(repository, { ...validInput, capacity }, organizer),
  ).rejects.toThrow("CAPACITY_INVALID")
})
```

Add a direct-request case to the `saveTournamentHandler` describe block in `tests/api/admin/tournament-submit.test.ts`:

```ts
it("returns 422 with an actionable message for an odd capacity", async () => {
  const response = await saveTournamentHandler({
    actor: organizer,
    request: new Request("http://localhost/api/admin/tournaments", {
      method: "POST",
      body: JSON.stringify({ ...validTournament, capacity: 7 }),
    }),
    repository: new InMemoryTournamentOperationsRepository(),
  })

  expect(response.status).toBe(422)
  await expect(response.json()).resolves.toEqual({
    message: "จำนวนทีมต้องเป็นเลขคู่ตั้งแต่ 6 ถึง 32 ทีม",
  })
})
```

- [ ] **Step 3: Run focused tests to verify RED**

Run:

```powershell
npm run test -- tests/features/admin/tournament-editor-schema.test.ts tests/features/tournament-operations/tournament-workflow.test.ts tests/api/admin/tournament-submit.test.ts
```

Expected: FAIL because the current schema and domain still accept odd values and capacities from 2 through 64.

- [ ] **Step 4: Add the domain capacity policy**

Create `features/tournament-operations/domain/tournament-capacity.ts`:

```ts
export const MIN_TOURNAMENT_CAPACITY = 6
export const MAX_TOURNAMENT_CAPACITY = 32

export function isValidTournamentCapacity(capacity: number): boolean {
  return (
    Number.isInteger(capacity) &&
    capacity % 2 === 0 &&
    capacity >= MIN_TOURNAMENT_CAPACITY &&
    capacity <= MAX_TOURNAMENT_CAPACITY
  )
}
```

Import `isValidTournamentCapacity` into `tournament-workflow.ts` and replace the existing `2..64` condition:

```ts
if (!isValidTournamentCapacity(input.capacity)) {
  throw new Error("CAPACITY_INVALID")
}
```

- [ ] **Step 5: Apply the policy in the Zod presentation schema**

Import the predicate into `tournament-editor-schema.ts`, define the boundary
message once in that module, and replace the current capacity chain:

```ts
const tournamentCapacityMessage =
  "จำนวนทีมต้องเป็นเลขคู่ตั้งแต่ 6 ถึง 32 ทีม"

capacity: z.coerce
  .number({ error: tournamentCapacityMessage })
  .refine(isValidTournamentCapacity, {
    message: tournamentCapacityMessage,
  }),
```

This keeps the HTTP response actionable while the domain continues returning the stable `CAPACITY_INVALID` code.

- [ ] **Step 6: Run focused tests to verify GREEN**

Run:

```powershell
npm run test -- tests/features/admin/tournament-editor-schema.test.ts tests/features/tournament-operations/tournament-workflow.test.ts tests/api/admin/tournament-submit.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the domain and validation checkpoint**

```powershell
git add -- features/tournament-operations/domain/tournament-capacity.ts features/tournament-operations/domain/tournament-workflow.ts features/admin/presentation/tournament-editor-schema.ts tests/features/admin/tournament-editor-schema.test.ts tests/features/tournament-operations/tournament-workflow.test.ts tests/api/admin/tournament-submit.test.ts
git commit -m "feat(tournament): enforce even team capacity"
```

### Task 2: Guided Capacity Field

**Files:**
- Create: `components/admin/tournament-capacity-field.tsx`
- Create: `tests/ui/admin/tournament-capacity-field.test.tsx`

**Interfaces:**
- Consumes: `defaultValue?: number` from an editable tournament.
- Produces: `TournamentCapacityField({ defaultValue }: { defaultValue?: number })` and exactly one successful form field named `capacity`.

- [ ] **Step 1: Write the failing component tests**

Create `tests/ui/admin/tournament-capacity-field.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import { TournamentCapacityField } from "@/components/admin/tournament-capacity-field"

afterEach(cleanup)

describe("TournamentCapacityField", () => {
  it("offers common capacities and defaults to 16 teams", () => {
    render(<TournamentCapacityField />)

    const select = screen.getByLabelText("จำนวนทีมสูงสุด") as HTMLSelectElement
    expect(select.value).toBe("16")
    for (const capacity of [6, 8, 12, 16, 24, 32]) {
      expect(screen.getByRole("option", { name: `${capacity} ทีม` })).toBeTruthy()
    }
    expect(screen.getByRole("option", { name: "กำหนดเอง" })).toBeTruthy()
  })

  it("reveals one custom capacity form value", async () => {
    const user = userEvent.setup()
    const { container } = render(<TournamentCapacityField />)

    await user.selectOptions(screen.getByLabelText("จำนวนทีมสูงสุด"), "CUSTOM")
    const customInput = screen.getByLabelText("ระบุจำนวนทีม")
    await user.type(customInput, "10")

    expect((customInput as HTMLInputElement).value).toBe("10")
    expect(container.querySelectorAll('[name="capacity"]')).toHaveLength(1)
  })

  it("opens custom mode for a non-standard edit value", () => {
    render(<TournamentCapacityField defaultValue={10} />)

    expect(
      (screen.getByLabelText("จำนวนทีมสูงสุด") as HTMLSelectElement).value,
    ).toBe("CUSTOM")
    expect(
      (screen.getByLabelText("ระบุจำนวนทีม") as HTMLInputElement).value,
    ).toBe("10")
  })
})
```

- [ ] **Step 2: Run the component test to verify RED**

Run:

```powershell
npm run test -- tests/ui/admin/tournament-capacity-field.test.tsx
```

Expected: FAIL because `TournamentCapacityField` does not exist.

- [ ] **Step 3: Implement the focused controlled field**

Create `components/admin/tournament-capacity-field.tsx` with this behavior:

```tsx
"use client"

import { useState } from "react"

import {
  MAX_TOURNAMENT_CAPACITY,
  MIN_TOURNAMENT_CAPACITY,
} from "@/features/tournament-operations/domain/tournament-capacity"

const STANDARD_CAPACITIES = [6, 8, 12, 16, 24, 32] as const
const CUSTOM_CAPACITY = "CUSTOM"
const fieldClassName =
  "min-h-11 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"

export function TournamentCapacityField({
  defaultValue = 16,
}: {
  defaultValue?: number
}) {
  const isStandard = STANDARD_CAPACITIES.some(
    (capacity) => capacity === defaultValue,
  )
  const [selection, setSelection] = useState(
    isStandard ? String(defaultValue) : CUSTOM_CAPACITY,
  )
  const [customValue, setCustomValue] = useState(
    isStandard ? "" : String(defaultValue),
  )

  return (
    <div className="space-y-2 text-sm">
      <label htmlFor="capacitySelection">จำนวนทีมสูงสุด</label>
      <select
        className={fieldClassName}
        id="capacitySelection"
        onChange={(event) => setSelection(event.target.value)}
        value={selection}
      >
        {STANDARD_CAPACITIES.map((capacity) => (
          <option key={capacity} value={capacity}>
            {capacity} ทีม
          </option>
        ))}
        <option value={CUSTOM_CAPACITY}>กำหนดเอง</option>
      </select>

      {selection === CUSTOM_CAPACITY ? (
        <div className="space-y-2">
          <label htmlFor="customCapacity">ระบุจำนวนทีม</label>
          <input
            className={fieldClassName}
            id="customCapacity"
            inputMode="numeric"
            max={MAX_TOURNAMENT_CAPACITY}
            min={MIN_TOURNAMENT_CAPACITY}
            name="capacity"
            onChange={(event) => setCustomValue(event.target.value)}
            step={2}
            type="number"
            value={customValue}
          />
          <p className="text-xs text-muted-foreground">เลขคู่ตั้งแต่ 6 ถึง 32 ทีม</p>
        </div>
      ) : (
        <input name="capacity" type="hidden" value={selection} />
      )}
    </div>
  )
}
```

Keep the exact CSS conventions aligned with the existing editor, and do not add a new shared design system primitive.

- [ ] **Step 4: Run the component tests to verify GREEN**

Run:

```powershell
npm run test -- tests/ui/admin/tournament-capacity-field.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the reusable field checkpoint**

```powershell
git add -- components/admin/tournament-capacity-field.tsx tests/ui/admin/tournament-capacity-field.test.tsx
git commit -m "feat(tournament): add capacity selector"
```

### Task 3: Editor Integration And Responsive Verification

**Files:**
- Modify: `components/admin/tournament-editor.tsx`
- Modify: `tests/ui/admin/tournament-editor.test.tsx`
- Include in final commit: `docs/superpowers/plans/2026-08-04-courtside-tournament-capacity-selector.md`

**Interfaces:**
- Consumes: `TournamentCapacityField({ defaultValue?: number })` and the stricter `tournamentEditorSchema` from Tasks 1 and 2.
- Produces: one create/edit form workflow whose payload contains a numeric `capacity` accepted by both presentation and domain validation.

- [ ] **Step 1: Extend editor tests before integration**

In the existing valid-save test, assert the default payload:

```ts
expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
  capacity: 16,
})
```

Add a custom-capacity save test:

```tsx
it("saves a valid custom even capacity", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({ tournament: { id: "tournament-10", version: 0 } }),
      { status: 201 },
    ),
  )
  vi.stubGlobal("fetch", fetchMock)
  const user = userEvent.setup()

  render(<TournamentEditor initialTournament={null} />)
  await fillValidTournament(user)
  await user.selectOptions(screen.getByLabelText("จำนวนทีมสูงสุด"), "CUSTOM")
  await user.type(screen.getByLabelText("ระบุจำนวนทีม"), "10")
  await user.click(screen.getByRole("button", { name: "บันทึกฉบับร่าง" }))

  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
    capacity: 10,
  })
})
```

Add the odd-value rejection test:

```tsx
it("blocks an odd custom capacity before sending a request", async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal("fetch", fetchMock)
  const user = userEvent.setup()

  render(<TournamentEditor initialTournament={null} />)
  await fillValidTournament(user)
  await user.selectOptions(screen.getByLabelText("จำนวนทีมสูงสุด"), "CUSTOM")
  await user.type(screen.getByLabelText("ระบุจำนวนทีม"), "7")
  await user.click(screen.getByRole("button", { name: "บันทึกฉบับร่าง" }))

  expect(
    await screen.findByText("จำนวนทีมต้องเป็นเลขคู่ตั้งแต่ 6 ถึง 32 ทีม"),
  ).toBeTruthy()
  expect(fetchMock).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run editor tests to verify RED**

Run:

```powershell
npm run test -- tests/ui/admin/tournament-editor.test.tsx
```

Expected: FAIL because the editor still exposes the old free-form number input and has no custom mode.

- [ ] **Step 3: Integrate `TournamentCapacityField`**

Import the new component in `components/admin/tournament-editor.tsx`:

```tsx
import { TournamentCapacityField } from "./tournament-capacity-field"
```

Replace the current capacity `Field` block with:

```tsx
<TournamentCapacityField defaultValue={tournament?.capacity} />
```

Add `noValidate` to the editor form so Zod consistently supplies the approved Thai message rather than a browser-dependent native message:

```tsx
<form className="space-y-8" noValidate onSubmit={handleSubmit}>
```

Do not alter how `FormData`, the API endpoint, or returned tournament identity is handled.

- [ ] **Step 4: Run all focused feature tests to verify GREEN**

Run:

```powershell
npm run test -- tests/ui/admin/tournament-capacity-field.test.tsx tests/ui/admin/tournament-editor.test.tsx tests/features/admin/tournament-editor-schema.test.ts tests/features/tournament-operations/tournament-workflow.test.ts tests/api/admin/tournament-submit.test.ts
```

Expected: PASS.

- [ ] **Step 5: Verify the real create and edit layouts**

Use an organizer development session and inspect `/organizer/tournaments/new` plus an editable `/organizer/tournaments/[id]` page at widths 375px, 768px, and 1440px. Confirm:

```text
default standard select shows 16 teams
custom mode reveals the labeled numeric input
custom input shows and retains an edit value such as 10
no field overlaps an adjacent control
document.scrollWidth <= document.clientWidth
odd custom submission shows จำนวนทีมต้องเป็นเลขคู่ตั้งแต่ 6 ถึง 32 ทีม
```

- [ ] **Step 6: Run the complete project verification**

Run each command and inspect its exit code:

```powershell
npm run test
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all commands pass. Only task files and the pre-existing user-owned untracked tool files appear before the final commit.

- [ ] **Step 7: Commit the integration and plan**

```powershell
git add -- components/admin/tournament-editor.tsx tests/ui/admin/tournament-editor.test.tsx docs/superpowers/plans/2026-08-04-courtside-tournament-capacity-selector.md
git commit -m "feat(tournament): integrate capacity selection"
```

- [ ] **Step 8: Push the completed feature branch**

```powershell
git push origin feat/courtside-public-platform
```

Expected: the three feature commits and the approved design commit are available on `origin/feat/courtside-public-platform`.
