# ระบบ tournament-operations

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## features/tournament-operations/application/create-tournament.ts

ตรวจจังหวัดและข้อมูลรายการ แล้วสร้างฉบับร่างหรือแก้ข้อมูลตามสิทธิ์เจ้าของและ version

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:1>)

ผู้เรียกในโครงการ: [features/admin/presentation/save-tournament-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/save-tournament-handler.ts:1>), [features/admin/presentation/submit-tournament-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/submit-tournament-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-operations/review-tournament.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/review-tournament.test.ts:1>), [tests/features/tournament-operations/tournament-workflow.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-workflow.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:17>) | 17 |  |
| [updateTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:32>) | 32 |  |
| [submitTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:59>) | 59 |  |

## features/tournament-operations/application/govern-tournament.ts

ดำเนินคำสั่งกำกับรายการของแอดมิน เช่น ระงับ เปิดกลับ เก็บถาวร หรือลบ ตามกฎและเหตุผล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/govern-tournament.ts:1>)

ผู้เรียกในโครงการ: [features/tournament-operations/presentation/tournament-governance-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-operations/govern-tournament.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/govern-tournament.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [governTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/govern-tournament.ts:49>) | 49 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentGovernanceCommand](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/govern-tournament.ts:19>)

## features/tournament-operations/application/list-owned-tournament-workflows.ts

อ่านรายการของผู้จัดพร้อมข้อมูลความพร้อม เพื่อแสดงสถานะและขั้นตอนถัดไป

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/list-owned-tournament-workflows.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-operations/list-owned-tournament-workflows.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/list-owned-tournament-workflows.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [listOwnedTournamentWorkflows](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/list-owned-tournament-workflows.ts:23>) | 23 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [OwnedTournamentWorkflowItem](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/list-owned-tournament-workflows.ts:18>)

## features/tournament-operations/application/review-tournament.ts

ตรวจสิทธิ์แอดมินและสถานะส่งตรวจ ก่อนบันทึกผลอนุมัติ ขอแก้ไข หรือปฏิเสธพร้อมเหตุผล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/review-tournament.ts:1>)

ผู้เรียกในโครงการ: [features/admin/presentation/review-tournament-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/review-tournament-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-operations/review-tournament.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/review-tournament.test.ts:1>), [tests/features/tournament-operations/tournament-workflow.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-workflow.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [reviewTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/review-tournament.ts:15>) | 15 |  |

## features/tournament-operations/application/transition-tournament-competition.ts

เริ่มหรือจบการแข่งขันหลังตรวจความพร้อมของสาย ตาราง ผล และสิทธิ์ผู้ดำเนินการ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-competition.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/complete/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/complete/route.ts:1>), [app/api/organizer/tournaments/\[id\]/start/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/start/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-operations/tournament-competition-lifecycle.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-competition-lifecycle.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [startTournamentCompetition](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-competition.ts:28>) | 28 |  |
| [completeTournamentCompetition](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-competition.ts:43>) | 43 |  |
| [transitionTournamentCompetition](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-competition.ts:58>) | 58 |  |

## features/tournament-operations/application/transition-tournament-lifecycle.ts

ประสานส่งตรวจ เผยแพร่ และปิดรับสมัคร โดยตรวจสิทธิ์และสถานะรายการก่อนบันทึก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-lifecycle.ts:1>)

ผู้เรียกในโครงการ: [features/admin/presentation/tournament-lifecycle-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-lifecycle-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-operations/tournament-lifecycle.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-lifecycle.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [publishTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-lifecycle.ts:23>) | 23 |  |
| [closeTournamentRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-lifecycle.ts:42>) | 42 |  |
| [loadAuthorizedTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-lifecycle.ts:60>) | 60 |  |
| [isAdminOverride](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-lifecycle.ts:75>) | 75 |  |

## features/tournament-operations/domain/tournament-age-group.ts

กำหนดรุ่น U12, U14, U16, U18, U23 และ Open ให้ฟอร์มกับการค้นหาใช้ชุดเดียวกัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-age-group.ts:1>)

ผู้เรียกในโครงการ: [components/admin/tournament-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:1>), [components/tournament-search-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-search-form.tsx:1>), [features/admin/presentation/tournament-editor-schema.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-schema.ts:1>), [features/registrations/domain/player-age-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:1>), [features/tournament-operations/domain/tournament-workflow.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-workflow.ts:1>), [features/tournaments/presentation/tournament-search-params.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-search-params.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [isTournamentAgeGroup](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-age-group.ts:20>) | 20 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentAgeGroup](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-age-group.ts:16>)

## features/tournament-operations/domain/tournament-capacity.ts

กำหนดตัวเลือกจำนวนทีมปัจจุบันและการรองรับค่าจำนวนทีมของข้อมูลเดิม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-capacity.ts:1>)

ผู้เรียกในโครงการ: [components/admin/tournament-capacity-field.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-capacity-field.tsx:1>), [features/admin/presentation/tournament-editor-schema.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-schema.ts:1>), [features/competition/infrastructure/prisma-competition-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1>), [features/tournament-operations/domain/tournament-workflow.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-workflow.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [isValidTournamentCapacity](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-capacity.ts:11>) | 11 |  |
| [isLegacyTournamentCapacity](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-capacity.ts:15>) | 15 |  |

## features/tournament-operations/domain/tournament-governance-policy.ts

รวมกฎกำกับรายการ ระงับ คืนสถานะ เก็บถาวร และลบ โดยคืนเหตุผลที่ยังทำคำสั่งไม่ได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/page.tsx:1>), [components/admin/tournament-governance-dialog.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-governance-dialog.tsx:1>), [features/competition/application/correct-match-result.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/correct-match-result.ts:1>), [features/competition/application/create-external-match.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/create-external-match.ts:1>), [features/competition/application/external-bracket-access.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/external-bracket-access.ts:1>), [features/competition/application/generate-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/generate-bracket.ts:1>), [features/competition/application/lock-bracket-entries.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/lock-bracket-entries.ts:1>), [features/competition/application/match-result-access.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/match-result-access.ts:1>), [features/competition/application/ports/competition-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:1>), [features/competition/application/ports/external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:1>), [features/competition/application/publish-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-bracket.ts:1>), [features/competition/application/schedule-match.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/schedule-match.ts:1>), [features/competition/application/update-external-match-purpose.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/update-external-match-purpose.ts:1>), [features/competition/domain/competition.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/competition.ts:1>), [features/competition/infrastructure/development-external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:1>), [features/registrations/application/apply-to-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/apply-to-tournament.ts:1>), [features/registrations/application/cancel-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/cancel-registration.ts:1>), [features/registrations/application/decide-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/decide-registration.ts:1>), [features/registrations/application/ports/registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:1>), [features/registrations/application/withdraw-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/withdraw-registration.ts:1>), [features/tournament-media/application/authorize-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/authorize-tournament-media.ts:1>), [features/tournament-operations/application/create-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:1>), [features/tournament-operations/application/govern-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/govern-tournament.ts:1>), [features/tournament-operations/application/review-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/review-tournament.ts:1>), [features/tournament-operations/application/transition-tournament-competition.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-competition.ts:1>), [features/tournament-operations/application/transition-tournament-lifecycle.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-lifecycle.ts:1>), [features/tournament-operations/domain/tournament-operation.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-operation.ts:1>), [features/tournament-operations/infrastructure/development-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/prisma-tournament-governance-lock.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-governance-lock.ts:1>), [features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:1>), [features/tournament-operations/presentation/organizer-workflow-guidance.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/organizer-workflow-guidance.ts:1>), [features/tournament-operations/presentation/tournament-governance-error-response.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-error-response.ts:1>), [features/tournaments/infrastructure/mock-tournament-data.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-data.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-media.test.ts:1>), [tests/api/competition/competition-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/competition/competition-routes.test.ts:1>), [tests/api/competition/external-bracket-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/competition/external-bracket-routes.test.ts:1>), [tests/api/competition/tournament-competition-lifecycle-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/competition/tournament-competition-lifecycle-routes.test.ts:1>), [tests/api/registrations/organizer-registration-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/registrations/organizer-registration-routes.test.ts:1>), [tests/features/competition/external-bracket-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-bracket-use-cases.test.ts:1>), [tests/features/tournament-media/upload-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/upload-tournament-media.test.ts:1>), [tests/features/tournament-operations/govern-tournament.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/govern-tournament.test.ts:1>), [tests/features/tournament-operations/tournament-governance-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-governance-policy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentGovernancePolicyError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:58>) | 58 |  |
| [getTournamentGovernanceIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:68>) | 68 |  |
| [getTournamentGovernanceReasonIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:90>) | 90 |  |
| [assertTournamentGovernanceAllowsOperation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:99>) | 99 |  |
| [getSuspendIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:110>) | 110 |  |
| [getResumeIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:118>) | 118 |  |
| [getRemoveIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:131>) | 131 |  |
| [getArchiveIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:139>) | 139 |  |
| [getReopenRegistrationIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:147>) | 147 |  |
| [getPermanentDeleteIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:167>) | 167 |  |
| [getGovernanceStateIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:184>) | 184 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentGovernanceStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:9>), [TournamentGovernanceAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:11>), [TournamentGovernanceContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:19>), [TournamentGovernanceIssueCode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:39>)

## features/tournament-operations/domain/tournament-operation.ts

กำหนดข้อมูลรายการฝั่งจัดการ สถานะการตรวจ และชนิดเหตุการณ์ที่เก็บใน audit

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-operation.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/page.tsx:1>), [app/(admin)/admin/tournaments/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/page.tsx:1>), [components/admin/tournament-lifecycle-actions.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-lifecycle-actions.tsx:1>), [components/organizer/tournament-workflow-progress.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-workflow-progress.tsx:1>), [features/tournament-media/application/get-admin-review-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-admin-review-media.ts:1>), [features/tournament-media/application/get-public-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-public-tournament-media.ts:1>), [features/tournament-operations/application/create-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:1>), [features/tournament-operations/application/govern-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/govern-tournament.ts:1>), [features/tournament-operations/application/list-owned-tournament-workflows.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/list-owned-tournament-workflows.ts:1>), [features/tournament-operations/application/review-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/review-tournament.ts:1>), [features/tournament-operations/application/transition-tournament-competition.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-competition.ts:1>), [features/tournament-operations/application/transition-tournament-lifecycle.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-lifecycle.ts:1>), [features/tournament-operations/domain/tournament-governance-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-governance-policy.ts:1>), [features/tournament-operations/domain/tournament-workflow.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-workflow.ts:1>), [features/tournament-operations/infrastructure/development-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:1>), [features/tournament-operations/presentation/organizer-workflow-guidance.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/organizer-workflow-guidance.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-media/get-public-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/get-public-tournament-media.test.ts:1>), [tests/features/tournament-media/upload-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/upload-tournament-media.test.ts:1>), [tests/features/tournament-operations/list-owned-tournament-workflows.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/list-owned-tournament-workflows.test.ts:1>), [tests/features/tournament-operations/tournament-competition-lifecycle.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-competition-lifecycle.test.ts:1>), [tests/features/tournament-operations/tournament-lifecycle.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-lifecycle.test.ts:1>), [tests/fixtures/tournament-operation.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/fixtures/tournament-operation.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentOperationStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-operation.ts:10>), [ReviewDecision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-operation.ts:23>), [TournamentOperationInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-operation.ts:25>), [TournamentOperation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-operation.ts:39>), [TournamentReviewInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-operation.ts:53>), [TournamentAuditAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-operation.ts:59>)

## features/tournament-operations/domain/tournament-workflow.ts

ตรวจข้อมูลรายการและกฎส่งตรวจ/เผยแพร่/ปิดรับสมัคร โดยแยกจากโค้ดฐานข้อมูล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-workflow.ts:1>)

ผู้เรียกในโครงการ: [features/tournament-operations/application/create-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:1>), [features/tournament-operations/application/review-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/review-tournament.ts:1>), [features/tournament-operations/application/transition-tournament-lifecycle.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-lifecycle.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-operations/tournament-workflow.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-workflow.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [validateTournamentInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-workflow.ts:17>) | 17 | ตรวจช่องที่จำเป็น จังหวัด/อายุ/จำนวนทีม และลำดับวันเริ่ม วันจบ วันปิดรับสมัคร |
| [canSubmit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-workflow.ts:42>) | 42 | อนุญาตส่งตรวจได้เฉพาะฉบับร่างหรือรายการที่ถูกขอให้แก้ไข |
| [applyReviewDecision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-workflow.ts:47>) | 47 | ใช้ผลตรวจได้ต่อเมื่อรายการอยู่ในสถานะส่งตรวจแล้ว |
| [assertCanPublish](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-workflow.ts:53>) | 53 | รายการต้องอนุมัติและยังมีช่วงเวลารับสมัคร/วันเริ่มที่ใช้ได้ก่อนเปิดเผยแพร่ |
| [assertCanCloseRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-workflow.ts:70>) | 70 | ตรวจว่ารายการกำลังเผยแพร่ก่อนปิดการรับสมัคร |

## features/tournament-operations/infrastructure/development-tournament-operations-repository.ts

เก็บรายการและประวัติลงไฟล์ในโหมดพัฒนา โดยทำตามสัญญา repository เดียวกับฐานข้อมูล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:1>)

ผู้เรียกในโครงการ: [features/tournament-operations/infrastructure/get-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/get-tournament-operations-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-operations/tournament-governance-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-governance-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getDevelopmentTournamentOperationsRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:61>) | 61 |  |
| [DevelopmentTournamentOperationsRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:70>) | 70 |  |
| [create](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:73>) | 73 |  |
| [findById](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:97>) | 97 |  |
| [findGovernanceContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:102>) | 102 |  |
| [findCompetitionLifecycleContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:112>) | 112 |  |
| [listByOrganizer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:128>) | 128 |  |
| [listForAdmin](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:135>) | 135 |  |
| [listByStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:140>) | 140 |  |
| [updateWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:147>) | 147 |  |
| [reviewWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:175>) | 175 |  |
| [transitionWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:221>) | 221 |  |
| [transitionCompetitionWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:254>) | 254 |  |
| [governWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:269>) | 269 |  |
| [permanentlyDeleteWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:322>) | 322 |  |
| [mapGovernanceContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:364>) | 364 |  |
| [reviewCount](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:385>) | 385 |  |
| [assertGovernancePolicy](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:391>) | 391 |  |
| [updatesGovernanceMetadata](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:410>) | 410 |  |
| [governanceTarget](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:416>) | 416 |  |
| [governanceAuditAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:434>) | 434 |  |
| [filterAdminTournaments](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:447>) | 447 |  |
| [provinceName](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:465>) | 465 |  |
| [ensureDevelopmentState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:471>) | 471 |  |
| [readState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:480>) | 480 |  |
| [writeState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:494>) | 494 |  |
| [createSeedState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:498>) | 498 |  |
| [appendDevelopmentAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:535>) | 535 |  |

## features/tournament-operations/infrastructure/get-tournament-operations-repository.ts

เลือก Prisma เมื่อมีฐานข้อมูล หรือ adapter พัฒนาเมื่อไม่ได้รัน production

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/get-tournament-operations-repository.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/reviews/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/[id]/page.tsx:1>), [app/(admin)/admin/reviews/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/page.tsx:1>), [app/(admin)/admin/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/page.tsx:1>), [app/(admin)/admin/tournaments/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/page.tsx:1>), [app/(admin)/organizer/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/page.tsx:1>), [app/api/admin/tournaments/\[id\]/close-registration/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/close-registration/route.ts:1>), [app/api/admin/tournaments/\[id\]/governance/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/governance/route.ts:1>), [app/api/admin/tournaments/\[id\]/media/\[assetId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/route.ts:1>), [app/api/admin/tournaments/\[id\]/media/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/route.ts:1>), [app/api/admin/tournaments/\[id\]/publish/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/publish/route.ts:1>), [app/api/admin/tournaments/\[id\]/review/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/review/route.ts:1>), [app/api/admin/tournaments/\[id\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/route.ts:1>), [app/api/admin/tournaments/\[id\]/submit/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/submit/route.ts:1>), [app/api/admin/tournaments/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/route.ts:1>), [app/api/organizer/tournaments/\[id\]/complete/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/complete/route.ts:1>), [app/api/organizer/tournaments/\[id\]/start/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/start/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getTournamentOperationsRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/get-tournament-operations-repository.ts:16>) | 16 |  |

## features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts

จำลองรายการและการเปลี่ยนสถานะในหน่วยความจำเพื่อใช้ทดสอบกฎงาน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/review-tournament.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/review-tournament.test.ts:1>), [tests/api/admin/tournament-governance.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-governance.test.ts:1>), [tests/api/admin/tournament-lifecycle.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-lifecycle.test.ts:1>), [tests/api/admin/tournament-submit.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-submit.test.ts:1>), [tests/features/tournament-operations/govern-tournament.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/govern-tournament.test.ts:1>), [tests/features/tournament-operations/review-tournament.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/review-tournament.test.ts:1>), [tests/features/tournament-operations/tournament-governance-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-governance-repository.test.ts:1>), [tests/features/tournament-operations/tournament-workflow.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-workflow.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [InMemoryTournamentOperationsRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:34>) | 34 |  |
| [create](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:45>) | 45 |  |
| [findById](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:56>) | 56 |  |
| [findGovernanceContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:58>) | 58 |  |
| [findCompetitionLifecycleContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:67>) | 67 |  |
| [listByOrganizer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:83>) | 83 |  |
| [listForAdmin](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:89>) | 89 |  |
| [listByStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:104>) | 104 |  |
| [updateWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:110>) | 110 |  |
| [reviewWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:131>) | 131 |  |
| [transitionWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:170>) | 170 |  |
| [transitionCompetitionWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:192>) | 192 |  |
| [governWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:207>) | 207 |  |
| [permanentlyDeleteWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:253>) | 253 |  |
| [reviewCount](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:287>) | 287 |  |
| [appendAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:293>) | 293 |  |
| [mapGovernanceContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:318>) | 318 |  |
| [assertGovernancePolicy](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:339>) | 339 |  |
| [updatesGovernanceMetadata](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:358>) | 358 |  |
| [governanceTarget](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:364>) | 364 |  |
| [governanceAuditAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:382>) | 382 |  |
| [provinceName](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:395>) | 395 |  |
| [systemAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:401>) | 401 |  |

## features/tournament-operations/infrastructure/prisma-tournament-governance-lock.ts

ล็อกแถวรายการก่อนเปลี่ยนข้อมูล และปฏิเสธการทำงานเมื่อรายการถูกระงับหรือไม่พร้อม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-governance-lock.ts:1>)

ผู้เรียกในโครงการ: [features/competition/infrastructure/prisma-competition-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1>), [features/competition/infrastructure/prisma-external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:1>), [features/registrations/infrastructure/prisma-registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:1>), [features/tournament-media/infrastructure/prisma-tournament-media-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:1>), [features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [lockTournamentGovernanceRow](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-governance-lock.ts:21>) | 21 | ล็อกสถานะการกำกับของรายการก่อนทำคำสั่งที่ต้องตัดสินจากสถานะล่าสุด |
| [lockActiveTournamentForMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-governance-lock.ts:39>) | 39 | ล็อกและตรวจว่ารายการอนุญาตให้แก้ข้อมูลก่อนคืนบริบทให้ repository |

## features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts

อ่านและเปลี่ยนรายการผ่าน Prisma พร้อม version, transaction, audit และการตรวจสถานะซ้ำก่อนเขียน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:1>)

ผู้เรียกในโครงการ: [features/tournament-operations/infrastructure/get-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/get-tournament-operations-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PrismaTournamentOperationsRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:135>) | 135 |  |
| [create](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:143>) | 143 |  |
| [findById](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:169>) | 169 |  |
| [findGovernanceContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:177>) | 177 |  |
| [findCompetitionLifecycleContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:187>) | 187 |  |
| [listByOrganizer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:197>) | 197 |  |
| [listForAdmin](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:206>) | 206 |  |
| [listByStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:235>) | 235 |  |
| [updateWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:247>) | 247 |  |
| [reviewWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:264>) | 264 |  |
| [transitionWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:314>) | 314 |  |
| [transitionCompetitionWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:355>) | 355 |  |
| [governWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:405>) | 405 |  |
| [permanentlyDeleteWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:465>) | 465 |  |
| [runSerializableTransaction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:514>) | 514 | รัน transaction ที่ป้องกันผลจากคำสั่งพร้อมกัน และลองใหม่ตามจำนวนครั้งที่จำกัดเมื่อเกิด serialization conflict |
| [assertGovernancePolicy](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:528>) | 528 |  |
| [updatesGovernanceMetadata](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:547>) | 547 |  |
| [governanceTarget](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:553>) | 553 |  |
| [governanceAuditAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:571>) | 571 |  |
| [updateAndReloadTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:584>) | 584 |  |
| [appendTournamentAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:621>) | 621 |  |
| [mapCompetitionLifecycleContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:651>) | 651 |  |
| [mapGovernanceContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:685>) | 685 |  |
| [mapTournamentChanges](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:712>) | 712 |  |
| [mapTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:736>) | 736 | แปลงระเบียนรายการและความสัมพันธ์ที่อ่านมาเป็นข้อมูลตามสัญญา repository |
| [toJsonValue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:764>) | 764 | แปลงข้อมูลให้เก็บในช่อง JSON ของ Prisma ได้ เช่น snapshot ใน audit |
| [isPrismaSerializationConflict](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:769>) | 769 | แยกข้อผิดพลาด transaction ชนกัน เพื่อให้ retry เฉพาะกรณีที่รองรับ |

## features/tournament-operations/infrastructure/tournament-operations-repository.ts

กำหนดสัญญาอ่านรายการและคำสั่งเปลี่ยนสถานะ รวมบริบทการแข่งขันและการกำกับของแอดมิน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:1>)

ผู้เรียกในโครงการ: [features/admin/presentation/review-tournament-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/review-tournament-handler.ts:1>), [features/admin/presentation/save-tournament-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/save-tournament-handler.ts:1>), [features/admin/presentation/submit-tournament-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/submit-tournament-handler.ts:1>), [features/admin/presentation/tournament-lifecycle-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-lifecycle-handler.ts:1>), [features/tournament-media/application/authorize-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/authorize-tournament-media.ts:1>), [features/tournament-media/application/delete-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/delete-tournament-media.ts:1>), [features/tournament-media/application/upload-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:1>), [features/tournament-operations/application/create-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:1>), [features/tournament-operations/application/govern-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/govern-tournament.ts:1>), [features/tournament-operations/application/list-owned-tournament-workflows.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/list-owned-tournament-workflows.ts:1>), [features/tournament-operations/application/review-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/review-tournament.ts:1>), [features/tournament-operations/application/transition-tournament-competition.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-competition.ts:1>), [features/tournament-operations/application/transition-tournament-lifecycle.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-lifecycle.ts:1>), [features/tournament-operations/infrastructure/development-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/get-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/get-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:1>), [features/tournament-operations/presentation/tournament-governance-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/tournament-submit.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-submit.test.ts:1>), [tests/features/tournament-operations/tournament-competition-lifecycle.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-competition-lifecycle.test.ts:1>), [tests/features/tournament-operations/tournament-governance-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-governance-repository.test.ts:1>), [tests/features/tournament-operations/tournament-lifecycle.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-lifecycle.test.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentCompetitionOperationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:21>), [TournamentOperationsRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:24>), [AdminTournamentFilters](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:58>), [TournamentMutationAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:63>), [TournamentReviewTransition](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:69>), [TournamentLifecycleTransition](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:79>), [TournamentCompetitionTransition](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:91>), [TournamentGovernanceTransition](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:103>), [TournamentPermanentDelete](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:114>), [TournamentOperationChanges](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:123>), [TournamentStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:124>)

## features/tournament-operations/presentation/organizer-workflow-guidance.ts

แปลงสถานะและความพร้อมของรายการเป็นข้อความ/ลิงก์ขั้นถัดไปสำหรับผู้จัด

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/organizer-workflow-guidance.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/page.tsx:1>), [components/organizer/tournament-competition-lifecycle-panel.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-competition-lifecycle-panel.tsx:1>), [components/organizer/tournament-workflow-progress.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-workflow-progress.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-operations/organizer-workflow-guidance.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/organizer-workflow-guidance.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createOrganizerWorkflowGuidance](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/organizer-workflow-guidance.ts:71>) | 71 |  |
| [tournamentOperationStatusLabel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/organizer-workflow-guidance.ts:108>) | 108 |  |
| [withAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/organizer-workflow-guidance.ts:114>) | 114 |  |
| [readOnly](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/organizer-workflow-guidance.ts:128>) | 128 |  |
| [detailsHref](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/organizer-workflow-guidance.ts:140>) | 140 |  |

## features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts

ตรวจคำขอเริ่ม/จบการแข่งขันแล้วคืนรายการเงื่อนไขที่ยังขาดให้หน้าจอ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/complete/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/complete/route.ts:1>), [app/api/organizer/tournaments/\[id\]/start/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/start/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/competition/tournament-competition-lifecycle-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/competition/tournament-competition-lifecycle-routes.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [handleTournamentCompetitionLifecycle](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts:41>) | 41 |  |
| [policyFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts:94>) | 94 |  |
| [lifecycleFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts:111>) | 111 |  |

## features/tournament-operations/presentation/tournament-governance-error-response.ts

แปลงข้อผิดพลาดการกำกับรายการเป็น HTTP และข้อความภาษาไทยที่ผู้ใช้แก้ไขตามได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-error-response.ts:1>)

ผู้เรียกในโครงการ: [features/admin/presentation/review-tournament-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/review-tournament-handler.ts:1>), [features/admin/presentation/save-tournament-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/save-tournament-handler.ts:1>), [features/admin/presentation/submit-tournament-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/submit-tournament-handler.ts:1>), [features/admin/presentation/tournament-lifecycle-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-lifecycle-handler.ts:1>), [features/admin/presentation/tournament-media-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:1>), [features/competition/presentation/competition-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:1>), [features/competition/presentation/external-bracket-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:1>), [features/registrations/presentation/registration-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:1>), [features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts:1>), [features/tournament-operations/presentation/tournament-governance-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-handler.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [tournamentGovernanceFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-error-response.ts:32>) | 32 |  |
| [tournamentGovernanceCommandFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-error-response.ts:47>) | 47 |  |
| [commandPolicyMessage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-error-response.ts:70>) | 70 |  |

## features/tournament-operations/presentation/tournament-governance-handler.ts

ตรวจคำสั่งกำกับรายการและเหตุผลจากแอดมิน ก่อนเรียก use case

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/governance/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/governance/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/tournament-governance.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-governance.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [handleTournamentGovernance](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-handler.ts:52>) | 52 |  |
| [governanceValidationResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-handler.ts:121>) | 121 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentGovernanceHandlerDependencies](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-governance-handler.ts:45>)
