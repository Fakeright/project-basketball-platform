# COURTSIDE Tournament Completion And Results Design

**วันที่:** 2026-08-20  
**สถานะ:** Approved for implementation planning  
**ขอบเขต:** Tournament start/completion, match purpose และ public results

## Context

COURTSIDE รองรับการปิดรับสมัคร ล็อกรายชื่อ สร้างหรืออัปโหลดสายการแข่งขัน
จัดตาราง และยืนยันผลรายคู่แล้ว แต่ยังไม่มี workflow ที่สมบูรณ์สำหรับเปลี่ยนรายการจาก
`REGISTRATION_CLOSED` เป็น `IN_PROGRESS` และ `COMPLETED` อย่างปลอดภัย

การสรุปแชมป์ปัจจุบันเดาจาก Match ลำดับสุดท้าย ซึ่งไม่ปลอดภัยเมื่อมีคู่ชิงอันดับ 3,
ชื่อรอบแบบกำหนดเอง หรือสายการแข่งขันจากไฟล์ภายนอก ระยะนี้จึงเพิ่มความหมายของแต่ละ
Match เป็นข้อมูลโครงสร้าง และใช้ข้อมูลนั้นเป็น source of truth ของผลอันดับ

## Goals

- ให้ Organizer เริ่มและจบการแข่งขันด้วยคำสั่งที่ชัดเจน
- ตรวจ prerequisite ฝั่ง server และภายใน database transaction
- รองรับชนะเลิศ รองชนะเลิศ และอันดับ 3 แบบไม่บังคับ
- แสดงทีมอื่นตามรอบที่ตกรอบ
- ใช้กติกาเดียวกันกับสายที่ระบบสร้างและสายจากไฟล์ภายนอก
- บันทึก audit และป้องกัน stale update ด้วย optimistic concurrency
- เพิ่มหน้าผลการแข่งขันสาธารณะที่รองรับ Desktop และ Mobile

## Non-goals

- การจัดอันดับเต็มทุกลำดับ
- การ parse คู่แข่งขันหรือผลจาก PDF/รูปภาพ
- การนำเข้า Excel/CSV
- ระบบลีกหรือ round-robin standings
- การเปิดรับสมัครใหม่ ระงับ เก็บถาวร หรือลบ Tournament
- Notification และ Analytics
- การเพิ่มระบบชิงอันดับ 3 อัตโนมัติให้ bracket generator ในระยะนี้

การ governance ของ Tournament จะทำเป็น implementation slice ถัดไป เพื่อไม่ให้
workflow จบการแข่งขันปนกับ transition ที่มีเงื่อนไขและสิทธิ์คนละชุด

## Product Decisions

### Ranking Depth

ผลมาตรฐานประกอบด้วย:

1. ชนะเลิศ จากผู้ชนะคู่ `CHAMPIONSHIP`
2. รองชนะเลิศ จากผู้แพ้คู่ `CHAMPIONSHIP`
3. อันดับ 3 จากผู้ชนะคู่ `THIRD_PLACE` เมื่อมีคู่ดังกล่าว
4. ทีมอื่นแสดงตามรอบที่แพ้

ไม่สร้าง full ranking เพราะ single elimination ไม่สามารถสรุปลำดับเต็มได้อย่างเที่ยงตรง
หากไม่มี placement match เพิ่มเติม

### Explicit Lifecycle Commands

Tournament ไม่เริ่มอัตโนมัติเมื่อบันทึกคะแนนครั้งแรก และไม่จบอัตโนมัติเมื่อยืนยัน
Final Match ผู้จัดต้องกดคำสั่งแยกเพื่อให้ระบบตรวจความพร้อมและบันทึกเจตนาใน audit

### Explicit Match Purpose

เพิ่ม `MatchPurpose`:

- `STANDARD`: คู่แข่งขันทั่วไป
- `THIRD_PLACE`: คู่ชิงอันดับ 3
- `CHAMPIONSHIP`: คู่ชิงชนะเลิศ

ห้ามใช้ชื่อรอบ เช่น `Final`, `รอบชิง` หรือ Match ลำดับสุดท้ายในการตัดสินความหมาย
ของคู่แข่งขัน

## Domain Rules

### Start Tournament

คำสั่งเริ่มการแข่งขันเปลี่ยนสถานะ:

```text
REGISTRATION_CLOSED -> IN_PROGRESS
```

ต้องผ่านเงื่อนไขทั้งหมด:

- มี active Bracket เพียงชุดเดียวและสถานะเป็น `PUBLISHED`
- Bracket ล็อกรายชื่อแล้วและมีอย่างน้อย 2 entries
- มี Match อย่างน้อย 1 คู่
- มี `CHAMPIONSHIP` exactly 1 คู่
- มี `THIRD_PLACE` ได้ไม่เกิน 1 คู่
- คู่ `CHAMPIONSHIP` และ `THIRD_PLACE` ต้องมีทีมครบสองฝั่ง
- Tournament version ตรงกับ version ที่ client ส่งมา

เมื่อผ่านให้เพิ่ม Tournament version, เปลี่ยนสถานะ และเขียน audit action
`tournament.started` ใน transaction เดียว

### Complete Tournament

คำสั่งจบการแข่งขันเปลี่ยนสถานะ:

```text
IN_PROGRESS -> COMPLETED
```

ต้องผ่านเงื่อนไขทั้งหมด:

- มี active published Bracket ที่ใช้เริ่มการแข่งขัน
- Match ทุกคู่ที่สร้างไว้มีสถานะ `COMPLETED` และมี MatchResult ที่ยืนยันแล้ว
- มี `CHAMPIONSHIP` exactly 1 คู่และมี winner ที่ถูกต้อง
- หากมี `THIRD_PLACE` ต้องมี winner ที่ถูกต้อง
- Tournament version ตรงกับ version ที่ client ส่งมา

เมื่อผ่านให้เพิ่ม Tournament version, เปลี่ยนสถานะ และเขียน audit action
`tournament.completed` ใน transaction เดียว ผลอันดับคำนวณจาก MatchResult เมื่ออ่าน
ข้อมูลและไม่เก็บซ้ำในตาราง standings

### Match Operation Boundaries

- จัดตารางได้ขณะ `REGISTRATION_CLOSED` หรือ `IN_PROGRESS`
- บันทึกคะแนนและยืนยันผลได้เฉพาะ `IN_PROGRESS`
- Organizer แก้ผลที่ยืนยันแล้วไม่ได้
- Platform Admin correction ยังใช้ workflow พร้อมเหตุผลเดิม และทำได้หลังจบรายการ
- System-generated bracket กำหนด terminal match เป็น `CHAMPIONSHIP` อัตโนมัติ
- External bracket ให้เลือก purpose ตอนสร้าง Match
- External Match ที่ยัง `SCHEDULED` และไม่มีคะแนนสามารถแก้ purpose ได้
- ห้ามเปลี่ยน purpose หลังเริ่มกรอกคะแนนหรือยืนยันผล
- ห้ามเปลี่ยน mode, unlock entries หรือสร้างโครงสร้าง system bracket ใหม่หลัง Tournament
  เป็น `IN_PROGRESS`
- External mode ยังเพิ่ม `STANDARD` Match ระหว่างแข่งขันได้ เพราะไฟล์เป็น source of truth
  และรายการ Schedule/Result อาจถูกบันทึกเป็นช่วง ๆ แต่ completion จะตรวจ Match ที่มีอยู่
  ทั้งหมดอีกครั้ง

## Result Calculation

`getCompetitionSummary` จะรับ purpose และสถานะของ Match:

- อ่าน champion และ runner-up จาก confirmed `CHAMPIONSHIP` เท่านั้น
- อ่าน third place จาก confirmed `THIRD_PLACE` เท่านั้น
- ไม่รวม placement matches ในรายการทีมตกรอบ
- ติดตามผู้แพ้จาก `STANDARD` matches ตาม round sequence
- ตัดทีมที่เป็น champion, runner-up หรือ third place ออกจากรายการตกรอบซ้ำ
- หาก placement result ยังไม่ยืนยัน ให้คืนค่าอันดับนั้นเป็น `null`
- คืน `isTournamentCompleted` จาก Tournament status เพื่อแยกผลระหว่างแข่งกับผลทางการ

การแก้ผลโดย Platform Admin จะสะท้อน summary ทันที เพราะ summary คำนวณจากข้อมูล
Match และ MatchResult ล่าสุด

## Permissions And Ownership

เพิ่ม permissions:

- `tournament.start`
- `tournament.complete`

`TOURNAMENT_ORGANIZER` ทำได้เฉพาะ Tournament ที่ตนเป็นเจ้าของ
`PLATFORM_ADMIN` ทำแทนได้ทุก Tournament แต่ต้องส่ง `reason` ที่ไม่เป็นค่าว่างเมื่อเป็น
admin override ระบบต้องเก็บเหตุผลและ `adminOverride: true` ใน audit

การซ่อนปุ่มใน UI เป็นเพียง usability การอนุญาตจริงต้องตรวจใน application use case
และ re-check ใน repository transaction

## Architecture

### Domain

`features/competition/domain` รับผิดชอบ:

- `MatchPurpose`
- validation ของ purpose cardinality
- readiness policy สำหรับ start และ completion
- deterministic result calculation policy

`features/tournament-operations/domain` รับผิดชอบ legal Tournament status transitions
และ audit action types

### Application

เพิ่ม use cases:

- `startTournamentCompetition`
- `completeTournamentCompetition`
- `updateExternalMatchPurpose`

Use case โหลด lifecycle context, ตรวจ permission และ ownership, เรียก pure domain
policy แล้วส่งคำสั่ง mutation พร้อม expected version, actor, reason และ timestamp

### Infrastructure

ขยาย Tournament Operations repository ด้วย lifecycle context และ transactional mutation
เฉพาะงานการแข่งขัน Adapter ของ Prisma ต้องโหลด context และตรวจ prerequisite ซ้ำใน
transaction เดียวกับ Tournament update และ AuditLog insert เพื่อป้องกันผลแข่งขันถูกแก้
ระหว่างการตรวจและ transition

In-memory และ development adapters ต้องใช้ contract เดียวกันเพื่อให้ demo และ tests
ไม่เบี่ยงจาก production behavior

Presentation และ Route Handlers ห้ามเรียก Prisma โดยตรง

## Database Design

เพิ่ม Prisma enum และ field:

```prisma
enum MatchPurpose {
  STANDARD
  THIRD_PLACE
  CHAMPIONSHIP
}

model Match {
  purpose MatchPurpose @default(STANDARD)
}
```

เพิ่ม PostgreSQL partial unique index เพื่อให้ active Bracket มี placement match แต่ละชนิด
ได้ไม่เกินหนึ่งคู่:

```sql
CREATE UNIQUE INDEX "Match_bracketId_placementPurpose_key"
ON "Match" ("bracketId", "purpose")
WHERE "purpose" IN ('THIRD_PLACE', 'CHAMPIONSHIP');
```

Migration backfill terminal Match ของ system-generated brackets เดิมเป็น
`CHAMPIONSHIP` สายภายนอกเดิมคง `STANDARD` และต้องให้ผู้จัดระบุคู่ชิงก่อนเริ่มหรือจบ
รายการ ไม่มีการลบข้อมูล Tournament, Match หรือ MatchResult เดิม

## HTTP Interface

เพิ่ม Route Handlers:

```text
POST  /api/organizer/tournaments/:id/start
POST  /api/organizer/tournaments/:id/complete
PATCH /api/organizer/tournaments/:id/matches/:matchId/purpose
```

Start/complete payload:

```json
{
  "version": 4,
  "reason": null
}
```

Purpose payload:

```json
{
  "purpose": "CHAMPIONSHIP",
  "version": 1,
  "reason": null
}
```

Admin override ส่ง `reason` เป็นข้อความที่มีความหมาย Route Handler validate ด้วย Zod
และ map failures ดังนี้:

- `401`: ไม่ได้เข้าสู่ระบบ
- `403`: role ไม่มี permission
- `404`: ไม่พบ resource หรือ Organizer ไม่ใช่เจ้าของ
- `409`: stale version, illegal source status หรือ placement purpose ซ้ำ
- `422`: prerequisite ไม่ครบหรือ payload ไม่ถูกต้อง
- `500`: unexpected failure พร้อม request correlation id โดยไม่ log secrets/PII

สำหรับ `422` response ส่ง `issues` เป็น code แบบมีโครงสร้าง เช่น
`BRACKET_NOT_PUBLISHED`, `CHAMPIONSHIP_MISSING`, `MATCH_RESULT_PENDING` เพื่อให้ UI
แสดง checklist ภาษาไทยได้โดยไม่ parse error string

## Organizer Experience

หน้า `/organizer/tournaments/:id/results` เพิ่ม lifecycle panel ด้านบน:

- แสดงสถานะ Tournament ปัจจุบัน
- แสดง checklist ความพร้อมแบบ rows ไม่ใช้ nested cards
- แสดงปุ่ม `เริ่มการแข่งขัน` เมื่ออยู่ `REGISTRATION_CLOSED`
- แสดงปุ่ม `จบการแข่งขัน` เมื่ออยู่ `IN_PROGRESS`
- ใช้ confirmation dialog ก่อน mutation
- Platform Admin override แสดง textarea เหตุผลที่บังคับกรอก
- เมื่อสำเร็จใช้ `router.refresh()` เพื่ออ่าน version และสถานะล่าสุดจาก server
- เมื่อ conflict แสดงข้อความให้โหลดข้อมูลใหม่

External Match form เพิ่ม select “ประเภทคู่แข่งขัน” โดย default เป็น “คู่แข่งขันทั่วไป”
และแสดง badge ข้อความบน row ของคู่ชิงชนะเลิศหรือชิงอันดับ 3 โดยไม่ใช้สีเป็นสัญญาณเดียว

## Public Results Experience

เพิ่มเมนู “ผลการแข่งขัน” และหน้า:

```text
/results?tournament=:slug
```

หน้าใช้รูปแบบ Editorial Minimalism เดียวกับ Schedule และ Bracket:

- Header ชื่อรายการและสถานะกำลังแข่ง/จบแล้ว
- แชมป์และรองแชมป์เป็น hierarchy หลัก
- อันดับ 3 แสดงเมื่อมี confirmed third-place result
- ทีมที่ตกรอบแสดงเป็น structured rows แบ่งตามรอบ
- ระหว่างแข่งขันแสดงเฉพาะผลที่ยืนยันแล้วและข้อความ “การแข่งขันยังไม่จบ”
- มี loading, empty และ unexpected error state ภาษาไทย
- ลิงก์จาก Tournament detail, Schedule และ Bracket รักษา slug เดียวกัน

หน้าต้องไม่มี horizontal page overflow ที่ 375px, 768px และ 1440px

## Error Recovery

- ปุ่ม mutation disabled ระหว่าง request และเปิดใช้อีกครั้งเมื่อ failure
- Domain issue แสดงเป็น checklist ที่ผู้จัดแก้ได้
- Optimistic conflict ไม่ retry mutation อัตโนมัติ
- Duplicate placement purpose บอกให้เปลี่ยนประเภทของคู่เดิมก่อน
- Completion failure ไม่เปลี่ยน Tournament status และไม่เขียน audit สำเร็จบางส่วน
- Unexpected failure ไม่เปิดเผย object path, database details หรือ actor data

## Testing Strategy

ใช้ TDD แบ่งความเสี่ยงดังนี้:

### Domain Tests

- purpose cardinality
- start readiness ทุก prerequisite
- completion readiness รวม pending/missing MatchResult
- champion, runner-up, optional third place และ eliminated rounds
- placement teams ไม่ซ้ำใน eliminated list

### Application Tests

- Organizer ownership และ Platform Admin override reason
- permission rejection
- stale Tournament/Match version
- start และ completion audit input
- purpose mutation restrictions

### Repository Tests

- migration mapping และ default purpose
- partial unique index
- prerequisite re-check ใน transaction
- Tournament update และ audit rollback พร้อมกัน
- concurrent completion ได้สำเร็จเพียงคำสั่งเดียว

### Route Handler Tests

- `401`, `403`, `404`, `409`, `422`, `500`
- structured issue response
- malformed JSON และ invalid enum

### UI Tests

- lifecycle checklist และปุ่มตามสถานะ
- confirmation, pending, success, conflict และ admin reason
- external purpose selector
- public ongoing/completed/empty summaries
- accessible labels และ keyboard interaction

### Verification

ก่อน commit implementation ต้องรัน:

```powershell
npm run test
npm run lint
npm run build
npx prisma validate
npx prisma migrate status
git diff --check
git status --short
```

ตรวจภาพและ interaction ที่ประมาณ 375px, 768px และ 1440px ทั้ง public Results และ
Organizer Results โดย protected browser QA ต้องใช้ Supabase session ที่ถูกต้อง

## Delivery Sequence

1. MatchPurpose domain, migration และ generator tagging
2. Result summary refactor
3. Start lifecycle use case, repository transaction และ route
4. Completion lifecycle use case, repository transaction และ route
5. External match purpose create/update workflow
6. Organizer lifecycle panel
7. Public Results page และ navigation
8. Full regression, database migration check และ responsive browser QA

แต่ละขั้นต้องมี focused failing test ก่อน implementation และ commit แยกตาม behavior
เพื่อให้ย้อนตรวจและ review ได้ง่าย
