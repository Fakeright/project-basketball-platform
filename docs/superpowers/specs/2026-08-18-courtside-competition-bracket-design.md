# COURTSIDE Competition Bracket And External Bracket File Design

## Goal

เพิ่มระบบดำเนินการแข่งขันแบบแพ้คัดออกครั้งเดียว (`single-elimination`) ให้ผู้จัด
การแข่งขันสามารถล็อกรายชื่อทีม สร้างและเผยแพร่สาย จัดตาราง บันทึกผล และเลื่อน
ผู้ชนะโดยระบบได้ หรือเลือกใช้ไฟล์สายการแข่งขันจากภายนอกสำหรับเปิดดูโดยไม่ให้
ระบบตีความข้อมูลจากไฟล์

ระบบต้องรักษาความชัดเจนว่าแหล่งข้อมูลใดเป็นสายการแข่งขันหลัก ป้องกันการแก้สาย
หลังเริ่มแข่งขัน และทำให้การยืนยันผลกับการเลื่อนผู้ชนะสำเร็จหรือ rollback พร้อมกัน

## Context

ฐานข้อมูลปัจจุบันมี `Bracket`, `BracketRound`, `Match` และ `MatchResult` รองรับ
ข้อมูลพื้นฐาน หน้าสาธารณะ `/bracket` และ `/schedule` สามารถอ่าน Match จาก Bracket
สถานะ `PUBLISHED` ได้ แต่ยังไม่มี workflow ฝั่งผู้จัดสำหรับล็อกรายชื่อ สร้างสาย
กำหนดคู่ จัดเวลา บันทึกผล ยืนยันผล หรือเลื่อนทีม

Tournament มีการสมัครและตัดสินใบสมัครแล้ว ผู้จัดการแข่งขันมี permission
`bracket.generate`, `match.schedule` และ `result.record` ส่วน Platform Admin มี
permission ทั้งหมด การพัฒนาระยะนี้ต่อยอด boundary เดิมโดยไม่เพิ่มบทบาทกรรมการ

## Design Classification

งานนี้เป็นการเพิ่ม subsystem เชิงสถาปัตยกรรม เนื่องจากเพิ่ม domain lifecycle,
transactional result advancement, database relations, storage revisions, Route
Handlers และ protected workflow หลายหน้า จึงต้องแบ่ง implementation เป็น checkpoint
ที่ทดสอบและ commit แยกกันได้

## Scope

### In Scope

1. เลือก Bracket Mode ต่อ Tournament ได้หนึ่งโหมด
2. ล็อกทีมจาก Registration สถานะ `APPROVED`
3. สร้าง Single-elimination Bracket สำหรับ 2-32 ทีม
4. รองรับจำนวนทีมที่ไม่ใช่กำลังสองด้วย Bye
5. เลือกการจัดลำดับแบบกำหนด Seed หรือสุ่มทั้งหมด
6. Preview, Publish, Unpublish และ Archive Bracket
7. จัดวัน เวลา และสนามของ Match
8. บันทึกและยืนยันคะแนนโดยผู้จัดการแข่งขัน
9. เลื่อนผู้ชนะของ Bracket ที่ระบบสร้างใน transaction เดียวกับการยืนยันผล
10. แสดง Winner, Runner-up และรอบที่แต่ละทีมตกรอบ
11. อัปโหลด PDF/PNG/JPG/WEBP เป็นสายจากภายนอกสำหรับเปิดดู
12. เก็บ revision ของไฟล์ หมายเหตุ ผู้เปลี่ยน และ audit event
13. สร้าง Schedule และ Result แบบ manual ในโหมดไฟล์ โดยไม่เลื่อนทีมอัตโนมัติ
14. หน้าจอผู้จัดและหน้าสาธารณะสำหรับทั้งสองโหมด

### Out Of Scope

- Double elimination, round robin, group stage และ Swiss format
- การอ่าน PDF หรือรูปภาพเพื่อสร้าง Team, Round หรือ Match
- การนำเข้า Excel หรือ CSV
- OCR, AI extraction หรือการตรวจว่าข้อมูลในไฟล์ตรงกับ Match ในระบบ
- การแก้เนื้อหา PDF/รูปภาพหรือเขียนคะแนนลงไฟล์ให้อัตโนมัติ
- Live scoring แบบ real-time, shot clock และ play-by-play
- บทบาทกรรมการ
- การจัดอันดับตัวเลขนอกเหนือจาก Winner และ Runner-up
- นัดชิงอันดับสามหรือ placement match ในระยะนี้
- การส่ง Email Notification ซึ่งจะเป็น subsystem ถัดไป

ทีมที่ไม่เข้ารอบชิงจะแสดงรอบที่ตกรอบ เช่น `ตกรอบรองชนะเลิศ` โดยระบบไม่สร้าง
อันดับ 3 หรือ 4 จากข้อมูลที่ไม่เพียงพอ

## Bracket Modes

Tournament มี Active Bracket ได้หนึ่งชุดและ Bracket กำหนด `mode` ชัดเจน:

- `SYSTEM_GENERATED`: ระบบเป็นแหล่งข้อมูลหลักของคู่แข่งขันและการเลื่อนผู้ชนะ
- `EXTERNAL_DOCUMENT`: ไฟล์จากผู้จัดเป็นแหล่งข้อมูลหลักของสายการแข่งขัน

ห้ามแสดงสองโหมดเป็นสายหลักพร้อมกัน หน้าสาธารณะต้องแสดง label ของ source เสมอ
โดยเฉพาะโหมดไฟล์ให้แสดง `สายการแข่งขันจากผู้จัด`

ผู้จัดเปลี่ยน Mode ได้ขณะ Bracket เป็น Draft และยังไม่มี Match เริ่มแข่งขัน หากเผยแพร่
แล้วต้อง Unpublish พร้อมเหตุผลก่อนเปลี่ยน Mode เมื่อ Match ใดมีสถานะ `IN_PROGRESS`
หรือ `COMPLETED` ห้ามเปลี่ยน Mode, ปลดล็อกรายชื่อ หรือสร้างโครงสร้างสายใหม่

## Lifecycle

### Entry Lock

1. Tournament ต้องมีสถานะ `REGISTRATION_CLOSED`
2. อ่านเฉพาะ Registration สถานะ `APPROVED`
3. ต้องมีอย่างน้อย 2 ทีมและไม่เกิน Tournament capacity หรือ 32 ทีม แล้วแต่ค่าที่ต่ำกว่า
4. สร้าง `BracketEntry` snapshot ใน transaction เดียว
5. Snapshot เก็บ Registration ID, Team ID, ชื่อทีม ณ เวลาล็อก และลำดับตั้งต้น
6. หลังล็อก การเปลี่ยนชื่อทีมไม่เปลี่ยนชื่อใน Bracket ที่กำลังดำเนินการแข่งขัน
7. Unlock ได้เฉพาะ Draft ที่ยังไม่มี Match เริ่ม และต้องระบุเหตุผล

Entry Lock ไม่เปลี่ยน Registration status และไม่แก้ Team roster การอนุมัติหรือถอนทีม
หลัง Entry Lock ต้องได้รับการแก้ผ่าน workflow Unlock แล้ว Lock ใหม่ ห้ามแก้ snapshot
เฉพาะรายการจน integrity ของชุดทีมไม่ชัดเจน

### Draft And Publish

- `DRAFT`: แก้ Mode, Seed, random draw, file revision และโครงสร้างที่อนุญาตได้
- `PUBLISHED`: หน้าสาธารณะเห็นสายหรือไฟล์ revision ที่เผยแพร่
- `ARCHIVED`: เก็บประวัติแต่ไม่เป็น Active Bracket

การ Publish ต้องผ่าน validation ของ Mode ปัจจุบัน การ Unpublish ต้องระบุเหตุผลและ
ทำได้เฉพาะก่อนมี Match เริ่ม การสร้าง Active Bracket ชุดใหม่ต้อง Archive ชุดเดิม
อย่างชัดเจนและไม่ลบ MatchResult เดิม

## System-Generated Bracket

### Seeding Methods

ผู้จัดเลือกหนึ่งวิธี:

- `SEEDED`: กำหนด Seed 1 ถึงจำนวนทีมโดยไม่ซ้ำและต้องครบทุกทีม
- `RANDOM`: ระบบสุ่มทีมฝั่ง server แล้วบันทึก draw token และลำดับ Team ID ที่ได้

การ Preview ซ้ำด้วย draw เดิมต้องได้ตำแหน่งเดิม การกดสุ่มใหม่สร้าง draw token ใหม่
เก็บลำดับใหม่ และบันทึก audit event ผู้จัดต้องยืนยันก่อนสุ่มทับ Draft เดิม

### Bracket Size And Bye

Bracket size เป็นกำลังสองที่น้อยที่สุดซึ่งไม่น้อยกว่าจำนวนทีม สูงสุด 32 เช่น:

- 6 ทีมใช้ bracket size 8 และมี 2 Bye
- 10 ทีมใช้ bracket size 16 และมี 6 Bye
- 14 ทีมใช้ bracket size 16 และมี 2 Bye

โหมด Seed ใช้ standard mirrored seed placement และให้ Bye แก่ Seed สูงตามตำแหน่ง
มาตรฐาน โหมด Random ใช้ลำดับสุ่มที่ถูก freeze เป็นลำดับตั้งต้นเดียวกับ Seed order
Algorithm ต้อง deterministic และมี test vector สำหรับ bracket size 2, 4, 8, 16 และ 32

ลำดับช่องมาตรฐานที่ใช้เป็น source of truth ได้แก่:

- size 2: `1, 2`
- size 4: `1, 4, 2, 3`
- size 8: `1, 8, 4, 5, 2, 7, 3, 6`
- size 16: `1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11`

size 32 ขยายด้วย mirrored placement rule เดียวกันและยืนยันด้วย test vector เต็ม

Bye ไม่สร้าง MatchResult ปลอม ระบบเติมทีมที่ได้ Bye เข้าช่องรอบถัดไปขณะสร้าง Draft
เพื่อให้ Match จริงและเส้นทางการเลื่อนผู้ชนะตรวจสอบได้

### Match Advancement

Match ของโหมดระบบเก็บปลายทางของผู้ชนะเป็น `nextMatchId` และ `nextSlot`
(`HOME` หรือ `AWAY`) การยืนยันผลต้อง:

1. ตรวจ Match version และสถานะ
2. ตรวจคะแนนเป็นจำนวนเต็มไม่ติดลบและไม่เสมอ
3. ตรวจว่าทีมทั้งสองช่องถูกกำหนดแล้ว
4. สร้าง MatchResult
5. เปลี่ยน Match เป็น `COMPLETED` และกำหนด winner
6. เติม winner ลงช่องปลายทางที่ว่างหรือเป็นทีมเดิมจากผลเดียวกัน
7. เพิ่ม version และบันทึก audit
8. Commit ทุกข้อใน database transaction เดียว

หากช่องปลายทางมีทีมอื่น ต้องตอบ Conflict และ rollback ทั้งหมด ห้ามเกิด MatchResult
ที่ยืนยันแล้วแต่ผู้ชนะไม่เลื่อนไป หรือเลื่อนไปแล้วแต่ไม่มี MatchResult

ระยะนี้ผลที่ยืนยันแล้วแก้โดย Organizer ไม่ได้ การ correction ใช้ Platform Admin
override พร้อมเหตุผลและ workflow เฉพาะ ซึ่งต้อง rollback ผลของ Match ปลายทางก่อน
หาก Match ปลายทางยังไม่เริ่ม หาก Match ปลายทางเริ่มแล้วให้บล็อกและส่งต่อการแก้ไข
แบบ manual ที่อยู่นอก scope ของระยะนี้

### Winner And Runner-up

เมื่อ Final Match ยืนยันผล:

- Winner คือ `winnerTeamId`
- Runner-up คืออีกทีมใน Final
- ทีมอื่นแสดง Round ที่แพ้
- Tournament จะเปลี่ยนเป็น `COMPLETED` ผ่านคำสั่งแยกหลังตรวจว่า Match ที่ต้องเล่น
  ทุกคู่เสร็จแล้ว ไม่เปลี่ยนสถานะ Tournament โดยอัตโนมัติจากการยืนยัน Final

## External Bracket Document

### Source Of Truth

ไฟล์เป็น source of truth ของ pairing และ advancement ระบบไม่ parse ชื่อทีม รอบ คะแนน
หรือลูกศรจากไฟล์ และไม่รับประกันว่า Schedule/Result ที่กรอกแยกจะตรงกับไฟล์

ผู้จัดสามารถสร้าง Match แบบ manual สำหรับหน้า Schedule และ Result โดยเลือกชื่อ Round,
ทีมเหย้า ทีมเยือน สนาม วัน และเวลา การยืนยันคะแนนเก็บผลแต่ไม่เติมผู้ชนะลง Match อื่น
และไม่แก้ไฟล์

เมื่อมี MatchResult ที่ยืนยันหลัง published file revision ล่าสุด ระบบแสดง warning ในหน้า
ผู้จัดว่าอาจต้องอัปโหลดไฟล์ฉบับใหม่ Warning ไม่บล็อก Schedule หรือ Result

### File Types And Limits

- PDF: `application/pdf` สูงสุด 20 MB
- JPEG: `image/jpeg` สูงสุด 10 MB
- PNG: `image/png` สูงสุด 10 MB
- WebP: `image/webp` สูงสุด 10 MB

ตรวจ MIME type, byte size และ magic bytes ฝั่ง server ห้ามเชื่อเฉพาะ filename หรือ
browser-reported content type หากไฟล์เสีย signature ไม่ตรง หรือ Preview ไม่ได้ ให้ upload
ไม่สำเร็จและห้าม Publish

PDF เปิดผ่าน embedded preview เมื่อ browser รองรับ พร้อมปุ่มเปิดแท็บใหม่และดาวน์โหลด
รูปภาพแสดงแบบ responsive โดยรักษาอัตราส่วน ไม่ crop ข้อมูลสาย

### Revisions

ทุก upload สร้าง revision ใหม่ ไม่เขียนทับ object เดิม Revision เก็บ:

- Bracket ID และ revision number
- Media asset/storage metadata
- filename, content type และ byte size
- update note
- createdBy, createdAt, publishedAt และ replacedAt

Bracket มี published revision ได้หนึ่งรายการ Draft revision ใหม่ไม่เปลี่ยนหน้าสาธารณะ
จนกด Publish/Replace การ Replace revision ที่เผยแพร่แล้วต้องระบุเหตุผล เก็บ audit และ
คง revision เดิมเพื่อการตรวจสอบ

Storage ใช้ bucket สำหรับ bracket documents โดยเฉพาะและสร้าง signed URL อายุสั้น
สำหรับการเปิดดูหรือดาวน์โหลด ไม่เปิด service role key หรือ object path ที่ไม่จำเป็นต่อ client

## Data Model Changes

### Enums

- `BracketMode`: `SYSTEM_GENERATED`, `EXTERNAL_DOCUMENT`
- `BracketGenerationMethod`: `SEEDED`, `RANDOM`
- `MatchSlot`: `HOME`, `AWAY`
- เพิ่ม `BRACKET_DOCUMENT` ใน MediaAsset kind

### Bracket

ขยาย `Bracket` ด้วย:

- `mode`
- `version`
- `entriesLockedAt`
- `generationMethod`
- `drawToken`
- `publishedAt`
- `archivedAt`
- relation ไป Entry และ File Revision
- published revision ID สำหรับ External Mode

ใช้ PostgreSQL partial unique index เพื่อรับประกัน Bracket ที่ไม่ใช่ `ARCHIVED` ได้หนึ่งชุด
ต่อ Tournament และใช้ relation `publishedRevisionId` เพื่อรับประกัน published external
revision หนึ่งรายการต่อ Bracket พร้อมตรวจซ้ำใน application transaction

### BracketEntry

เพิ่ม model ที่มี:

- `bracketId`
- `registrationId`
- `teamId`
- `teamNameSnapshot`
- `seed`
- `drawPosition`
- timestamps

กำหนด unique constraint สำหรับ bracket/team, bracket/registration และ bracket/seed
เมื่อใช้ Seeded mode

### Match

ขยาย Match ด้วย self-relation ของ `nextMatchId`, `nextSlot` และ optional metadata สำหรับ
manual external schedule การ validate advancement อยู่ใน domain/application ไม่อยู่ใน
React component หรือ Prisma adapter

### ExternalBracketRevision

เพิ่ม model แยกจาก MediaAsset เพื่อเก็บ revision number, note, publication lifecycle และ
relation ไป MediaAsset การลบเป็น soft-retire และ storage cleanup ใช้ staged-delete pattern
เดิม ห้ามลบไฟล์ที่เป็น published revision อยู่

Prisma migration ต้องเพิ่ม index สำหรับ Tournament/Bracket status, BracketEntry order,
Match next destination และ revision publication lookup พร้อมกำหนด delete behavior ชัดเจน

## Architecture

รักษาทิศทาง dependency:

```text
presentation -> application -> domain
infrastructure -> application/domain contracts
```

### Domain

- Bracket lifecycle และ transition policy
- Entry lock policy
- Seed validation และ deterministic bracket generation
- Bye allocation
- Match score/result/advancement policy
- External file constraint และ revision policy
- Domain errors ที่ไม่ import Next.js, React, Prisma หรือ Supabase

### Application

- Lock/Unlock bracket entries
- Select bracket mode
- Generate/Regenerate bracket draft
- Upload/Publish/Replace external revision
- Publish/Unpublish/Archive bracket
- Schedule/reschedule match
- Record draft score และ confirm result
- Correct result ผ่าน Admin override
- Query organizer workspace และ public bracket view

ทุก mutation ตรวจ Actor, permission, ownership, lifecycle, expected version และ transaction
boundary ใน application use case

### Infrastructure

- Prisma repositories สำหรับ Bracket, Entry, Match, Result, Revision และ Audit
- Transaction adapter สำหรับ generation และ result advancement
- Supabase storage adapter โดย reuse staged upload/move/remove pattern เดิม
- Mapping view-ready data โดยไม่ query Prisma จาก page/component

### Presentation

- Server Components โหลด workspace และ public data
- Client Components ใช้เฉพาะ interaction ที่ต้องมี browser state เช่น Seed reorder,
  Preview controls, upload progress และ score form
- Route Handlers parse external input ด้วย Zod และ map domain error เป็น HTTP status
- UI visibility ไม่ใช้แทน server authorization

## Permissions And Ownership

- Tournament Organizer ใช้ `bracket.generate`, `match.schedule` และ `result.record`
  เฉพาะ Tournament ที่ตนเป็นเจ้าของ
- การ Publish Bracket ใช้ permission เดียวกับการจัดการสายและตรวจ Tournament ownership
- เพิ่ม `result.confirm` ให้ Tournament Organizer สำหรับ Tournament ที่ตนเป็นเจ้าของ
- Organizer บันทึกคะแนนร่างและยืนยันผลของ Tournament ที่ตนเป็นเจ้าของได้
- Result correction หลังยืนยันสงวนให้ Platform Admin
- Admin override ต้องมีเหตุผลและ audit metadata
- Public query เห็นเฉพาะ Bracket status `PUBLISHED` และ file revision ที่ publish แล้ว
- Error `403` และ `404` ต้องไม่เปิดเผยว่าทรัพยากรของผู้จัดรายอื่นมีอยู่หรือไม่

หมายเหตุ: permission map ปัจจุบันยังไม่มี `result.confirm` สำหรับ Organizer การ migration
behavior ต้องเพิ่ม permission นี้โดยยังบังคับ Tournament ownership ใน application use case

## Organizer Experience

เพิ่ม navigation ภายใต้ Tournament Workspace:

- ภาพรวม
- ทีมสมัคร
- สายการแข่งขัน
- ตารางแข่งขัน
- ผลการแข่งขัน

หน้า `สายการแข่งขัน` ใช้ flow สามขั้น:

1. ล็อกรายชื่อทีม
2. เลือก Bracket Mode และตั้งค่า
3. Preview แล้ว Publish

### System Mode

- แสดงทีมที่ล็อก จำนวนทีม และ capacity
- segmented control เลือก `กำหนด Seed` หรือ `สุ่มทั้งหมด`
- Seed editor ใช้แถวเรียงลำดับที่ keyboard ใช้งานได้ ไม่พึ่ง drag-and-drop อย่างเดียว
- Preview Bracket scroll แนวนอนเฉพาะพื้นที่สายบน mobile
- ปุ่ม Regenerate ต้องยืนยันก่อนและ disabled หลังมี Match เริ่ม

### External Mode

- upload zone พร้อม label และ constraint ที่มองเห็นได้
- Preview PDF/รูปก่อน Publish
- ช่อง update note บังคับเมื่อ Replace published revision
- แสดง revision ล่าสุดและประวัติ revision
- warning เมื่อผลที่ยืนยันใหม่กว่าไฟล์ที่เผยแพร่

### Match Schedule And Results

- Operational table สำหรับ Round, คู่, สนาม, วันเวลา, สถานะ และ action
- Score entry ใช้ numeric inputs ที่ dimension คงที่
- Confirm result แสดงทีมชนะอย่างชัดเจนและต้องยืนยันคำสั่ง
- System Mode แสดงปลายทางผู้ชนะก่อน confirm
- External Mode แสดงข้อความว่า `ผลนี้จะไม่แก้ไฟล์สายการแข่งขัน`

## Public Experience

- `/bracket?tournament=<slug>` เลือก Tournament และแสดง source label
- System Mode แสดง responsive bracket จาก Match จริง
- External PDF แสดง embedded preview พร้อม Open/Download
- External image แสดงเต็มความกว้าง รักษา aspect ratio และรองรับ zoom/open original
- `/schedule` แสดง Match ที่เผยแพร่ เรียงวันเวลา Round และ sequence
- Result แสดงคะแนน ผู้ชนะ และสถานะยืนยัน
- Empty state แยกระหว่างยังไม่เผยแพร่สายกับไม่มี Schedule
- Loading, not-found และ unexpected-error state ใช้ pattern ปัจจุบัน

## Validation And Failure Mapping

### Domain Validation

- Entry 2-32 ทีม ไม่ซ้ำ และทั้งหมดมาจาก approved registrations
- Seed เป็นจำนวนเต็มต่อเนื่อง 1-N และไม่ซ้ำ
- Tournament ต้องปิดรับสมัครก่อน Entry Lock
- Publish System Mode ต้องมี generated rounds/matches ที่สมบูรณ์
- Publish External Mode ต้องมี revision ที่ผ่าน signature validation และ server parse/decode probe
- Match teams ต้องอยู่ใน locked entries
- scheduledAt ต้องอยู่ในช่วงที่ Tournament อนุญาต หรือ require override reason
- score เป็นจำนวนเต็มไม่ติดลบและไม่เสมอ
- ห้าม overwrite winner slot ด้วยทีมอื่น
- ห้ามเปลี่ยน Mode/Entry/Structure หลัง Match เริ่ม

### HTTP Mapping

- `401`: ไม่มี session
- `403`: ไม่มี permission หรือ ownership
- `404`: Tournament, Bracket, Match หรือ Revision ไม่พบใน boundary ที่ actor เข้าถึงได้
- `409`: stale version, lifecycle conflict, duplicate active bracket, occupied next slot
  หรือมี Match เริ่มแล้ว
- `422`: payload, seed, score, file type/content/size หรือ transition prerequisite ไม่ถูกต้อง
- `500`: unexpected failure พร้อม correlation ID โดยไม่ log file content หรือข้อมูลส่วนตัว

Form error ต้องเป็นภาษาไทย เก็บค่าที่ผู้ใช้กรอก และ focus summary/field แรกที่ผิด
การโหลดล้มเหลวต้องแสดง Error State ไม่ปลอมเป็น Empty State

## Audit Events

บันทึกอย่างน้อย:

- bracket entries locked/unlocked
- bracket mode selected/changed
- bracket generated/regenerated/randomized
- bracket published/unpublished/archived
- external revision uploaded/published/replaced/retired
- match scheduled/rescheduled
- score recorded
- result confirmed/corrected
- tournament completed
- admin override

Audit metadata เก็บ IDs, counts, version, mode และเหตุผลที่จำเป็น ห้ามเก็บ binary file,
signed URL หรือ secret

## Testing Strategy

### Domain

- known seed vectors สำหรับ bracket size 2, 4, 8, 16 และ 32
- 6, 10 และ 14 ทีมได้ Bye ถูกตำแหน่ง
- same entries/draw ให้ output เดิม
- random redraw เปลี่ยน frozen order และ audit
- seed ซ้ำ ขาด หรือเกินถูกปฏิเสธ
- score เสมอ ติดลบ หรือไม่ใช่จำนวนเต็มถูกปฏิเสธ
- winner advancement และ occupied-slot conflict
- lifecycle transition ทั้ง allowed/forbidden
- External Mode ไม่สร้าง automatic advancement

### Application And Repository

- Entry Lock อ่านเฉพาะ approved registrations ของ Tournament owner
- generation สร้าง Bracket, Entry, Round, Match และ Audit แบบ atomic
- result confirmation สร้าง Result, update Match, advance winner และ Audit แบบ atomic
- rollback ทุก record เมื่อขั้นตอนใดล้มเหลว
- optimistic concurrency และ duplicate active bracket constraint
- admin correction block เมื่อ downstream Match เริ่มแล้ว
- revision publication และ staged storage cleanup

### Route Handlers

- authentication, permission, ownership และ `401/403/404`
- validation `422`, conflict `409`, success responses และ safe diagnostics
- multipart file type, byte limit และ magic-byte validation
- expectedVersion บังคับกับ mutation ที่แก้ state

### UI

- Lock/Unlock entries และ confirmation
- Seed editor ด้วย keyboard และ validation
- Randomize/Regenerate confirmation
- Mode switch เฉพาะ state ที่อนุญาต
- System preview และ External PDF/Image preview
- revision history และ stale-file warning
- score draft/confirm state และ next-match explanation
- loading, empty, conflict, validation และ unexpected error
- public source label, open/download และ no horizontal page overflow

### Verification

- focused TDD tests ในแต่ละ checkpoint
- full test suite, lint, production build, Prisma validate และ `git diff --check`
- database migration และ transaction integration กับ PostgreSQL development
- Supabase Storage integration สำหรับ PDF/PNG/JPEG/WebP
- browser QA ที่ประมาณ 375px, 768px และ 1440px ทั้ง light/dark mode
- keyboard navigation, focus order, accessible labels และ touch targets

## Delivery Checkpoints

1. Domain policies และ deterministic generator
2. Prisma migration, repositories และ transaction contracts
3. Entry Lock และ System Bracket draft generation
4. Organizer Preview/Seed/Random UI
5. Publish/Unpublish และ public System Bracket
6. Match schedule, score draft, result confirmation และ advancement
7. External file revision upload/publish/replace
8. External manual Schedule/Result และ stale-file warning
9. Winner/Runner-up summary, audit completeness และ responsive QA

แต่ละ checkpoint ต้องมี focused tests และ commit ที่ independently testable ห้ามรวม
schema, generator, result advancement, upload และ UI ทั้งหมดไว้ใน commit เดียว

## Acceptance Criteria

1. ผู้จัดเลือก System หรือ External Mode ได้หนึ่งโหมดต่อ Active Bracket
2. ผู้จัดล็อกเฉพาะทีมที่อนุมัติแล้วจำนวน 2-32 ทีมได้
3. System Mode สร้าง Single-elimination Bracket แบบ deterministic พร้อม Bye ถูกต้อง
4. ผู้จัดกำหนด Seed หรือสุ่มทั้งหมดและ Preview ก่อน Publish ได้
5. หลัง Match เริ่ม ระบบบล็อกการเปลี่ยน Mode, Entry และ Structure
6. การยืนยันผล System Mode เลื่อนผู้ชนะอย่าง atomic และไม่ยอมรับคะแนนเสมอ
7. External Mode แสดง PDF/รูปที่ผู้จัดเผยแพร่โดยไม่ parse หรือเลื่อนทีมอัตโนมัติ
8. ผู้จัดกรอก Schedule/Result ใน External Mode ได้พร้อมคำเตือนว่าไม่แก้ไฟล์
9. ไฟล์ทุก revision ตรวจ type/size/signature เก็บประวัติและเปิดผ่าน signed URL
10. Public page แสดง source label และเฉพาะข้อมูลที่ Publish แล้ว
11. Permission, ownership, lifecycle, concurrency และ audit บังคับฝั่ง server
12. Winner/Runner-up มาจาก Final ที่ยืนยัน ส่วนทีมอื่นแสดงรอบที่ตกรอบ
13. Workflow ผ่าน automated tests, PostgreSQL/Storage integration และ responsive QA
