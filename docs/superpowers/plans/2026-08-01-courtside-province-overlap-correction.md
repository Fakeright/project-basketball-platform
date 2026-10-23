# COURTSIDE Province Overlap Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the province combobox input group inside its tournament-search grid track at desktop widths.

**Architecture:** Constrain the implicit inner grid column at the `TournamentSearchForm` call site by passing `grid-cols-[minmax(0,1fr)]` through the existing `ProvinceCombobox.className` boundary. Keep the shared combobox implementation and all search behavior unchanged.

**Tech Stack:** Next.js 16.2.11 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, Base UI, Vitest, React Testing Library.

## Global Constraints

- Change only the tournament-search province wrapper.
- Do not modify the shared `ProvinceCombobox` implementation.
- Do not clip overflow or focus indicators.
- Do not change filter values, URL parameters, or province search behavior.
- Verify Home and Tournament List at 1080px, 1280px, 1440px, and 1920px.
- Do not stage `.agents/`, `.claude/`, `.windsurf/`, or `skills-lock.json`.

---

## File Structure

- `components/tournament-search-form.tsx`: supplies the explicit shrinkable inner grid track to the province field.
- `tests/ui/tournament-search-layout.test.tsx`: protects the call-site sizing contract that prevents Base UI intrinsic width from escaping the outer track.

### Task 1: Constrain The Province Inner Grid Track

**Files:**
- Modify: `components/tournament-search-form.tsx`
- Modify: `tests/ui/tournament-search-layout.test.tsx`

**Interfaces:**
- Consumes: `ProvinceCombobox({ className, ...props })` and the existing `TournamentSearchForm` API.
- Produces: the same form behavior with `grid-cols-[minmax(0,1fr)]` applied only to the search-form province wrapper.

- [ ] **Step 1: Extend the regression test before production code**

In the existing responsive-layout test, assert that the rendered province field
has an explicit shrinkable inner grid column:

```tsx
expect(provinceField?.className).toContain(
  "grid-cols-[minmax(0,1fr)]",
)
```

The production regression this catches is removing the call-site constraint,
which restores the implicit `auto` grid track and lets the Base UI group retain
its approximately 258px intrinsic width.

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```powershell
npm run test -- tests/ui/tournament-search-layout.test.tsx
```

Expected: FAIL because the province wrapper currently has `min-w-0` but no
explicit inner grid column.

- [ ] **Step 3: Apply the minimal call-site correction**

Change only the province `className` in `TournamentSearchForm`:

```tsx
className="min-w-0 grid-cols-[minmax(0,1fr)] gap-1 sm:gap-1.5"
```

- [ ] **Step 4: Run focused UI tests to verify GREEN**

Run:

```powershell
npm run test -- tests/ui/tournament-search-layout.test.tsx tests/ui/interactive-accessibility.test.tsx tests/ui/province-combobox.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Verify real browser geometry**

Measure Home and Tournament List at 1080px, 1280px, 1440px, and 1920px.
For each page and width, confirm these literal conditions:

```text
provinceInputGroup.width <= provinceWrapper.width
provinceInputGroup does not intersect formatWrapper
document.scrollWidth <= document.clientWidth
```

- [ ] **Step 6: Run the full project verification suite**

Run:

```powershell
npm run test
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all commands pass and only the two implementation files, this plan,
and pre-existing user-owned untracked tool files appear before commit.

- [ ] **Step 7: Commit and push**

Run:

```powershell
git add -- components/tournament-search-form.tsx tests/ui/tournament-search-layout.test.tsx docs/superpowers/plans/2026-08-01-courtside-province-overlap-correction.md
git commit -m "fix(search): contain province filter width"
git push origin feat/courtside-public-platform
```
