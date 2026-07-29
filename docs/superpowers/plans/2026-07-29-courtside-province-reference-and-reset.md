# COURTSIDE Province Reference And Clean Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Normalize Thai province data, add searchable province selectors, remove Home hero auth actions, and reset/reseed the approved development Supabase project.

**Architecture:** A domain-owned 77-province catalog is shared by Prisma seed, browser selector options, and server validation. \`Team\` and \`Tournament\` persist a \`provinceCode\` relation to \`Province\`; read models expose that code plus the Thai display name. A separately guarded script removes development storage and Auth data, runs Prisma reset, then seeds consistent sample data.

**Tech Stack:** Next.js 16.2.11 App Router, React 19, TypeScript, Tailwind CSS 4, Base UI Combobox, Prisma 7, Supabase PostgreSQL/Auth/Storage, Zod, Vitest, React Testing Library.

## Global Constraints

- Use Thai for user-facing province labels and errors.
- Use Ministry of Interior two-digit province codes; \`10\` is Bangkok and \`92\` is Trang.
- Do not accept arbitrary province text for Team or Tournament mutations.
- Do not commit secrets, generated clients, \`.env\`, or reset confirmations.
- The reset refuses production, missing \`COURTSIDE_ALLOW_DESTRUCTIVE_RESET=true\`, or missing Supabase configuration.
- Do not execute reset until Tasks 1-3 are reviewed and tests pass.
- Do not stage \`.agents/\`, \`.claude/\`, \`.windsurf/\`, or \`skills-lock.json\`.

---

## File Structure

- \`features/provinces/domain/thai-provinces.ts\`: immutable 77-province catalog, lookup, and Thai/English search.
- \`features/provinces/application/assert-province-code.ts\`: server validation boundary.
- \`components/province-selector.tsx\`: accessible searchable Base UI combobox.
- \`prisma/schema.prisma\`, migration, and \`prisma/seed.ts\`: reference relation and reset-safe development data.
- \`scripts/reset-development-supabase.ts\`: guarded Supabase Auth/Storage/PostgreSQL reset.

### Task 1: Province Catalog And Schema

**Files:**
- Create: \`features/provinces/domain/thai-provinces.ts\`
- Create: \`features/provinces/application/assert-province-code.ts\`
- Create: \`prisma/migrations/<timestamp>_province_reference/migration.sql\`
- Modify: \`prisma/schema.prisma\`
- Test: \`tests/features/provinces/thai-provinces.test.ts\`
- Test: \`tests/features/provinces/assert-province-code.test.ts\`

**Interfaces:**
- \`ProvinceOption = { code: string; nameTh: string; nameEn: string }\`
- \`thaiProvinces\`, \`findProvinceByCode(code)\`, \`searchThaiProvinces(query)\`
- \`assertProvinceCode(code): string\`, throwing \`INVALID_PROVINCE_CODE\`

- [ ] **Step 1: Write failing catalog and validation tests**

\`\`\`ts
expect(thaiProvinces).toHaveLength(77)
expect(new Set(thaiProvinces.map((item) => item.code)).size).toBe(77)
expect(findProvinceByCode("92")).toMatchObject({ nameTh: "ตรัง", nameEn: "Trang" })
expect(searchThaiProvinces("chiang")).toEqual(
  expect.arrayContaining([expect.objectContaining({ code: "50" })]),
)
expect(() => assertProvinceCode("Trang")).toThrow("INVALID_PROVINCE_CODE")
\`\`\`

- [ ] **Step 2: Run tests to verify RED**

\`\`\`powershell
npm run test -- tests/features/provinces/thai-provinces.test.ts tests/features/provinces/assert-province-code.test.ts
\`\`\`

Expected: FAIL because the catalog and validation boundary do not exist.

- [ ] **Step 3: Implement the immutable catalog and Prisma reference relation**

Create the exact 77-record catalog, shaped as \`{ code, nameTh, nameEn }\`, using the following code/name pairs:

\`\`\`text
10 กรุงเทพมหานคร Bangkok; 11 สมุทรปราการ Samut Prakan; 12 นนทบุรี Nonthaburi; 13 ปทุมธานี Pathum Thani; 14 พระนครศรีอยุธยา Phra Nakhon Si Ayutthaya; 15 อ่างทอง Ang Thong; 16 ลพบุรี Lop Buri; 17 สิงห์บุรี Sing Buri; 18 ชัยนาท Chai Nat; 19 สระบุรี Saraburi
20 ชลบุรี Chon Buri; 21 ระยอง Rayong; 22 จันทบุรี Chanthaburi; 23 ตราด Trat; 24 ฉะเชิงเทรา Chachoengsao; 25 ปราจีนบุรี Prachin Buri; 26 นครนายก Nakhon Nayok; 27 สระแก้ว Sa Kaeo
30 นครราชสีมา Nakhon Ratchasima; 31 บุรีรัมย์ Buri Ram; 32 สุรินทร์ Surin; 33 ศรีสะเกษ Si Sa Ket; 34 อุบลราชธานี Ubon Ratchathani; 35 ยโสธร Yasothon; 36 ชัยภูมิ Chaiyaphum; 37 อำนาจเจริญ Amnat Charoen; 38 บึงกาฬ Bueng Kan; 39 หนองบัวลำภู Nong Bua Lam Phu
40 ขอนแก่น Khon Kaen; 41 อุดรธานี Udon Thani; 42 เลย Loei; 43 หนองคาย Nong Khai; 44 มหาสารคาม Maha Sarakham; 45 ร้อยเอ็ด Roi Et; 46 กาฬสินธุ์ Kalasin; 47 สกลนคร Sakon Nakhon; 48 นครพนม Nakhon Phanom; 49 มุกดาหาร Mukdahan
50 เชียงใหม่ Chiang Mai; 51 ลำพูน Lamphun; 52 ลำปาง Lampang; 53 อุตรดิตถ์ Uttaradit; 54 แพร่ Phrae; 55 น่าน Nan; 56 พะเยา Phayao; 57 เชียงราย Chiang Rai; 58 แม่ฮ่องสอน Mae Hong Son
60 นครสวรรค์ Nakhon Sawan; 61 อุทัยธานี Uthai Thani; 62 กำแพงเพชร Kamphaeng Phet; 63 ตาก Tak; 64 สุโขทัย Sukhothai; 65 พิษณุโลก Phitsanulok; 66 พิจิตร Phichit; 67 เพชรบูรณ์ Phetchabun
70 ราชบุรี Ratchaburi; 71 กาญจนบุรี Kanchanaburi; 72 สุพรรณบุรี Suphan Buri; 73 นครปฐม Nakhon Pathom; 74 สมุทรสาคร Samut Sakhon; 75 สมุทรสงคราม Samut Songkhram; 76 เพชรบุรี Phetchaburi; 77 ประจวบคีรีขันธ์ Prachuap Khiri Khan
80 นครศรีธรรมราช Nakhon Si Thammarat; 81 กระบี่ Krabi; 82 พังงา Phang Nga; 83 ภูเก็ต Phuket; 84 สุราษฎร์ธานี Surat Thani; 85 ระนอง Ranong; 86 ชุมพร Chumphon
90 สงขลา Songkhla; 91 สตูล Satun; 92 ตรัง Trang; 93 พัทลุง Phatthalung; 94 ปัตตานี Pattani; 95 ยะลา Yala; 96 นราธิวาส Narathiwat
\`\`\`

Normalize search using \`toLocaleLowerCase("th-TH")\` and match Thai or English names. Replace free-text database columns with:

\`\`\`prisma
model Province {
  code String @id @db.Char(2)
  nameTh String @unique
  nameEn String @unique
  teams Team[]
  tournaments Tournament[]
}

model Team {
  provinceCode String @db.Char(2)
  province Province @relation(fields: [provinceCode], references: [code], onDelete: Restrict)
  @@index([provinceCode])
}

model Tournament {
  provinceCode String @db.Char(2)
  province Province @relation(fields: [provinceCode], references: [code], onDelete: Restrict)
  @@index([provinceCode])
}
\`\`\`

Generate a destructive migration because Task 4 resets the approved development database before it is applied.

- [ ] **Step 4: Run focused verification**

\`\`\`powershell
npm run test -- tests/features/provinces/thai-provinces.test.ts tests/features/provinces/assert-province-code.test.ts
npx prisma validate
npx prisma generate
\`\`\`

Expected: PASS.

- [ ] **Step 5: Commit**

\`\`\`powershell
git add -- prisma features/provinces tests/features/provinces
git commit -m "feat(province): add normalized province reference"
\`\`\`

### Task 2: Persist Codes At Team And Tournament Boundaries

**Files:**
- Modify: Team domain, application input, repository ports, handlers, and Prisma repository under \`features/team-management/\`
- Modify: Tournament operation domain, workflow, editor schema, and Prisma repository under \`features/tournament-operations/\`
- Modify: \`features/tournaments/domain/tournament.ts\`, search params, and Prisma tournament repository
- Modify: affected fixtures and API/feature tests

**Interfaces:**
- All write inputs become \`{ provinceCode: string }\`.
- Read models become \`{ provinceCode: string; province: string }\`, where \`province\` is \`Province.nameTh\`.
- \`TournamentSearchFilters\` uses \`provinceCode?: string\`; URL key \`province\` carries the code.

- [ ] **Step 1: Write failing boundary and repository tests**

\`\`\`ts
const response = await handleCreateTeam(
  jsonRequest({ name: "Trang Hoops", provinceCode: "Trang" }),
  dependencies,
)
expect(response.status).toBe(422)

expect(mappedTournament).toMatchObject({ provinceCode: "92", province: "ตรัง" })
expect(prisma.tournament.findMany).toHaveBeenCalledWith(
  expect.objectContaining({ where: expect.objectContaining({ provinceCode: "92" }) }),
)
\`\`\`

- [ ] **Step 2: Run focused tests to verify RED**

\`\`\`powershell
npm run test -- tests/api/teams/team-routes.test.ts tests/features/team-management/prisma-team-repository.test.ts tests/features/tournaments/prisma-tournament-repository.test.ts tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts tests/features/tournaments/tournament-search-params.test.ts
\`\`\`

Expected: FAIL because mutations and Prisma mappers still use free-text province values.

- [ ] **Step 3: Implement canonical write contracts and Thai read mapping**

Use \`assertProvinceCode\` in server schemas with Thai feedback \`กรุณาเลือกจังหวัดจากรายการ\`. Change Prisma create/update data to \`provinceCode\`; include the relation in mappers and expose \`province.nameTh\` as display \`province\`. Parse public query \`province\` only when it is a known code and query exact \`provinceCode\`, never \`contains\`.

- [ ] **Step 4: Run affected regression tests**

\`\`\`powershell
npm run test -- tests/api/teams tests/api/admin tests/features/team-management tests/features/tournaments tests/features/tournament-operations
\`\`\`

Expected: PASS.

- [ ] **Step 5: Commit**

\`\`\`powershell
git add -- features tests/api tests/features
git commit -m "refactor(province): persist province codes"
\`\`\`

### Task 3: Searchable Selector, Forms, And Home Cleanup

**Files:**
- Create: \`components/province-selector.tsx\`
- Modify: \`components/tournament-search-form.tsx\`
- Modify: \`components/admin/tournament-editor.tsx\`
- Modify: \`components/team/team-editor.tsx\`
- Modify: \`app/(public)/page.tsx\`
- Test: selector, accessibility, tournament editor, team editor, and Home action tests

**Interfaces:**
- \`ProvinceSelector({ id, label, name, defaultValue?, allowEmpty? })\`
- A hidden \`<input name={name}>\` always holds the selected code.
- \`allowEmpty\` renders \`ทุกจังหวัด\` only for tournament search.

- [ ] **Step 1: Write failing selector and form tests**

\`\`\`tsx
render(<ProvinceSelector id="province" label="จังหวัด" name="provinceCode" />)
await user.click(screen.getByRole("combobox", { name: "จังหวัด" }))
await user.type(screen.getByRole("textbox", { name: "ค้นหาจังหวัด" }), "Trang")
await user.click(screen.getByRole("option", { name: /ตรัง/ }))
expect(screen.getByDisplayValue("92")).toHaveAttribute("name", "provinceCode")
\`\`\`

Add tests that tournament search creates \`province=92\`, editors submit \`provinceCode: "92"\`, and Home no longer renders the \`บัญชีผู้ใช้\` hero action region.

- [ ] **Step 2: Run UI tests to verify RED**

\`\`\`powershell
npm run test -- tests/ui/province-selector.test.tsx tests/ui/interactive-accessibility.test.tsx tests/ui/admin/tournament-editor.test.tsx tests/ui/team/team-editor.test.tsx tests/ui/home-auth-actions.test.tsx
\`\`\`

Expected: FAIL because the selector does not exist and forms submit text.

- [ ] **Step 3: Implement the Base UI combobox and integrate forms**

Use \`@base-ui/react/combobox\`; do not add a dependency. Filter Thai and English names, display \`จังหวัดไทย / English\`, provide keyboard selection and \`ไม่พบจังหวัดที่ค้นหา\`, constrain the popup to the viewport, and keep the hidden canonical code input. Replace all three province text fields. Remove \`HomeAuthActions\` from Home but leave anonymous header actions unchanged.

- [ ] **Step 4: Run focused UI tests**

\`\`\`powershell
npm run test -- tests/ui/province-selector.test.tsx tests/ui/interactive-accessibility.test.tsx tests/ui/admin/tournament-editor.test.tsx tests/ui/team/team-editor.test.tsx tests/ui/home-auth-actions.test.tsx
\`\`\`

Expected: PASS.

- [ ] **Step 5: Commit**

\`\`\`powershell
git add -- components app/'(public)'/page.tsx tests/ui
git commit -m "feat(province): add searchable province selector"
\`\`\`

### Task 4: Guarded Reset And New Seed Data

**Files:**
- Create: \`scripts/reset-development-supabase.ts\`
- Modify: \`prisma/seed.ts\`
- Modify: \`package.json\`
- Test: \`tests/scripts/reset-development-supabase.test.ts\`
- Test: \`tests/features/provinces/seed-provinces.test.ts\`

**Interfaces:**
- \`assertDestructiveResetAllowed(environment, confirmed, configuration): void\`
- \`resetDevelopmentSupabase(dependencies): Promise<{ storageObjectsDeleted: number; authUsersDeleted: number }>\`
- \`npm run reset:development\` executes only after confirmation.

- [ ] **Step 1: Write failing reset guard and seed tests**

\`\`\`ts
expect(() => assertDestructiveResetAllowed("production", true, config))
  .toThrow("DESTRUCTIVE_RESET_NOT_ALLOWED")
expect(() => assertDestructiveResetAllowed("development", false, config))
  .toThrow("DESTRUCTIVE_RESET_NOT_ALLOWED")
expect(() => assertDestructiveResetAllowed("development", true, config))
  .not.toThrow()
\`\`\`

Mock Supabase and verify a rejected guard calls no storage/Auth deletion method. Verify seed upserts exactly 77 provinces before sample rows, and samples use \`10\`, \`20\`, \`50\`, or \`92\`.

- [ ] **Step 2: Run tests to verify RED**

\`\`\`powershell
npm run test -- tests/scripts/reset-development-supabase.test.ts tests/features/provinces/seed-provinces.test.ts
\`\`\`

Expected: FAIL because reset guard and province seed helpers do not exist.

- [ ] **Step 3: Implement reset and seed behavior**

Read Supabase configuration only from environment variables. Recursively remove objects from \`tournament-posters\` and \`tournament-documents\`; delete paginated Supabase Auth users via the service-role Admin API; then run \`prisma migrate reset --force --skip-seed\` followed by \`tsx prisma/seed.ts\`. Use \`npx.cmd\` on Windows and \`npx\` elsewhere. Log only aggregate deletion counts and the final province count. Seed provinces before public sample tournaments, teams, and approved registrations; create no Auth users and embed no passwords.

Add:

\`\`\`json
"reset:development": "tsx scripts/reset-development-supabase.ts"
\`\`\`

to \`package.json\`.

- [ ] **Step 4: Run independent verification**

\`\`\`powershell
npm run test -- tests/scripts/reset-development-supabase.test.ts tests/features/provinces/seed-provinces.test.ts
npx prisma validate
npx prisma generate
\`\`\`

Expected: PASS.

- [ ] **Step 5: Execute the approved destructive reset once**

\`\`\`powershell
$env:COURTSIDE_ALLOW_DESTRUCTIVE_RESET = "true"
npm run reset:development
Remove-Item Env:COURTSIDE_ALLOW_DESTRUCTIVE_RESET
npx prisma migrate status
\`\`\`

Expected: storage buckets and Supabase Auth are empty, PostgreSQL is rebuilt, and seed verification reports 77 provinces. Do not print secrets, emails, paths, or identifiers.

- [ ] **Step 6: Commit**

\`\`\`powershell
git add -- scripts prisma/seed.ts package.json tests/scripts tests/features/provinces
git commit -m "feat(province): reset and seed normalized development data"
\`\`\`

### Task 5: Complete Verification And Delivery

- [ ] **Step 1: Run full verification**

\`\`\`powershell
npm run test
npm run lint
npm run build
npx prisma validate
npx prisma migrate status
git diff --check
git status --short
\`\`\`

Expected: all commands pass; only user-owned untracked tooling files remain after commits.

- [ ] **Step 2: Browser QA at 375px, 768px, and 1440px**

Verify Home has no hero Login/Register actions; anonymous header actions remain; tournament search finds \`ตรัง\` and \`Trang\` and uses \`province=92\`; team and tournament editors require a province; and the combobox popup scrolls without page overflow.

- [ ] **Step 3: Push**

\`\`\`powershell
git push
\`\`\`

## Plan Self-Review

- **Spec coverage:** Task 1 creates the 77-province foundation. Task 2 converts persistent contracts and read models. Task 3 builds the accessible selector and removes Home hero actions. Task 4 performs the approved reset and clean seed. Task 5 verifies the result.
- **Scope:** No province administration UI, multi-country support, email verification, or seed credentials is included.
- **Type consistency:** All writes use \`provinceCode\`; reads expose both \`provinceCode\` and Thai display \`province\`; URL \`province\` carries the code.
- **Placeholder scan:** Catalog mapping, guards, reset order, command, and verification behavior are explicit.

