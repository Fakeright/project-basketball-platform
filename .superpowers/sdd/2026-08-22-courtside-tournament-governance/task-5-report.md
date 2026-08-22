# Task 5 Report: Block Competition Mutations

## สรุปผล

ดำเนิน Task 5 ตาม approved specification และ implementation plan แล้ว โดยส่ง
`tournamentGovernanceStatus` ผ่าน competition lifecycle, bracket lock/generation/
publication, organizer workspace, external bracket mode/revision workspace,
external match, schedule, score/result และ correction contexts

ทุก competition write path เรียก
`assertTournamentGovernanceAllowsOperation` หลัง ownership/authentication และ
optimistic version checks ที่มีอยู่ และก่อน persistence หรือ Storage operation
สถานะ `SUSPENDED`/`REMOVED` จึงใช้ shared typed issue codes จาก Task 1

competition, external-bracket และ tournament competition lifecycle HTTP handlers
ใช้ `tournamentGovernanceFailureResponse` ชุดเดียวกันเพื่อคืน Thai `409` body:

```json
{
  "message": "รายการแข่งขันถูกระงับหรือถูกนำออก กรุณาตรวจสอบสถานะล่าสุด",
  "issues": ["TOURNAMENT_SUSPENDED"]
}
```

public competition/external-bracket reads ไม่ถูกกรองหรือปิดใน Task นี้ตามข้อกำหนด
ที่ defer visibility behavior ไป Task 6

## TDD Evidence

### RED 1: competition mutation guards

Command:

```powershell
npm run test -- tests/features/competition/competition-use-cases.test.ts tests/features/competition/external-bracket-use-cases.test.ts tests/features/competition/external-match-operations.test.ts
```

Exact result:

```text
exit code: 1
Test Files  3 failed (3)
Tests       14 failed | 50 passed (64)
Duration    1.30s
```

ทั้ง 14 failures เป็น expected behavior gap: suspended operation resolved แทนที่จะ
reject ด้วย `issues: ["TOURNAMENT_SUSPENDED"]` ครบ lock, generation,
publish/unpublish, schedule, score, confirmation, correction, mode selection,
external upload/publication/retirement และ external match creation/purpose update

### RED 2: HTTP and Prisma propagation

Command:

```powershell
npm run test -- tests/api/competition/competition-routes.test.ts tests/api/competition/external-bracket-routes.test.ts tests/features/competition/prisma-competition-repository.test.ts tests/features/competition/prisma-external-bracket-repository.test.ts
```

Exact result:

```text
exit code: 1
Test Files  4 failed (4)
Tests       4 failed | 60 passed (64)
Duration    1.49s
```

Expected failures คือ competition/external handlers คืน `500` แทน shared `409`
และ Prisma result/external workspace contexts ยังไม่มี
`tournamentGovernanceStatus: "SUSPENDED"`

### GREEN 1: competition mutation guards

รัน command เดียวกับ RED 1 หลัง implementation:

```text
exit code: 0
Test Files  3 passed (3)
Tests       64 passed (64)
Duration    1.29s
```

### GREEN 2: HTTP and Prisma propagation

รัน command เดียวกับ RED 2 หลัง implementation:

```text
exit code: 0
Test Files  4 passed (4)
Tests       64 passed (64)
Duration    1.45s
```

### Feature regression

Command:

```powershell
npm run test -- tests/features/competition
```

Exact result:

```text
exit code: 0
Test Files  18 passed (18)
Tests       152 passed (152)
Duration    5.04s
```

Additional lifecycle/development projection check:

```powershell
npm run test -- tests/features/tournament-operations/tournament-competition-lifecycle.test.ts tests/features/competition/development-external-bracket-repository.test.ts tests/features/competition/get-organizer-external-bracket.test.ts
```

```text
exit code: 0
Test Files  3 passed (3)
Tests       14 passed (14)
Duration    1.17s
```

## Full Verification

```powershell
npm run test
```

```text
exit code: 0
Test Files  143 passed (143)
Tests       998 passed (998)
Duration    51.45s
```

```powershell
npm run lint
```

```text
exit code: 0
eslint reported no warnings or errors
```

```powershell
npm run build
```

```text
exit code: 0
Next.js 16.2.11 compiled successfully in 7.1s
TypeScript finished in 10.1s
Static pages generated 27/27 in 338ms
```

```powershell
git diff --check
```

```text
exit code: 0
No whitespace errors; Git emitted only existing LF-to-CRLF working-copy warnings.
```

## Files

Domain and application contracts/guards:

- `features/competition/domain/competition.ts`
- `features/competition/application/ports/competition-repository.ts`
- `features/competition/application/ports/external-bracket-repository.ts`
- `features/competition/application/external-bracket-access.ts`
- `features/competition/application/match-result-access.ts`
- `features/competition/application/lock-bracket-entries.ts`
- `features/competition/application/generate-bracket.ts`
- `features/competition/application/publish-bracket.ts`
- `features/competition/application/create-external-match.ts`
- `features/competition/application/update-external-match-purpose.ts`
- `features/competition/application/schedule-match.ts`
- `features/competition/application/correct-match-result.ts`
- `features/competition/application/get-organizer-competition.ts`
- `features/tournament-operations/application/transition-tournament-competition.ts`

Infrastructure and lifecycle adapters:

- `features/competition/infrastructure/prisma-competition-repository.ts`
- `features/competition/infrastructure/prisma-external-bracket-repository.ts`
- `features/competition/infrastructure/development-external-bracket-repository.ts`
- `features/tournament-operations/infrastructure/tournament-operations-repository.ts`
- `features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts`
- `features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts`
- `features/tournament-operations/infrastructure/development-tournament-operations-repository.ts`

HTTP mapping:

- `features/competition/presentation/competition-handler.ts`
- `features/competition/presentation/external-bracket-handler.ts`
- `features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts`
  already used the shared mapper from Task 4; Task 5 preserved and reverified it

Tests and fixtures:

- `tests/features/competition/competition-use-cases.test.ts`
- `tests/features/competition/external-bracket-use-cases.test.ts`
- `tests/features/competition/external-match-operations.test.ts`
- `tests/features/competition/prisma-competition-repository.test.ts`
- `tests/features/competition/prisma-external-bracket-repository.test.ts`
- `tests/features/competition/development-external-bracket-repository.test.ts`
- `tests/features/competition/get-organizer-external-bracket.test.ts`
- `tests/features/competition/tournament-competition-policy.test.ts`
- `tests/features/tournament-operations/tournament-competition-lifecycle.test.ts`
- `tests/api/competition/competition-routes.test.ts`
- `tests/api/competition/external-bracket-routes.test.ts`

`select-bracket-mode`, `upload-external-bracket`, `publish-external-bracket` และ
`retire-external-bracket` enforce ผ่าน `assertExternalBracketAccess` ส่วน
`record-match-score` และ `confirm-match-result` enforce ผ่าน
`loadMutableMatchResultContext` จึงไม่มี duplicated direct guard edits ในไฟล์ use case
เหล่านั้น

## Self-review

- ตรวจครบทุก competition write path และยืนยันว่า suspended tests assert
  persistence/Storage mock ไม่ถูกเรียกหลัง context load
- ownership และ permission checks ยังเกิดก่อน governance guard จึงไม่เปิดเผย resource
  ของ organizer รายอื่น
- optimistic version checks ที่ application มีอยู่ยังเกิดก่อน governance guard;
  repository version predicates และ transactional score/bracket behavior ไม่ถูกลดทอน
- lifecycle/bracket/match/result policy errors เดิมยังคง mapper และ status เดิม
- Prisma selects/maps ใช้ `tournament.governanceStatus` ทุก mutation context และ
  development external state เก่าที่ไม่มี field จะ normalize เป็น `ACTIVE`
- organizer projections carry status แต่ไม่ block read; public lookup conditions ไม่ถูกแก้
- presentation layer ไม่ query Prisma และไม่มี external database/schema/secret changes
- diff จำกัดอยู่ใน competition governance propagation, lifecycle contract consumers,
  tests และ report นี้; ไม่มี UI/visual behavior จึงไม่ต้องทำ responsive visual QA

## Concerns

- `npm run test` แสดง warning เดิมว่า Vite รองรับ tsconfig paths แบบ native และ
  `vite-tsconfig-paths` สามารถถอดภายหลังได้; ไม่เกี่ยวกับ Task 5
- `npm run build` แสดง warning เดิมเรื่อง multiple lockfiles และ inferred workspace root;
  build สำเร็จและไม่ได้แก้ config นอกขอบเขต
- untracked `.agents/`, `.claude/`, `.windsurf/` และ `skills-lock.json` มีอยู่ก่อนเริ่มงาน
  และถูกเว้นจาก staging/commit
- public visibility filtering สำหรับ suspended/removed tournaments ยังไม่ทำโดยเจตนา
  และเป็นงานของ Task 6

## Commit

Task checkpoint commit (this commit):

```text
feat(governance): protect competition operations
```
