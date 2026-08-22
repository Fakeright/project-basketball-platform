# COURTSIDE Tournament Governance Design

**วันที่:** 22 สิงหาคม 2026
**สถานะ:** รอตรวจสอบก่อนจัดทำ implementation plan

## เป้าหมาย

เพิ่มเครื่องมือกำกับรายการแข่งขันสำหรับ `PLATFORM_ADMIN` โดยไม่ทำลาย
สถานะการดำเนินการแข่งขันเดิมหรือประวัติที่ต้องตรวจสอบย้อนหลัง ระบบต้องรองรับ
การระงับ การยกเลิกการระงับ การนำออกจากพื้นที่สาธารณะ การเก็บถาวร
การเปิดรับสมัครใหม่ และการลบรายการร่างที่ยังไม่มีข้อมูลสำคัญ

งานนี้ไม่เพิ่มบทบาทใหม่ ไม่เปลี่ยน workflow การตรวจอนุมัติ และไม่รวมการตั้งเวลา
ดำเนินคำสั่งล่วงหน้า การกู้คืนรายการที่ถูกนำออก หรือ retention job สำหรับไฟล์

## หลักการออกแบบ

สถานะการกำกับเป็นคนละแกนกับสถานะการแข่งขัน:

- `TournamentStatus` บอกขั้นตอนทางธุรกิจ เช่น `PUBLISHED`,
  `REGISTRATION_CLOSED`, `IN_PROGRESS` และ `COMPLETED`
- `TournamentGovernanceStatus` บอกว่ารายการถูกอนุญาตให้ใช้งานหรือไม่ ได้แก่
  `ACTIVE`, `SUSPENDED` และ `REMOVED`

การแยกสองแกนทำให้การระงับไม่เขียนทับสถานะการแข่งขันเดิม เมื่อ Admin
ยกเลิกการระงับ รายการจึงกลับมาอยู่ขั้นตอนเดิมโดยไม่ต้องเดาจาก Audit Log
ส่วน `ARCHIVED` ยังคงเป็น `TournamentStatus` เพราะเป็นขั้นตอนปกติหลังการแข่งขัน
เสร็จสมบูรณ์ ไม่ใช่บทลงโทษทางการกำกับ

## ขอบเขตคำสั่ง

ทุกคำสั่งในระยะนี้เป็นสิทธิ์ของ `PLATFORM_ADMIN` เท่านั้น ใช้ optimistic
concurrency ผ่าน `version` และบันทึก Audit Log ใน transaction เดียวกับ mutation

### ระงับรายการ

- ใช้ได้เมื่อ `governanceStatus` เป็น `ACTIVE`
- ใช้ได้กับทุก `TournamentStatus` ยกเว้น `ARCHIVED`
- ต้องมีเหตุผลความยาว 1-500 ตัวอักษร
- เปลี่ยนเฉพาะ `governanceStatus` เป็น `SUSPENDED`
- ไม่แก้ `TournamentStatus`, bracket, match, registration หรือผลการแข่งขัน
- รายการหายจากพื้นที่สาธารณะและ mutation ทางการแข่งขันทั้งหมดถูกบล็อกทันที

### ยกเลิกการระงับ

- ใช้ได้เมื่อ `governanceStatus` เป็น `SUSPENDED`
- ต้องมีเหตุผลความยาว 1-500 ตัวอักษร
- เปลี่ยน `governanceStatus` กลับเป็น `ACTIVE`
- `TournamentStatus` เดิมยังคงอยู่ จึงกลับมาใช้งานต่อจากขั้นตอนเดิม

### นำรายการออก

- ใช้ได้เมื่อ governance เป็น `ACTIVE` หรือ `SUSPENDED`
- ใช้ได้กับทุก `TournamentStatus` ยกเว้น `ARCHIVED`
- ต้องมีเหตุผลความยาว 1-500 ตัวอักษร
- เปลี่ยน `governanceStatus` เป็น `REMOVED` โดยไม่ลบ record หรือข้อมูลสัมพันธ์
- เป็นปลายทางถาวรในระยะนี้ ไม่มีคำสั่ง restore
- รายการไม่ปรากฏต่อสาธารณะหรือ workspace ของผู้จัด แต่ยังอ่านได้จาก Admin
  governance และ Audit Log

### เก็บถาวร

- ใช้ได้เมื่อ `governanceStatus` เป็น `ACTIVE` และ `TournamentStatus` เป็น
  `COMPLETED` เท่านั้น
- ต้องมีเหตุผลความยาว 1-500 ตัวอักษร
- เปลี่ยน `TournamentStatus` เป็น `ARCHIVED`
- รายการและผลการแข่งขันยังเปิดอ่านต่อสาธารณะตาม visibility ปัจจุบัน แต่ mutation
  ทางการแข่งขันทั้งหมดถูกปิด

### เปิดรับสมัครใหม่

- ใช้ได้เมื่อ governance เป็น `ACTIVE` และสถานะเป็น `REGISTRATION_CLOSED`
- ต้องมีเหตุผลความยาว 1-500 ตัวอักษร
- เวลาปัจจุบันต้องอยู่ก่อน `startsAt`
- active bracket ต้องยังไม่ publish, ยังไม่ lock entries และยังไม่มี match
- เปลี่ยน `TournamentStatus` กลับเป็น `PUBLISHED`
- ไม่แก้หรือลบใบสมัครเดิม

### ลบถาวร

- ใช้ได้เฉพาะรายการ `DRAFT` ที่ governance เป็น `ACTIVE`
- ต้องมีเหตุผลและต้องพิมพ์ชื่อรายการตรงกันหลัง trim
- ต้องไม่มี review, registration, bracket, match หรือ media asset ใด ๆ
- Audit Log ที่มีอยู่ไม่ถือเป็นข้อมูลที่บล็อกการลบและต้องถูกเก็บไว้ โดย relation
  `tournamentId` จะเป็น `null` ตาม `onDelete: SetNull`
- transaction สร้าง `tournament.deleted` พร้อม snapshot และ tombstone ก่อนลบ
  Tournament
- application เป็นผู้ตัดสินว่าจะลบได้หรือไม่ Client ไม่มีสิทธิ์เลือก cascade
- เพราะเงื่อนไขห้ามมี media asset จึงไม่มี storage object ที่ต้อง cleanup ในคำสั่งนี้

## แบบจำลองข้อมูล

เพิ่ม Prisma enum และคอลัมน์ใน `Tournament`:

```prisma
enum TournamentGovernanceStatus {
  ACTIVE
  SUSPENDED
  REMOVED
}

model Tournament {
  governanceStatus    TournamentGovernanceStatus @default(ACTIVE)
  governanceReason    String?
  governanceUpdatedAt DateTime?

  @@index([governanceStatus, status])
}
```

`governanceReason` เก็บเหตุผลล่าสุดสำหรับหน้ากำกับ ส่วนประวัติครบถ้วนและผู้กระทำ
อยู่ใน Audit Log ไม่เพิ่ม relation ผู้แก้ล่าสุดเพื่อลดความซ้ำซ้อนกับ audit source of
truth การ archive และ reopen จะไม่แก้ `governanceReason`

Migration ต้องเป็น additive และกำหนดรายการเดิมทั้งหมดเป็น `ACTIVE` จึงไม่ต้อง reset
หรือลบข้อมูล development database

## Domain และ Application

เพิ่มโมดูล policy ที่ไม่มี dependency ต่อ Next.js หรือ Prisma และคืน issue code
แบบ typed สำหรับ:

- `assertCanSuspendTournament`
- `assertCanResumeTournament`
- `assertCanRemoveTournament`
- `assertCanArchiveTournament`
- `assertCanReopenTournamentRegistration`
- `assertCanPermanentlyDeleteTournament`
- `assertTournamentGovernanceAllowsOperation`

Application use case `governTournament` รับ discriminated command และ Actor
ตรวจ permission ที่สอดคล้องกับคำสั่ง ได้แก่ `tournament.suspend`,
`tournament.archive` หรือ `tournament.remove` จากนั้นโหลด governance context,
ตรวจ version, policy และเรียก repository transaction

คำสั่ง reopen เพิ่ม permission `tournament.registration.reopen` เพื่อไม่ใช้
`tournament.publish` แทนความหมาย ส่วน resume ใช้ `tournament.suspend` และ hard
delete/remove ใช้ `tournament.remove`

ทุก mutation ของ tournament, registration, bracket, match, result และ tournament
media ต้องตรวจ `governanceStatus` ที่ application boundary รายการ `SUSPENDED`
หรือ `REMOVED` ตอบ conflict โดยไม่พึ่งการซ่อนปุ่มใน UI Admin governance command
เป็นข้อยกเว้นที่โหลด record ทุก governance state ได้

## Repository และ Transaction

Repository เพิ่ม `findGovernanceContext` ซึ่งคืนข้อมูลที่ policy ต้องใช้เท่านั้น:

- identity, organizer, title, version และสองสถานะ
- `startsAt`
- จำนวน review, registration, bracket, match และ media asset
- active bracket status, `entriesLockedAt` และจำนวน match

Repository มี mutation เดียวสำหรับ status transition และ mutation แยกสำหรับ permanent
delete ทั้งสองทำ update/delete, optimistic version check, governance metadata และ
Audit Log ใน Prisma transaction เดียว Repository ทำ policy check ซ้ำภายใน transaction
ก่อนเขียนเพื่อป้องกันข้อมูลสัมพันธ์เปลี่ยนหลัง application ตรวจครั้งแรก

Development และ in-memory adapters ต้องรองรับ contract เดียวกัน ข้อมูล JSON เดิมที่
ไม่มีฟิลด์ governance ให้ normalize เป็น `ACTIVE` ตอนอ่านโดยไม่เขียนทับไฟล์ทันที

Audit actions ที่เพิ่ม:

- `tournament.suspended`
- `tournament.resumed`
- `tournament.removed`
- `tournament.archived`
- `tournament.registration_reopened`
- `tournament.deleted`
- `tournament.admin_override` สำหรับคำสั่งกำกับของ Admin แต่ละรายการ

เหตุผลถูกเก็บใน `afterJson.transitionReason` โดยไม่บันทึกข้อมูลลับหรือ PII เพิ่มเติม

## HTTP Contract

เพิ่ม `POST /api/admin/tournaments/[id]/governance` และ validate ด้วย Zod
discriminated union:

```ts
type TournamentGovernanceCommand =
  | { action: "SUSPEND"; version: number; reason: string }
  | { action: "RESUME"; version: number; reason: string }
  | { action: "REMOVE"; version: number; reason: string }
  | { action: "ARCHIVE"; version: number; reason: string }
  | { action: "REOPEN_REGISTRATION"; version: number; reason: string }
  | {
      action: "PERMANENT_DELETE"
      version: number
      reason: string
      confirmationTitle: string
    }
```

สถานะตอบกลับ:

- `200` transition สำเร็จ
- `204` ลบถาวรสำเร็จ
- `401` ยังไม่เข้าสู่ระบบ
- `403` ไม่ใช่ Platform Admin
- `404` ไม่พบ record โดยไม่เปิดเผยข้อมูลเกินจำเป็น
- `409` version เก่า, state ไม่รองรับ หรือ governance บล็อก operation
- `422` payload, เหตุผล, ชื่อยืนยัน หรือ prerequisite ไม่ครบ

ข้อความ error หลักเป็นภาษาไทยและ issue code ใช้เพื่อให้ UI แสดงข้อขัดข้องแบบรายการ
โดยไม่ผูก presentation เข้ากับข้อความจาก Error โดยตรง

## หน้าจอ Admin

เพิ่ม `/admin/tournaments/[id]` เป็นหน้ากำกับรายการ และเปลี่ยนลิงก์
"เปิดข้อมูลรายการ" ในรายการ Admin ให้เข้าหน้านี้แทนการเข้า organizer editor โดยตรง

หน้ากำกับประกอบด้วย:

- identity strip: ชื่อ ผู้จัด จังหวัด รูปแบบ รุ่นอายุ และ version ล่าสุด
- status section: สถานะการแข่งขันและ governance status แยก label ชัดเจน
- dependency facts: จำนวนใบสมัคร สาย แมตช์ ไฟล์ และเหตุผลกำกับล่าสุด
- action section แสดงเฉพาะคำสั่งที่ policy อนุญาต พร้อมบอก prerequisite ที่ยังขาด
- ลิงก์ไป editor, bracket และ results สำหรับรายการที่ยังเข้าถึงได้

คำสั่งทั่วไปใช้ dialog ที่มี textarea เหตุผล การลบถาวรใช้ destructive dialog ที่ต้อง
พิมพ์ชื่อรายการ ปุ่มใช้ Lucide icon และมี accessible name หลังสำเร็จให้ refresh Server
Component เพื่อรับ version ใหม่ ป้องกันการส่งคำสั่งเดิมซ้ำระหว่าง pending และมี
`aria-live` สำหรับผลลัพธ์

หน้าผู้จัดแสดง notice แบบ read-only เมื่อถูกระงับและซ่อน mutation controls ทั้งหมด
รายการ `REMOVED` ไม่เปิด workspace ผู้จัด หน้าสาธารณะทุกจุด รวม home, list,
detail, schedule, bracket, results และ media ต้องไม่คืนรายการที่ governance ไม่ใช่
`ACTIVE`

## Error และความปลอดภัย

- UI visibility ไม่ใช่ authorization boundary
- ทุก command ตรวจ Actor, permission, state, ownership context และ version ฝั่ง server
- คำสั่ง governance ไม่รับ organizer id หรือ target status จาก Client
- reason trim ก่อน validate และห้ามยาวเกิน 500 ตัวอักษร
- permanent delete ต้องยืนยันชื่อแบบ exact match หลัง trim
- unexpected error ใช้ safe route boundary และไม่ log payload เหตุผลเต็มหรือข้อมูลลับ
- การชนกันจากข้อมูลใหม่ตอบ `409` และให้ผู้ใช้ refresh ก่อนลองอีกครั้ง

## การทดสอบ

ใช้ TDD โดยเริ่มจาก focused failing tests:

- Domain: transition matrix, reason, time, bracket readiness และ delete prerequisites
- Application: permission, admin-only behavior, stale version และ governance guard
- Prisma repository: context projection, transaction, status update, audit, hard delete
  และ concurrent dependency change
- Route Handler: `401`, `403`, `404`, `409`, `422`, `200` และ `204`
- UI: available/disabled actions, reason dialog, exact-title delete, pending state,
  refresh และ accessible announcements
- Public/organizer regression: suspended/removed visibility และ mutation blocking
- Adapter regression: development JSON ที่ไม่มี governance fields

หลัง focused tests ต้องรัน full test, lint, build, Prisma validate, `git diff --check`
และตรวจ browser ที่ประมาณ 375px, 768px และ 1440px ทั้ง light/dark mode

## ลำดับการส่งมอบ

1. Domain policy, permission และ focused tests
2. Prisma schema, migration และ repository transactions
3. Application use case, shared governance guard และ Route Handler
4. Admin governance page และ dialogs
5. Public/organizer filtering และ mutation regression coverage
6. Database migration, full verification และ responsive browser QA

## ไม่รวมในระยะนี้

- Organizer ระงับ ลบ Archive หรือเปิดรับสมัครใหม่ด้วยตนเอง
- การ restore รายการ `REMOVED`
- scheduled governance actions หรือ notification delivery
- การลบ storage object แบบ background retention
- การ rewrite Audit Log เดิม
- production deployment และ production Auth hardening
