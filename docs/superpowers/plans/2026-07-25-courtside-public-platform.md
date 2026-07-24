# COURTSIDE Public Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Thai-first, responsive public COURTSIDE tournament discovery experience with mock data and clean seams for the later Prisma/Supabase backend.

**Architecture:** Next.js App Router pages remain Server Components and call feature use cases. Use cases depend on a `TournamentRepository` contract implemented by an in-memory adapter. Client Components are limited to theme selection and URL-backed search controls.

**Tech Stack:** Next.js 16.2.11, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Lucide, next-themes, Vitest.

## Global Constraints

- Keep Next.js at `16.2.11`; use App Router conventions and async `params` and `searchParams` route props.
- Use Thai as the primary UI language. Do not add an i18n framework in this phase.
- Use Server Components by default. Add `'use client'` only for browser state, event handlers, or `next-themes`.
- Apply editorial minimalism plus modern Swiss design: no purple/blue/pink full-page gradients, no glassmorphism, no repeated rounded-card sections, and no nested cards.
- Use shadcn/ui controls only where controls are needed. Use Lucide icons for icon buttons and give unfamiliar icons tooltips.
- Preserve responsive behavior at 375px, 768px, and 1440px. Brackets must scroll horizontally on narrow screens.
- Do not connect Prisma, Supabase, authentication, uploads, notifications, or analytics in this implementation.
- Each task must run the listed tests before its commit. Do not stage unrelated files.

---

## Planned File Structure

```text
app/
  (public)/layout.tsx
  (public)/page.tsx
  (public)/tournaments/page.tsx
  (public)/tournaments/[slug]/page.tsx
  (public)/schedule/page.tsx
  (public)/bracket/page.tsx
  loading.tsx
  error.tsx
  not-found.tsx
components/
  site-header.tsx
  theme-provider.tsx
  theme-toggle.tsx
  state-panel.tsx
  tournament-search-form.tsx
  tournament-row.tsx
  schedule-table.tsx
  bracket-view.tsx
components/ui/                  shadcn CLI output only
features/tournaments/
  domain/tournament.ts
  application/search-tournaments.ts
  application/get-tournament-by-slug.ts
  infrastructure/mock-tournament-repository.ts
  infrastructure/mock-tournament-data.ts
  infrastructure/tournament-repository.ts
  presentation/tournament-filters.ts
  presentation/tournament-search-params.ts
  presentation/tournament-view-model.ts
tests/features/tournaments/
  search-tournaments.test.ts
  get-tournament-by-slug.test.ts
  tournament-search-params.test.ts
lib/utils.ts
vitest.config.mts
```

### Task 1: Configure the UI, Theme, and Test Toolchain

**Files:**
- Modify: `package.json`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `components.json`
- Create: `components/theme-provider.tsx`
- Create: `components/theme-toggle.tsx`
- Create: `lib/utils.ts`
- Create: `vitest.config.mts`

**Interfaces:**
- Produces `ThemeProvider({ children }: { children: React.ReactNode })` and `ThemeToggle()` for Task 3.
- Produces the `cn(...inputs: ClassValue[])` helper used by all shared components.

- [ ] **Step 1: Install required dependencies and initialize shadcn/ui**

```powershell
npm install next-themes lucide-react
npm install -D vitest
npx shadcn@latest init
# Select: Next.js project, Neutral base color, CSS variables enabled, and pointer cursor enabled.
npx shadcn@latest add button input select sheet skeleton tooltip
```

- [ ] **Step 2: Add the failing domain-test command**

Add this script to `package.json` before creating tests:

```json
"test": "vitest run"
```

Run: `npm run test -- --passWithNoTests`

Expected: PASS with no test files found.

- [ ] **Step 3: Add minimal test and utility configuration**

Create `vitest.config.mts`:

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
```

Install the referenced plugin:

```powershell
npm install -D vite-tsconfig-paths
```

Create `lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Implement global theme boundaries**

Create `components/theme-provider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>{children}</NextThemesProvider>;
}
```

Create `components/theme-toggle.tsx` using `Sun`, `Moon`, `Button`, and `Tooltip`; toggle `setTheme(resolvedTheme === "dark" ? "light" : "dark")`.

Update `app/layout.tsx` to set `lang="th"`, use `suppressHydrationWarning` on `<html>`, wrap children with `ThemeProvider`, and replace default metadata with `COURTSIDE` Thai tournament metadata.

Replace starter colors in `app/globals.css` with neutral paper/ink custom properties, dark equivalents, and a small accent palette (`court` orange, `scoreboard` green, `court-blue`). Do not add gradients.

- [ ] **Step 5: Verify toolchain and commit**

Run:

```powershell
npm run lint
npm run test
npm run build
git add package.json package-lock.json components.json app/layout.tsx app/globals.css components/theme-provider.tsx components/theme-toggle.tsx lib/utils.ts vitest.config.mts
git commit -m "chore: configure courtside UI foundation"
```

Expected: all commands exit `0`.

### Task 2: Model Tournament Data and Repository Boundaries

**Files:**
- Create: `features/tournaments/domain/tournament.ts`
- Create: `features/tournaments/infrastructure/tournament-repository.ts`
- Create: `features/tournaments/infrastructure/mock-tournament-data.ts`
- Create: `features/tournaments/infrastructure/mock-tournament-repository.ts`
- Create: `features/tournaments/application/search-tournaments.ts`
- Create: `features/tournaments/application/get-tournament-by-slug.ts`
- Test: `tests/features/tournaments/search-tournaments.test.ts`
- Test: `tests/features/tournaments/get-tournament-by-slug.test.ts`

**Interfaces:**
- Produces `Tournament`, `TournamentStatus`, `TournamentFormat`, `TournamentSearchFilters`, and `Match`.
- Produces `TournamentRepository.list(filters)` and `TournamentRepository.findBySlug(slug)` for Tasks 4-6.

- [ ] **Step 1: Write failing use-case tests**

Create `tests/features/tournaments/search-tournaments.test.ts` with these assertions:

```ts
expect(searchTournaments(repository, { province: "Bangkok" })).resolves.toHaveLength(1);
expect(searchTournaments(repository, { format: "THREE_V_THREE" })).resolves.toEqual([
  expect.objectContaining({ slug: "north-court-3x3" }),
]);
expect(searchTournaments(repository, { query: "open" })).resolves.toEqual([
  expect.objectContaining({ slug: "bangkok-open-2026" }),
]);
```

Create `tests/features/tournaments/get-tournament-by-slug.test.ts`:

```ts
expect(getTournamentBySlug(repository, "bangkok-open-2026")).resolves.toMatchObject({ title: "Bangkok Open 2026" });
expect(getTournamentBySlug(repository, "missing")).resolves.toBeNull();
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- tests/features/tournaments`

Expected: FAIL because application modules do not exist.

- [ ] **Step 3: Implement domain contracts and mock adapter**

Create `features/tournaments/domain/tournament.ts` with these public contracts:

```ts
export type TournamentStatus = "OPEN" | "CLOSED" | "ONGOING" | "COMPLETED";
export type TournamentFormat = "FIVE_V_FIVE" | "THREE_V_THREE";

export interface TournamentSearchFilters {
  query?: string;
  province?: string;
  format?: TournamentFormat;
  ageGroup?: string;
  venue?: string;
  date?: string;
  status?: TournamentStatus;
}

export interface Match {
  id: string;
  tournamentSlug: string;
  round: string;
  court: string;
  scheduledAt: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface Tournament {
  slug: string;
  title: string;
  province: string;
  venue: string;
  format: TournamentFormat;
  ageGroup: string;
  status: TournamentStatus;
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
  description: string;
  teams: string[];
  matches: Match[];
}
```

Create the repository interface:

```ts
export interface TournamentRepository {
  list(filters: TournamentSearchFilters): Promise<Tournament[]>;
  findBySlug(slug: string): Promise<Tournament | null>;
}
```

Implement `MockTournamentRepository` over six Thai tournaments covering each status, both formats, Bangkok/Chiang Mai/Chonburi, and a mix of age groups. Its `list` method normalizes text with `toLocaleLowerCase("th-TH")`, matches all populated filters, and returns newest `startsAt` first.

Implement the two use cases as thin functions that delegate to the repository:

```ts
export function searchTournaments(repository: TournamentRepository, filters: TournamentSearchFilters) {
  return repository.list(filters);
}

export function getTournamentBySlug(repository: TournamentRepository, slug: string) {
  return repository.findBySlug(slug);
}
```

- [ ] **Step 4: Run tests to verify the repository behavior**

Run: `npm run test -- tests/features/tournaments`

Expected: PASS, including exact query, province, and format filtering plus missing-slug behavior.

- [ ] **Step 5: Commit the domain slice**

```powershell
git add features/tournaments tests/features/tournaments
git commit -m "feat: add tournament discovery domain"
```

### Task 3: Implement Shared Public Shell and Reusable State UI

**Files:**
- Create: `app/(public)/layout.tsx`
- Create: `components/site-header.tsx`
- Create: `components/state-panel.tsx`
- Create: `components/tournament-row.tsx`
- Create: `app/loading.tsx`
- Create: `app/error.tsx`
- Create: `app/not-found.tsx`

**Interfaces:**
- Consumes `Tournament` from Task 2.
- Produces `SiteHeader`, `StatePanel`, and `TournamentRow` for Tasks 4-6.

- [ ] **Step 1: Write the failing row view-model test**

Create `tests/features/tournaments/tournament-view-model.test.ts`:

```ts
expect(formatTournamentDateRange("2026-07-27", "2026-07-29")).toBe("27-29 ก.ค. 2026");
expect(formatTournamentFormat("THREE_V_THREE")).toBe("3x3");
```

- [ ] **Step 2: Verify the test fails**

Run: `npm run test -- tournament-view-model`

Expected: FAIL because `presentation/tournament-view-model.ts` is missing.

- [ ] **Step 3: Implement shared visual primitives**

Create `features/tournaments/presentation/tournament-view-model.ts` with `formatTournamentDateRange(start: string, end: string): string` using `Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" })`, and `formatTournamentFormat(format)` returning `5x5` or `3x3`.

Create `SiteHeader` with `Link` navigation to Home, Tournaments, Schedule, and Bracket; use a shadcn `Sheet` for mobile navigation and `ThemeToggle` on every viewport.

Create `TournamentRow` as a bordered, responsive information row, not a rounded card. It links to `/tournaments/${tournament.slug}` and displays date range, title, province/venue, format, age group, and status.

Create `StatePanel` with `kind: "empty" | "error" | "not-found"`, a Thai title/message, and an optional `Link` action. Use it from root loading/error/not-found files. Make `app/error.tsx` a Client Component and wire its retry button to `reset()`.

- [ ] **Step 4: Run tests and application checks**

Run:

```powershell
npm run test -- tournament-view-model
npm run lint
npm run build
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit shared shell**

```powershell
git add app components features/tournaments/presentation tests/features/tournaments/tournament-view-model.test.ts
git commit -m "feat: add courtside public shell"
```

### Task 4: Build Home and URL-Backed Tournament Discovery

**Files:**
- Create: `app/(public)/page.tsx`
- Create: `app/(public)/tournaments/page.tsx`
- Create: `components/tournament-search-form.tsx`
- Create: `features/tournaments/presentation/tournament-search-params.ts`
- Test: `tests/features/tournaments/tournament-search-params.test.ts`

**Interfaces:**
- Consumes `searchTournaments`, `MockTournamentRepository`, `TournamentSearchFilters`, `TournamentRow`, and `StatePanel`.
- Produces `parseTournamentSearchParams` and `toTournamentSearchParams` so filter URL behavior is unit-tested and reusable.

- [ ] **Step 1: Write failing search-param tests**

Create `tests/features/tournaments/tournament-search-params.test.ts`:

```ts
expect(parseTournamentSearchParams({ q: "Bangkok", format: "THREE_V_THREE" })).toEqual({
  query: "Bangkok",
  format: "THREE_V_THREE",
});
expect(toTournamentSearchParams({ province: "Chiang Mai", ageGroup: "U18" }).toString()).toBe("province=Chiang+Mai&ageGroup=U18");
expect(parseTournamentSearchParams({ format: "invalid" })).toEqual({});
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm run test -- tournament-search-params`

Expected: FAIL because the parser module is missing.

- [ ] **Step 3: Implement parser and discovery pages**

Implement `parseTournamentSearchParams(input: Record<string, string | string[] | undefined>): TournamentSearchFilters` to accept only known formats/statuses and non-empty scalar strings. Implement `toTournamentSearchParams(filters)` to append values in the order `q`, `province`, `format`, `ageGroup`, `venue`, `date`.

Build `TournamentSearchForm` as a Client Component. It receives `initialFilters`; on submit it creates `URLSearchParams` with `toTournamentSearchParams` and calls `router.push(`/tournaments?${params}`)`. Use shadcn `Input`, `Select`, and `Button`; keep fields in a responsive grid.

Build the home page as a Server Component. Show only the hybrid hero, a primary search form, and the open-registration tournament rows. Do not add ongoing or completed home sections.

Build `/tournaments` as an async Server Component with:

```ts
export default async function TournamentListPage({
  searchParams,
}: PageProps<"/tournaments">) {
  const filters = parseTournamentSearchParams(await searchParams);
  const tournaments = await searchTournaments(repository, filters);
  // render heading, form, rows or StatePanel
}
```

- [ ] **Step 4: Verify filters and visual behavior**

Run:

```powershell
npm run test -- tournament-search-params
npm run lint
npm run build
npm run dev
```

Manually check `/`, `/tournaments?province=Bangkok`, `/tournaments?format=THREE_V_THREE`, and a query with no results at 375px, 768px, and 1440px. Stop the dev server after checking.

- [ ] **Step 5: Commit discovery UI**

```powershell
git add app components features/tournaments/presentation tests/features/tournaments/tournament-search-params.test.ts
git commit -m "feat: add tournament discovery pages"
```

### Task 5: Add Tournament Detail, Schedule, and Bracket Routes

**Files:**
- Create: `app/(public)/tournaments/[slug]/page.tsx`
- Create: `app/(public)/schedule/page.tsx`
- Create: `app/(public)/bracket/page.tsx`
- Create: `components/schedule-table.tsx`
- Create: `components/bracket-view.tsx`

**Interfaces:**
- Consumes `getTournamentBySlug`, `searchTournaments`, `Tournament`, `Match`, `StatePanel`, and `TournamentRow`.
- Produces public routes linked by Task 3 navigation and Task 4 results.

- [ ] **Step 1: Write a failing schedule grouping test**

Create `tests/features/tournaments/schedule-view-model.test.ts`:

```ts
expect(groupMatchesByDateAndCourt(matches)).toEqual({
  "2026-07-27": { "Court A": [matches[0]] },
});
```

- [ ] **Step 2: Verify the schedule test fails**

Run: `npm run test -- schedule-view-model`

Expected: FAIL because `schedule-view-model.ts` is missing.

- [ ] **Step 3: Implement public tournament operation views**

Create `features/tournaments/presentation/schedule-view-model.ts` exporting `groupMatchesByDateAndCourt(matches: Match[]): Record<string, Record<string, Match[]>>`.

Create tournament detail page with async `params`, `getTournamentBySlug`, and `notFound()` when it returns `null`. Render overview, registration deadline/status, teams, venue, and links to:

```tsx
<Link href={`/schedule?tournament=${tournament.slug}`}>ตารางแข่งขัน</Link>
<Link href={`/bracket?tournament=${tournament.slug}`}>Bracket</Link>
```

Build `/schedule` and `/bracket` to parse `tournament` from `searchParams`, default to the first open tournament, and render `StatePanel` when the selected tournament has no matches. `ScheduleTable` groups matches by date and court. `BracketView` derives rounds from `match.round`, uses fixed column widths, and wraps the grid in `overflow-x-auto` so it remains usable on phones.

- [ ] **Step 4: Run tests and route checks**

Run:

```powershell
npm run test -- schedule-view-model
npm run lint
npm run build
npm run dev
```

Manually check a valid tournament detail, `/tournaments/missing`, `/schedule?tournament=bangkok-open-2026`, and `/bracket?tournament=bangkok-open-2026` at desktop and 375px. Stop the dev server after checking.

- [ ] **Step 5: Commit schedule and bracket**

```powershell
git add app components features/tournaments/presentation tests/features/tournaments/schedule-view-model.test.ts
git commit -m "feat: add tournament detail and match views"
```

### Task 6: Visual Asset, Accessibility, and Final Verification

**Files:**
- Create: `public/images/courtside-hero.jpg`
- Modify: `app/(public)/page.tsx`
- Modify: relevant shared components only if verification uncovers a scoped issue

**Interfaces:**
- Consumes the Home page from Task 4.
- Produces an editorial hero that uses an actual bitmap asset without moving discovery controls below the fold.

- [ ] **Step 1: Generate the hero asset**

Use the image-generation tool to create a wide editorial sports photograph: a real indoor basketball court in Thailand, overhead view, visible court markings and hoop, natural arena lighting, no readable logos, no text, no gradient, and ample negative space. Save its final JPEG as `public/images/courtside-hero.jpg`.

- [ ] **Step 2: Integrate the image without weakening hierarchy**

Use `next/image` in the Home hero as a contained poster-side image with a fixed aspect ratio, descriptive Thai `alt`, and a dark solid overlay only when required for legible text. Keep Search and the open-registration list visible in the first viewport at desktop and mobile.

- [ ] **Step 3: Perform accessibility checks**

Check every icon-only button has `aria-label` and `Tooltip`, every form field has a visible label, focus order follows visual order, the mobile menu traps no focus after closing, and all status text has sufficient contrast in both themes.

- [ ] **Step 4: Run final verification**

Run:

```powershell
npm run test
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all verification commands exit `0`; only intended product files are staged or untracked.

- [ ] **Step 5: Commit the finished public platform**

```powershell
git add app components features lib public package.json package-lock.json tests vitest.config.mts
git commit -m "feat: build courtside public platform"
```

## Plan Self-Review

- **Spec coverage:** Task 1 delivers Next.js 16, Tailwind, shadcn/ui, dark mode, and testing; Task 2 provides the mock repository and future schema shape; Tasks 3-5 implement all agreed public routes and states; Task 6 adds the required real visual asset and final responsive/accessibility verification.
- **Scope:** Prisma, Supabase, route handlers, authentication, roles, uploads, notifications, dashboards, and analytics remain explicitly absent from implementation tasks.
- **Type consistency:** `TournamentRepository`, `TournamentSearchFilters`, `Tournament`, and `Match` originate in Task 2 and are the only feature-data contracts used in subsequent tasks.
- **Placeholder scan:** No task relies on undefined modules or an unspecified validation step.
