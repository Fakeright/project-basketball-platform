# แผนปิดงานตรวจโค้ดและส่งขึ้น GitHub

คำขอ: แก้ประเด็นค้างจากรายงาน ตรวจสอบ แล้ว commit/push โดยรักษาพฤติกรรมระบบเดิม

- [x] ตรวจสถานะ Git และทำซ้ำปัญหา TypeScript/คำเตือนแพ็กเกจ
- [x] อัปเดตแพ็กเกจที่มีแพตช์ความปลอดภัยโดยไม่ downgrade หรือ force upgrade
- [x] แก้ชนิดข้อมูล mock/fixture ให้ตรงกับสัญญาจริง และเพิ่มคำสั่ง typecheck รวม tests
- [x] ตรวจ typecheck, tests, lint, build, audit และ diff
- [x] ปรับคู่มือและเลขบรรทัด ตรวจข้อมูลลับก่อน stage เฉพาะงานโครงการ
- [ ] commit และ push ไป branch เดิม จากนั้นยืนยัน commit บน remote

ไม่แก้ฐานข้อมูลจริง ไม่เพิ่มฟีเจอร์ และไม่รวมโฟลเดอร์เครื่องมือส่วนตัว `.agents`, `.claude`, `.windsurf` หรือ `skills-lock.json`
