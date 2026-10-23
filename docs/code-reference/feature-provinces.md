# ระบบ provinces

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## features/provinces/application/assert-province-code.ts

ตรวจว่ารหัสจังหวัดอยู่ในรายการจังหวัดไทยที่ระบบรองรับก่อนบันทึกข้อมูล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/provinces/application/assert-province-code.ts:1>)

ผู้เรียกในโครงการ: [features/admin/presentation/tournament-editor-schema.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-schema.ts:1>), [features/team-management/application/create-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:1>), [features/team-management/application/update-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team.ts:1>), [features/team-management/presentation/team-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:1>), [features/tournament-operations/application/create-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/provinces/assert-province-code.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/provinces/assert-province-code.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [assertProvinceCode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/provinces/application/assert-province-code.ts:11>) | 11 | ปฏิเสธรหัสจังหวัดที่ไม่ได้อยู่ในชุดข้อมูลกลางก่อนเข้าสู่ขั้นตอนบันทึก |

## features/provinces/domain/thai-provinces.ts

เก็บรหัสและชื่อจังหวัดไทย 77 จังหวัด พร้อมค้นหาชื่อ/รหัสสำหรับ dropdown

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/provinces/domain/thai-provinces.ts:1>)

ผู้เรียกในโครงการ: [components/province-combobox.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/province-combobox.tsx:1>), [features/demo-data/infrastructure/demo-seed-orchestration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:1>), [features/provinces/application/assert-province-code.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/provinces/application/assert-province-code.ts:1>), [features/tournament-operations/infrastructure/development-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:1>), [features/tournaments/presentation/tournament-search-params.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-search-params.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/demo-data/prisma-demo-seed-port.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/prisma-demo-seed-port.test.ts:1>), [tests/features/provinces/thai-provinces.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/provinces/thai-provinces.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [findProvinceByCode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/provinces/domain/thai-provinces.ts:100>) | 100 | ค้นข้อมูลจังหวัดจากรหัสที่เก็บในฟอร์มหรือฐานข้อมูล |
| [searchThaiProvinces](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/provinces/domain/thai-provinces.ts:105>) | 105 | กรองตัวเลือกจังหวัดด้วยคำค้นที่ normalize แล้วสำหรับ combobox |

ชนิดข้อมูล/สัญญาที่ส่งออก: [ProvinceOption](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/provinces/domain/thai-provinces.ts:7>)
