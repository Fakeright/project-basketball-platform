# COURTSIDE Workflow Guidance And Demo Readiness Design

**วันที่:** 24 สิงหาคม 2026  
**สถานะ:** อนุมัติแบบออกแบบแล้ว รอตรวจสอบเอกสารก่อนจัดทำ implementation plan

## เป้าหมาย

ทำให้ workflow ที่มีอยู่แล้วใน COURTSIDE เข้าใจง่ายและพร้อมสาธิตภายในเวลา
20-25 นาที ผู้ใช้แต่ละบทบาทต้องเห็นว่าตนอยู่ขั้นตอนไหน งานถัดไปคืออะไร
และมีเงื่อนไขใดที่ยังขาด โดยไม่เพิ่ม subsystem ใหม่หรือเปลี่ยนกฎธุรกิจเดิม

รอบนี้เน้น `TOURNAMENT_ORGANIZER`, `PLATFORM_ADMIN` และบทบาทรวม
`TEAM_MANAGER_COACH` ซึ่งเป็นบทบาทที่ระบบปัจจุบันใช้สำหรับผู้จัดการและโค้ชคนเดียวกัน
หน้าสาธารณะยังคงทำหน้าที่ค้นหาและติดตามการแข่งขันตามเดิม

## ขอบเขต

งานที่รวมอยู่ในรอบนี้:

- Workflow guidance บน Organizer, Admin และ Team Dashboard
- แถบสถานะและงานถัดไปใน workspace ของ Tournament
- ข้อความ blocker และ prerequisite ภาษาไทยที่อ้างอิงผลจาก policy เดิม
- การนำทางข้ามข้อมูล การสมัคร สาย ตาราง และผลการแข่งขันที่สอดคล้องกัน
- ชุดข้อมูลเดโมแบบ idempotent สำหรับสถานะสำคัญของระบบ
- Automated tests และ responsive browser verification สำหรับเส้นทางเดโม
- ปรับ Roadmap ให้สะท้อนลำดับงานที่ได้รับอนุมัติหลัง implementation เสร็จ

งานที่ไม่รวม:

- Email Verification, production SMTP และ email notification
- Profile management, organizer verification และการบริหาร role
- Analytics, visitor tracking, charts และ monitoring
- CSV import, payment, referee role และระบบแจ้งเตือนใหม่
- Production deployment หรือการสร้างบัญชี Supabase สำหรับวันนำเสนอ
- Database migration หรือการเปลี่ยน lifecycle, permission และ ownership policy

Authentication hardening ยังคงเป็นงานในอนาคต การพักงานนี้ไม่ยกเลิก login,
registration, session, forgot password หรือ reset password ที่มีอยู่แล้ว

## หลักการออกแบบ

เพิ่มชั้น presentation read model ชื่อเชิงแนวคิดว่า `Workflow Guidance` เพื่อแปลง
ข้อมูลสถานะที่อ่านได้อยู่แล้วให้เป็นคำแนะนำสำหรับหน้าจอ ชั้นนี้ไม่มีสิทธิ์เปลี่ยนข้อมูล
และไม่เป็น authorization boundary

ผลลัพธ์ของ guidance แต่ละรายการประกอบด้วย:

- ชื่อขั้นตอนปัจจุบัน
- คำอธิบายสถานะแบบสั้น
- primary action ได้สูงสุดหนึ่งรายการ โดยมี label และ href
- secondary links เฉพาะที่ช่วยตรวจข้อมูลประกอบ
- blocker หรือ prerequisite ที่ต้องแก้ก่อนดำเนินงาน
- progress steps สำหรับ Tournament workspace

primary action แสดงได้ต่อเมื่อข้อมูลที่ application layer ส่งมาอนุญาตให้ทำงานนั้น
ห้าม presentation เดาสิทธิ์จาก role หรือ status เพียงอย่างเดียวเมื่อ operation มี policy
เฉพาะ Server-side use case และ Route Handler ยังคงตรวจ authentication, permission,
ownership, lifecycle, governance และ optimistic concurrency ทุกครั้ง

## สถาปัตยกรรมและความรับผิดชอบ

### Domain

ใช้ lifecycle, readiness และ permission policy ที่มีอยู่แล้ว ไม่มี domain enum หรือ
transition ใหม่ หาก policy ปัจจุบันยังไม่สามารถคืน readiness สำหรับหน้าจอได้
ให้เพิ่ม pure query/helper ใน feature เจ้าของกฎนั้น โดยไม่ผูกข้อความภาษาไทยหรือ URL
เข้า domain

### Application

Application query รวบรวมเฉพาะข้อมูลที่หน้าจอต้องใช้ เช่น status, governance status,
จำนวนทีม ผู้เล่น ใบสมัคร bracket matches และ readiness issues การตรวจ ownership
เกิดก่อนคืนข้อมูลเสมอ ห้าม presentation query Prisma โดยตรง

### Infrastructure

Repository ใช้ contract เดิมก่อน หาก dashboard query ต้องอ่านข้อมูลเพิ่ม ให้ขยาย
projection แบบ read-only เท่าที่จำเป็น ห้ามเพิ่ม schema หรือสร้างตารางสำหรับเก็บ
คำแนะนำ เพราะ guidance ต้องคำนวณจากสถานะจริงเสมอ

### Presentation

Presentation mapper แปลง typed status และ issue codes เป็นข้อความภาษาไทยและ route
ที่เหมาะสม Component รับ view-ready data เท่านั้น โดยเพิ่ม component ขนาดเล็กไม่เกิน
ความจำเป็น เช่น `WorkflowNextAction` และ `TournamentWorkflowProgress`
ไม่สร้าง design system ใหม่และไม่ซ้อน card ภายใน card

## Workflow ของแต่ละบทบาท

### Tournament Organizer

หน้า `/organizer` แสดงแต่ละ Tournament เป็นแถวที่สแกนง่าย มีสถานะ งานถัดไป
blocker แบบย่อ และ primary action หนึ่งปุ่ม

แนวทางการจับคู่สถานะ:

| สถานะ | คำแนะนำหลัก |
| --- | --- |
| `DRAFT` | ตรวจข้อมูลและส่งให้ Admin |
| `CHANGES_REQUESTED` | แก้ไขตามข้อเสนอแนะ |
| `SUBMITTED` | รอ Admin ตรวจสอบ โดยไม่มี mutation หลัก |
| `APPROVED` | เผยแพร่รายการ |
| `PUBLISHED` | ตรวจทีมที่สมัคร หรือปิดรับสมัครเมื่อพร้อม |
| `REGISTRATION_CLOSED` | เตรียมและเผยแพร่สายการแข่งขัน |
| `IN_PROGRESS` | จัดตาราง บันทึก และยืนยันผล |
| `COMPLETED` | ตรวจอันดับและผลสรุป |
| `ARCHIVED` | ดูผลสาธารณะ |
| governance `SUSPENDED` | แสดงเหตุผลและรอ Admin เปิดใช้งาน |

ตารางนี้กำหนดเจตนาของ UI ไม่ใช่ transition matrix หาก readiness policy ระบุว่า
ยังทำขั้นถัดไปไม่ได้ UI ต้องแสดง blocker แทนปุ่มดำเนินการ

หน้า `/organizer/tournaments/[id]` และหน้าปฏิบัติการที่เกี่ยวข้องใช้แถบขั้นตอน
`ข้อมูลรายการ -> ทีมสมัคร -> สายการแข่งขัน -> ตารางแข่งขัน -> ผลการแข่งขัน`
แถบต้องเลื่อนได้ในจอแคบ แต่ห้ามทำให้หน้าหลักเกิด horizontal overflow

### Platform Admin

หน้า `/admin` ให้คิวรายการรอตรวจเป็นงานสำคัญลำดับแรก ตามด้วยรายการ governance
ที่ต้องสนใจและ Audit ล่าสุด ปุ่มหลักนำไปยัง record ที่ดำเนินการได้จริง

หลังอนุมัติ ขอแก้ไข หรือปฏิเสธ ระบบแสดงผลสำเร็จอย่างเข้าถึงได้และให้กลับคิวตรวจ
หรือเปิดรายการถัดไปได้ การบังคับระบุเหตุผล Audit Log และสิทธิ์ Admin ใช้ workflow
เดิมทั้งหมด

### Team Manager/Coach

หน้า `/team` แสดงสถานะความพร้อมของแต่ละทีมจาก format, active state และจำนวนผู้เล่น:

- ยังไม่มีทีม: `สร้างทีม`
- ทีมยังไม่พร้อม: `เพิ่มผู้เล่น`
- ทีมพร้อมและยังไม่มีการสมัครที่ต้องติดตาม: `ค้นหารายการแข่งขัน`
- มีใบสมัครที่รอดำเนินการ: `ตรวจสถานะการสมัคร`
- ใบสมัครอนุมัติแล้วและการแข่งขันมีข้อมูล: ลิงก์ไปตาราง สาย หรือผลตามสถานะ
- ทีมปิดใช้งาน: แสดงแบบ read-only โดยไม่มีปุ่ม mutation

ผู้เล่นยังคงเป็น `TeamPlayer` ที่ไม่ต้องมีบัญชี และรอบนี้ไม่เพิ่ม self-service
workspace สำหรับบทบาท `PLAYER`

### Public Visitor

ไม่แสดง workflow ของผู้ดูแล เพิ่มเฉพาะ cross-navigation ที่จำเป็นระหว่างรายละเอียด
Tournament, Schedule, Bracket และ Results โดยยังกรองรายการที่ไม่ public ตาม policy เดิม

## สถานะผิดปกติและข้อผิดพลาด

- ข้อมูลไม่พร้อม: แสดง prerequisite ที่แก้ได้ เช่น ต้องมีทีมอนุมัติอย่างน้อย 2 ทีม
- ไม่มีงานที่ทำได้: แสดงสถานะ read-only และไม่สร้างปุ่มหลอก
- รายการถูกระงับ: แสดง governance reason ที่ผ่านการ sanitize และซ่อน mutation controls
- version เก่า: Route Handler ตอบ `409` และ UI ขอให้ refresh ก่อนดำเนินการใหม่
- ไม่เข้าสู่ระบบหรือไม่มีสิทธิ์: ใช้ redirect, `401`, `403` หรือ `404` ตาม boundary เดิม
- unexpected error: ใช้ error boundary ที่มีอยู่และไม่แสดง secret หรือข้อมูลส่วนบุคคล
- empty state ต้องมีคำสั่งถัดไปเมื่อผู้ใช้มีสิทธิ์ เช่น สร้างทีม หรือสร้างรายการแข่งขัน

## ชุดข้อมูลเดโม

เพิ่มคำสั่งแยก เช่น `npm run seed:demo` สำหรับสร้างข้อมูลจำลองแบบ idempotent
โดยใช้ stable identifiers และ upsert การรันซ้ำต้องไม่สร้าง record ซ้ำ ไม่ reset schema
และไม่ลบข้อมูลที่ไม่ได้เป็นเจ้าของโดยชุดเดโม

ชุดหลักประกอบด้วย Tournament 6 รายการ:

1. `COURTSIDE Draft Cup` สำหรับสร้างและส่งตรวจ
2. `COURTSIDE Review Cup` สำหรับคิวตรวจของ Admin
3. `COURTSIDE Registration Cup` สำหรับสมัครและพิจารณาทีม
4. `COURTSIDE Bracket Cup` สำหรับล็อกทีมและจัดสาย
5. `COURTSIDE Live Cup` สำหรับตาราง คะแนน และการยืนยันผล
6. `COURTSIDE Championship` สำหรับ Winner, Runner-up และอันดับสรุป

ข้อมูลประกอบมีทีมตัวอย่างทั้ง `3v3` และ `5v5`, ผู้เล่นสมมติ, ใบสมัคร, bracket,
matches และผลเฉพาะที่แต่ละ checkpoint ต้องใช้ ห้ามใช้ข้อมูลส่วนบุคคลจริง

Seed ไม่สร้างหรือเก็บรหัสผ่าน, Supabase service key หรือ access token ใน repository
และต้องปฏิเสธการทำงานเมื่อ environment ถูกระบุเป็น production อย่างชัดเจน บัญชี
Supabase จริงสำหรับเว็บออนไลน์จะเตรียมในระยะ deployment ภายหลัง ระหว่างพัฒนาใช้
session mechanism ที่โครงการรองรับอยู่แล้ว

## เส้นทางสาธิต

เตรียม session แยก 3 บทบาทเพื่อลดเวลาสลับบัญชี:

1. Organizer ตรวจ Dashboard เปิดรายการร่าง ส่งตรวจ และแสดงรายการที่รอผล
2. Admin เปิด review queue ตรวจรายการ และแสดง Audit ที่เกิดขึ้น
3. Team Manager/Coach ตรวจความพร้อมทีม ค้นหารายการ และติดตามใบสมัคร
4. Organizer เปิด Registration Cup เพื่อพิจารณาทีม
5. เปิด Bracket Cup เพื่อแสดงการสร้างหรือเผยแพร่สาย
6. เปิด Live Cup เพื่อแสดงตารางและผลการแข่งขัน
7. ปิดด้วย Championship บนหน้าสาธารณะเพื่อแสดงผลและอันดับ

ไม่บังคับให้ record เดียวเดินผ่านทุกสถานะระหว่างนำเสนอ แต่ทุก checkpoint ต้องสร้างจาก
กฎและข้อมูลแบบเดียวกับ workflow จริง ไม่ใช้ภาพจำลองหรือข้อมูล hard-code ใน component

## การเข้าถึงและ Responsive

- ใช้ semantic heading, visible label, focus state และ `aria-live` สำหรับผล mutation
- primary action มีอย่างมากหนึ่งรายการต่อ context และมีชื่อที่บอกการกระทำชัดเจน
- ไม่ใช้สีเพียงอย่างเดียวบอกสถานะ
- ตรวจประมาณ `375px`, `768px` และ `1440px` ทั้ง light และ dark mode
- ภาษาไทยต้องไม่ล้นหรือซ้อนกับ control และ touch target ต้องไม่น้อยกว่า 24px
- Bracket และ operational table เลื่อนแนวนอนได้เฉพาะพื้นที่ของตน

## การทดสอบและเกณฑ์ยอมรับ

พัฒนาด้วย TDD โดยเริ่มจาก focused failing tests:

- Unit tests ของ guidance mapper สำหรับสถานะและ blocker สำคัญ
- Application tests สำหรับ ownership, readiness projection และข้อมูลที่ถูกระงับ
- UI tests ยืนยัน primary action หนึ่งรายการ, read-only state, empty state และ URL
- Admin tests ยืนยันว่าคิวรอตรวจมาก่อนและ mutation เดิมยัง enforce permission
- Team tests สำหรับ no-team, incomplete roster, ready, pending และ approved registration
- Seed tests หรือ verification script ยืนยัน stable IDs และไม่มีข้อมูลซ้ำเมื่อรันสองครั้ง
- Regression tests ยืนยันว่า guidance ไม่ข้าม server authorization

ก่อนส่งมอบต้องรัน:

```powershell
npm run test
npm run lint
npm run build
git diff --check
git status --short
```

จากนั้นตรวจเส้นทางเดโมใน browser ด้วยทั้ง 3 บทบาทและ viewport ที่กำหนด หาก database,
Supabase หรือ storage ภายนอกไม่พร้อม ต้องรายงานข้อจำกัดและยังคงรัน independent checks
ทั้งหมดที่ทำได้

## เกณฑ์จบงาน

- ผู้ใช้ทั้ง 3 บทบาทเห็นสถานะและงานถัดไปที่ถูกต้องจากข้อมูลจริง
- ไม่มีปุ่มที่พาผู้ใช้ไปทำ operation ซึ่ง policy ปัจจุบันห้าม
- blocker สำคัญอธิบายเป็นภาษาไทยและนำไปแก้ได้
- ชุดข้อมูลเดโมสร้างซ้ำได้โดยไม่ล้างฐานข้อมูลหรือเปิดเผย secret
- เส้นทางเดโม 20-25 นาทีเปิดแต่ละ checkpoint ได้โดยตรง
- Responsive, dark mode, automated tests, lint และ production build ผ่าน
- Roadmap ระบุ Workflow Guidance เป็นงานเสร็จแล้ว และเลื่อน Authentication hardening
  ไปหลังการปรับ workflow ตามการตัดสินใจล่าสุด
