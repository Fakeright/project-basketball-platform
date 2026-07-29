# COURTSIDE Supabase Auth And Team Manager Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase email/password authentication with Prisma-backed roles, visible session status, Team Manager tournament discovery, and Home approved-team data.

**Architecture:** Supabase Auth owns credentials and server-managed session cookies; Prisma owns the linked user profile and authoritative role. Server Components and Route Handlers resolve a `CurrentActorProvider` from Supabase session plus Prisma profile, while application use cases retain existing permission and ownership checks. Public tournament reads gain a dedicated approved-team Home projection.

**Tech Stack:** Next.js 16.2.11 App Router, React 19, TypeScript, `@supabase/ssr`, `@supabase/supabase-js`, Prisma 7, Supabase PostgreSQL, Zod, Vitest, React Testing Library, Tailwind CSS 4.

## Global Constraints

- Keep Next.js 16 server APIs and async request primitives aligned with local installed documentation.
- Use Thai as primary UI copy; English remains for code identifiers, roles, and tests.
- Use server-side Supabase session resolution and Prisma role lookup as the authorization source of truth.
- Do not allow self-registration as `PLATFORM_ADMIN`.
- Never store password, reset token, provider error details, or Supabase secrets in Prisma, audit data, logs, or client responses.
- Preserve existing application permission, ownership, optimistic concurrency, and safe correlated error behavior.
- Keep direct Prisma access out of presentation pages and components.
- Do not commit `.env`, `.env.local`, service-role keys, generated clients, `.next`, or unrelated local tooling.
- User must enable Email/password Auth in Supabase and disable Confirm email for this phase; password-recovery redirect URL must include the local/deployed `/auth/callback` route.

---

## File Structure

- `lib/supabase/browser.ts`: browser Supabase client for client auth forms.
- `lib/supabase/server.ts`: cookie-aware server Supabase client.
- `lib/supabase/admin.ts`: server-only admin client for compensating deletion of an unprovisioned Auth user.
- `app/auth/callback/route.ts`: exchanges recovery/login code for a server session.
- `app/api/auth/*/route.ts`: Route Handlers for registration, login, logout, recovery, and password update.
- `features/identity/application/*`: registration/profile provisioning and current-actor contracts.
- `features/identity/infrastructure/*`: Prisma profile repository and Supabase-backed actor provider.
- `components/auth/*`: focused client forms for each auth command.
- `components/account-session-control.tsx`: role indicator and account/logout controls.
- `features/tournaments/application/list-home-approved-teams.ts`: Home projection use case.
- `features/tournaments/infrastructure/prisma-tournament-repository.ts`: efficient approved-team projection.

### Task 1: Auth Profile Schema And Supabase Actor Provider

**Files:**
- Create: `prisma/migrations/20260729120000_supabase_auth_profiles/migration.sql`
- Modify: `prisma/schema.prisma`
- Create: `features/identity/application/ports/user-profile-repository.ts`
- Create: `features/identity/application/provision-auth-profile.ts`
- Create: `features/identity/infrastructure/prisma-user-profile-repository.ts`
- Create: `features/identity/infrastructure/get-user-profile-repository.ts`
- Create: `features/identity/infrastructure/supabase-current-actor-provider.ts`
- Modify: `features/identity/infrastructure/next-cookie-current-actor-provider.ts`
- Modify: `features/identity/domain/actor.ts`
- Modify: `features/identity/domain/permission.ts`
- Test: `tests/features/identity/provision-auth-profile.test.ts`
- Test: `tests/features/identity/supabase-current-actor-provider.test.ts`
- Test: `tests/features/identity/prisma-user-profile-repository.test.ts`

**Interfaces:**
- Produces `AuthProfileInput`, `UserProfileRepository`, `provisionAuthProfile`, and a production `CurrentActorProvider`.
- `Actor` gains `email` and `displayName`; existing permission checks continue to consume `id` and `role`.

- [ ] **Step 1: Write failing provisioning and actor tests**

```ts
it("creates a Team Manager profile for a new Supabase user", async () => {
  const profile = await provisionAuthProfile(
    { supabaseUserId: "auth-user-1", email: "manager@example.com", displayName: "May", role: "TEAM_MANAGER" },
    repository,
  )
  expect(profile).toMatchObject({ supabaseUserId: "auth-user-1", role: "TEAM_MANAGER" })
})

it("rejects a crafted Platform Admin registration", async () => {
  await expect(provisionAuthProfile({ ...input, role: "PLATFORM_ADMIN" }, repository))
    .rejects.toThrow("ROLE_NOT_SELF_ASSIGNABLE")
})

it("maps a valid Supabase session and Prisma profile to the current actor", async () => {
  await expect(provider.getCurrentActor()).resolves.toEqual({
    id: "user-1", role: "TEAM_MANAGER", email: "manager@example.com", displayName: "May",
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- tests/features/identity/provision-auth-profile.test.ts tests/features/identity/supabase-current-actor-provider.test.ts tests/features/identity/prisma-user-profile-repository.test.ts`

Expected: FAIL because the profile contract, Supabase user id field, provisioning use case, and provider do not exist.

- [ ] **Step 3: Add the profile relation and repository boundary**

Add `supabaseUserId String? @unique` to `User`, backfill no existing seeded rows, and create a non-destructive migration. Define the port and use case:

```ts
export type SelfAssignableRole = "PLAYER" | "COACH" | "TEAM_MANAGER" | "TOURNAMENT_ORGANIZER"

export interface UserProfileRepository {
  findBySupabaseUserId(supabaseUserId: string): Promise<Actor | null>
  create(input: {
    supabaseUserId: string
    email: string
    displayName: string
    role: SelfAssignableRole
  }): Promise<Actor>
}

export async function provisionAuthProfile(input: AuthProfileInput, repository: UserProfileRepository) {
  if (input.role === "PLATFORM_ADMIN") throw new Error("ROLE_NOT_SELF_ASSIGNABLE")
  return (await repository.findBySupabaseUserId(input.supabaseUserId)) ?? repository.create(input)
}
```

Make the production provider return `null` for absent session, invalid session, or a session without a Prisma profile. Retain the existing development provider only behind its explicit local-development gate.

- [ ] **Step 4: Run focused tests and Prisma validation**

Run: `npm run test -- tests/features/identity/provision-auth-profile.test.ts tests/features/identity/supabase-current-actor-provider.test.ts tests/features/identity/prisma-user-profile-repository.test.ts`

Run: `npx prisma validate`

Expected: PASS.

- [ ] **Step 5: Apply the safe migration and commit**

Run: `npx prisma migrate deploy`

Run: `npx prisma migrate status`

Run: `git add prisma features/identity tests/features/identity && git commit -m "feat(auth): add Supabase-linked user profiles"`

### Task 2: Supabase Clients And Server Auth Commands

**Files:**
- Create: `lib/supabase/browser.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`
- Create: `features/identity/presentation/auth-handler.ts`
- Create: `app/api/auth/register/route.ts`
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `app/api/auth/forgot-password/route.ts`
- Create: `app/api/auth/reset-password/route.ts`
- Create: `app/auth/callback/route.ts`
- Modify: `.env.example`
- Test: `tests/api/auth/auth-routes.test.ts`
- Test: `tests/features/identity/auth-handler.test.ts`

**Interfaces:**
- Consumes `UserProfileRepository` from Task 1.
- Produces `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/forgot-password`, and `POST /api/auth/reset-password`.

- [ ] **Step 1: Write failing Route Handler tests**

```ts
it("registers an allowed role and provisions the Prisma profile", async () => {
  const response = await POST(registerRequest({ role: "TEAM_MANAGER" }))
  expect(response.status).toBe(201)
  expect(provision).toHaveBeenCalledWith(expect.objectContaining({ role: "TEAM_MANAGER" }), expect.anything())
})

it("compensates by removing the Auth user when profile provisioning fails", async () => {
  provision.mockRejectedValue(new Error("DATABASE_UNAVAILABLE"))
  const response = await POST(registerRequest())
  expect(response.status).toBe(500)
  expect(deleteAuthUser).toHaveBeenCalledWith("auth-user-1")
})

it("does not leak provider errors during password recovery", async () => {
  const response = await forgotPassword(makeRequest({ email: "bad@example.com" }))
  expect(await response.json()).toEqual({ message: "หากมีบัญชีอยู่ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้" })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- tests/api/auth/auth-routes.test.ts tests/features/identity/auth-handler.test.ts`

Expected: FAIL because Supabase client factories and auth Route Handlers do not exist.

- [ ] **Step 3: Implement cookie-aware clients and handlers**

Use `@supabase/ssr` for browser/server clients. Validate external input with Zod:

```ts
const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  passwordConfirmation: z.string(),
  role: z.enum(["PLAYER", "COACH", "TEAM_MANAGER", "TOURNAMENT_ORGANIZER"]),
}).refine((value) => value.password === value.passwordConfirmation, {
  path: ["passwordConfirmation"], message: "PASSWORD_CONFIRMATION_MISMATCH",
})
```

Registration creates the Supabase user, provisions the Prisma profile, and deletes the newly-created Auth user through the server-only admin client when provisioning fails. Login redirects by actor role after session creation. Logout calls `signOut`. Recovery uses `resetPasswordForEmail` with the `/auth/callback?next=/reset-password` redirect, and the callback exchanges `code` for session cookies. Reset requires a recovery session and calls `updateUser({ password })`.

`.env.example` receives only safe placeholder names for public Supabase URL/key and server-only service role key; never include real values.

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- tests/api/auth/auth-routes.test.ts tests/features/identity/auth-handler.test.ts`

Expected: PASS with registration, role rejection, login routing, logout, recovery privacy, callback, reset, and compensation coverage.

- [ ] **Step 5: Commit**

Run: `git add lib/supabase app/api/auth app/auth/callback features/identity .env.example tests/api/auth tests/features/identity package.json package-lock.json && git commit -m "feat(auth): add Supabase email authentication"`

### Task 3: Auth Pages, Role Indicator, And Protected Navigation

**Files:**
- Create: `app/(public)/register/page.tsx`
- Create: `app/(public)/forgot-password/page.tsx`
- Create: `app/(public)/reset-password/page.tsx`
- Create: `components/auth/login-form.tsx`
- Create: `components/auth/register-form.tsx`
- Create: `components/auth/forgot-password-form.tsx`
- Create: `components/auth/reset-password-form.tsx`
- Create: `components/account-session-control.tsx`
- Modify: `app/(public)/login/page.tsx`
- Modify: `app/(public)/layout.tsx`
- Modify: `components/site-header.tsx`
- Modify: `app/(admin)/layout.tsx`
- Test: `tests/ui/auth/login-form.test.tsx`
- Test: `tests/ui/auth/register-form.test.tsx`
- Test: `tests/ui/auth/recovery-forms.test.tsx`
- Test: `tests/ui/site-header-session.test.tsx`

**Interfaces:**
- Consumes Task 1 `CurrentActorProvider` and Task 2 auth HTTP endpoints.
- Produces responsive anonymous/authenticated navigation and Thai auth form states.

- [ ] **Step 1: Write failing UI tests**

```tsx
it("shows the current Team Manager role and logout command", () => {
  render(<SiteHeader actor={{ id: "user-1", role: "TEAM_MANAGER", email: "m@example.com", displayName: "May" }} />)
  expect(screen.getByText("กำลังใช้งาน: Team Manager")).toBeTruthy()
  expect(screen.getByRole("button", { name: "ออกจากระบบ" })).toBeTruthy()
})

it("submits a self-service registration role without an Admin option", async () => {
  render(<RegisterForm />)
  expect(screen.queryByRole("option", { name: "Platform Admin" })).toBeNull()
  await user.selectOptions(screen.getByLabelText("บทบาท"), "TEAM_MANAGER")
  await user.click(screen.getByRole("button", { name: "สมัครสมาชิก" }))
  expect(fetchMock).toHaveBeenCalledWith("/api/auth/register", expect.anything())
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- tests/ui/auth/login-form.test.tsx tests/ui/auth/register-form.test.tsx tests/ui/auth/recovery-forms.test.tsx tests/ui/site-header-session.test.tsx`

Expected: FAIL because the auth form components and actor-aware header do not exist.

- [ ] **Step 3: Implement focused client forms and server composition**

The public layout resolves the actor server-side and passes it into `SiteHeader`. The header exposes Login/Register for anonymous users and an account control for authenticated users. The control displays `กำลังใช้งาน: <Thai role>` and performs a confirmed `POST /api/auth/logout` before navigating home.

Forms use visible labels, `aria-live="polite"`, per-request disabled state, Thai validation feedback, and no password persistence in client storage. Replace development account buttons on `/login` with the actual login form. Keep any development switcher separate from production user-facing UI.

- [ ] **Step 4: Run UI tests and Browser QA**

Run: `npm run test -- tests/ui/auth tests/ui/site-header-session.test.tsx`

Use Browser QA at 375px and 1440px for `/login`, `/register`, `/forgot-password`, `/reset-password`, and the authenticated header. Verify labels, focus, role indicator, logout, no overflow, and dark mode contrast.

- [ ] **Step 5: Commit**

Run: `git add app/'(public)' components/auth components/account-session-control.tsx components/site-header.tsx app/'(admin)'/layout.tsx tests/ui/auth tests/ui/site-header-session.test.tsx && git commit -m "feat(auth): add account screens and role indicator"`

### Task 4: Team Manager Discovery And Application Entry Points

**Files:**
- Modify: `app/(admin)/team/page.tsx`
- Modify: `app/(admin)/team/[id]/page.tsx`
- Modify: `components/team/team-registration-list.tsx`
- Modify: `components/tournaments/tournament-registration-action.tsx`
- Modify: `app/(public)/tournaments/[slug]/page.tsx`
- Test: `tests/ui/team/team-discovery-link.test.tsx`
- Test: `tests/ui/tournaments/tournament-registration-action.test.tsx`
- Test: `tests/ui/team/team-registration-list.test.tsx`

**Interfaces:**
- Consumes Task 3 authenticated role indicator and existing public Prisma tournament repository.
- Uses existing `POST /api/tournaments/[id]/registrations` authorization and application rules.

- [ ] **Step 1: Write failing Team Manager journey tests**

```tsx
it("offers Team Managers a link to persisted tournament discovery", () => {
  render(<TeamWorkspaceHome actorRole="TEAM_MANAGER" />)
  expect(screen.getByRole("link", { name: "ค้นหารายการแข่ง" })).toHaveAttribute("href", "/tournaments")
})

it("keeps the submitted team unavailable for a second application in this session", async () => {
  render(<TournamentRegistrationAction tournamentId="tournament-1" teams={[team]} />)
  await user.selectOptions(screen.getByLabelText("ทีมที่สมัคร"), team.id)
  await user.click(screen.getByRole("button", { name: "สมัครแข่งขัน" }))
  expect(await screen.findByText("ส่งใบสมัครแล้ว")).toBeTruthy()
  expect(screen.getByLabelText("ทีมที่สมัคร")).not.toContainHTML(`<option value="${team.id}">`)
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- tests/ui/team/team-discovery-link.test.tsx tests/ui/tournaments/tournament-registration-action.test.tsx tests/ui/team/team-registration-list.test.tsx`

Expected: FAIL because the Team Manager discovery affordance and completed local application state are absent.

- [ ] **Step 3: Implement the role-aware journey**

Add a Team Workspace link to `/tournaments` for Team Managers. Preserve public browsing for anonymous visitors. On an open detail page, retain the server-composed owned team list; after a successful application remove that team from selectable options and refresh the server projection. After a successful cancellation refresh the registration list so stale cancel actions cannot be repeated.

- [ ] **Step 4: Run focused tests and Browser QA**

Run: `npm run test -- tests/ui/team/team-discovery-link.test.tsx tests/ui/tournaments/tournament-registration-action.test.tsx tests/ui/team/team-registration-list.test.tsx tests/features/registrations/apply-to-tournament.test.ts`

Use Browser QA with a Team Manager Supabase account: search/filter `/tournaments`, open an `OPEN` tournament, select an owned team, submit once, reload, and verify the persisted pending or approved status.

- [ ] **Step 5: Commit**

Run: `git add app/'(admin)'/team app/'(public)'/tournaments components/team components/tournaments tests/ui/team tests/ui/tournaments && git commit -m "feat(team): complete tournament discovery journey"`

### Task 5: Home Approved-Team Projection And Final Verification

**Files:**
- Create: `features/tournaments/application/list-home-approved-teams.ts`
- Create: `features/tournaments/domain/home-approved-team.ts`
- Modify: `features/tournaments/infrastructure/tournament-repository.ts`
- Modify: `features/tournaments/infrastructure/prisma-tournament-repository.ts`
- Modify: `features/tournaments/infrastructure/mock-tournament-repository.ts`
- Create: `components/home-approved-team-list.tsx`
- Modify: `app/(public)/page.tsx`
- Test: `tests/features/tournaments/list-home-approved-teams.test.ts`
- Test: `tests/features/tournaments/prisma-tournament-repository.test.ts`
- Test: `tests/ui/home-approved-team-list.test.tsx`

**Interfaces:**
- Produces `HomeApprovedTournament` records for public, visible tournaments only.
- Home consumes `listHomeApprovedTeams(repository, { limit: 12 })`.

- [ ] **Step 1: Write failing projection tests**

```ts
it("returns only approved teams belonging to visible tournaments", async () => {
  await expect(listHomeApprovedTeams(repository, { limit: 12 })).resolves.toEqual([
    expect.objectContaining({ tournamentStatus: "OPEN", teams: [expect.objectContaining({ name: "Bangkok Ballers" })] }),
  ])
})

it("excludes pending, rejected, and draft tournament registrations", async () => {
  await expect(repository.listHomeApprovedTeams({ limit: 12 })).resolves.not.toContainEqual(
    expect.objectContaining({ registrationStatus: "PENDING" }),
  )
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- tests/features/tournaments/list-home-approved-teams.test.ts tests/features/tournaments/prisma-tournament-repository.test.ts tests/ui/home-approved-team-list.test.tsx`

Expected: FAIL because the Home projection contract and component do not exist.

- [ ] **Step 3: Implement a bounded public read model**

Define:

```ts
export type HomeApprovedTournament = {
  id: string
  slug: string
  title: string
  province: string
  format: "FIVE_V_FIVE" | "THREE_V_THREE"
  status: "OPEN" | "CLOSED" | "ONGOING" | "COMPLETED"
  teams: Array<{ id: string; name: string; province: string }>
}
```

The Prisma query filters public tournament statuses and `Registration.status = APPROVED`, orders tournaments and teams deterministically, and applies a bounded limit. Render a full-width Home section with compact rows, links to tournament detail, and a Thai empty state. Do not use a nested card layout or mock data when `DATABASE_URL` is configured.

- [ ] **Step 4: Run focused and complete verification**

Run: `npm run test -- tests/features/tournaments/list-home-approved-teams.test.ts tests/features/tournaments/prisma-tournament-repository.test.ts tests/ui/home-approved-team-list.test.tsx`

Run: `npm run test`

Run: `npm run lint`

Run: `npm run build`

Run: `npx prisma validate`

Run: `npx prisma migrate status`

Run: `git diff --check`

Use Browser QA at 375px, 768px, and 1440px for anonymous Home, authenticated Home, Team Manager tournament discovery/application, and the role indicator. Verify Home never exposes non-approved or non-public teams.

- [ ] **Step 5: Commit**

Run: `git add features/tournaments components/home-approved-team-list.tsx app/'(public)'/page.tsx tests/features/tournaments tests/ui/home-approved-team-list.test.tsx && git commit -m "feat(home): show approved tournament teams"`

## Plan Self-Review

- **Spec coverage:** Task 1 provides the Supabase-to-Prisma identity/role boundary. Task 2 provides every server authentication command and recovery flow. Task 3 provides all requested user-facing auth views and role indication. Task 4 completes Team Manager discovery and application behavior. Task 5 exposes approved teams on Home from public persisted data.
- **Scope:** Email verification and organizer approval are explicitly omitted. Bracket, schedule generation, results, payments, notifications, and profile editing remain outside this plan.
- **Type consistency:** `Actor`, `SelfAssignableRole`, `UserProfileRepository`, auth command payloads, and `HomeApprovedTournament` are defined before later consumers.
- **Safety:** Role authority remains server-side; Admin is not self-assignable; recovery errors are private; provisioning has compensation; credentials do not enter Prisma.
- **Placeholder scan:** No TODO, TBD, unspecified handler, or deferred implementation step remains.
