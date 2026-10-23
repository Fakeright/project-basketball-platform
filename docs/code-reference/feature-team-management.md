# ระบบ team-management

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## features/team-management/application/add-team-players.ts

เพิ่มผู้เล่นหลายคนในทีม ตรวจสิทธิ์ จำนวนสูงสุด และรายชื่อเดิม แล้วบันทึกผู้เล่นกับ audit ร่วมกัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/add-team-players.ts:1>)

ผู้เรียกในโครงการ: [app/api/teams/\[id\]/players/batch/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/batch/route.ts:1>), [features/team-management/presentation/team-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [addTeamPlayers](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/add-team-players.ts:22>) | 22 | ล็อกทีมก่อนตรวจผู้เล่นเดิมและจำนวน แล้วเพิ่ม/เปิดใช้ผู้เล่นพร้อมบันทึก audit ใน transaction เดียว |

ชนิดข้อมูล/สัญญาที่ส่งออก: [AddTeamPlayersInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/add-team-players.ts:16>)

## features/team-management/application/create-team.ts

สร้างทีมของผู้จัดการพร้อมรายชื่อเริ่มต้น ตรวจชื่อซ้ำในบัญชีและจำนวนผู้เล่นก่อนบันทึก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:1>)

ผู้เรียกในโครงการ: [app/api/teams/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/route.ts:1>), [features/team-management/application/update-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team.ts:1>), [features/team-management/presentation/team-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:39>) | 39 |  |
| [appendOverrideAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:86>) | 86 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [CreateTeamInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:27>), [CreateTeamResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:34>)

## features/team-management/application/deactivate-team-player.ts

นำผู้เล่นออกจากรายชื่อปัจจุบันโดยปิดสถานะ พร้อมเก็บประวัติการเปลี่ยนแปลง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/deactivate-team-player.ts:1>)

ผู้เรียกในโครงการ: [app/api/teams/\[id\]/players/\[playerId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/[playerId]/route.ts:1>), [features/team-management/presentation/team-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [deactivateTeamPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/deactivate-team-player.ts:22>) | 22 | ค้นผู้เล่นที่ยังใช้งานภายในทีมก่อนปิดสถานะ เพื่อเก็บประวัติโดยไม่ลบข้อมูลอ้างอิง |

ชนิดข้อมูล/สัญญาที่ส่งออก: [DeactivateTeamPlayerInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/deactivate-team-player.ts:15>)

## features/team-management/application/get-owned-team-workspace.ts

ประกอบข้อมูลทีม ผู้เล่น และข้อมูลสมาชิกเก่า หลังตรวจสิทธิ์เข้าถึงทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/get-owned-team-workspace.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/[id]/page.tsx:1>), [app/(admin)/team/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getOwnedTeamWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/get-owned-team-workspace.ts:28>) | 28 | ตรวจสิทธิ์แล้วประกอบทีม รายชื่อปัจจุบัน และข้อมูลเปรียบเทียบสมาชิกเดิมให้หน้า workspace |

ชนิดข้อมูล/สัญญาที่ส่งออก: [OwnedTeamWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/get-owned-team-workspace.ts:21>)

## features/team-management/application/legacy-team-reconciliation.ts

ตรวจความต่างระหว่างสมาชิกแบบเดิมกับรายชื่อผู้เล่นปัจจุบัน เพื่อแจ้งรายการที่ต้องทบทวน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/legacy-team-reconciliation.ts:1>)

ผู้เรียกในโครงการ: [components/team/legacy-team-reconciliation-notice.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/legacy-team-reconciliation-notice.tsx:1>), [components/team/team-workspace-manager.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-workspace-manager.tsx:1>), [features/team-management/application/get-owned-team-workspace.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/get-owned-team-workspace.ts:1>), [scripts/audit-legacy-team-members.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/scripts/audit-legacy-team-members.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/scripts/audit-legacy-team-members.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/scripts/audit-legacy-team-members.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [summarizeLegacyTeamReconciliation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/legacy-team-reconciliation.ts:26>) | 26 |  |
| [createLegacyTeamReconciliationAuditReport](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/legacy-team-reconciliation.ts:55>) | 55 |  |
| [listLegacyTeamReconciliations](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/legacy-team-reconciliation.ts:67>) | 67 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [LegacyTeamReconciliationIssue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/legacy-team-reconciliation.ts:12>), [LegacyTeamReconciliationSummary](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/legacy-team-reconciliation.ts:18>)

## features/team-management/application/list-owned-teams.ts

คืนเฉพาะรายการทีมของผู้จัดการที่มีสิทธิ์ใช้พื้นที่ทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/list-owned-teams.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/page.tsx:1>), [features/tournaments/application/get-tournament-registration-options.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-registration-options.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [listOwnedTeams](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/list-owned-teams.ts:15>) | 15 | ตรวจสิทธิ์พื้นที่ทีมก่อนค้นด้วย owner ID ของผู้ใช้ปัจจุบัน |

## features/team-management/application/list-reusable-team-players.ts

อ่านประวัติผู้เล่นในทีมของบัญชีเดียวกัน แล้วรวมรายชื่อซ้ำให้เลือกนำกลับมาใช้ได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/list-reusable-team-players.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/new/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/new/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [listReusableTeamPlayers](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/list-reusable-team-players.ts:17>) | 17 | อ่านประวัติจากทีมของบัญชีเดียวกันแล้วรวมผู้เล่นซ้ำก่อนส่งให้ช่องเลือกผู้เล่นเดิม |

## features/team-management/application/ports/admin-team-read-repository.ts

กำหนดข้อมูลรายชื่อทีม ผู้สร้าง และสมาชิกปัจจุบันที่แอดมินอ่านได้โดยไม่เปิดเผยเบอร์โทร

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/admin-team-read-repository.ts:1>)

ผู้เรียกในโครงการ: [features/team-management/application/read-admin-teams.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/read-admin-teams.ts:1>), [features/team-management/infrastructure/get-admin-team-read-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/get-admin-team-read-repository.ts:1>), [features/team-management/infrastructure/prisma-admin-team-read-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-admin-team-read-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/admin-team-read.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/admin-team-read.test.ts:1>), [tests/ui/admin/admin-team-pages.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/admin-team-pages.test.tsx:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [AdminTeamListItem](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/admin-team-read-repository.ts:12>), [AdminTeamPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/admin-team-read-repository.ts:22>), [AdminTeamDetail](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/admin-team-read-repository.ts:32>), [AdminTeamReadRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/admin-team-read-repository.ts:36>)

## features/team-management/application/ports/team-repository.ts

กำหนดสัญญาอ่าน/แก้ทีม ผู้เล่น ประวัติ และการล็อกข้อมูลที่ use case ใช้ผ่าน transaction

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/team-repository.ts:1>)

ผู้เรียกในโครงการ: [features/team-management/application/add-team-players.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/add-team-players.ts:1>), [features/team-management/application/create-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:1>), [features/team-management/application/deactivate-team-player.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/deactivate-team-player.ts:1>), [features/team-management/application/get-owned-team-workspace.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/get-owned-team-workspace.ts:1>), [features/team-management/application/legacy-team-reconciliation.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/legacy-team-reconciliation.ts:1>), [features/team-management/application/list-owned-teams.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/list-owned-teams.ts:1>), [features/team-management/application/list-reusable-team-players.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/list-reusable-team-players.ts:1>), [features/team-management/application/remove-or-deactivate-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/remove-or-deactivate-team.ts:1>), [features/team-management/application/update-team-player.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team-player.ts:1>), [features/team-management/application/update-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team.ts:1>), [features/team-management/infrastructure/get-team-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/get-team-repository.ts:1>), [features/team-management/infrastructure/prisma-team-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:1>), [features/tournaments/application/get-tournament-registration-options.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-registration-options.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/teams/team-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/teams/team-routes.test.ts:1>), [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>), [tests/features/tournaments/get-tournament-registration-options.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/get-tournament-registration-options.test.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [TeamRemovalContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/team-repository.ts:16>), [LegacyTeamReconciliationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/team-repository.ts:22>), [TeamMutationRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/team-repository.ts:35>), [TeamRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/team-repository.ts:86>)

## features/team-management/application/read-admin-teams.ts

ตรวจบทบาทแอดมินก่อนอ่านทีมทั้งหมดหรือสมาชิกปัจจุบันของทีมที่เลือก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/read-admin-teams.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/teams/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/teams/[id]/page.tsx:1>), [app/(admin)/admin/teams/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/teams/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/admin-team-read.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/admin-team-read.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [listAdminTeams](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/read-admin-teams.ts:18>) | 18 | ตรวจว่าเป็นแอดมินก่อนอ่านทีมทั้งหมดพร้อมชื่อผู้สร้าง |
| [getAdminTeamDetail](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/read-admin-teams.ts:27>) | 27 | ตรวจสิทธิ์แอดมินแล้วอ่านทีมและผู้เล่นปัจจุบันแบบอ่านอย่างเดียว |
| [assertAdminTeamAccess](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/read-admin-teams.ts:38>) | 38 |  |

## features/team-management/application/remove-or-deactivate-team.ts

ตรวจชื่อยืนยันและการอ้างอิงก่อนลบทีมที่ลบได้ หรือปิดใช้งานทีมที่ต้องเก็บประวัติ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/remove-or-deactivate-team.ts:1>)

ผู้เรียกในโครงการ: [app/api/teams/\[id\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/route.ts:1>), [features/team-management/presentation/team-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/teams/team-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/teams/team-routes.test.ts:1>), [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [removeOrDeactivateTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/remove-or-deactivate-team.ts:27>) | 27 | ยืนยันชื่อทีมและ version แล้วเลือกวิธีลบ/ปิดสถานะจากข้อมูลที่ยังอ้างอิงทีมอยู่ |

ชนิดข้อมูล/สัญญาที่ส่งออก: [RemoveOrDeactivateTeamInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/remove-or-deactivate-team.ts:13>), [RemoveOrDeactivateTeamResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/remove-or-deactivate-team.ts:20>)

## features/team-management/application/team-access.ts

รวมการตรวจสิทธิ์และเจ้าของทีม/รายชื่อผู้เล่น พร้อมคืนสัญญาณสำหรับ audit การทำแทนของแอดมิน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/team-access.ts:1>)

ผู้เรียกในโครงการ: [features/registrations/application/apply-to-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/apply-to-tournament.ts:1>), [features/registrations/application/cancel-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/cancel-registration.ts:1>), [features/registrations/application/list-owned-team-registrations.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/list-owned-team-registrations.ts:1>), [features/team-management/application/add-team-players.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/add-team-players.ts:1>), [features/team-management/application/deactivate-team-player.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/deactivate-team-player.ts:1>), [features/team-management/application/get-owned-team-workspace.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/get-owned-team-workspace.ts:1>), [features/team-management/application/remove-or-deactivate-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/remove-or-deactivate-team.ts:1>), [features/team-management/application/update-team-player.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team-player.ts:1>), [features/team-management/application/update-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [authorizeTeamAccess](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/team-access.ts:14>) | 14 | ตรวจเจ้าของและสิทธิ์คำสั่งก่อนคืนว่าครั้งนี้เป็นการทำแทนเจ้าของโดยแอดมินหรือไม่ |
| [authorizePlayerRosterAccess](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/team-access.ts:28>) | 28 |  |

## features/team-management/application/update-team-player.ts

แก้ข้อมูลผู้เล่นที่ยังอยู่ในทีม หลังตรวจเจ้าของและสถานะ แล้วเก็บ audit ก่อน/หลังแบบลดข้อมูลส่วนบุคคล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team-player.ts:1>)

ผู้เรียกในโครงการ: [app/api/teams/\[id\]/players/\[playerId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/[playerId]/route.ts:1>), [features/team-management/presentation/team-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [updateTeamPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team-player.ts:22>) | 22 | ตรวจทีมและผู้เล่นปัจจุบันก่อนเขียนค่าใหม่ พร้อม audit ที่ลดข้อมูลส่วนบุคคล |

ชนิดข้อมูล/สัญญาที่ส่งออก: [UpdateTeamPlayerInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team-player.ts:15>)

## features/team-management/application/update-team.ts

แก้ชื่อ จังหวัด และรูปแบบทีมโดยตรวจ version ชื่อซ้ำ จำนวนผู้เล่น และข้อจำกัดเมื่อมีใบสมัคร

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team.ts:1>)

ผู้เรียกในโครงการ: [app/api/teams/\[id\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/route.ts:1>), [features/team-management/presentation/team-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [updateTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team.ts:23>) | 23 | ตรวจ version ชื่อซ้ำ ใบสมัคร และจำนวนผู้เล่นก่อนเปลี่ยนข้อมูลทีม |

ชนิดข้อมูล/สัญญาที่ส่งออก: [UpdateTeamInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team.ts:17>)

## features/team-management/domain/team-player-audit.ts

เลือกเฉพาะข้อมูลที่จำเป็นสำหรับประวัติผู้เล่น และตรวจหา audit เก่าที่เก็บข้อมูลส่วนบุคคลเกินจำเป็น

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:1>)

ผู้เรียกในโครงการ: [features/team-management/application/add-team-players.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/add-team-players.ts:1>), [features/team-management/application/create-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:1>), [features/team-management/application/deactivate-team-player.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/deactivate-team-player.ts:1>), [features/team-management/application/update-team-player.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team-player.ts:1>), [scripts/audit-team-player-audit-pii.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/scripts/audit-team-player-audit-pii.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [projectTeamPlayerAuditSnapshot](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:53>) | 53 | เลือกเฉพาะฟิลด์ที่จำเป็นต่อ audit โดยไม่คัดลอกข้อมูลส่วนบุคคลทั้งระเบียน |
| [projectTeamPlayerBatchAuditSnapshot](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:66>) | 66 | สร้างประวัติแบบสรุปของชุดผู้เล่น รวม ID ที่เปิดกลับมาใช้ |
| [createTeamPlayerAuditPiiReport](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:77>) | 77 |  |
| [findTeamPlayerPiiKeys](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:105>) | 105 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TeamPlayerAuditSnapshot](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:9>), [TeamPlayerBatchAuditSnapshot](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:17>), [StoredTeamPlayerAuditEvent](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:23>), [TeamPlayerAuditPiiFinding](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:30>), [TeamPlayerAuditPiiReport](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:37>)

## features/team-management/domain/team-player-batch-policy.ts

ตรวจชุดผู้เล่นและเบอร์เสื้อไม่ซ้ำ; ทีม 5v5 ไม่เกิน 15 คน และ 3v3 ไม่เกิน 4 คน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-batch-policy.ts:1>)

ผู้เรียกในโครงการ: [components/team/team-creation-roster-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:1>), [components/team/team-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:1>), [components/team/team-player-batch-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:1>), [components/team/team-player-roster.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:1>), [features/team-management/application/add-team-players.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/add-team-players.ts:1>), [features/team-management/application/create-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:1>), [features/team-management/application/update-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team.ts:1>), [features/team-management/presentation/team-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-policy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getMaximumTeamPlayerCount](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-batch-policy.ts:12>) | 12 | คืนเพดานผู้เล่นตามรูปแบบทีม: 5v5 ได้ 15 คน และ 3v3 ได้ 4 คน |
| [assertTeamPlayerBatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-batch-policy.ts:23>) | 23 | ตรวจจำนวนผู้เล่น รวมกับสมาชิกเดิมเมื่อมี และตรวจตัวตน/เบอร์เสื้อซ้ำภายในชุดที่ส่งมา |
| [normalizedPlayerIdentity](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-batch-policy.ts:54>) | 54 | รวมชื่อ นามสกุล และวันเกิดเป็นคีย์เปรียบเทียบคนเดิม โดยตัดช่องว่างหัวท้ายและไม่แยกตัวพิมพ์ |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TeamPlayerBatchOptions](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-batch-policy.ts:16>)

## features/team-management/domain/team-player-history.ts

รวมผู้เล่นคนเดิมจากหลายทีมด้วยชื่อ นามสกุล วันเกิด และเลือกข้อมูลล่าสุดเพื่อใช้สร้างทีมใหม่

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-history.ts:1>)

ผู้เรียกในโครงการ: [components/team/reusable-player-selector.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/reusable-player-selector.tsx:1>), [components/team/team-creation-roster-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:1>), [components/team/team-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:1>), [features/team-management/application/list-reusable-team-players.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/list-reusable-team-players.ts:1>), [features/team-management/application/ports/team-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/team-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-player-history.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-player-history.test.ts:1>), [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>), [tests/ui/team/reusable-player-selector.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/reusable-player-selector.test.tsx:1>), [tests/ui/team/team-creation-roster-editor.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-creation-roster-editor.test.tsx:1>), [tests/ui/team/team-editor.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-editor.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [projectReusableTeamPlayers](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-history.ts:32>) | 32 | จัดกลุ่มคนเดิมจากชื่อ/นามสกุล/วันเกิด แล้วเลือกข้อมูลล่าสุดและรวมทีมต้นทาง |
| [normalizedPlayerIdentity](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-history.ts:58>) | 58 | รวมชื่อ นามสกุล และวันเกิดเป็นคีย์เปรียบเทียบคนเดิม โดยตัดช่องว่างหัวท้ายและไม่แยกตัวพิมพ์ |
| [compareCanonicalSources](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-history.ts:67>) | 67 | เลือกระเบียนที่แก้ไขล่าสุดก่อน และใช้ ID ตัดสินเมื่อลำดับเวลาเท่ากันเพื่อให้ผลคงที่ |
| [projectPlayerHistoryGroup](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-history.ts:78>) | 78 | แปลงกลุ่มประวัติของคนเดียวให้เหลือหนึ่งตัวเลือก พร้อมรายชื่อทีมต้นทาง |
| [compareStrings](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-history.ts:112>) | 112 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TeamPlayerHistorySource](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-history.ts:9>), [ReusableTeamPlayerSourceTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-history.ts:13>), [ReusableTeamPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-history.ts:19>)

## features/team-management/domain/team-policy.ts

ตรวจจำนวนและสถานะผู้เล่นขั้นต่ำที่ทีมต้องมีเมื่อสมัครรายการ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-policy.ts:1>)

ผู้เรียกในโครงการ: [features/registrations/application/ports/registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:1>), [features/registrations/domain/registration-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:1>), [features/team-management/presentation/team-workflow-guidance.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-workflow-guidance.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-policy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getMinimumRosterSize](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-policy.ts:16>) | 16 |  |
| [assertRosterEligibility](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-policy.ts:21>) | 21 | ตรวจรายชื่อที่ใช้สมัครว่าผ่านจำนวนขั้นต่ำและสถานะผู้เล่นตามรูปแบบทีม |
| [assertMinimumActivePlayerCount](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-policy.ts:32>) | 32 | ตรวจจำนวนผู้เล่นที่ยังใช้งานว่าพอสำหรับส่งสมัครตามรูปแบบทีม |

ชนิดข้อมูล/สัญญาที่ส่งออก: [RosterFormat](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-policy.ts:9>)

## features/team-management/domain/team.ts

กำหนดรูปแบบทีม ตำแหน่งผู้เล่น ข้อมูลทีม และข้อมูลผู้เล่นแบบร่าง/ที่บันทึกแล้ว

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team.ts:1>)

ผู้เรียกในโครงการ: [components/team/team-creation-roster-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-creation-roster-editor.tsx:1>), [components/team/team-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:1>), [components/team/team-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-list.tsx:1>), [components/team/team-player-batch-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-batch-form.tsx:1>), [components/team/team-player-fields.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-fields.tsx:1>), [components/team/team-player-roster.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-player-roster.tsx:1>), [components/team/team-workspace-manager.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-workspace-manager.tsx:1>), [features/registrations/application/ports/registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:1>), [features/registrations/domain/player-age-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:1>), [features/registrations/domain/registration-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:1>), [features/registrations/infrastructure/prisma-registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:1>), [features/team-management/application/add-team-players.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/add-team-players.ts:1>), [features/team-management/application/create-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:1>), [features/team-management/application/deactivate-team-player.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/deactivate-team-player.ts:1>), [features/team-management/application/get-owned-team-workspace.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/get-owned-team-workspace.ts:1>), [features/team-management/application/list-owned-teams.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/list-owned-teams.ts:1>), [features/team-management/application/ports/admin-team-read-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/admin-team-read-repository.ts:1>), [features/team-management/application/ports/team-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/team-repository.ts:1>), [features/team-management/application/team-access.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/team-access.ts:1>), [features/team-management/application/update-team-player.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team-player.ts:1>), [features/team-management/application/update-team.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/update-team.ts:1>), [features/team-management/domain/team-player-audit.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-audit.ts:1>), [features/team-management/domain/team-player-batch-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-batch-policy.ts:1>), [features/team-management/domain/team-player-history.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-history.ts:1>), [features/team-management/domain/team-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-policy.ts:1>), [features/team-management/infrastructure/prisma-team-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:1>), [features/team-management/presentation/team-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:1>), [features/team-management/presentation/team-workflow-guidance.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-workflow-guidance.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/registrations/player-age-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/player-age-policy.test.ts:1>), [tests/features/registrations/registration-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/registration-policy.test.ts:1>), [tests/features/team-management/team-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-policy.test.ts:1>), [tests/features/team-management/team-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-use-cases.test.ts:1>), [tests/ui/team/team-creation-roster-editor.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-creation-roster-editor.test.tsx:1>), [tests/ui/team/team-player-roster.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-player-roster.test.tsx:1>), [tests/ui/team/team-workspace-manager.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-workspace-manager.test.tsx:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [TeamFormat](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team.ts:7>), [TeamPlayerPosition](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team.ts:9>), [TeamSummary](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team.ts:11>), [TeamPlayerDraft](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team.ts:23>), [TeamPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team.ts:33>)

## features/team-management/infrastructure/get-admin-team-read-repository.ts

ประกอบ Prisma adapter สำหรับให้แอดมินอ่านรายชื่อทีมและสมาชิก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/get-admin-team-read-repository.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/teams/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/teams/[id]/page.tsx:1>), [app/(admin)/admin/teams/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/teams/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getAdminTeamReadRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/get-admin-team-read-repository.ts:15>) | 15 |  |

## features/team-management/infrastructure/get-team-repository.ts

ประกอบ Prisma repository สำหรับทีมและรายชื่อผู้เล่น

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/get-team-repository.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/[id]/page.tsx:1>), [app/(admin)/team/new/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/new/page.tsx:1>), [app/(admin)/team/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/page.tsx:1>), [app/(public)/tournaments/\[slug\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:1>), [app/api/teams/\[id\]/players/\[playerId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/[playerId]/route.ts:1>), [app/api/teams/\[id\]/players/batch/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/batch/route.ts:1>), [app/api/teams/\[id\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getTeamRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/get-team-repository.ts:15>) | 15 |  |

## features/team-management/infrastructure/prisma-admin-team-read-repository.ts

อ่านทีม ผู้สร้าง และสมาชิกปัจจุบันผ่าน Prisma โดยเลือกเฉพาะฟิลด์ที่หน้าแอดมินต้องแสดง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-admin-team-read-repository.ts:1>)

ผู้เรียกในโครงการ: [features/team-management/infrastructure/get-admin-team-read-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/get-admin-team-read-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/prisma-admin-team-read-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/prisma-admin-team-read-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PrismaAdminTeamReadRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-admin-team-read-repository.ts:15>) | 15 |  |
| [listAll](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-admin-team-read-repository.ts:18>) | 18 |  |
| [findById](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-admin-team-read-repository.ts:39>) | 39 |  |

## features/team-management/infrastructure/prisma-team-repository.ts

เก็บทีมและผู้เล่นผ่าน Prisma พร้อมล็อกแถว ตรวจชื่อ/เบอร์เสื้อซ้ำ version และ audit

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:1>)

ผู้เรียกในโครงการ: [app/api/teams/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/route.ts:1>), [features/team-management/infrastructure/get-team-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/get-team-repository.ts:1>), [scripts/audit-legacy-team-members.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/scripts/audit-legacy-team-members.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/prisma-team-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/prisma-team-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PrismaTeamRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:44>) | 44 |  |
| [inTransaction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:52>) | 52 | ส่ง adapter ที่ผูกกับ transaction ให้ use case เพื่อรวมการอ่าน/เขียนที่ต้องสำเร็จหรือย้อนกลับพร้อมกัน |
| [create](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:60>) | 60 |  |
| [findByIdForUpdate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:65>) | 65 | ล็อกแถวก่อนอ่านข้อมูลที่กำลังจะเปลี่ยน เพื่อให้คำสั่งที่แก้ระเบียนเดียวกันรอกัน |
| [hasActiveNameConflict](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:70>) | 70 | ตรวจชื่อที่ normalize แล้วในขอบเขตเจ้าของทีมหรือรายการ โดยไม่นับระเบียนที่ไม่อยู่ในสถานะใช้งาน |
| [findById](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:74>) | 74 |  |
| [listByOwner](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:82>) | 82 |  |
| [listPlayerHistoryByOwner](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:91>) | 91 |  |
| [listLegacyReconciliationContexts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:103>) | 103 |  |
| [update](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:179>) | 179 |  |
| [hasActiveRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:186>) | 186 |  |
| [getRemovalContextForUpdate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:190>) | 190 |  |
| [deleteTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:194>) | 194 |  |
| [deactivateTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:198>) | 198 |  |
| [listActivePlayers](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:202>) | 202 |  |
| [findExistingPlayersByIdentities](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:206>) | 206 |  |
| [addPlayers](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:213>) | 213 |  |
| [updatePlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:220>) | 220 |  |
| [deactivatePlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:228>) | 228 |  |
| [appendAuditEvent](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:233>) | 233 | เก็บผู้กระทำ คำสั่ง และข้อมูลก่อน/หลังที่จำเป็นไว้ตรวจสอบย้อนหลัง |
| [legacyMemberCount](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:240>) | 240 |  |
| [PrismaTeamMutationRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:254>) | 254 |  |
| [hasActiveNameConflict](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:258>) | 258 | ตรวจชื่อที่ normalize แล้วในขอบเขตเจ้าของทีมหรือรายการ โดยไม่นับระเบียนที่ไม่อยู่ในสถานะใช้งาน |
| [findByIdForUpdate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:280>) | 280 | ล็อกแถวก่อนอ่านข้อมูลที่กำลังจะเปลี่ยน เพื่อให้คำสั่งที่แก้ระเบียนเดียวกันรอกัน |
| [create](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:298>) | 298 |  |
| [update](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:306>) | 306 |  |
| [hasActiveRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:325>) | 325 |  |
| [getRemovalContextForUpdate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:333>) | 333 |  |
| [deleteTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:351>) | 351 |  |
| [deactivateTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:355>) | 355 |  |
| [listActivePlayers](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:374>) | 374 |  |
| [findExistingPlayersByIdentities](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:382>) | 382 |  |
| [addPlayers](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:402>) | 402 |  |
| [updatePlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:410>) | 410 |  |
| [deactivatePlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:430>) | 430 |  |
| [addPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:442>) | 442 |  |
| [appendAuditEvent](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:481>) | 481 | เก็บผู้กระทำ คำสั่ง และข้อมูลก่อน/หลังที่จำเป็นไว้ตรวจสอบย้อนหลัง |
| [mapTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:498>) | 498 | แปลงข้อมูลที่อ่านจากฐานข้อมูลเป็นรูปแบบทีมที่ application และ UI ใช้ |
| [mapPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:513>) | 513 | แปลงแถวผู้เล่นเป็นข้อมูล domain รวมรูปแบบวันที่และค่าที่เว้นว่างได้ |
| [playerData](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:531>) | 531 |  |
| [optionalPlayerData](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:540>) | 540 |  |
| [toDateOnly](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:549>) | 549 |  |
| [createRegistrationStatusCounts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:553>) | 553 |  |
| [toJsonValue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:560>) | 560 | แปลงข้อมูลให้เก็บในช่อง JSON ของ Prisma ได้ เช่น snapshot ใน audit |
| [isPrismaUniqueError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:565>) | 565 |  |
| [mapPlayerUniqueError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:569>) | 569 |  |
| [getPrismaConstraintTarget](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:585>) | 585 |  |

## features/team-management/presentation/team-handler.ts

ตรวจ JSON และข้อมูลฟอร์มทีม/ผู้เล่นด้วย Zod ก่อนเรียก use case และคืนข้อความผิดพลาดภาษาไทย

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/teams/\[id\]/players/\[playerId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/[playerId]/route.ts:1>), [app/api/teams/\[id\]/players/batch/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/batch/route.ts:1>), [app/api/teams/\[id\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/route.ts:1>), [app/api/teams/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/teams/team-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/teams/team-routes.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [handleCreateTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:140>) | 140 |  |
| [handleUpdateTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:171>) | 171 |  |
| [handleAddTeamPlayers](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:196>) | 196 |  |
| [handleUpdateTeamPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:221>) | 221 |  |
| [handleDeactivateTeamPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:250>) | 250 |  |
| [handleRemoveOrDeactivateTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:272>) | 272 |  |
| [unauthorizedResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:303>) | 303 |  |
| [validationResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:307>) | 307 |  |
| [teamRemovalValidationResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:311>) | 311 |  |
| [playerValidationResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:318>) | 318 |  |
| [playerFieldMessage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:340>) | 340 |  |
| [teamFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:369>) | 369 |  |

## features/team-management/presentation/team-workflow-guidance.ts

สร้างสถานะและคำแนะนำขั้นถัดไปของทีมจากจำนวนผู้เล่นและสถานะทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-workflow-guidance.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/team-management/team-workflow-guidance.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/team-management/team-workflow-guidance.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createTeamWorkflowGuidance](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-workflow-guidance.ts:39>) | 39 |  |
| [incompleteRosterGuidance](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-workflow-guidance.ts:60>) | 60 |  |
| [pendingRegistrationGuidance](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-workflow-guidance.ts:72>) | 72 |  |
| [approvedTournamentGuidance](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-workflow-guidance.ts:84>) | 84 |  |
| [publicTournamentGuidance](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-workflow-guidance.ts:123>) | 123 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TeamWorkflowGuidanceInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-workflow-guidance.ts:13>)
