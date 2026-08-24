# COURTSIDE Tournament Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let organizers upload one real Supabase poster and related documents, then present them securely on public tournament details.

**Architecture:** Keep media domain types and validation independent of Supabase. Route Handlers resolve actor/ownership and call application use cases; a server-only Supabase Storage adapter implements the storage port. Prisma is the production metadata store, while the existing development repository mirrors media metadata for local workflow preview.

**Tech Stack:** Next.js 16.2.11 App Router, React 19, TypeScript, Tailwind CSS 4, Prisma 7, Supabase Storage, Zod 4, Vitest, React Testing Library.

## Global Constraints

- Keep service-role credentials server-only in `.env.local`; never expose or commit them.
- Use Thai for user-facing copy and return typed 401/403/404/409/413/415/422 route responses.
- Enforce `tournament.update` and organizer ownership in every media mutation.
- Poster accepts JPEG/PNG/WebP up to 5 MB; documents accept PDF/DOC/DOCX up to 10 MB.
- Use `tournament-posters` public bucket and `tournament-documents` private bucket with signed document URLs only for visible lifecycle statuses.
- Use TDD, focused commits, `npm run test`, `npm run lint`, `npm run build`, `git diff --check`, and responsive QA at 375px, 768px, and 1440px before completion.

---

### Task 1: Define Media Metadata And Storage Contract

**Files:**
- Modify: `prisma/schema.prisma`, `features/tournament-operations/domain/tournament-operation.ts`
- Create: `features/tournament-media/domain/media-asset.ts`, `features/tournament-media/domain/media-policy.ts`, `features/tournament-media/application/ports/tournament-media-repository.ts`, `features/tournament-media/application/ports/object-storage.ts`
- Test: `tests/features/tournament-media/media-policy.test.ts`

**Interfaces:**
- Consumes: existing `TournamentOperationStatus`, Prisma `Tournament`, `User`, and `AuditLog`.
- Produces: `MediaAsset`, `MediaAssetKind`, `validateMediaFile`, `ObjectStorage`, and `TournamentMediaRepository` for Tasks 2-4.

- [ ] **Step 1: Write failing media policy tests**

```ts
it("accepts a WebP poster below 5 MB", () => {
  expect(() => validateMediaFile({ kind: "POSTER", contentType: "image/webp", byteSize: 5_000_000 })).not.toThrow()
})

it("rejects a document larger than 10 MB", () => {
  expect(() => validateMediaFile({ kind: "DOCUMENT", contentType: "application/pdf", byteSize: 10_000_001 })).toThrow("MEDIA_FILE_TOO_LARGE")
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- tests/features/tournament-media/media-policy.test.ts`

Expected: FAIL because the media policy module does not exist.

- [ ] **Step 3: Add domain types, policy, ports, and Prisma schema**

```ts
export type MediaAssetKind = "POSTER" | "DOCUMENT"

export interface MediaFileDescriptor {
  fileName: string
  contentType: string
  byteSize: number
}

export function validateMediaFile(input: MediaFileDescriptor & { kind: MediaAssetKind }) {
  const limits = input.kind === "POSTER"
    ? { bytes: 5_000_000, types: ["image/jpeg", "image/png", "image/webp"] }
    : { bytes: 10_000_000, types: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] }
  if (!limits.types.includes(input.contentType)) throw new Error("MEDIA_FILE_TYPE_INVALID")
  if (input.byteSize > limits.bytes) throw new Error("MEDIA_FILE_TOO_LARGE")
}
```

Add `MediaAssetKind` enum and `MediaAsset` model with `tournamentId`, `createdById`, `bucket`, `objectPath`, `fileName`, `contentType`, `byteSize`, `createdAt`, and nullable `deletedAt`. Add relations to `Tournament` and `User`, indexes on `[tournamentId, kind]` and `[tournamentId, deletedAt]`. Generate and apply a named migration only after confirming `DATABASE_URL` targets the intended Supabase project.

- [ ] **Step 4: Run focused tests and Prisma validation**

Run: `npm run test -- tests/features/tournament-media/media-policy.test.ts; npm run prisma:generate; npx prisma validate`

Expected: PASS and Prisma reports a valid schema.

- [ ] **Step 5: Commit**

```powershell
git add prisma features/tournament-media tests/features/tournament-media
git commit -m "feat: add tournament media contracts"
```

### Task 2: Implement Supabase Storage And Media Use Cases

**Files:**
- Create: `features/tournament-media/application/upload-tournament-media.ts`, `features/tournament-media/application/delete-tournament-media.ts`, `features/tournament-media/infrastructure/supabase-object-storage.ts`, `features/tournament-media/infrastructure/prisma-tournament-media-repository.ts`
- Modify: `features/tournament-operations/infrastructure/development-tournament-operations-repository.ts`
- Test: `tests/features/tournament-media/upload-tournament-media.test.ts`, `tests/features/tournament-media/delete-tournament-media.test.ts`

**Interfaces:**
- Consumes: Task 1 contracts and `authorize(actor, "tournament.update", { organizerId })`.
- Produces: `uploadTournamentMedia(input, actor, dependencies)` and `deleteTournamentMedia(assetId, tournamentId, actor, dependencies)` for Task 3.

- [ ] **Step 1: Write failing upload and replacement tests**

```ts
it("replaces an owned poster and removes its previous object", async () => {
  await uploadTournamentMedia(posterInput, organizer, dependencies)
  await uploadTournamentMedia(replacementPosterInput, organizer, dependencies)
  expect(storage.remove).toHaveBeenCalledWith("tournament-posters", oldObjectPath)
})

it("compensates by removing the object when metadata persistence fails", async () => {
  repository.createAsset.mockRejectedValueOnce(new Error("DATABASE_UNAVAILABLE"))
  await expect(uploadTournamentMedia(posterInput, organizer, dependencies)).rejects.toThrow("DATABASE_UNAVAILABLE")
  expect(storage.remove).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/features/tournament-media/upload-tournament-media.test.ts tests/features/tournament-media/delete-tournament-media.test.ts`

Expected: FAIL because use cases and adapters do not exist.

- [ ] **Step 3: Implement server-only Supabase adapter and use cases**

```ts
const path = `tournaments/${tournamentId}/${kind === "POSTER" ? "poster" : "documents"}/${assetId}.${extension}`
const { error } = await client.storage.from(bucket).upload(path, file, { contentType, upsert: false })
if (error) throw new Error("STORAGE_UPLOAD_FAILED")
```

Use `@supabase/supabase-js` only in the server-only adapter. Validate before upload, resolve tournament, authorize ownership, retire an existing active poster after creating the replacement metadata, and append `media.uploaded`, `media.replaced`, or `media.deleted` audit events. Update the development JSON state with media assets so local Browser QA persists across routes.

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- tests/features/tournament-media/upload-tournament-media.test.ts tests/features/tournament-media/delete-tournament-media.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add features/tournament-media features/tournament-operations tests/features/tournament-media package.json package-lock.json
git commit -m "feat: add secure tournament media storage"
```

### Task 3: Add Authorized Media Routes And Organizer Controls

**Files:**
- Create: `app/api/admin/tournaments/[id]/media/route.ts`, `app/api/admin/tournaments/[id]/media/[assetId]/route.ts`, `features/admin/presentation/tournament-media-handler.ts`, `components/admin/tournament-media-manager.tsx`
- Modify: `components/admin/tournament-editor.tsx`, `app/(admin)/organizer/tournaments/[id]/page.tsx`
- Test: `tests/api/admin/tournament-media.test.ts`, `tests/ui/admin/tournament-media-manager.test.tsx`

**Interfaces:**
- Consumes: Task 2 use cases and `createNextCookieCurrentActorProvider()`.
- Produces: multipart upload/delete endpoints and a media-manager UI that Task 4 can read from the editor view model.

- [ ] **Step 1: Write failing route and component tests**

```tsx
it("rejects an oversized poster before it reaches the upload route", async () => {
  render(<TournamentMediaManager tournamentId="tournament-1" assets={[]} />)
  await user.upload(screen.getByLabelText("โปสเตอร์การแข่งขัน"), new File([new Uint8Array(5_000_001)], "poster.webp", { type: "image/webp" }))
  expect(await screen.findByText("รูปโปสเตอร์ต้องมีขนาดไม่เกิน 5 MB")).toBeTruthy()
})

it("returns 403 when another organizer uploads media", async () => {
  const response = await POST(requestWithPoster, contextFor("tournament-2"))
  expect(response.status).toBe(403)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/api/admin/tournament-media.test.ts tests/ui/admin/tournament-media-manager.test.tsx`

Expected: FAIL because the media routes and manager do not exist.

- [ ] **Step 3: Implement route handler composition and editor manager**

```ts
export async function POST(request: Request, context: RouteContext<"/api/admin/tournaments/[id]/media">) {
  const { id } = await context.params
  return handleTournamentMediaUpload(request, id, {
    actorProvider: createNextCookieCurrentActorProvider(),
    mediaService: createTournamentMediaService(),
  })
}
```

Parse `FormData` with required `kind` and `file`. Map known use-case failures to Thai `413` and `415` responses. Render a 4:5 poster preview with an image `alt` label, replacement action, explicit delete confirmation, and a document table with file-type icon, name, size, and delete action. Add `aria-live` success/error output and disable the affected action while a request is active.

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- tests/api/admin/tournament-media.test.ts tests/ui/admin/tournament-media-manager.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add app/api/admin components/admin features/admin tests/api/admin tests/ui/admin
git commit -m "feat: add organizer media management"
```

### Task 4: Render Public Poster And Secure Document Links

**Files:**
- Create: `features/tournament-media/application/get-public-tournament-media.ts`, `components/tournaments/tournament-poster.tsx`, `components/tournaments/tournament-document-list.tsx`
- Modify: `features/tournaments/domain/tournament.ts`, `features/tournaments/infrastructure/mock-tournament-data.ts`, `app/(public)/tournaments/[slug]/page.tsx`
- Test: `tests/features/tournament-media/get-public-tournament-media.test.ts`, `tests/ui/tournaments/tournament-detail-media.test.tsx`

**Interfaces:**
- Consumes: Task 2 media repository/storage port and existing public tournament read model.
- Produces: `{ posterUrl?: string, documents: PublicDocumentLink[] }` with signed URLs only for public lifecycle statuses.

- [ ] **Step 1: Write failing public-media tests**

```ts
it("creates document links only for a published tournament", async () => {
  const media = await getPublicTournamentMedia(publishedTournament, dependencies)
  expect(media.documents[0].url).toContain("token=")
})

it("does not expose document links for a submitted tournament", async () => {
  const media = await getPublicTournamentMedia(submittedTournament, dependencies)
  expect(media.documents).toEqual([])
})
```

```tsx
it("renders a 4:5 tournament poster and document rows", () => {
  render(<TournamentDetailMedia posterUrl="https://example.test/poster.webp" documents={[document]} />)
  expect(screen.getByRole("img", { name: "โปสเตอร์การแข่งขัน Chiang Rai Cup" })).toBeTruthy()
  expect(screen.getByRole("link", { name: "ดาวน์โหลด กติกาการแข่งขัน.pdf" })).toBeTruthy()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/features/tournament-media/get-public-tournament-media.test.ts tests/ui/tournaments/tournament-detail-media.test.tsx`

Expected: FAIL because public media read models and components do not exist.

- [ ] **Step 3: Implement visibility gate and responsive detail composition**

```ts
const publicStatuses = new Set(["PUBLISHED", "REGISTRATION_CLOSED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"])
if (!publicStatuses.has(tournament.status)) return { posterUrl, documents: [] }
```

Render the poster in a stable `aspect-[4/5]` container. Place it before the title on mobile and beside the detail header from `lg` upward. Render documents in an unframed full-width section with Lucide file/download icons. Preserve the existing schedule and bracket navigation, loading state, no-document state, and Thai download-error copy.

- [ ] **Step 4: Run tests and visual QA**

Run: `npm run test -- tests/features/tournament-media/get-public-tournament-media.test.ts tests/ui/tournaments/tournament-detail-media.test.tsx; npm run lint; npm run build`

Expected: PASS.

Use Browser screenshots at 375px, 768px, and 1440px. Confirm poster crop, readable document rows, no page overflow, keyboard focus on destructive confirmation, and dark-mode contrast.

- [ ] **Step 5: Final verification and commit**

Run: `npm run test; npm run lint; npm run build; git diff --check; git status --short`

```powershell
git add app components features prisma tests package.json package-lock.json
git commit -m "feat: show tournament media on public details"
```

## Self-Review

- Spec coverage: Task 1 covers metadata and file policy; Task 2 covers Supabase upload, replacement, cleanup, audit, and development persistence; Task 3 covers server authorization and organizer experience; Task 4 covers public poster, signed documents, responsive and accessibility QA.
- Placeholder scan: no deferred implementation steps are used.
- Type consistency: Task 1 defines MediaAssetKind, storage and repository ports; Tasks 2-4 consume those names unchanged.
