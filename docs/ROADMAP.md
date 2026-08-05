# COURTSIDE Roadmap

อัปเดตล่าสุด: 6 สิงหาคม 2026

## ความหมายของสถานะ

- `เสร็จแล้ว`: มีการพัฒนาและเชื่อมต่อกับสถาปัตยกรรมที่ใช้งานอยู่แล้ว
- `กำลังพัฒนา`: มีการพัฒนาบางส่วนแล้ว หรือยังต้องเสริมความพร้อมสำหรับการใช้งานจริง
- `วางแผนไว้`: ยังไม่ได้พัฒนานอกเหนือจาก schema ที่รองรับ หรือหน้าจอแบบอ่านอย่างเดียว

การมี schema หรือหน้าจอสาธารณะแบบอ่านอย่างเดียวไม่ถือว่า workflow เชิงปฏิบัติการเสร็จสมบูรณ์ ต้องมีการดำเนินงาน การตรวจสิทธิ์ และการเปลี่ยนสถานะที่เชื่อมต่อครบถ้วนด้วย

## เสร็จแล้ว

- การสมัครสมาชิกด้วยอีเมลและรหัสผ่านผ่าน Supabase, การเข้าสู่ระบบ, การออกจากระบบ, เส้นทางลืมและรีเซ็ตรหัสผ่าน, การสร้าง profile, session และการ redirect ตาม role
- การตรวจ permission และ ownership ของ server-side actions
- การสร้างและแก้ไข tournament แบบร่าง, การส่งตรวจ, การตรวจโดย admin, การเผยแพร่, การปิดรับสมัคร, age groups มาตรฐาน, ความจุที่เป็นจำนวนคู่, reference จังหวัดทั้ง 77 จังหวัด, audit และ concurrency checks
- Home สาธารณะ, รายการ tournament, รายละเอียด tournament, search filters ที่ผูกกับ URL, การแสดง poster และเอกสาร, responsive layouts, dark mode และ loading/empty/error states ที่ใช้ร่วมกัน
- การสร้างและแก้ไขทีม, การดูแล roster ของ player/coach, การสมัคร tournament, การยกเลิก, การอนุมัติ, การปฏิเสธ, การถอนตัว, การตรวจ eligibility และ capacity checks
- การ upload และ delete poster กับเอกสาร tournament ผ่าน Supabase Storage
- จำนวนสรุปเชิงปฏิบัติการของ admin, review queue และกิจกรรม audit ล่าสุด
- Prisma migrations, seed/reset tooling และ automated Vitest/RTL coverage

## กำลังพัฒนา

- การส่งอีเมลยืนยันและการทำ callback ให้แข็งแรงขึ้น รวมถึง production SMTP และ redirect configuration
- ประสบการณ์ของ Player และ Coach เพราะมี role แล้ว แต่ยังไม่มี permission/workspace เฉพาะสำหรับแต่ละ role
- การจัดการ profile, การยืนยัน organizer และการบริหาร platform role
- ช่องว่างด้าน governance ของ tournament: delete/remove, suspend, archive และการเปิดรับสมัครอีกครั้ง
- หน้าจออ่านข้อมูล bracket และ schedule สาธารณะ ซึ่งแสดง match data ที่เผยแพร่แล้วได้ แต่ยังสร้างหรือแก้ไขการดำเนินการแข่งขันไม่ได้
- Admin analytics ซึ่งปัจจุบันมี counts และ audits แต่ยังไม่มี visitor tracking, province popularity, trends หรือ charts
- การตรวจสอบ browser แบบ responsive สำหรับทุก protected workflow และ production observability

## วางแผนไว้

- การสร้าง deterministic single-elimination bracket และการล็อก entry
- การจับคู่ match, การจัดเวลาและสนาม, การบันทึกคะแนน, การยืนยันผล, การเลื่อนทีม, winner, runner-up และ rankings
- การ upload team-logo, tournament banners และ galleries
- Email notifications และ announcements สำหรับผลการสมัคร, การเปลี่ยนตาราง และผลการแข่งขัน
- Visitor analytics, monthly charts, popular provinces, conversion metrics, monitoring, CI/CD และ production deployment

## ลำดับการส่งมอบถัดไป

1. **Authentication hardening, email verification และ profile management** — ผู้ใช้ยืนยันอีเมล จัดการ profile ได้ และ auth flow พร้อมสำหรับ production configuration
2. **Competition operations: entry lock, bracket, schedule และ results** — ระบบสร้างและล็อก bracket จัดตาราง บันทึกและยืนยันผล พร้อมเลื่อนทีมอย่าง deterministic
3. **Remaining media และ notification delivery** — สื่อที่เหลือและการแจ้งเตือนถูกส่งและจัดการผ่าน workflow ที่ใช้งานได้จริง
4. **Analytics, monitoring, CI/CD และ deployment** — ระบบมี analytics, observability, pipeline และการ deploy production ที่ตรวจสอบได้

## เอกสารประวัติศาสตร์

ไฟล์ที่มีวันที่ภายใต้ `docs/superpowers/specs/` และ `docs/superpowers/plans/` เก็บการตัดสินใจและบริบทของการดำเนินงานในอดีต checkbox ในไฟล์เหล่านั้นไม่ใช่สถานะปัจจุบันของระบบ และ roadmap นี้เป็นแหล่งสถานะที่ authoritative เพียงแหล่งเดียว

บทบาทกรรมการไม่อยู่ในขอบเขตของผลิตภัณฑ์ปัจจุบัน
