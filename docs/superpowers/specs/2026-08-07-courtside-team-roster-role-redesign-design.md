# COURTSIDE Team Roster And Combined Team Role Design

## Goal

ปรับระบบจัดการทีมให้ผู้จัดการ/โค้ชเพิ่มรายชื่อผู้เล่นหลายคนได้โดยตรง
โดยผู้เล่นไม่ต้องมีบัญชี COURTSIDE พร้อมรวมบทบาทบัญชี `COACH` และ
`TEAM_MANAGER` ให้เป็นบทบาทเดียว เพิ่มรูปแบบทีม `5v5`/`3v3` และกำหนด
กติกาการลบทีมที่ไม่ทำลายประวัติการแข่งขัน

## Current Problems

- การเพิ่มผู้เล่นปัจจุบันต้องเลือกบัญชี `PLAYER` หรือ `COACH` ที่มีอยู่แล้ว
  ทีละคน
- `TeamMember` ผูกกับ `User` โดยตรง ทำให้ผู้เล่นที่ไม่มีบัญชีไม่สามารถอยู่ใน
  รายชื่อทีมได้
- บทบาท `COACH` และ `TEAM_MANAGER` แยกกันทั้งที่ workflow ใหม่ต้องการให้คน
  เดียวดูแลงานทั้งสองด้าน
- ทีมยังไม่มีรูปแบบประจำทีม จึงไม่สามารถป้องกันการสมัครรายการที่ใช้รูปแบบไม่ตรงกัน
- การลบทีมยังไม่แยกระหว่างทีมที่ไม่มีประวัติกับทีมที่ต้องรักษาประวัติการแข่งขัน

## Scope

ระยะนี้ประกอบด้วย:

1. รวมบทบาทบัญชีโค้ชและผู้จัดการทีมเป็นผู้จัดการ/โค้ช
2. แยกข้อมูลผู้เล่นในทีมออกจากบัญชีผู้ใช้
3. เพิ่มผู้เล่นหลายคนในคำขอเดียวจากตารางกรอกข้อมูล
4. แก้ไขและนำผู้เล่นออกจากทีมโดยรักษาประวัติ
5. กำหนดรูปแบบทีมเป็น `5v5` หรือ `3v3`
6. ตรวจรูปแบบทีมและจำนวนผู้เล่นขั้นต่ำเมื่อสมัครแข่งขัน
7. ลบทีมถาวรเมื่อไม่มีประวัติ หรือปิดใช้งานเมื่อจำเป็นต้องรักษาประวัติ
8. ปรับหน้าสมัครบัญชี Header และ Team Dashboard ให้ใช้บทบาทใหม่

ระยะนี้ไม่รวม:

- การนำเข้ารายชื่อด้วย CSV
- การเชิญผู้ช่วยหรือเจ้าของทีมหลายบัญชี
- การเชื่อมรายชื่อผู้เล่นกับบัญชี `PLAYER`
- การเก็บเลขบัตรประชาชนหรือเอกสารยืนยันตัวผู้เล่น
- การย้ายผู้เล่นระหว่างทีม
- การล็อกรายชื่อแยกตามการแข่งขัน
- การเปิดใช้งานทีมที่ถูกปิดใช้งานอีกครั้ง

## Account Roles And Ownership

บทบาทบัญชีหลังการเปลี่ยนแปลงคือ:

- `PLATFORM_ADMIN`
- `TOURNAMENT_ORGANIZER`
- `TEAM_MANAGER_COACH`
- `PLAYER`

ชื่อที่แสดงต่อผู้ใช้สำหรับ `TEAM_MANAGER_COACH` คือ `ผู้จัดการ/โค้ช`
บัญชีบทบาทนี้รับผิดชอบทั้งงานบริหารทีมและงานโค้ช ไม่แยกสิทธิ์ย่อยสองชุด

- หนึ่งทีมมีผู้จัดการ/โค้ชหลักหนึ่งบัญชีผ่าน `Team.ownerId`
- หนึ่งบัญชีสามารถเป็นเจ้าของหลายทีมได้ เช่น ทีม U14 และ U18
- ผู้จัดการ/โค้ชแก้ไขข้อมูลทีม จัดการรายชื่อ สมัครแข่งขัน ยกเลิกใบสมัคร
  และจัดการเอกสารทีมได้
- `PLAYER` ยังคงเป็นบทบาทบัญชีสำหรับความสามารถในอนาคต แต่บัญชีนี้ไม่จำเป็น
  สำหรับการอยู่ในรายชื่อทีม
- Platform Admin ใช้สิทธิ์ override ตามระบบ permission และต้องมี Audit Log

การซ่อนปุ่มใน UI ไม่ใช่ authorization boundary ทุก mutation ต้องตรวจ authentication,
permission, ownership และสถานะทรัพยากรใน application use case

## Data Model

### Team

เพิ่มข้อมูลต่อไปนี้ใน `Team`:

- `format: TournamentFormat` เป็นค่าบังคับ `FIVE_V_FIVE` หรือ
  `THREE_V_THREE`
- `isActive: Boolean` ค่าเริ่มต้น `true`
- `deactivatedAt: DateTime?`
- `version: Int` ค่าเริ่มต้น `0` สำหรับ optimistic concurrency

ทีมแก้รูปแบบได้เมื่อไม่มี Registration สถานะ `PENDING` หรือ `APPROVED`
เท่านั้น การเปลี่ยนรูปแบบเป็น mutation ที่ต้องตรวจ version เพื่อป้องกัน stale update

### TeamPlayer

สร้างโมเดล `TeamPlayer` แยกจาก `User`:

- `id`
- `teamId`
- `firstName`
- `lastName`
- `nickname?`
- `birthDate`
- `jerseyNumber?`
- `position?`
- `phone?`
- `isActive`
- `deactivatedAt?`
- `createdAt`
- `updatedAt`

ชื่อ นามสกุล และวันเกิดเป็นข้อมูลบังคับ ช่องอื่นเป็นข้อมูลไม่บังคับ ระบบไม่เก็บ
เลขบัตรประชาชน

ข้อมูลชื่อ นามสกุล และวันเกิดเดียวกันต้องไม่ซ้ำภายในทีมเดียวกัน หากผู้เล่นเดิมถูก
นำออกแล้ว การบันทึกข้อมูลเดิมใน batch ถือเป็นการยืนยันให้คืนสถานะและปรับข้อมูลกีฬา
ของประวัติเดิมแทนการสร้างแถวซ้ำ ผู้เล่นคนเดียวกันสามารถมีข้อมูลแยกกันในคนละทีมได้

เบอร์เสื้อต้องเป็นจำนวนเต็มบวกและห้ามซ้ำในรายชื่อที่ใช้งานของทีมเดียวกัน ตำแหน่ง
เป็นตัวเลือก `PG`, `SG`, `SF`, `PF` หรือ `C` และอาจเว้นว่างได้ วันเกิดเก็บเป็น
วันที่โดยไม่มีเขตเวลา

### Legacy TeamMember

`TeamMember` เดิมไม่ใช่แหล่งข้อมูลรายชื่อหลังเปิดใช้ระบบใหม่ แต่ยังไม่ถูกลบใน
migration แรก เพื่อหลีกเลี่ยงการทำลายข้อมูลโดยไม่ตรวจสอบ:

1. เพิ่ม `TeamPlayer` และเปลี่ยน read/write path ไปใช้โมเดลใหม่
2. ปรับ development seed ให้สร้าง `TeamPlayer`
3. ตรวจข้อมูล `TeamMember` ในฐานข้อมูลเป้าหมาย
4. ลบโมเดลเดิมด้วย migration แยกภายหลังเมื่อยืนยันว่าไม่มีข้อมูลที่ต้องรักษา

บัญชี `COACH` และ `TEAM_MANAGER` เดิมถูกแปลงเป็น `TEAM_MANAGER_COACH`
โดยรักษา User id และความเป็นเจ้าของทีมเดิม

## Team Format And Registration Rules

- ทีมเลือกได้เพียงรูปแบบเดียว
- หากต้องแข่งอีกประเภท ผู้จัดการ/โค้ชสร้างอีกทีมภายใต้บัญชีเดิม
- ทีมสมัครได้เฉพาะ Tournament ที่มีรูปแบบตรงกัน
- ทีม `5v5` ต้องมีผู้เล่น active อย่างน้อย 5 คน
- ทีม `3v3` ต้องมีผู้เล่น active อย่างน้อย 3 คน
- ข้อจำกัดจำนวนสูงสุดและรุ่นอายุยึดกติกาของ Tournament เมื่อมีการกำหนด
- วันเกิดใช้แสดงคำเตือนและตรวจรุ่นอายุที่ server boundary ก่อนสร้าง Registration
  โดยคำนวณอายุเต็มในวันเริ่มแข่งขัน `U12`, `U14`, `U16`, `U18` และ `U23`
  หมายถึงอายุต้องน้อยกว่า 12, 14, 16, 18 และ 23 ตามลำดับ ส่วน `Open`
  ไม่จำกัดอายุ
- ทีมที่ `isActive = false` ไม่สามารถแก้รายชื่อหรือสมัครแข่งขันใหม่

การตรวจทั้งหมดต้องทำใหม่บนเซิร์ฟเวอร์ขณะสมัคร ไม่พึ่งข้อมูลเก่าจากหน้าเว็บ

## User Experience

### Team Form

หน้าเพิ่มและแก้ไขทีมมีช่องที่มองเห็น label ชัดเจนสำหรับ:

- ชื่อทีม
- จังหวัด
- รูปแบบทีม `5v5` หรือ `3v3`

การเปลี่ยนรูปแบบที่ถูก Registration ขัดขวางต้องแสดงข้อความภาษาไทยพร้อมการกระทำ
ที่ผู้ใช้ต้องทำต่อ

### Team Workspace

หน้า `/team/[id]` แบ่งเป็นส่วนข้อมูลทีม รายชื่อผู้เล่น การสมัครแข่งขัน และพื้นที่
เอกสารในระยะถัดไป โดยไม่ซ้อน card หลายชั้น

ส่วนรายชื่อแสดงจำนวนผู้เล่น active และมีคำสั่ง `เพิ่มผู้เล่นหลายคน`

- Desktop ใช้ตารางที่มีคอลัมน์ชื่อ นามสกุล วันเกิด ชื่อเล่น เบอร์เสื้อ ตำแหน่ง
  เบอร์โทร และคำสั่งประจำแถว
- ฟอร์มเริ่มต้นด้วยแถวว่าง 5 แถว และเพิ่มหรือลบแถวได้
- Mobile เปลี่ยนแต่ละแถวเป็นส่วนกรอกแบบย่อที่มีเส้นแบ่งชัดเจนและไม่มี page overflow
- ปุ่ม `บันทึกผู้เล่นทั้งหมด` ส่งแถวที่กรอกแล้วทั้งหมดครั้งเดียว
- แถวว่างทั้งหมดถูกละเว้น แต่แถวที่กรอกบางส่วนต้องผ่าน validation ให้ครบ
- ข้อผิดพลาดแสดงที่แถวและช่องที่เกี่ยวข้อง พร้อม summary ด้านบนสำหรับผู้ใช้
  screen reader
- หากแถวใดผิด ระบบไม่บันทึกทั้งชุด

หลังบันทึก รายชื่อรองรับการแก้ไขรายคนและการนำออกแบบ soft delete การนำออกต้อง
ยืนยันและอธิบายผลกระทบเมื่อจำนวนผู้เล่นจะต่ำกว่าเกณฑ์ของรูปแบบทีม

### Authentication And Navigation

- หน้าสมัครบัญชีแสดง `ผู้จัดการ/โค้ช` แทนตัวเลือก `โค้ช` และ `ผู้จัดการทีม`
- Header แสดง `กำลังใช้งาน: ผู้จัดการ/โค้ช` หลังเข้าสู่ระบบ
- บัญชีดังกล่าวเข้าถึง Team Dashboard และเฉพาะทีมที่ตนเป็นเจ้าของ
- สำเนา UI และข้อความผิดพลาดใช้ภาษาไทยเป็นหลัก

## Team Deletion And Deactivation

ใช้สองพฤติกรรมตามประวัติของทีม:

### Permanent Deletion

ทีมที่ไม่เคยมี Registration หรือประวัติการแข่งขันสามารถลบถาวรได้ การลบ cascade
เฉพาะข้อมูลผู้เล่นและข้อมูลทีมที่ไม่มีประวัติอ้างอิง ผู้ใช้ต้องยืนยันชื่อทีมก่อนดำเนินการ

### Deactivation

ทีมที่มี Registration หรือประวัติการแข่งขันต้องปิดใช้งานแทนการลบ:

- ทีมที่มี Registration `PENDING` หรือ `APPROVED` ต้องยกเลิกหรือถอนใบสมัครก่อน
- ทีมที่มีเฉพาะประวัติสถานะปลายทาง เช่น `REJECTED`, `CANCELLED` หรือ
  `WITHDRAWN` สามารถปิดใช้งานได้
- ทีมที่ปิดใช้งานไม่ปรากฏในตัวเลือกสมัครแข่งขันและสร้างใบสมัครใหม่ไม่ได้
- หน้าประวัติยังแสดงชื่อทีมและผลเดิมได้
- การปิดใช้งานต้องยืนยันชื่อทีม

ทั้งการลบถาวรและปิดใช้งานต้องสร้าง Audit Log การตรวจว่าทีมควรถูกลบหรือปิดใช้งาน
เป็นการตัดสินใจของ server ไม่รับค่าชนิดการลบจาก client

## Application Use Cases

เพิ่มหรือปรับ use case ให้มีขอบเขตชัดเจน:

- `createTeam`
- `updateTeam`
- `addTeamPlayers`
- `updateTeamPlayer`
- `deactivateTeamPlayer`
- `removeOrDeactivateTeam`
- `applyToTournament`

`addTeamPlayers` รับข้อมูลหลายแถว ตรวจทุกแถวก่อนเขียน และบันทึกทั้งหมดใน
transaction เดียว Repository contract ต้องรองรับ duplicate checks และ atomic insert
โดยไม่เปิดเผย Prisma models ให้ application layer

## HTTP Boundaries

ปรับหรือเพิ่ม Route Handlers ดังนี้:

- `POST /api/teams` รับ `name`, `provinceCode` และ `format`
- `PATCH /api/teams/[id]` แก้ข้อมูลทีมพร้อม optimistic version
- `DELETE /api/teams/[id]` ให้ server เลือกลบถาวรหรือปิดใช้งาน
- `POST /api/teams/[id]/players/batch` เพิ่มผู้เล่นหลายคนแบบ atomic
- `PATCH /api/teams/[id]/players/[playerId]` แก้ไขผู้เล่น
- `DELETE /api/teams/[id]/players/[playerId]` นำผู้เล่นออกแบบ soft delete

Zod ตรวจ payload ที่ Route Handler และกติกา domain/application เป็น authoritative
หนึ่ง batch รับได้สูงสุด 30 แถวเพื่อป้องกัน payload ผิดปกติ แต่ไม่เพิ่ม workflow CSV
ในระยะนี้

การตอบกลับข้อผิดพลาด:

- `401`: ยังไม่เข้าสู่ระบบ
- `403`: ไม่มี permission หรือไม่ใช่เจ้าของทีม
- `404`: ไม่พบทีม/ผู้เล่นที่ผู้ใช้มีสิทธิ์เข้าถึง
- `409`: ข้อมูลซ้ำ version เก่า รูปแบบเปลี่ยนไม่ได้ หรือทีมมีใบสมัครที่ขัดขวาง
- `422`: ข้อมูลไม่ถูกต้อง รายชื่อไม่ครบ หรือไม่ผ่านกติกาการสมัคร
- `500`: ความผิดพลาดที่ไม่คาดคิด พร้อม correlation id และไม่มีข้อมูลอ่อนไหว

## Error And State Handling

หน้าจอต้องรองรับสถานะต่อไปนี้โดยไม่ทำให้ layout กระโดดหรือเกิด horizontal page
overflow:

- loading
- empty roster
- batch save pending
- successful save
- field and row validation errors
- duplicate player or jersey number
- unauthorized and inaccessible resource
- stale update conflict
- blocked format change
- blocked deletion/deactivation
- unexpected error with reference id

ปุ่ม mutation ปิดเฉพาะขณะคำสั่งของตนกำลังทำงาน ข้อความสถานะใช้ `aria-live`
และ focus ย้ายไป error summary เมื่อ batch ไม่ผ่าน

## Architecture

รักษาทิศทาง dependency เดิม:

```text
presentation -> application -> domain
infrastructure -> application/domain contracts
```

- Domain เก็บกติกาบทบาท รูปแบบทีม รายชื่อซ้ำ จำนวนขั้นต่ำ และเงื่อนไขลบทีม
- Application ประสาน permission, ownership, optimistic concurrency,
  transaction และ Audit Log
- Infrastructure ใช้ Prisma สำหรับ persistence และ atomic batch insert
- Presentation ประกอบด้วย Server Components, focused Client Components,
  Zod schemas, view models และ Route Handlers

Client Component ไม่เป็น authorization boundary และไม่เรียก Prisma โดยตรง

## Testing Strategy

- Domain tests: บทบาทใหม่ รูปแบบทีม รายชื่อซ้ำ เบอร์เสื้อซ้ำ จำนวนขั้นต่ำ และ
  เงื่อนไขลบ/ปิดใช้งาน
- Application tests: ownership, permission, atomic batch, stale version,
  format change guards และ Audit Log
- Repository tests: mapping, unique constraints, transaction rollback,
  active/deactivated records และ role migration
- Route Handler tests: `401`, `403`, `404`, `409`, `422` และ success responses
- UI tests: team format selector, five initial rows, add/remove row, field errors,
  atomic save feedback, edit/deactivate player และ deletion confirmation
- Registration regression tests: team/tournament format match, active roster minimum,
  age eligibility และ inactive team
- Browser QA: approximately 375px, 768px และ 1440px ใน light/dark mode
  โดยไม่มี overlap หรือ page-level horizontal scrolling

## Delivery Sequence

1. เพิ่ม role, Team format/state และ TeamPlayer พร้อม migration ที่ไม่ลบ legacy data
2. ปรับ permission, session provisioning, seed และ role labels
3. สร้าง TeamPlayer domain/application/repository และ batch API แบบ TDD
4. ปรับ Team Form และ Roster UI ให้รองรับ Desktop/Mobile
5. เพิ่ม format/roster checks ใน Tournament Registration
6. เพิ่มการลบถาวร/ปิดใช้งานทีมและ Audit Log
7. ตรวจ migration data, regression suite, lint, build และ responsive Browser QA
8. จัดทำ migration แยกเพื่อลบ TeamMember เดิมหลังยืนยันข้อมูลเท่านั้น

## Definition Of Done

- ผู้จัดการ/โค้ชสร้างทีม `5v5` หรือ `3v3` และเพิ่มผู้เล่นหลายคนโดยไม่ต้องสร้าง
  บัญชีให้ผู้เล่นได้
- Role, Header, registration และ Team Dashboard ใช้ `TEAM_MANAGER_COACH`
  อย่างสอดคล้อง
- Batch insert สำเร็จทั้งหมดหรือ rollback ทั้งหมดเมื่อมีข้อมูลผิด
- การสมัครแข่งขันตรวจรูปแบบทีม จำนวนผู้เล่น และสถานะทีมบน server
- ทีมไม่มีประวัติลบถาวรได้ ส่วนทีมมีประวัติถูกปิดใช้งานโดยไม่ทำลายผลเดิม
- ทุก mutation ตรวจ permission/ownership และบันทึก Audit Log ตามกติกา
- Focused tests, full tests, lint, build, Prisma validation, `git diff --check`
  และ responsive Browser QA ผ่านก่อน push implementation
