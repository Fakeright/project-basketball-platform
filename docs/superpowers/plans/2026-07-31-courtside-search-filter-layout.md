# COURTSIDE Search Filter Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent the province filter from crowding adjacent controls and make tournament search fields balanced at mobile, tablet, and desktop widths.

**Architecture:** Keep responsive layout ownership inside `TournamentSearchForm` and leave the shared searchable `ProvinceCombobox` behavior unchanged. Use explicit grid tracks and shrink constraints, then verify real layout geometry in the browser because jsdom does not calculate Tailwind layout.

**Tech Stack:** Next.js 16.2.11 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, Base UI, Vitest, React Testing Library.

## Global Constraints

- Use Thai for user-facing copy.
- Do not change filter values, URL parameters, province search behavior, or database data.
- Do not add dependencies or change the shared Province Combobox presentation.
- Render one field per row on mobile and two equal-width fields per row on tablet.
- Keep the tournament-name search full-width on tablet.
- Preserve balanced desktop tracks and consistent control heights.
- Verify layouts at approximately 375px, 768px, and 1440px.
- Do not stage `.agents/`, `.claude/`, `.windsurf/`, or `skills-lock.json`.

---

## File Structure

- `components/tournament-search-form.tsx`: owns the responsive search grid, field spans, shrink constraints, and filter order.
- `tests/ui/tournament-search-layout.test.tsx`: protects the explicit responsive layout contract rendered by the real search form.

### Task 1: Balance The Tournament Search Grid

**Files:**
- Modify: `components/tournament-search-form.tsx`
- Create: `tests/ui/tournament-search-layout.test.tsx`

**Interfaces:**
- Consumes: `TournamentSearchForm({ initialFilters }: TournamentSearchFormProps)`.
- Produces: the same form API and submission behavior with responsive classes `grid-cols-1 sm:grid-cols-2 lg:grid-cols-6`, a full-width tablet query field, and shrinkable filter wrappers.

- [ ] **Step 1: Write the failing responsive-layout regression test**

Create a test that renders the real form and checks the layout decisions that
prevent crowding:

```tsx
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentSearchForm } from "@/components/tournament-search-form"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe("TournamentSearchForm responsive layout", () => {
  afterEach(() => cleanup())

  it("uses one mobile column, two tablet columns, and shrinkable filter fields", () => {
    const { container } = render(<TournamentSearchForm initialFilters={{}} />)
    const form = container.querySelector("form")
    const queryField = screen.getByLabelText("ค้นหาชื่อรายการ").parentElement
    const provinceField = screen.getByLabelText("จังหวัด").closest(".grid")

    expect(form?.className).toContain("grid-cols-1")
    expect(form?.className).toContain("sm:grid-cols-2")
    expect(form?.className).toContain("lg:grid-cols-6")
    expect(queryField?.className).toContain("sm:col-span-2")
    expect(queryField?.className).toContain("min-w-0")
    expect(provinceField?.className).toContain("min-w-0")
  })
})
```

The production regression this catches is restoring a two-column mobile grid,
removing the tablet full-row query field, or allowing province content to
establish a non-shrinkable grid minimum.

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```powershell
npm run test -- tests/ui/tournament-search-layout.test.tsx
```

Expected: FAIL because the current form starts with an asymmetric two-column
mobile grid and its query and province wrappers do not include `min-w-0`.

- [ ] **Step 3: Implement the minimal responsive grid change**

In `TournamentSearchForm`:

```tsx
<form
  className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-6"
  onSubmit={handleSubmit}
>
```

Give the query wrapper:

```tsx
className="grid min-w-0 gap-1 sm:col-span-2 sm:gap-1.5 lg:col-span-2"
```

Pass `min-w-0` in the province wrapper class and add the same shrink constraint
to format, age group, venue, and date wrappers. Move the date field before the
search button so the action remains last in keyboard and visual order. Keep
all existing names, IDs, values, labels, and submission logic unchanged.

- [ ] **Step 4: Run focused UI tests to verify GREEN**

Run:

```powershell
npm run test -- tests/ui/tournament-search-layout.test.tsx tests/ui/interactive-accessibility.test.tsx tests/ui/province-combobox.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Verify responsive geometry in the browser**

At `http://127.0.0.1:3000/` and
`http://127.0.0.1:3000/tournaments`, inspect approximately 375px, 768px, and
1440px. Confirm:

- No horizontal document overflow.
- No field border or text overlaps another field.
- Mobile renders one field per row.
- Tablet renders two equal-width fields and a full-row query field.
- Province, format, age group, venue, date, and search action have stable
  control heights.

- [ ] **Step 6: Run the project verification suite**

Run:

```powershell
npm run test
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all commands pass; status contains only the intended plan,
implementation, test, and pre-existing user-owned untracked tool files.

- [ ] **Step 7: Commit and push the implementation**

Run:

```powershell
git add -- docs/superpowers/plans/2026-07-31-courtside-search-filter-layout.md components/tournament-search-form.tsx tests/ui/tournament-search-layout.test.tsx
git commit -m "fix(search): balance responsive filter layout"
git push origin feat/courtside-public-platform
```
