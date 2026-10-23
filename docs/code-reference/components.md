# ส่วนแสดงผลและฟอร์ม

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## components/account-session-control.tsx

แสดงปุ่มเข้าสู่ระบบ/สมัครสำหรับผู้เยี่ยมชม หรือข้อมูลบทบาทและคำสั่งออกจากระบบสำหรับบัญชีที่ล็อกอิน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/account-session-control.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/layout.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/layout.tsx:1>), [components/site-header.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/site-header.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AccountSessionControl](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/account-session-control.tsx:44>) | 44 |  |
| [logout](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/account-session-control.tsx:57>) | 57 | เรียก API ออกจากระบบ แล้วอัปเดตเส้นทาง/ข้อมูลหน้าให้ตรงกับ session ที่ถูกยกเลิก |

## components/admin/admin-dashboard.tsx

แสดงตัวเลขสรุป งานที่ต้องตรวจ และประวัติของผู้ดูแลจาก view model

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/admin-dashboard.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/admin-dashboard.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/admin-dashboard.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminDashboard](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/admin-dashboard.tsx:12>) | 12 |  |

## components/admin/admin-sidebar.tsx

แสดงเมนูหลังบ้านตามบทบาทและหน้าปัจจุบัน พร้อมเมนูสำหรับหน้าจอเล็ก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/admin-sidebar.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/layout.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/layout.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/admin-shell.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/admin-shell.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminSidebar](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/admin-sidebar.tsx:14>) | 14 |  |

## components/admin/match-result-correction-dialog.tsx

ฟอร์มยืนยันให้แอดมินแก้คะแนนที่ยืนยันแล้ว พร้อมส่งเหตุผลและ version ไป API

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/match-result-correction-dialog.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/tournaments/\[id\]/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/results/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/match-result-correction-dialog.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/match-result-correction-dialog.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [MatchResultCorrectionDialog](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/match-result-correction-dialog.tsx:29>) | 29 |  |
| [submitCorrection](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/match-result-correction-dialog.tsx:62>) | 62 | ส่งคะแนนแก้ไข เหตุผล และ version ไป API แอดมิน แล้วโหลดข้อมูลล่าสุดเมื่อสำเร็จ |

ชนิดข้อมูล/สัญญาที่ส่งออก: [AdminCorrectableMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/match-result-correction-dialog.tsx:17>)

## components/admin/tournament-capacity-field.tsx

ช่องเลือกจำนวนทีมตามชุดค่าที่รองรับ โดยอ่านค่าเดิมได้เมื่อแก้รายการเก่า

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-capacity-field.tsx:1>)

ผู้เรียกในโครงการ: [components/admin/tournament-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/tournament-capacity-field.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/tournament-capacity-field.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentCapacityField](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-capacity-field.tsx:17>) | 17 |  |

## components/admin/tournament-editor.tsx

ฟอร์มสร้าง/แก้ฉบับร่างและส่งตรวจ; ตรวจ Zod ก่อนเรียก API แล้วอัปเดต id/version สำหรับคำสั่งถัดไป

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/page.tsx:1>), [app/(admin)/organizer/tournaments/new/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/new/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/tournament-editor.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/tournament-editor.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentEditor](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:40>) | 40 |  |
| [handleSubmit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:57>) | 57 | อ่าน FormData และตรวจ schema; บันทึกร่างใช้ POST/PUT ส่วนส่งตรวจใช้ endpoint submit แล้วเก็บ id/version ที่เซิร์ฟเวอร์คืน |
| [ReadOnlyTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:276>) | 276 |  |
| [ReadOnlyText](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:330>) | 330 |  |
| [hasTournamentIdentity](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:350>) | 350 | ตรวจว่า API คืน id และ version ครบก่อนนำข้อมูลไปใช้ส่งคำสั่งครั้งถัดไป |
| [Field](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:362>) | 362 |  |
| [TextArea](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:392>) | 392 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [EditableTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:29>)

## components/admin/tournament-governance-dialog.tsx

รับเหตุผลและยืนยันคำสั่งกำกับรายการก่อนส่งไป API ของแอดมิน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-dialog.tsx:1>)

ผู้เรียกในโครงการ: [components/admin/tournament-governance-panel.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-panel.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/tournament-governance-dialog.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/tournament-governance-dialog.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentGovernanceDialog](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-dialog.tsx:43>) | 43 |  |
| [updateOpen](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-dialog.tsx:64>) | 64 |  |
| [resetForm](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-dialog.tsx:70>) | 70 |  |
| [submitCommand](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-dialog.tsx:77>) | 77 | ส่งคำสั่งกำกับ เหตุผล และ version ไป API แอดมิน; แสดงข้อผิดพลาดหากสถานะเปลี่ยนไปแล้ว |
| [GovernanceActionIcon](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-dialog.tsx:232>) | 232 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentGovernanceDialogAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-dialog.tsx:27>)

## components/admin/tournament-governance-panel.tsx

แสดงสถานะกำกับรายการและคำสั่งที่แอดมินทำได้จากข้อมูลบริบท

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-panel.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentGovernancePanel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-panel.tsx:36>) | 36 |  |
| [StatusFact](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-panel.tsx:158>) | 158 |  |
| [OperationLink](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-panel.tsx:167>) | 167 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentGovernanceActionView](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-panel.tsx:16>)

## components/admin/tournament-governance-read-only.tsx

แจ้งว่ารายการอยู่ในสถานะอ่านอย่างเดียว พร้อมข้อมูลสถานะและเหตุผล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-read-only.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/registrations/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/registrations/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/results/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/schedule/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentGovernanceNotice](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-read-only.tsx:9>) | 9 |  |
| [SuspendedTournamentWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-read-only.tsx:39>) | 39 |  |

## components/admin/tournament-lifecycle-actions.tsx

แสดงคำสั่งเผยแพร่/ปิดรับสมัครตามสถานะ และส่งคำขอเปลี่ยนสถานะไป API

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-lifecycle-actions.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/tournament-lifecycle-actions.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/tournament-lifecycle-actions.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentLifecycleActions](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-lifecycle-actions.tsx:31>) | 31 |  |
| [transition](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-lifecycle-actions.tsx:53>) | 53 | ส่งคำสั่งเปลี่ยนสถานะรายการไป endpoint ที่ตรงกับ action แล้วรีเฟรชข้อมูล |

## components/admin/tournament-media-manager.tsx

อัปโหลดและลบโปสเตอร์/เอกสารของรายการ พร้อมแสดงไฟล์และผลการทำงาน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-media-manager.tsx:1>)

ผู้เรียกในโครงการ: [components/admin/tournament-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/tournament-media-manager.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/tournament-media-manager.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentMediaManager](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-media-manager.tsx:25>) | 25 |  |
| [upload](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-media-manager.tsx:42>) | 42 | ส่งไฟล์และชนิดสื่อเป็น FormData ไป API แล้วเพิ่ม asset ที่เซิร์ฟเวอร์คืนในรายการบนหน้าจอ |
| [remove](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-media-manager.tsx:79>) | 79 | เรียก API ลบ asset ที่เลือก แล้วนำออกจากรายการบนหน้าจอเมื่อสำเร็จ |
| [formatFileSize](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-media-manager.tsx:183>) | 183 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentMediaManagerAsset](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-media-manager.tsx:16>)

## components/admin/tournament-review-media.tsx

แสดงโปสเตอร์และเอกสารที่แนบให้แอดมินตรวจ โดยเอกสารเปิดผ่าน endpoint ที่ตรวจสิทธิ์

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-media.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/reviews/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/[id]/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentReviewMedia](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-media.tsx:13>) | 13 |  |

## components/admin/tournament-review-panel.tsx

รับผลตรวจและเหตุผลจากแอดมิน แล้วส่งอนุมัติ ขอแก้ไข หรือปฏิเสธไป API

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-panel.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/reviews/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/[id]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/tournament-review-panel.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/tournament-review-panel.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentReviewPanel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-panel.tsx:38>) | 38 |  |
| [submitDecision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-panel.tsx:50>) | 50 | ส่งผลตรวจและเหตุผลไป API review พร้อมอัปเดตข้อความ/หน้าจอตามผลตอบกลับ |
| [ReviewButton](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-panel.tsx:157>) | 157 |  |

## components/admin/tournament-review-queue.tsx

แสดงรายการรอตรวจพร้อมลิงก์ไปตรวจรายละเอียดแต่ละรายการ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-queue.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/reviews/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/review-queue.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/review-queue.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentReviewQueue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-queue.tsx:19>) | 19 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [ReviewQueueItem](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-queue.tsx:11>)

## components/auth/auth-form-layout.tsx

จัดวางหัวข้อ เนื้อหาฟอร์ม และลิงก์ของหน้าบัญชีให้สอดคล้องกัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/auth-form-layout.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/forgot-password/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/forgot-password/page.tsx:1>), [app/(public)/login/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/login/page.tsx:1>), [app/(public)/register/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/register/page.tsx:1>), [app/(public)/reset-password/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/reset-password/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AuthFormLayout](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/auth-form-layout.tsx:9>) | 9 |  |

## components/auth/auth-response.ts

อ่านผลตอบกลับของ API บัญชีอย่างระมัดระวังและเลือกข้อความผิดพลาดที่แสดงได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/auth-response.ts:1>)

ผู้เรียกในโครงการ: [components/auth/forgot-password-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/forgot-password-form.tsx:1>), [components/auth/login-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/login-form.tsx:1>), [components/auth/register-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/register-form.tsx:1>), [components/auth/reset-password-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/reset-password-form.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [readAuthResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/auth-response.ts:13>) | 13 | อ่าน response ของ API บัญชีและรับเฉพาะข้อมูลตามรูปแบบที่หน้าจอรองรับ |
| [getAllowedMessage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/auth-response.ts:26>) | 26 | เลือกข้อความตอบกลับที่แสดงได้ และใช้ข้อความสำรองเมื่อรูปแบบไม่ถูกต้อง |
| [getSafeRedirect](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/auth-response.ts:38>) | 38 | ตรวจเส้นทางที่จะนำทางจากผล API ก่อนให้เบราว์เซอร์เปลี่ยนหน้า |

## components/auth/forgot-password-form.tsx

รับอีเมลแล้วส่งคำขอกู้รหัสผ่าน พร้อมแสดงผลการส่งและสถานะกำลังทำงาน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/forgot-password-form.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/forgot-password/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/forgot-password/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/auth/recovery-forms.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/auth/recovery-forms.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ForgotPasswordForm](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/forgot-password-form.tsx:23>) | 23 |  |
| [handleSubmit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/forgot-password-form.tsx:28>) | 28 | ส่งอีเมลไป API ขอ recovery แล้วแสดงข้อความตอบกลับจากระบบ |

## components/auth/login-form.tsx

รับอีเมล/รหัสผ่าน ส่ง POST ไป API เข้าสู่ระบบ แล้วเปลี่ยนหน้าเมื่อสำเร็จ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/login-form.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/login/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/login/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/auth/login-form.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/auth/login-form.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [LoginForm](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/login-form.tsx:30>) | 30 |  |
| [handleSubmit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/login-form.tsx:36>) | 36 | หยุดการ submit แบบปกติ แล้วส่งอีเมล/รหัสผ่านใน body ไป API; สำเร็จจึงนำทางไปหน้าที่อนุญาต |

## components/auth/register-form.tsx

รับข้อมูลสมัครและบทบาทที่เลือกเองได้ ตรวจรหัสผ่านยืนยัน แล้วส่ง API สมัครบัญชี

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/register-form.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/register/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/register/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/auth/register-form.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/auth/register-form.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [RegisterForm](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/register-form.tsx:39>) | 39 |  |
| [handleSubmit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/register-form.tsx:45>) | 45 | รวบรวมข้อมูลสมัครและรหัสผ่านยืนยัน ส่ง POST ไป API แล้วแสดงผลตามว่าต้องยืนยันอีเมลหรือเข้าสู่ระบบได้ |

## components/auth/reset-password-form.tsx

รับรหัสผ่านใหม่และคำยืนยัน แล้วส่ง API ที่ตรวจ recovery grant ก่อนเปลี่ยนรหัสผ่าน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/reset-password-form.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/reset-password/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/reset-password/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/auth/recovery-forms.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/auth/recovery-forms.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ResetPasswordForm](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/reset-password-form.tsx:29>) | 29 |  |
| [handleSubmit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/reset-password-form.tsx:35>) | 35 | ส่งรหัสผ่านใหม่และคำยืนยันไป API ซึ่งเป็นผู้ตรวจสิทธิ์ recovery จริง |

## components/bracket-view.tsx

แสดงรอบและคู่แข่งขันของสายที่ระบบสร้าง รวมทางเชื่อมไปคู่ถัดไปและการเลื่อนดูบนมือถือ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/bracket-view.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/public-bracket.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-bracket.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [formatScore](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/bracket-view.tsx:9>) | 9 |  |
| [BracketView](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/bracket-view.tsx:24>) | 24 |  |

## components/external-bracket-view.tsx

แสดงไฟล์สายที่ผู้จัดเผยแพร่ พร้อมทางเปิดเอกสาร/ภาพและสถานะของไฟล์

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/external-bracket-view.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/public-external-bracket.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-external-bracket.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ExternalBracketView](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/external-bracket-view.tsx:12>) | 12 |  |
| [formatDate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/external-bracket-view.tsx:64>) | 64 |  |
| [formatBytes](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/external-bracket-view.tsx:72>) | 72 |  |

## components/home-hero-image.tsx

แสดงภาพหลักหน้าแรกด้วยขนาดและการโหลดที่เหมาะกับพื้นที่แสดงผล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/home-hero-image.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/public-platform-accessibility.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-platform-accessibility.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [HomeHeroImage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/home-hero-image.tsx:9>) | 9 |  |

## components/organizer/bracket-mode-control.tsx

ให้ผู้จัดเลือกสายจากระบบหรือเอกสารภายนอก แล้วส่ง mode และ version ไป API

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-mode-control.tsx:1>)

ผู้เรียกในโครงการ: [components/organizer/bracket-workspace.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:1>), [components/organizer/external-bracket-workspace.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-workspace.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/external-bracket-workspace.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/external-bracket-workspace.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [BracketModeControl](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-mode-control.tsx:21>) | 21 |  |
| [selectMode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-mode-control.tsx:37>) | 37 | ส่งโหมดสายที่เลือกและ version ไป API เพื่อให้เซิร์ฟเวอร์ตรวจว่าเปลี่ยนได้หรือไม่ |

## components/organizer/bracket-preview.tsx

แสดงตัวอย่างโครงสร้างคู่แข่งขันที่จัดเตรียมไว้ก่อนหรือหลังเผยแพร่

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-preview.tsx:1>)

ผู้เรียกในโครงการ: [components/organizer/bracket-workspace.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [BracketPreview](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-preview.tsx:11>) | 11 |  |

## components/organizer/bracket-workspace.tsx

ควบคุมการตรึงทีม จัดลำดับ/สุ่ม สร้างตัวอย่าง และเผยแพร่สาย โดยแต่ละคำสั่งส่งไป API ของรายการ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/bracket-workspace.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/bracket-workspace.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [BracketWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:20>) | 20 |  |
| [mutate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:56>) | 56 | ตัวช่วยส่งคำสั่งจากพื้นที่สาย จัดการสถานะ pending และข้อความผิดพลาดร่วมกัน |
| [lockEntries](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:79>) | 79 | ส่งคำขอตรึงทีมที่ผ่านอนุมัติ เพื่อสร้างรายชื่อเริ่มต้นของสาย |
| [moveEntry](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:86>) | 86 | สลับตำแหน่งทีมใน state ของหน้าจอ; ยังไม่เขียนสายจริงจนกดสร้างสาย |
| [generateBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:96>) | 96 | ส่งลำดับทีมที่จัดเองหรือคำสั่งสุ่มไป API generate เพื่อสร้างสายฉบับร่าง |
| [publishBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:117>) | 117 | ส่งคำขอเผยแพร่สายฉบับร่างไป API publication แล้วโหลดสถานะล่าสุด |
| [StepNumber](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:302>) | 302 |  |

## components/organizer/external-bracket-preview.tsx

แสดงตัวอย่าง PDF/ภาพของเวอร์ชันไฟล์สายที่เลือก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-preview.tsx:1>)

ผู้เรียกในโครงการ: [components/organizer/external-bracket-workspace.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-workspace.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/external-bracket-workspace.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/external-bracket-workspace.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ExternalBracketPreview](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-preview.tsx:12>) | 12 |  |

## components/organizer/external-bracket-revision-list.tsx

แสดงประวัติไฟล์สายและคำสั่งเผยแพร่/เลิกใช้แต่ละเวอร์ชัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-revision-list.tsx:1>)

ผู้เรียกในโครงการ: [components/organizer/external-bracket-workspace.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-workspace.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/external-bracket-workspace.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/external-bracket-workspace.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ExternalBracketRevisionList](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-revision-list.tsx:23>) | 23 |  |
| [confirmAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-revision-list.tsx:38>) | 38 | ส่งคำสั่งที่ยืนยันแล้วสำหรับเวอร์ชันไฟล์ เช่น เผยแพร่หรือเลิกใช้ |
| [statusLabel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-revision-list.tsx:164>) | 164 |  |
| [formatDate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-revision-list.tsx:172>) | 172 |  |

## components/organizer/external-bracket-uploader.tsx

รับไฟล์สายและส่ง FormData ไป API อัปโหลด พร้อมสถานะรอและข้อผิดพลาด

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-uploader.tsx:1>)

ผู้เรียกในโครงการ: [components/organizer/external-bracket-workspace.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-workspace.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/external-bracket-workspace.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/external-bracket-workspace.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ExternalBracketUploader](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-uploader.tsx:22>) | 22 |  |
| [selectFile](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-uploader.tsx:35>) | 35 | เก็บไฟล์ที่ผู้ใช้เลือกและตรวจเงื่อนไขเบื้องต้นก่อนเปิดให้ส่งอัปโหลด |
| [upload](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-uploader.tsx:57>) | 57 | ส่งไฟล์สายและข้อมูลกำกับไป API อัปโหลด แล้วให้พื้นที่ทำงานโหลด revision ล่าสุด |

## components/organizer/external-bracket-workspace.tsx

ประกอบตัวอัปโหลด ตัวอย่าง และประวัติไฟล์สายให้เป็นพื้นที่ทำงานของผู้จัด

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-workspace.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/external-bracket-workspace.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/external-bracket-workspace.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ExternalBracketWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-workspace.tsx:15>) | 15 |  |

## components/organizer/external-match-editor.tsx

ฟอร์มเพิ่มคู่แข่งขันเองในโหมดไฟล์สาย พร้อมทีม รอบ ลำดับ วันเวลา และสนาม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-editor.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/schedule/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/external-match-editor.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/external-match-editor.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ExternalMatchEditor](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-editor.tsx:32>) | 32 |  |
| [submit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-editor.tsx:49>) | 49 | อ่านรอบ ลำดับ ทีม วันเวลา และสนามจากฟอร์ม แล้วส่งเพิ่มคู่แข่งขันโหมดไฟล์ไป API |
| [TeamCombobox](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-editor.tsx:184>) | 184 |  |

## components/organizer/external-match-purpose-control.tsx

เลือกว่าคู่แข่งขันเป็นคู่ทั่วไปหรือคู่ตัดสินอันดับ แล้วส่งคำขอแก้ไป API

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-purpose-control.tsx:1>)

ผู้เรียกในโครงการ: [components/organizer/match-result-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-result-editor.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/external-match-purpose-control.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/external-match-purpose-control.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ExternalMatchPurposeControl](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-purpose-control.tsx:30>) | 30 |  |
| [updatePurpose](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-purpose-control.tsx:47>) | 47 | ส่งชนิดคู่แข่งขันและ version ไป API purpose เพื่อให้เซิร์ฟเวอร์ตรวจและบันทึก |

## components/organizer/match-result-editor.tsx

รับคะแนนแต่ละคู่ แยกบันทึกร่างกับยืนยันผล และรีเฟรชข้อมูลเมื่อคำสั่งสำเร็จ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-result-editor.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/results/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/match-result-editor.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/match-result-editor.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [MatchResultEditor](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-result-editor.tsx:37>) | 37 |  |
| [submitResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-result-editor.tsx:49>) | 49 | ส่งคะแนนร่างหรือคำขอยืนยันผลตามปุ่มที่เลือก; ข้อกำหนดผลและการเลื่อนทีมตรวจซ้ำที่เซิร์ฟเวอร์ |

ชนิดข้อมูล/สัญญาที่ส่งออก: [EditableMatchResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-result-editor.tsx:20>)

## components/organizer/match-schedule-editor.tsx

แก้วันเวลาและสนามของคู่แข่งขัน พร้อมส่ง version และแสดงข้อผิดพลาดจากการตรวจตาราง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-schedule-editor.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/schedule/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/match-schedule-editor.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/match-schedule-editor.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [MatchScheduleEditor](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-schedule-editor.tsx:31>) | 31 |  |
| [saveMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-schedule-editor.tsx:43>) | 43 | ส่งเวลา สนาม และ version ไป API schedule แล้วสะท้อนผลกลับในแถวของคู่นั้น |

ชนิดข้อมูล/สัญญาที่ส่งออก: [EditableMatchSchedule](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-schedule-editor.tsx:18>)

## components/organizer/registration-review-list.tsx

แสดงใบสมัคร สมาชิกทีม และปุ่มอนุมัติ/ปฏิเสธ/ถอน โดยยืนยันคำสั่งและส่งเหตุผลไป API

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/registrations/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/registrations/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/registration-review-list.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/registration-review-list.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [RegistrationReviewList](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:49>) | 49 |  |
| [requestConfirmation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:73>) | 73 | ตรวจเหตุผลบนหน้าจอเมื่อจำเป็น แล้วเปิด dialog ยืนยันคำสั่งก่อนส่ง API |
| [submitConfirmation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:94>) | 94 |  |
| [ConfirmationDialog](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:324>) | 324 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [RegistrationReviewListItem](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:20>)

## components/organizer/registration-team-roster.tsx

แสดงรายชื่อผู้เล่นของทีมที่สมัคร พร้อมข้อมูลที่ผู้จัดใช้ตรวจทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-team-roster.tsx:1>)

ผู้เรียกในโครงการ: [components/organizer/registration-review-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [RegistrationTeamRoster](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-team-roster.tsx:9>) | 9 |  |

## components/organizer/tournament-competition-lifecycle-panel.tsx

แสดงความพร้อมและข้อที่ยังขาดก่อนเริ่มหรือจบรายการ แล้วส่งคำสั่งเมื่อยืนยัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-competition-lifecycle-panel.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/results/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/tournament-competition-lifecycle-panel.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/tournament-competition-lifecycle-panel.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentCompetitionLifecyclePanel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-competition-lifecycle-panel.tsx:28>) | 28 |  |
| [submitCommand](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-competition-lifecycle-panel.tsx:51>) | 51 | ส่งคำขอเริ่มหรือจบรายการไป API และแสดงเงื่อนไขที่เซิร์ฟเวอร์แจ้งว่ายังขาด |
| [isTournamentOperationStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-competition-lifecycle-panel.tsx:164>) | 164 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentCompetitionLifecyclePanelProps](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-competition-lifecycle-panel.tsx:19>)

## components/organizer/tournament-workflow-progress.tsx

แสดงความคืบหน้าของรายการและลิงก์ไปขั้นตอนที่ผู้จัดควรทำต่อ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-workflow-progress.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/registrations/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/registrations/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/results/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/schedule/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/tournament-workflow-progress.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/tournament-workflow-progress.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentWorkflowProgress](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-workflow-progress.tsx:32>) | 32 |  |
| [isTournamentOperationStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-workflow-progress.tsx:81>) | 81 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentWorkflowSection](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-workflow-progress.tsx:13>)

## components/province-combobox.tsx

ช่องเลือกจังหวัดแบบค้นหาได้จาก 77 จังหวัด โดยส่งรหัสจังหวัดในฟอร์มและควบคุมค่าที่เลือกด้วย state

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/province-combobox.tsx:1>)

ผู้เรียกในโครงการ: [components/admin/tournament-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:1>), [components/team/team-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:1>), [components/tournament-search-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-search-form.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/province-combobox.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/province-combobox.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ProvinceCombobox](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/province-combobox.tsx:39>) | 39 |  |
| [ProvinceComboboxControl](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/province-combobox.tsx:48>) | 48 |  |
| [formatProvinceLabel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/province-combobox.tsx:121>) | 121 |  |
| [matchesProvince](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/province-combobox.tsx:127>) | 127 |  |

## components/schedule-table.tsx

แสดงคู่แข่งขันตามวันเวลาและสนาม พร้อมทีมและข้อมูลผลที่มีอยู่

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/schedule-table.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/schedule/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/public-schedule-results.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-schedule-results.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [formatDate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/schedule-table.tsx:24>) | 24 |  |
| [formatTime](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/schedule-table.tsx:28>) | 28 |  |
| [formatScore](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/schedule-table.tsx:32>) | 32 |  |
| [ScheduleTable](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/schedule-table.tsx:36>) | 36 |  |

## components/site-header.tsx

แสดงแบรนด์ เมนูสาธารณะ ธีม และส่วนบัญชีตาม session สำหรับ desktop/mobile

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/site-header.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/layout.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/layout.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/interactive-accessibility.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/interactive-accessibility.test.tsx:1>), [tests/ui/public-navigation-prefetch.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-navigation-prefetch.test.tsx:1>), [tests/ui/site-header-session.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/site-header-session.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [SiteHeader](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/site-header.tsx:35>) | 35 |  |

## components/state-panel.tsx

ส่วนแสดงสถานะว่าง ไม่พบข้อมูล หรือข้อผิดพลาด พร้อมคำสั่งถัดไปเมื่อมี

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/state-panel.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>), [app/(public)/results/error.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/error.tsx:1>), [app/(public)/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/page.tsx:1>), [app/(public)/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/schedule/page.tsx:1>), [app/(public)/tournaments/\[slug\]/not-found.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/not-found.tsx:1>), [app/(public)/tournaments/error.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/error.tsx:1>), [app/(public)/tournaments/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/page.tsx:1>), [app/error.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/error.tsx:1>), [app/loading.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/loading.tsx:1>), [app/not-found.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/not-found.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [StatePanel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/state-panel.tsx:41>) | 41 |  |

## components/team/legacy-team-reconciliation-notice.tsx

แจ้งความต่างของสมาชิกเก่าที่ควรตรวจ โดยรับผลสรุปจาก use case และไม่แก้ข้อมูลเอง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/legacy-team-reconciliation-notice.tsx:1>)

ผู้เรียกในโครงการ: [components/team/team-workspace-manager.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-workspace-manager.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [LegacyTeamReconciliationNotice](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/legacy-team-reconciliation-notice.tsx:9>) | 9 |  |

## components/team/reusable-player-selector.tsx

ค้นหาและติ๊กเลือกผู้เล่นจากประวัติทีมของบัญชี เพื่อส่งรายชื่อที่เลือกให้ฟอร์มสร้างทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:1>)

ผู้เรียกในโครงการ: [components/team/team-creation-roster-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/reusable-player-selector.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/reusable-player-selector.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ReusablePlayerSelector](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:32>) | 32 |  |
| [updateSelection](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:48>) | 48 | ปรับชุดผู้เล่นที่เลือกและส่งผลกลับ component แม่ โดยยังไม่สร้างระเบียนในฐานข้อมูล |
| [togglePlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:82>) | 82 | เลือกหรือยกเลิกผู้เล่นหนึ่งคน พร้อมตรวจเพดานจำนวนที่เลือกได้ |
| [IndeterminateCheckbox](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:211>) | 211 | ตั้งสถานะ indeterminate ให้ checkbox เมื่อเลือกผู้เล่นเพียงบางคนในกลุ่ม |
| [matchesSearch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:240>) | 240 |  |
| [groupPlayersBySourceTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:250>) | 250 | จัดตัวเลือกผู้เล่นเป็นกลุ่มตามทีมต้นทางเพื่อให้ติ๊กเลือกทั้งกลุ่มได้ |
| [uniqueVisibleKeys](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:277>) | 277 | รวบรวมคีย์ผู้เล่นที่มองเห็นโดยตัดคนซ้ำจากหลายกลุ่มออก |
| [allKeysSelected](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:286>) | 286 | ตรวจว่าผู้เล่นทุกคนในกลุ่มถูกเลือกแล้ว เพื่อแสดง checkbox แบบเลือกครบ |
| [someKeysSelected](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:291>) | 291 | ตรวจว่ามีผู้เล่นบางคนถูกเลือก เพื่อแสดง checkbox แบบเลือกบางส่วน |
| [selectionLimitMessage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:296>) | 296 |  |
| [selectedKeySignature](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:300>) | 300 |  |
| [compareStrings](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:304>) | 304 |  |

## components/team/team-creation-roster-editor.tsx

จัดรายการผู้เล่นก่อนสร้างทีม ทั้งกรอกใหม่และเลือกจากประวัติ พร้อมจำกัดจำนวนตาม 5v5/3v3

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:1>)

ผู้เรียกในโครงการ: [components/team/team-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-creation-roster-editor.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-creation-roster-editor.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamCreationRosterEditor](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:36>) | 36 |  |
| [updateSelection](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:70>) | 70 | ปรับชุดผู้เล่นที่เลือกและส่งผลกลับ component แม่ โดยยังไม่สร้างระเบียนในฐานข้อมูล |
| [updateRow](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:103>) | 103 | อัปเดตข้อมูลแถวที่เลือกใน state และส่งค่ารวมกลับตาม callback ของฟอร์ม |
| [addManualRow](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:118>) | 118 | เพิ่มแถวกรอกผู้เล่นใหม่ในหน้าจอตามจำนวนที่ยังเพิ่มได้ |
| [createManualTeamCreationPlayerRow](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:241>) | 241 | สร้างค่าเริ่มต้นและคีย์ของแถวผู้เล่นที่กรอกเอง |
| [getSubmittableTeamCreationPlayerRows](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:246>) | 246 | เลือกแถวที่ควรส่งสร้างทีมและแปลงเป็นข้อมูลผู้เล่นสำหรับคำขอ |
| [validateTeamCreationPlayerRows](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:255>) | 255 | ตรวจข้อมูลและความซ้ำข้ามแถวก่อนส่งสร้างทีม เพื่อชี้ข้อผิดพลาดให้ถูกแถว |
| [hasCompleteValidIdentity](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:289>) | 289 |  |
| [normalizedIdentity](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:293>) | 293 |  |
| [validJerseyKey](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:301>) | 301 |  |
| [countBy](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:308>) | 308 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TeamCreationPlayerRow](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:29>)

## components/team/team-delete-dialog.tsx

ขอยืนยันชื่อทีมก่อนลบ/ปิดใช้งาน ส่ง version ไป API และแสดงผลตามวิธีที่เซิร์ฟเวอร์อนุญาต

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-delete-dialog.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/[id]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-delete-dialog.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-delete-dialog.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamDeleteDialog](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-delete-dialog.tsx:23>) | 23 |  |
| [updateOpen](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-delete-dialog.tsx:30>) | 30 |  |
| [removeTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-delete-dialog.tsx:37>) | 37 | ส่งชื่อยืนยันและ version ไป API ทีม แล้วนำทางตามผลลบหรือปิดใช้งานที่เซิร์ฟเวอร์คืน |

## components/team/team-editor.tsx

ฟอร์มสร้าง/แก้ทีมและแนบผู้เล่นเริ่มต้น ส่ง API แล้วคืนข้อมูลทีมล่าสุดให้พื้นที่จัดการ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/new/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/new/page.tsx:1>), [components/team/team-workspace-manager.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-workspace-manager.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-editor.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-editor.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamEditor](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:43>) | 43 |  |
| [handleSubmit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:95>) | 95 | อ่านข้อมูลทีมและรายชื่อเริ่มต้น แล้วส่งสร้าง/แก้ทีมผ่าน API; นำข้อผิดพลาดรายผู้เล่นกลับไปแสดงที่แถว |
| [applyServerPlayerIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:282>) | 282 | ผูกข้อผิดพลาดผู้เล่นจาก API กับตำแหน่งแถว/field ของฟอร์ม |
| [isTeamPlayerField](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:302>) | 302 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [EditableTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:31>)

## components/team/team-list.tsx

แสดงทีมของบัญชีพร้อมสถานะ รูปแบบการแข่งขัน และทางไปจัดการ/ค้นหารายการ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-list.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-list.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-list.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamList](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-list.tsx:20>) | 20 |  |

## components/team/team-player-batch-form.tsx

รับรายชื่อผู้เล่นหลายคน ตรวจข้อมูลเบื้องต้นและจำนวน แล้วส่งเพิ่มผู้เล่นเป็นชุด

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:1>)

ผู้เรียกในโครงการ: [components/team/team-player-roster.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-player-batch-form.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-player-batch-form.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamPlayerBatchForm](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:41>) | 41 |  |
| [updateRow](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:68>) | 68 | อัปเดตข้อมูลแถวที่เลือกใน state และส่งค่ารวมกลับตาม callback ของฟอร์ม |
| [showError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:78>) | 78 |  |
| [submitPlayers](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:84>) | 84 | ตรวจข้อมูลแต่ละแถวแล้วส่งชุดผู้เล่นไป API; ผูกข้อผิดพลาดที่เซิร์ฟเวอร์ระบุกลับกับแถวที่เกี่ยวข้อง |
| [createRows](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:250>) | 250 |  |
| [createRow](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:261>) | 261 |  |
| [isPlayerField](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:268>) | 268 |  |

## components/team/team-player-fields.tsx

ชุดช่องกรอกชื่อ วันเกิด เบอร์เสื้อ ตำแหน่ง และข้อมูลผู้เล่นที่ฟอร์มหลายหน้าร่วมใช้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:1>)

ผู้เรียกในโครงการ: [components/team/team-creation-roster-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:1>), [components/team/team-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:1>), [components/team/team-player-batch-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:1>), [components/team/team-player-roster.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-player-batch-form.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-player-batch-form.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamPlayerFields](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:34>) | 34 |  |
| [inputProps](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:49>) | 49 |  |
| [PlayerInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:138>) | 138 |  |
| [FieldError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:164>) | 164 |  |
| [createBlankPlayerValues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:172>) | 172 |  |
| [isBlankPlayerValues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:184>) | 184 |  |
| [validatePlayerValues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:189>) | 189 | ตรวจค่าในฟอร์มผู้เล่นและคืนข้อผิดพลาดรายช่องสำหรับแสดงข้าง input |
| [isIsoCalendarDate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:219>) | 219 | ตรวจว่าข้อความวันเกิดเป็นวันที่ปฏิทินที่มีอยู่จริงตามรูปแบบที่ระบบรับ |
| [playerDraftFromValues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:226>) | 226 | แปลงข้อความจาก input เป็นชนิดข้อมูลร่างผู้เล่น เช่น เบอร์เสื้อเป็นตัวเลขหรือ null |
| [playerValuesFromDraft](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:239>) | 239 | แปลงข้อมูลผู้เล่นกลับเป็นข้อความสำหรับเติมในช่อง input |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TeamPlayerFormValues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:17>), [TeamPlayerField](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:27>), [TeamPlayerFieldErrors](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:28>)

## components/team/team-player-roster.tsx

แสดงรายชื่อปัจจุบัน พร้อมเพิ่ม แก้ และนำผู้เล่นออกผ่าน API แล้วปรับรายการบนหน้าจอ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:1>)

ผู้เรียกในโครงการ: [components/team/team-workspace-manager.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-workspace-manager.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-player-roster.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-player-roster.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamPlayerRoster](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:36>) | 36 |  |
| [startEditing](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:59>) | 59 | คัดข้อมูลผู้เล่นที่เลือกมาเป็นค่าเริ่มต้นของฟอร์มแก้ไข |
| [updateEditValue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:67>) | 67 | แก้ค่า field ใน state ของฟอร์มผู้เล่น โดยยังไม่ส่งฐานข้อมูล |
| [savePlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:73>) | 73 | ส่งข้อมูลผู้เล่นที่แก้ไป API แล้วแทนที่ข้อมูลในรายชื่อด้วยค่าที่บันทึกสำเร็จ |
| [deactivatePlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:122>) | 122 | เรียก API นำผู้เล่นออก และปรับรายการปัจจุบันเมื่อเซิร์ฟเวอร์ตอบสำเร็จ |
| [playerDisplayName](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:300>) | 300 |  |
| [isPlayerField](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:304>) | 304 |  |

## components/team/team-registration-list.tsx

แสดงประวัติการสมัครของทีม สถานะ เหตุผล และคำสั่งยกเลิกที่ยังทำได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-registration-list.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/[id]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-list.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-list.test.tsx:1>), [tests/ui/team/team-registration-list.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-registration-list.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamRegistrationList](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-registration-list.tsx:26>) | 26 |  |
| [cancelRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-registration-list.tsx:71>) | 71 | ส่งคำขอยกเลิกใบสมัครไป API แล้วอัปเดตสถานะรายการบนหน้าจอ |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TeamRegistrationListItem](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-registration-list.tsx:17>)

## components/team/team-workspace-header.tsx

แสดงชื่อทีม รูปแบบ จำนวนผู้เล่น และลิงก์ที่เกี่ยวข้องในหัวพื้นที่ทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-workspace-header.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-discovery-link.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-discovery-link.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamWorkspaceHeader](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-workspace-header.tsx:11>) | 11 |  |

## components/team/team-workspace-manager.tsx

เก็บข้อมูลทีมล่าสุดร่วมกันระหว่างฟอร์มทีมกับรายชื่อผู้เล่น เพื่อใช้ข้อจำกัดรูปแบบทีมชุดเดียวกัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-workspace-manager.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/[id]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-list.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-list.test.tsx:1>), [tests/ui/team/team-workspace-manager.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-workspace-manager.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamWorkspaceManager](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-workspace-manager.tsx:18>) | 18 |  |

## components/theme-provider.tsx

เชื่อม next-themes ให้ component ใต้ต้นไม้เลือกธีมและอ่านค่าธีมร่วมกัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/theme-provider.tsx:1>)

ผู้เรียกในโครงการ: [app/layout.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/layout.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ThemeProvider](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/theme-provider.tsx:14>) | 14 |  |

## components/theme-toggle.tsx

ปุ่มเปลี่ยนธีมสว่าง/มืดโดยใช้สถานะจาก ThemeProvider

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/theme-toggle.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/layout.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/layout.tsx:1>), [components/site-header.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/site-header.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ThemeToggle](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/theme-toggle.tsx:23>) | 23 |  |

## components/tournament-row.tsx

แสดงข้อมูลรายการหนึ่งรายการและลิงก์รายละเอียดในผลค้นหา

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-row.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/page.tsx:1>), [app/(public)/tournaments/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/public-navigation-prefetch.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-navigation-prefetch.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentRow](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-row.tsx:23>) | 23 |  |

## components/tournament-search-form.tsx

ฟอร์มค้นหาชื่อ จังหวัด รูปแบบ รุ่นอายุ สนาม และวันที่ โดยเก็บเงื่อนไขผ่าน query string

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-search-form.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/page.tsx:1>), [app/(public)/tournaments/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/interactive-accessibility.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/interactive-accessibility.test.tsx:1>), [tests/ui/tournament-age-group-filter.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournament-age-group-filter.test.tsx:1>), [tests/ui/tournament-search-layout.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournament-search-layout.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentSearchForm](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-search-form.tsx:32>) | 32 |  |
| [handleSubmit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-search-form.tsx:36>) | 36 | อ่านตัวกรองแล้วเปลี่ยน URL การค้นหา เพื่อให้หน้าเซิร์ฟเวอร์โหลดผลตามค่าที่เลือก |

## components/tournaments/competition-result-summary.tsx

แสดงผู้ชนะ รองชนะเลิศ และสถานะความครบถ้วนของผลที่สรุปจากการแข่งขัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/competition-result-summary.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>), [app/(public)/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/page.tsx:1>), [app/(public)/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/schedule/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/public-schedule-results.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-schedule-results.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [CompetitionResultSummary](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/competition-result-summary.tsx:9>) | 9 |  |

## components/tournaments/tournament-document-list.tsx

แสดงรายการเอกสารแนบและลิงก์เปิดไฟล์ของรายการแข่งขัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-document-list.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/tournaments/\[slug\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/tournament-detail-media.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/tournament-detail-media.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentDocumentList](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-document-list.tsx:11>) | 11 |  |
| [formatFileSize](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-document-list.tsx:50>) | 50 |  |

## components/tournaments/tournament-poster.tsx

แสดงโปสเตอร์รายการตามข้อมูลภาพที่ได้รับ พร้อมการจัดขนาดให้พอดีกับพื้นที่

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-poster.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/tournaments/\[slug\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:1>), [components/admin/tournament-review-media.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-media.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/tournament-detail-media.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/tournament-detail-media.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentPoster](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-poster.tsx:9>) | 9 |  |

## components/tournaments/tournament-registration-action.tsx

ให้ผู้จัดการเลือกทีมที่พร้อมสมัคร ส่งคำขอสมัครรายการ และแสดงเหตุผลเมื่อยังสมัครไม่ได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-registration-action.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/tournaments/\[slug\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/tournament-registration-action.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/tournament-registration-action.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentRegistrationAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-registration-action.tsx:28>) | 28 |  |
| [TournamentRegistrationActionState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-registration-action.tsx:39>) | 39 |  |
| [submitRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-registration-action.tsx:83>) | 83 | ส่ง ID ทีมที่เลือกไป API สมัครของรายการ แล้วแสดงใบสมัคร/ข้อความผิดพลาดที่ตอบกลับ |
| [RegistrationAvailabilityMessage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-registration-action.tsx:173>) | 173 |  |

## components/ui/button.tsx

ห่อปุ่มพื้นฐานและรูปแบบที่ใช้ร่วมกัน ส่ง props และ event ให้ primitive โดยไม่มีตรรกะธุรกิจ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/button.tsx:1>)

ผู้เรียกในโครงการ: [app/(public)/results/error.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/error.tsx:1>), [app/(public)/tournaments/error.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/error.tsx:1>), [app/error.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/error.tsx:1>), [components/account-session-control.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/account-session-control.tsx:1>), [components/admin/match-result-correction-dialog.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/match-result-correction-dialog.tsx:1>), [components/admin/tournament-governance-dialog.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-dialog.tsx:1>), [components/auth/forgot-password-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/forgot-password-form.tsx:1>), [components/auth/login-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/login-form.tsx:1>), [components/auth/register-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/register-form.tsx:1>), [components/auth/reset-password-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/reset-password-form.tsx:1>), [components/organizer/bracket-workspace.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:1>), [components/organizer/external-bracket-revision-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-revision-list.tsx:1>), [components/organizer/external-bracket-uploader.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-uploader.tsx:1>), [components/organizer/external-match-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-editor.tsx:1>), [components/organizer/external-match-purpose-control.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-purpose-control.tsx:1>), [components/organizer/match-result-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-result-editor.tsx:1>), [components/organizer/match-schedule-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-schedule-editor.tsx:1>), [components/organizer/registration-review-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:1>), [components/organizer/tournament-competition-lifecycle-panel.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-competition-lifecycle-panel.tsx:1>), [components/site-header.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/site-header.tsx:1>), [components/team/team-creation-roster-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:1>), [components/team/team-delete-dialog.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-delete-dialog.tsx:1>), [components/team/team-player-batch-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:1>), [components/team/team-player-roster.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:1>), [components/team/team-registration-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-registration-list.tsx:1>), [components/theme-toggle.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/theme-toggle.tsx:1>), [components/tournament-search-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-search-form.tsx:1>), [components/tournaments/tournament-registration-action.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-registration-action.tsx:1>), [components/ui/sheet.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [Button](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/button.tsx:50>) | 50 |  |

## components/ui/input.tsx

ห่อช่องกรอกพื้นฐานให้ขนาด สี และสถานะ focus/disabled สอดคล้องกัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/input.tsx:1>)

ผู้เรียกในโครงการ: [components/admin/match-result-correction-dialog.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/match-result-correction-dialog.tsx:1>), [components/admin/tournament-governance-dialog.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-dialog.tsx:1>), [components/auth/forgot-password-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/forgot-password-form.tsx:1>), [components/auth/login-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/login-form.tsx:1>), [components/auth/register-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/register-form.tsx:1>), [components/auth/reset-password-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/reset-password-form.tsx:1>), [components/organizer/external-match-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-editor.tsx:1>), [components/organizer/match-result-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-result-editor.tsx:1>), [components/organizer/match-schedule-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-schedule-editor.tsx:1>), [components/organizer/registration-review-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:1>), [components/team/team-player-fields.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:1>), [components/tournament-search-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-search-form.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [Input](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/input.tsx:13>) | 13 |  |

## components/ui/select.tsx

ห่อ Base UI Select พร้อม trigger รายการตัวเลือก และส่วน popup สำหรับเลือกค่าจากชุดข้อมูล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:1>)

ผู้เรียกในโครงการ: [components/organizer/external-match-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-editor.tsx:1>), [components/organizer/external-match-purpose-control.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-purpose-control.tsx:1>), [components/tournament-search-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-search-form.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [SelectGroup](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:18>) | 18 |  |
| [SelectValue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:28>) | 28 |  |
| [SelectTrigger](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:38>) | 38 |  |
| [SelectContent](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:66>) | 66 |  |
| [SelectLabel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:105>) | 105 |  |
| [SelectItem](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:118>) | 118 |  |
| [SelectSeparator](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:146>) | 146 |  |
| [SelectScrollUpButton](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:159>) | 159 |  |
| [SelectScrollDownButton](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:178>) | 178 |  |

## components/ui/sheet.tsx

ห่อ dialog แบบเลื่อนจากขอบจอ ใช้กับเมนู/พื้นที่ควบคุมบนจอเล็ก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:1>)

ผู้เรียกในโครงการ: [components/site-header.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/site-header.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/interactive-accessibility.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/interactive-accessibility.test.tsx:1>), [tests/ui/public-platform-accessibility.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-platform-accessibility.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [Sheet](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:22>) | 22 |  |
| [SheetTrigger](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:26>) | 26 |  |
| [SheetClose](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:30>) | 30 |  |
| [SheetPortal](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:34>) | 34 |  |
| [SheetOverlay](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:38>) | 38 |  |
| [SheetContent](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:51>) | 51 |  |
| [SheetCloseButton](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:102>) | 102 |  |
| [SheetHeader](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:128>) | 128 |  |
| [SheetFooter](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:138>) | 138 |  |
| [SheetTitle](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:148>) | 148 |  |
| [SheetDescription](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:161>) | 161 |  |

## components/ui/tooltip.tsx

ห่อ Base UI Tooltip เพื่อแสดงชื่อหรือคำอธิบายปุ่มเมื่อชี้หรือโฟกัส

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/tooltip.tsx:1>)

ผู้เรียกในโครงการ: [components/team/team-player-roster.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:1>), [components/theme-provider.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/theme-provider.tsx:1>), [components/theme-toggle.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/theme-toggle.tsx:1>), [components/ui/sheet.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/interactive-accessibility.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/interactive-accessibility.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TooltipProvider](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/tooltip.tsx:14>) | 14 |  |
| [Tooltip](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/tooltip.tsx:27>) | 27 |  |
| [TooltipTrigger](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/tooltip.tsx:31>) | 31 |  |
| [TooltipContent](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/tooltip.tsx:35>) | 35 |  |

## components/workflow/workflow-next-action.tsx

แสดงสถานะ คำอธิบาย และปุ่มขั้นถัดไปจาก WorkflowGuidanceView

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/workflow/workflow-next-action.tsx:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/page.tsx:1>), [components/team/team-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-list.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/workflow/workflow-next-action.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/workflow/workflow-next-action.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [WorkflowNextAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/workflow/workflow-next-action.tsx:12>) | 12 |  |
