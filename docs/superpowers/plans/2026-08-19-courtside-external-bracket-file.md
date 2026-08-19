# COURTSIDE External Bracket File Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มโหมดสายการแข่งขันจากไฟล์ภายนอกสำหรับผู้จัดที่ไม่ใช้ตัวสร้างอัตโนมัติ โดยอัปโหลด PDF/JPG/PNG/WebP เป็น revision เผยแพร่ไฟล์ที่เลือก บริหารตารางและผลแข่งด้วยข้อมูลในระบบ และเตือนเมื่อไฟล์ที่เผยแพร่ล้าสมัยกว่าผลล่าสุด

**Architecture:** ต่อยอด `features/competition` จาก System Bracket Plan และ reuse `ObjectStorage` ของ `features/tournament-media` การอัปโหลดสร้าง `MediaAsset(BRACKET_DOCUMENT)` และ `ExternalBracketRevision` ใน transaction หลังตรวจไฟล์บน server สำเร็จ การเผยแพร่เป็น explicit mutation ที่เลือก revision เดียว ส่วน Match แบบ external ถูกสร้างและจัดการด้วย use case ของระบบ แต่ไม่มี automatic advancement เพราะโครงสร้างคู่แข่งอยู่ในเอกสารภายนอก

**Tech Stack:** Next.js 16.2.11 App Router, React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui/Base UI, Prisma ORM, Supabase PostgreSQL/Storage, `sharp`, `pdfjs-dist`, Vitest, React Testing Library

**Depends On:** `docs/superpowers/plans/2026-08-19-courtside-system-bracket-operations.md`

**Spec:** `docs/superpowers/specs/2026-08-18-courtside-competition-bracket-design.md`

## Global Constraints

- รองรับเฉพาะ PDF, JPEG, PNG และ WebP; ไม่รองรับ DOC/DOCX, Excel หรือ CSV ใน bracket workflow
- PDF สูงสุด 20 MB; รูปภาพสูงสุด 10 MB
- ตรวจ MIME, magic bytes และ parse/decode บน server ก่อนเขียน revision ลงฐานข้อมูล
- เก็บไฟล์ใน private bucket `tournament-brackets` และใช้ signed URL อายุสั้น
- การอัปโหลด revision ไม่ทำให้ public เปลี่ยนทันที ต้องกดเผยแพร่ revision ที่เลือก
- เก็บ revision history และ audit ของ upload, publish, replace และ retire
- Match, schedule และ result ยังเป็นข้อมูลจริงในระบบ; ไฟล์มีหน้าที่แสดงโครงสร้างสายเท่านั้น
- External mode ไม่คำนวณ next match และไม่เลื่อนผู้ชนะอัตโนมัติ
- Organizer จัดการได้เฉพาะ Tournament ตนเอง; Platform Admin override ต้องมีเหตุผล
- ห้ามเปลี่ยน mode หลังมี Match เริ่มหรือมีผลยืนยันแล้ว
- Mutation ทุกจุดตรวจ expected version และ map 401/403/404/409/422 อย่างชัดเจน
- ตรวจ responsive ที่ 375px, 768px และ 1440px ทั้ง light/dark mode

---

## File Structure

### Domain And Application

- `features/competition/domain/external-bracket-policy.ts`: file constraints, mode switch, publication and stale-state policy
- `features/competition/application/ports/external-bracket-repository.ts`: revision persistence and publication transaction contract
- `features/competition/application/select-bracket-mode.ts`: guarded selection between generated and external modes
- `features/competition/application/upload-external-bracket.ts`: validate, stage, persist and compensate upload
- `features/competition/application/publish-external-bracket.ts`: publish one revision with optimistic concurrency
- `features/competition/application/retire-external-bracket.ts`: retire unpublished revision safely
- `features/competition/application/create-external-match.ts`: manually create a match from locked entries
- `features/competition/application/get-external-bracket-view.ts`: organizer/public view model and stale warning

### Infrastructure And Presentation

- `features/competition/infrastructure/prisma-external-bracket-repository.ts`: Prisma transaction, revision and audit adapter
- `features/competition/infrastructure/get-external-bracket-repository.ts`: composition factory
- `features/competition/presentation/external-bracket-handler.ts`: multipart and JSON HTTP mapping
- `components/organizer/external-bracket-uploader.tsx`: accessible upload, progress and validation feedback
- `components/organizer/external-bracket-preview.tsx`: PDF/image preview and unavailable state
- `components/organizer/external-bracket-revision-list.tsx`: revision history, publish and retire controls
- `components/organizer/external-match-editor.tsx`: manual pairing, schedule and result entry
- `components/external-bracket-view.tsx`: public signed-file viewer and source label

### Routes

- `app/api/organizer/tournaments/[id]/bracket/mode/route.ts`
- `app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts`
- `app/api/organizer/tournaments/[id]/bracket/external/revisions/[revisionId]/route.ts`
- `app/api/organizer/tournaments/[id]/bracket/external/publication/route.ts`
- `app/api/organizer/tournaments/[id]/matches/route.ts`
- existing organizer bracket workspace and public `/bracket` page from the System plan

---

### Task 1: External File Domain Policy And Decode Probe

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `features/tournament-media/domain/media-asset.ts`
- Modify: `features/tournament-media/domain/media-policy.ts`
- Create: `features/competition/domain/external-bracket-policy.ts`
- Create: `features/competition/infrastructure/bracket-file-probe.ts`
- Create: `tests/features/competition/external-bracket-policy.test.ts`
- Create: `tests/features/competition/bracket-file-probe.test.ts`
- Create: `tests/fixtures/brackets/valid-bracket.pdf`
- Create: `tests/fixtures/brackets/valid-bracket.png`
- Create: `tests/fixtures/brackets/corrupt-bracket.pdf`

**Interfaces:**
- Consumes: `MediaFileDescriptor`, bracket lifecycle state
- Produces: `ExternalBracketFileKind`, `assertExternalBracketFile`, `assertCanSelectBracketMode`, `probeBracketFile`

- [ ] **Step 1: Install proven server decoders**

Run:

```powershell
npm install sharp pdfjs-dist
```

Expected: direct production dependencies are recorded in package files.

- [ ] **Step 2: Write failing policy tests**

Cover exact limits, unsupported DOC/DOCX, mode switch before/after match start and source staleness.

```ts
expect(() => assertExternalBracketFile({
  contentType: "application/pdf",
  byteSize: 20_000_001,
})).toThrow("BRACKET_FILE_TOO_LARGE")

expect(isExternalBracketStale({
  publishedAt: "2026-08-19T02:00:00.000Z",
  latestConfirmedResultAt: "2026-08-19T03:00:00.000Z",
})).toBe(true)
```

- [ ] **Step 3: Run policy tests and verify expected failure**

Run: `npx vitest run tests/features/competition/external-bracket-policy.test.ts`

Expected: FAIL because the policy module does not exist.

- [ ] **Step 4: Add bracket media kind and pure policies**

Add `BRACKET_DOCUMENT` to TypeScript and Prisma-aligned media kinds. Keep regular `DOCUMENT` constraints unchanged.

```ts
export const externalBracketContentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export function getExternalBracketMaximumBytes(contentType: string) {
  return contentType === "application/pdf" ? 20_000_000 : 10_000_000
}
```

`assertCanSelectBracketMode` rejects a switch when any match is `IN_PROGRESS`/`COMPLETED` or has a confirmed result.

- [ ] **Step 5: Write failing parse/decode tests**

Test one valid PDF, one valid image, a truncated PDF with a correct header, and random bytes declared as PNG.

Run: `npx vitest run tests/features/competition/bracket-file-probe.test.ts`

Expected: FAIL because `probeBracketFile` is absent.

- [ ] **Step 6: Implement bounded server decode probe**

Use `pdfjs-dist/legacy/build/pdf.mjs` with worker disabled to load page 1 and verify `numPages >= 1`. Use `sharp(data).metadata()` and require positive width/height for images. Convert decoder failures to `BRACKET_FILE_UNREADABLE`; never expose library error text to clients.

- [ ] **Step 7: Run focused tests**

Run:

```powershell
npx vitest run tests/features/competition/external-bracket-policy.test.ts tests/features/competition/bracket-file-probe.test.ts
npx prisma validate
```

Expected: PASS.

- [ ] **Step 8: Commit domain checkpoint**

```powershell
git add -- package.json package-lock.json features/tournament-media/domain features/competition/domain/external-bracket-policy.ts features/competition/infrastructure/bracket-file-probe.ts tests/features/competition tests/fixtures/brackets
git commit -m "feat(competition): validate external bracket files"
```

### Task 2: External Revision Schema And Repository

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260819130000_add_external_bracket_revisions/migration.sql`
- Create: `features/competition/application/ports/external-bracket-repository.ts`
- Create: `features/competition/infrastructure/prisma-external-bracket-repository.ts`
- Create: `features/competition/infrastructure/development-external-bracket-repository.ts`
- Create: `features/competition/infrastructure/get-external-bracket-repository.ts`
- Create: `tests/features/competition/prisma-external-bracket-repository.test.ts`

**Interfaces:**
- Consumes: `Bracket`, `MediaAsset`, `CompetitionRepository`
- Produces: `ExternalBracketRevision`, `ExternalBracketRepository`, atomic upload/publication operations

- [ ] **Step 1: Write failing repository tests**

Cover next revision number, concurrent uploads, one published revision, expected-version conflict, retire guard and audit payloads.

- [ ] **Step 2: Run and observe missing schema/adapter failure**

Run: `npx vitest run tests/features/competition/prisma-external-bracket-repository.test.ts`

Expected: FAIL because revision persistence does not exist.

- [ ] **Step 3: Extend Prisma schema**

```prisma
enum ExternalBracketRevisionStatus {
  DRAFT
  PUBLISHED
  RETIRED
}

model ExternalBracketRevision {
  id          String                        @id @default(cuid())
  bracketId   String
  mediaAssetId String                       @unique
  revision    Int
  status      ExternalBracketRevisionStatus @default(DRAFT)
  publishedAt DateTime?
  retiredAt   DateTime?
  createdById String
  bracket     Bracket                       @relation(fields: [bracketId], references: [id], onDelete: Cascade)
  mediaAsset  MediaAsset                    @relation(fields: [mediaAssetId], references: [id], onDelete: Restrict)
  createdBy   User                          @relation("ExternalBracketRevisionCreator", fields: [createdById], references: [id])
  createdAt   DateTime                      @default(now())

  @@unique([bracketId, revision])
  @@index([bracketId, status])
}
```

Add inverse relations to `Bracket`, `MediaAsset`, and `User`; add `BRACKET_DOCUMENT` to `MediaAssetKind`.

- [ ] **Step 4: Add partial uniqueness for published revision**

Append migration SQL:

```sql
CREATE UNIQUE INDEX "ExternalBracketRevision_one_published_per_bracket"
ON "ExternalBracketRevision" ("bracketId")
WHERE "status" = 'PUBLISHED';
```

- [ ] **Step 5: Define atomic repository contract**

```ts
export interface ExternalBracketRepository {
  commitUploadedRevision(input: CommitExternalRevisionInput): Promise<ExternalBracketRevision>
  publishRevision(input: PublishExternalRevisionInput): Promise<ExternalBracketWorkspace>
  retireRevision(input: RetireExternalRevisionInput): Promise<ExternalBracketRevision>
  findWorkspace(tournamentId: string): Promise<ExternalBracketWorkspaceContext | null>
  findPublicByTournamentSlug(slug: string): Promise<PublicExternalBracket | null>
}
```

`commitUploadedRevision` creates MediaAsset + revision + audit in one transaction. Lock the bracket row before calculating `MAX(revision) + 1`; retry unique conflict once, then return `CONFLICT`.

- [ ] **Step 6: Implement optimistic publication and mapping**

Publication retires the previously published revision and publishes the selected draft in one transaction. Update Bracket version conditionally and record before/after revision IDs.

- [ ] **Step 7: Generate, validate and test**

Run:

```powershell
npx prisma generate
npx prisma validate
npx vitest run tests/features/competition/prisma-external-bracket-repository.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit persistence checkpoint**

```powershell
git add -- prisma/schema.prisma prisma/migrations/20260819130000_add_external_bracket_revisions features/competition/application/ports/external-bracket-repository.ts features/competition/infrastructure tests/features/competition/prisma-external-bracket-repository.test.ts
git commit -m "feat(competition): persist external bracket revisions"
```

### Task 3: Mode Selection And External Upload Use Cases

**Files:**
- Create: `features/competition/application/select-bracket-mode.ts`
- Create: `features/competition/application/upload-external-bracket.ts`
- Create: `features/competition/application/publish-external-bracket.ts`
- Create: `features/competition/application/retire-external-bracket.ts`
- Create: `features/competition/presentation/external-bracket-handler.ts`
- Create: `app/api/organizer/tournaments/[id]/bracket/mode/route.ts`
- Create: `app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts`
- Create: `app/api/organizer/tournaments/[id]/bracket/external/revisions/[revisionId]/route.ts`
- Create: `app/api/organizer/tournaments/[id]/bracket/external/publication/route.ts`
- Create: `tests/features/competition/external-bracket-use-cases.test.ts`
- Create: `tests/api/competition/external-bracket-routes.test.ts`

- [ ] **Step 1: Write failing use-case tests**

Cover owner/admin authorization, admin reason, lifecycle, mode lock, valid upload, storage failure, database compensation, publish and retire restrictions.

```ts
expect(storage.upload).toHaveBeenCalledWith(expect.objectContaining({
  bucket: "tournament-brackets",
  objectPath: expect.stringMatching(/^tournaments\/t-1\/bracket\/revisions\//),
}))
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npx vitest run tests/features/competition/external-bracket-use-cases.test.ts`

Expected: FAIL because use cases are absent.

- [ ] **Step 3: Implement mode selection and upload orchestration**

Authorize with `bracket.generate`, enforce ownership/lifecycle and expected version. Upload to a unique staging path, run content signature + decode probe, move to final path, then commit the asset/revision. On any failure remove staged/final object and log cleanup failure without leaking secrets.

- [ ] **Step 4: Implement publication and retirement**

Require `EXTERNAL_DOCUMENT` mode. Publishing selects an existing readable DRAFT revision; retiring is allowed only for a non-published revision. Do not delete the storage object synchronously after retirement; retain it for revision history and later retention policy.

- [ ] **Step 5: Write failing route tests**

Cover multipart missing file, 20/10 MB boundaries, unsupported MIME, unreadable file, 401, 403, 404, 409, 422 and 503.

- [ ] **Step 6: Read local Next.js Route Handler docs, then add handlers**

Read the installed Next.js 16 docs for Route Handlers and `request.formData()` before implementation. Limit request body before expensive parsing where the runtime supports it; map known domain failures to concise Thai messages.

- [ ] **Step 7: Run use-case and route tests**

Run:

```powershell
npx vitest run tests/features/competition/external-bracket-use-cases.test.ts tests/api/competition/external-bracket-routes.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit application checkpoint**

```powershell
git add -- features/competition/application features/competition/presentation/external-bracket-handler.ts app/api/organizer/tournaments tests/features/competition/external-bracket-use-cases.test.ts tests/api/competition/external-bracket-routes.test.ts
git commit -m "feat(competition): manage external bracket revisions"
```

### Task 4: Organizer External Bracket Workspace

**Files:**
- Modify: `app/(admin)/organizer/tournaments/[id]/bracket/page.tsx`
- Modify: `components/organizer/bracket-workspace.tsx`
- Create: `components/organizer/bracket-mode-control.tsx`
- Create: `components/organizer/external-bracket-uploader.tsx`
- Create: `components/organizer/external-bracket-preview.tsx`
- Create: `components/organizer/external-bracket-revision-list.tsx`
- Create: `tests/ui/organizer/external-bracket-workspace.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Cover mode segmented control, disabled switch after match start, file accept list, size/type Thai feedback, upload pending state, explicit publish button, current source label, revision history and keyboard-accessible actions.

- [ ] **Step 2: Run and verify missing UI failure**

Run: `npx vitest run tests/ui/organizer/external-bracket-workspace.test.tsx`

Expected: FAIL because external workspace components are absent.

- [ ] **Step 3: Implement compact mode selection and upload UI**

Use a two-option segmented control: `สร้างอัตโนมัติ` and `ใช้ไฟล์ภายนอก`. Use one dashed upload surface only; avoid repeated rounded cards. Show accepted types and limits adjacent to the input, not as a feature tutorial.

- [ ] **Step 4: Implement preview and revision list**

Render images with stable aspect constraints and PDF in an embedded viewer with `เปิดไฟล์ในแท็บใหม่` fallback. Revision rows show number, filename, uploader, timestamp and status. Publish/retire require explicit confirmation and preserve focus after completion.

- [ ] **Step 5: Add loading, empty and error states**

Empty copy: `ยังไม่มีไฟล์สายการแข่งขัน` with upload command. Preview failure never marks revision published and offers replace/retry without losing history.

- [ ] **Step 6: Run UI tests**

Run: `npx vitest run tests/ui/organizer/external-bracket-workspace.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit organizer UI checkpoint**

```powershell
git add -- 'app/(admin)/organizer/tournaments/[id]/bracket/page.tsx' components/organizer tests/ui/organizer/external-bracket-workspace.test.tsx
git commit -m "feat(competition): add external bracket workspace"
```

### Task 5: Manual Matches, Schedule And Results In External Mode

**Files:**
- Create: `features/competition/application/create-external-match.ts`
- Modify: `features/competition/application/schedule-match.ts`
- Modify: `features/competition/application/record-match-score.ts`
- Modify: `features/competition/application/confirm-match-result.ts`
- Modify: `features/competition/application/ports/competition-repository.ts`
- Modify: `features/competition/infrastructure/prisma-competition-repository.ts`
- Create: `app/api/organizer/tournaments/[id]/matches/route.ts`
- Create: `components/organizer/external-match-editor.tsx`
- Create: `tests/features/competition/external-match-operations.test.ts`
- Create: `tests/ui/organizer/external-match-editor.test.tsx`

- [ ] **Step 1: Write failing manual-match tests**

Cover team selection only from locked entries, distinct teams, optional round label, unique sequence, schedule conflicts, score rules and confirmed result with no advancement.

```ts
expect(repository.confirmResultAndAdvance).toHaveBeenCalledWith(
  expect.objectContaining({ nextMatchId: null, nextSlot: null }),
)
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run tests/features/competition/external-match-operations.test.ts`

Expected: FAIL because external manual match creation is absent.

- [ ] **Step 3: Implement manual match use case**

Require locked entries and `EXTERNAL_DOCUMENT` mode. Create/reuse rounds by normalized round name and append a stable sequence inside a transaction. Store only team IDs from the bracket snapshot; reject duplicate matchup IDs within one match.

- [ ] **Step 4: Reuse schedule/result policies without advancement**

Keep all System mode score, permission, concurrency and audit rules. In External mode, confirmation completes the selected Match and MatchResult atomically but requires `nextMatchId` and `nextSlot` to be null. Winner/Runner-up summary uses the Final-marked external match selected by the organizer.

- [ ] **Step 5: Add route and operational editor**

Provide searchable team selects, round name, sequence, court and datetime. Reuse schedule/result editors after creation. Ensure the layout becomes a vertical form at 375px and a restrained grid at desktop widths.

- [ ] **Step 6: Run domain, route and UI tests**

Run:

```powershell
npx vitest run tests/features/competition/external-match-operations.test.ts tests/api/competition/competition-routes.test.ts tests/ui/organizer/external-match-editor.test.tsx
```

Expected: PASS and generated-bracket advancement tests remain green.

- [ ] **Step 7: Commit match checkpoint**

```powershell
git add -- features/competition app/api/organizer/tournaments components/organizer/external-match-editor.tsx tests/features/competition/external-match-operations.test.ts tests/api/competition/competition-routes.test.ts tests/ui/organizer/external-match-editor.test.tsx
git commit -m "feat(competition): operate matches for external brackets"
```

### Task 6: Public Viewer And Stale Revision Warning

**Files:**
- Create: `features/competition/application/get-external-bracket-view.ts`
- Modify: `features/competition/application/get-public-competition.ts`
- Modify: `app/(public)/bracket/page.tsx`
- Modify: `components/bracket-view.tsx`
- Create: `components/external-bracket-view.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/bracket/page.tsx`
- Create: `tests/features/competition/get-external-bracket-view.test.ts`
- Create: `tests/ui/public-external-bracket.test.tsx`

- [ ] **Step 1: Write failing query and public UI tests**

Cover unpublished revision hidden from public, signed URL creation, source label, file metadata, fallback link, latest-result comparison and organizer-only stale warning.

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
npx vitest run tests/features/competition/get-external-bracket-view.test.ts tests/ui/public-external-bracket.test.tsx
```

Expected: FAIL because public external projection is absent.

- [ ] **Step 3: Implement signed public projection**

Load only a `PUBLISHED` Tournament, `PUBLISHED` Bracket and `PUBLISHED` revision. Generate a signed URL for 600 seconds through `ObjectStorage`. Return `null` for missing source and map storage unavailability to the page error boundary.

- [ ] **Step 4: Implement external public viewer**

Public label: `สายการแข่งขันจากไฟล์ผู้จัด`. Show the actual image or PDF, filename, revision and update time. At mobile sizes preserve page navigation and allow only the document viewport to scroll horizontally when needed.

- [ ] **Step 5: Add organizer stale warning**

When `latestConfirmedResultAt > publishedRevision.publishedAt`, show `ผลการแข่งขันใหม่กว่าไฟล์ที่เผยแพร่` and actions `อัปโหลดฉบับใหม่` / `เผยแพร่ revision`. Do not show this operational warning publicly.

- [ ] **Step 6: Run tests**

Run:

```powershell
npx vitest run tests/features/competition/get-external-bracket-view.test.ts tests/ui/public-external-bracket.test.tsx tests/ui/organizer/external-bracket-workspace.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit public checkpoint**

```powershell
git add -- features/competition/application/get-external-bracket-view.ts features/competition/application/get-public-competition.ts 'app/(public)/bracket/page.tsx' components/external-bracket-view.tsx components/bracket-view.tsx 'app/(admin)/organizer/tournaments/[id]/bracket/page.tsx' tests
git commit -m "feat(competition): publish external bracket files"
```

### Task 7: Roadmap, Full Verification And Push

**Files:**
- Modify: `README.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/superpowers/plans/2026-08-19-courtside-external-bracket-file.md`

- [ ] **Step 1: Update authoritative project documentation**

Document both bracket modes, private bucket `tournament-brackets`, file limits, revision publication, manual external matches and stale-file behavior. Move only verified capabilities to `เสร็จแล้ว`; keep notifications, analytics and deployment work in their existing states.

- [ ] **Step 2: Run full automated verification**

```powershell
npm run test
npm run lint
npm run build
npx prisma validate
npx prisma migrate status
git diff --check
git status --short
```

Expected: all independent checks pass. Report database/storage limitations explicitly instead of hiding skipped checks.

- [ ] **Step 3: Run development database and Storage QA**

On the approved development Supabase project:

1. Verify private bucket `tournament-brackets` exists with no anonymous write policy.
2. Create an External mode bracket after locking six approved teams.
3. Upload valid PDF and PNG revisions; reject oversized and corrupt files.
4. Publish revision 1, then upload revision 2 and verify public still displays revision 1.
5. Publish revision 2 and verify revision 1 remains in history.
6. Add matches manually, schedule and confirm results; verify no automatic advancement.
7. Confirm stale warning appears after a newer result and clears after publishing a new revision.

- [ ] **Step 4: Run browser QA**

Use Playwright/browser screenshots at approximately 375px, 768px and 1440px in light/dark mode. Verify no overlap, no page-level horizontal overflow, PDF/image fallback, keyboard upload/publish controls and stable pending/error layouts.

- [ ] **Step 5: Mark checklist based on evidence**

Check only steps actually completed. Record any external service limitation directly beneath the affected step.

- [ ] **Step 6: Commit final documentation checkpoint**

```powershell
git add -- README.md docs/ROADMAP.md docs/superpowers/plans/2026-08-19-courtside-external-bracket-file.md
git commit -m "docs(competition): document external bracket workflow"
```

- [ ] **Step 7: Push the verified branch**

Run: `git push origin feat/courtside-public-platform`

Expected: remote branch points to the verified external bracket implementation.
