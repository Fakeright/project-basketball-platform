# ระบบ admin

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## features/admin/application/get-admin-dashboard.ts

ตรวจสิทธิ์แอดมินแล้วอ่านจำนวนรายการ ทีม ผู้ใช้ และงานที่รอดำเนินการ เพื่อส่งให้แดชบอร์ด

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/application/get-admin-dashboard.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/admin/admin-dashboard.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/admin/admin-dashboard.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getAdminDashboard](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/application/get-admin-dashboard.ts:15>) | 15 | ตรวจบทบาทก่อนอ่าน dashboard เพื่อไม่ให้ผู้ใช้ทั่วไปเรียกข้อมูลสรุปหลังบ้านโดยตรง |

## features/admin/application/ports/admin-dashboard-repository.ts

กำหนดข้อมูลสรุปและสัญญาการอ่านแดชบอร์ด ให้ use case ไม่ต้องผูกกับ Prisma

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/application/ports/admin-dashboard-repository.ts:1>)

ผู้เรียกในโครงการ: [features/admin/application/get-admin-dashboard.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/application/get-admin-dashboard.ts:1>), [features/admin/infrastructure/get-admin-dashboard-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/infrastructure/get-admin-dashboard-repository.ts:1>), [features/admin/infrastructure/prisma-admin-dashboard-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/infrastructure/prisma-admin-dashboard-repository.ts:1>), [features/admin/presentation/admin-dashboard-view-model.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/admin-dashboard-view-model.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/admin/admin-dashboard.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/admin/admin-dashboard.test.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [AdminDashboardMetrics](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/application/ports/admin-dashboard-repository.ts:7>), [AdminDashboardAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/application/ports/admin-dashboard-repository.ts:17>), [AdminDashboardTaskItem](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/application/ports/admin-dashboard-repository.ts:28>), [AdminDashboardReadModel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/application/ports/admin-dashboard-repository.ts:37>), [AdminDashboardRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/application/ports/admin-dashboard-repository.ts:44>)

## features/admin/infrastructure/get-admin-dashboard-repository.ts

ประกอบ repository สำหรับอ่านแดชบอร์ดจากฐานข้อมูลที่ตั้งค่าไว้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/infrastructure/get-admin-dashboard-repository.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getAdminDashboardRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/infrastructure/get-admin-dashboard-repository.ts:15>) | 15 |  |

## features/admin/infrastructure/prisma-admin-dashboard-repository.ts

รวมยอดและรายการงานจาก PostgreSQL ผ่าน Prisma แล้วแปลงเป็นข้อมูลแดชบอร์ด

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/infrastructure/prisma-admin-dashboard-repository.ts:1>)

ผู้เรียกในโครงการ: [features/admin/infrastructure/get-admin-dashboard-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/infrastructure/get-admin-dashboard-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/admin/admin-dashboard.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/admin/admin-dashboard.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PrismaAdminDashboardRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/infrastructure/prisma-admin-dashboard-repository.ts:28>) | 28 |  |
| [getDashboard](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/infrastructure/prisma-admin-dashboard-repository.ts:33>) | 33 |  |

## features/admin/presentation/admin-dashboard-view-model.ts

จัดข้อมูลสรุปของแอดมินเป็นข้อความ ตัวเลข และรายการที่ component แสดงผลได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/admin-dashboard-view-model.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/page.tsx:1>), [components/admin/admin-dashboard.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/admin-dashboard.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/admin-dashboard.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/admin-dashboard.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createAdminDashboardViewModel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/admin-dashboard-view-model.ts:78>) | 78 | แปลงข้อมูลจาก repository เป็นค่าที่หน้าแดชบอร์ดใช้แสดง ไม่อ่านฐานข้อมูลเพิ่ม |

ชนิดข้อมูล/สัญญาที่ส่งออก: [AdminDashboardViewModel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/admin-dashboard-view-model.ts:9>)

## features/admin/presentation/review-tournament-handler.ts

ตรวจคำขอตัดสินรายการ แล้วส่งผลอนุมัติ ขอแก้ไข หรือปฏิเสธไปยัง use case

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/review-tournament-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/review/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/review/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/review-tournament.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/review-tournament.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [handleReviewRequest](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/review-tournament-handler.ts:41>) | 41 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [ReviewDependencies](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/review-tournament-handler.ts:36>)

## features/admin/presentation/save-tournament-handler.ts

ตรวจข้อมูลฟอร์มและผู้ใช้ แล้วเลือกสร้างฉบับร่างหรือแก้รายการเดิม พร้อมแปลงข้อผิดพลาดเป็น HTTP

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/save-tournament-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/route.ts:1>), [app/api/admin/tournaments/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/tournament-submit.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-submit.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [saveTournamentHandler](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/save-tournament-handler.ts:30>) | 30 |  |
| [saveTournamentFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/save-tournament-handler.ts:72>) | 72 |  |

## features/admin/presentation/submit-tournament-handler.ts

รับคำขอส่งรายการให้แอดมินตรวจ แล้วเรียกการเปลี่ยนสถานะรายการ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/submit-tournament-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/submit/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/submit/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/tournament-submit.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-submit.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [submitTournamentHandler](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/submit-tournament-handler.ts:17>) | 17 |  |

## features/admin/presentation/tournament-editor-schema.ts

กำหนดรูปแบบฟอร์มด้วย Zod รวมจังหวัด รุ่นอายุ จำนวนทีม และวันเวลา; รายละเอียดกับกติกาเว้นว่างได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-schema.ts:1>)

ผู้เรียกในโครงการ: [components/admin/tournament-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:1>), [features/admin/presentation/save-tournament-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/save-tournament-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/admin/tournament-editor-schema.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/admin/tournament-editor-schema.test.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentEditorInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-schema.ts:96>)

## features/admin/presentation/tournament-editor-time.ts

แปลงวันเวลาที่กรอกตามเวลาไทยกับค่า UTC สำหรับเก็บข้อมูล เพื่อไม่ให้เวลาแข่งขันเลื่อน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-time.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/schedule/page.tsx:1>), [components/organizer/external-match-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-editor.tsx:1>), [components/organizer/match-schedule-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-schedule-editor.tsx:1>), [features/admin/presentation/tournament-editor-schema.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-schema.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/admin/tournament-editor-time.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/admin/tournament-editor-time.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [bangkokDateTimeLocalToUtc](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-time.ts:14>) | 14 | ตีความค่าจาก datetime-local ว่าเป็นเวลาไทย แล้วแปลงเป็น UTC สำหรับบันทึก |
| [utcToBangkokDateTimeLocal](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-time.ts:44>) | 44 | แปลงเวลาที่เก็บเป็น UTC กลับเป็นข้อความวันที่/เวลาไทยสำหรับเติมในช่องกรอก |
| [tournamentDateTimeToUtc](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-time.ts:63>) | 63 | ปรับค่าจากฟอร์มให้เป็นเวลา UTC ตามรูปแบบที่รับได้ก่อนส่งต่อ use case |
| [padTwoDigits](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-time.ts:74>) | 74 |  |
| [padYear](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-time.ts:78>) | 78 |  |

## features/admin/presentation/tournament-lifecycle-handler.ts

รับคำขอเผยแพร่หรือปิดรับสมัคร ตรวจตัวตน แล้วส่งต่อ use case ที่เปลี่ยนสถานะ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-lifecycle-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/close-registration/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/close-registration/route.ts:1>), [app/api/admin/tournaments/\[id\]/publish/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/publish/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/tournament-lifecycle.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-lifecycle.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [handleTournamentLifecycleRequest](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-lifecycle-handler.ts:29>) | 29 |  |
| [lifecycleErrorMessage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-lifecycle-handler.ts:118>) | 118 |  |

## features/admin/presentation/tournament-media-handler.ts

ตรวจ multipart/form-data สำหรับอัปโหลดและคำขอลบสื่อ แล้วแปลงผลจาก use case เป็น HTTP

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/media/\[assetId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/route.ts:1>), [app/api/admin/tournaments/\[id\]/media/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-media.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [handleTournamentMediaUpload](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:39>) | 39 |  |
| [handleTournamentMediaDelete](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:123>) | 123 |  |
| [isUploadFile](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:148>) | 148 |  |
| [invalidMediaFormResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:159>) | 159 |  |
| [mediaFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:166>) | 166 |  |
