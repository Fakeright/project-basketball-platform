# COURTSIDE Home Authentication Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show Login and Register actions to anonymous Home visitors while displaying a role only for a valid Supabase-linked session.

**Architecture:** The current actor composition keeps Supabase as the sole identity source whenever Supabase public configuration is present and retains cookie fixtures only for local mode without Supabase. Home resolves the actor in a Server Component and renders a small view-only authentication action component before tournament search.

**Tech Stack:** Next.js 16.2.11 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase Auth, Prisma, Vitest, React Testing Library.

## Global Constraints

- Use Thai for user-facing copy.
- Do not change the database schema or add dependencies.
- Keep authorization and session resolution on the server.
- Do not expose a development-cookie actor when Supabase is configured.
- Keep tournament search as the primary Home workflow.
- Do not add a marketing card, nested card, or new explanatory section.
- Verify layouts at approximately 375px, 768px, and 1440px.
- Do not stage `.agents/`, `.claude/`, `.windsurf/`, or `skills-lock.json`.

---

## File Structure

- `features/identity/infrastructure/create-current-actor-provider.ts`: chooses the exclusive Supabase or development-cookie actor provider.
- `tests/features/identity/create-current-actor-provider.test.ts`: protects identity-source precedence and local fallback behavior.
- `components/home-auth-actions.tsx`: renders anonymous Login and Register actions without owning authentication state.
- `app/(public)/page.tsx`: resolves the current actor server-side and places the anonymous actions before tournament search.
- `tests/ui/home-auth-actions.test.tsx`: covers anonymous and authenticated Home action visibility.
- `tests/ui/site-header-session.test.tsx`: confirms anonymous header actions never include role/account content.

### Task 1: Make Supabase The Exclusive Configured Identity Source

**Files:**
- Modify: `features/identity/infrastructure/create-current-actor-provider.ts`
- Test: `tests/features/identity/create-current-actor-provider.test.ts`

**Interfaces:**
- Consumes: `AuthenticatedUserReader`, `UserProfileRepository`, and `readDevelopmentActorCookie`.
- Produces: `createCurrentActorProvider(options): CurrentActorProvider`, where an available `authenticatedUserReader` always selects `SupabaseCurrentActorProvider`.

- [ ] **Step 1: Write the failing provider regression test**

Add a test with an absent Supabase user and a valid development cookie:

```ts
it("does not fall back to a development cookie when Supabase mode is active", async () => {
  const provider = createCurrentActorProvider({
    environment: "development",
    authenticatedUserReader: {
      async getAuthenticatedUser() {
        return null
      },
    },
    userProfileRepository: repository,
    readDevelopmentActorCookie: async () => "team-manager-1",
  })

  await expect(provider.getCurrentActor()).resolves.toBeNull()
})
```

Retain or add a separate test proving `environment: "development"` without an
`authenticatedUserReader` still resolves `team-manager-1` from the cookie.

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```powershell
npm run test -- tests/features/identity/create-current-actor-provider.test.ts
```

Expected: FAIL because the configured Supabase provider currently falls back
to `CookieCurrentActorProvider` in development.

- [ ] **Step 3: Remove the configured-Supabase cookie fallback**

Change the configured branch to return only the Supabase provider:

```ts
if (options.authenticatedUserReader) {
  if (!options.userProfileRepository) {
    throw new Error("USER_PROFILE_REPOSITORY_REQUIRED")
  }

  return new SupabaseCurrentActorProvider(
    options.authenticatedUserReader,
    options.userProfileRepository,
  )
}
```

Keep the final `CookieCurrentActorProvider` return unchanged for development
without an authenticated user reader.

- [ ] **Step 4: Run the focused identity tests**

Run:

```powershell
npm run test -- tests/features/identity/create-current-actor-provider.test.ts tests/features/identity/cookie-current-actor-provider.test.ts tests/features/identity/supabase-current-actor-provider.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the identity boundary**

Run:

```powershell
git add -- features/identity/infrastructure/create-current-actor-provider.ts tests/features/identity/create-current-actor-provider.test.ts
git commit -m "fix(auth): require Supabase session for configured app"
```

### Task 2: Add Anonymous Home Authentication Actions

**Files:**
- Create: `components/home-auth-actions.tsx`
- Modify: `app/(public)/page.tsx`
- Test: `tests/ui/home-auth-actions.test.tsx`
- Test: `tests/ui/site-header-session.test.tsx`

**Interfaces:**
- Consumes: `isAuthenticated: boolean`.
- Produces: `HomeAuthActions({ isAuthenticated }: { isAuthenticated: boolean })`.
- Home resolves `actor` with `createNextCookieCurrentActorProvider().getCurrentActor()`.

- [ ] **Step 1: Write the failing Home and header UI tests**

Create the component tests:

```tsx
it("renders Login and Register actions for an anonymous visitor", () => {
  render(<HomeAuthActions isAuthenticated={false} />)

  expect(screen.getByRole("link", { name: "เข้าสู่ระบบ" })).toHaveAttribute(
    "href",
    "/login",
  )
  expect(screen.getByRole("link", { name: "สมัครสมาชิก" })).toHaveAttribute(
    "href",
    "/register",
  )
})

it("renders no authentication actions for an authenticated visitor", () => {
  render(<HomeAuthActions isAuthenticated />)

  expect(screen.queryByRole("link", { name: "เข้าสู่ระบบ" })).toBeNull()
  expect(screen.queryByRole("link", { name: "สมัครสมาชิก" })).toBeNull()
})
```

Extend the anonymous `SiteHeader` test:

```tsx
render(<SiteHeader actor={null} />)
expect(screen.getAllByRole("link", { name: "เข้าสู่ระบบ" }).length).toBeGreaterThan(0)
expect(screen.getAllByRole("link", { name: "สมัครสมาชิก" }).length).toBeGreaterThan(0)
expect(screen.queryByText(/กำลังใช้งาน:/)).toBeNull()
```

- [ ] **Step 2: Run the UI tests to verify RED**

Run:

```powershell
npm run test -- tests/ui/home-auth-actions.test.tsx tests/ui/site-header-session.test.tsx
```

Expected: FAIL because `HomeAuthActions` does not exist.

- [ ] **Step 3: Implement the view-only Home action row**

Create:

```tsx
import Link from "next/link"

export function HomeAuthActions({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  if (isAuthenticated) return null

  return (
    <div aria-label="บัญชีผู้ใช้" className="mt-4 flex flex-wrap gap-2">
      <Link
        className="inline-flex min-h-11 items-center bg-foreground px-4 text-sm font-medium text-background"
        href="/login"
      >
        เข้าสู่ระบบ
      </Link>
      <Link
        className="inline-flex min-h-11 items-center border border-foreground px-4 text-sm font-medium"
        href="/register"
      >
        สมัครสมาชิก
      </Link>
    </div>
  )
}
```

In `HomePage`, resolve the actor alongside the existing tournament read:

```ts
const actorProvider = createNextCookieCurrentActorProvider()
const [actor, openTournaments] = await Promise.all([
  actorProvider.getCurrentActor(),
  searchTournaments(repository, { status: "OPEN" }),
])
```

Render `<HomeAuthActions isAuthenticated={actor !== null} />` after the intro
copy and before `TournamentSearchForm`.

- [ ] **Step 4: Run focused UI and identity tests**

Run:

```powershell
npm run test -- tests/ui/home-auth-actions.test.tsx tests/ui/site-header-session.test.tsx tests/features/identity/create-current-actor-provider.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run complete verification and Browser QA**

Run:

```powershell
npm run test
npm run lint
npm run build
git diff --check
git status --short
```

Use Browser QA at 375px, 768px, and 1440px:

- Anonymous Home shows Login and Register in the hero.
- Anonymous header contains no display name, email, role, or workspace link.
- Authenticated Home hides hero Login and Register actions.
- Authenticated header shows the Supabase-linked role.
- Neither state has horizontal overflow or overlapping controls.

- [ ] **Step 6: Commit and push**

Run:

```powershell
git add -- components/home-auth-actions.tsx app/'(public)'/page.tsx tests/ui/home-auth-actions.test.tsx tests/ui/site-header-session.test.tsx
git commit -m "feat(home): add anonymous authentication entry"
git push
```

## Plan Self-Review

- **Spec coverage:** Task 1 makes configured Supabase exclusive while retaining cookie-only local mode. Task 2 covers anonymous and authenticated Header/Home behavior, server rendering, tests, responsive QA, and delivery.
- **Scope:** No profile editing, email verification, role mutation, provider addition, dependency addition, or migration is included.
- **Type consistency:** `HomeAuthActions` accepts exactly `{ isAuthenticated: boolean }`, and Home derives it from `actor !== null`.
- **Placeholder scan:** No deferred implementation step or unspecified handler remains.
