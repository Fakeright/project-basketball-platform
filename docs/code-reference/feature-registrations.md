# ระบบ registrations

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## features/registrations/application/apply-to-tournament.ts

ตรวจทีม เจ้าของ อายุ จำนวนผู้เล่น สถานะรับสมัคร และชื่อทีมซ้ำ ก่อนสร้างใบสมัครรอพิจารณา

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/apply-to-tournament.ts:1>)

ผู้เรียกในโครงการ: [app/api/tournaments/\[id\]/registrations/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/tournaments/[id]/registrations/route.ts:1>), [features/registrations/presentation/registration-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/registrations/apply-to-tournament.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/apply-to-tournament.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [applyToTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/apply-to-tournament.ts:22>) | 22 |  |
| [loadEligibleApplicationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/apply-to-tournament.ts:38>) | 38 | อ่านทีมและรายการภายใน transaction แล้วตรวจสิทธิ์และเงื่อนไขสมัครก่อนสร้างใบสมัคร |

ชนิดข้อมูล/สัญญาที่ส่งออก: [ApplyToTournamentInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/apply-to-tournament.ts:16>)

## features/registrations/application/cancel-registration.ts

ให้เจ้าของทีมยกเลิกใบสมัครที่ยังอยู่ในสถานะที่ยกเลิกได้ พร้อมตรวจ version

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/cancel-registration.ts:1>)

ผู้เรียกในโครงการ: [app/api/registrations/\[id\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/registrations/[id]/route.ts:1>), [features/registrations/presentation/registration-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/registrations/cancel-registration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/cancel-registration.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [cancelRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/cancel-registration.ts:22>) | 22 | ยกเลิกใบสมัครของทีมที่เข้าถึงได้ โดยตรวจสถานะและ version ปัจจุบันก่อนเขียน |

ชนิดข้อมูล/สัญญาที่ส่งออก: [CancelRegistrationInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/cancel-registration.ts:16>)

## features/registrations/application/decide-registration.ts

ให้ผู้จัดเจ้าของรายการหรือแอดมินอนุมัติ/ปฏิเสธใบสมัคร พร้อมตรวจความจุและเหตุผล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/decide-registration.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/registrations/\[registrationId\]/decision/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/registrations/[registrationId]/decision/route.ts:1>), [features/registrations/presentation/registration-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/registrations/decide-registration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/decide-registration.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [decideRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/decide-registration.ts:25>) | 25 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [DecideRegistrationInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/decide-registration.ts:16>)

## features/registrations/application/list-owned-team-registrations.ts

อ่านประวัติการสมัครของทีมหลังตรวจว่าผู้ใช้เข้าถึงทีมนั้นได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/list-owned-team-registrations.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/team/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/[id]/page.tsx:1>), [app/(admin)/team/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [listOwnedTeamRegistrations](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/list-owned-team-registrations.ts:14>) | 14 | ตรวจสิทธิ์ทีมก่อนอ่านประวัติการสมัครของทีม เพื่อไม่ให้เปิดของบัญชีอื่นด้วยการเปลี่ยน ID |

## features/registrations/application/list-tournament-registrations.ts

ตรวจผู้จัดเจ้าของรายการก่อนอ่านใบสมัคร ชื่อผู้จัดการ และรายชื่อผู้เล่นให้หน้าตรวจทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/list-tournament-registrations.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/registrations/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/registrations/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/registrations/list-tournament-registrations.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/list-tournament-registrations.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [listTournamentRegistrations](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/list-tournament-registrations.ts:23>) | 23 | ตรวจเจ้าของรายการก่อนคืนใบสมัครพร้อมข้อมูลผู้จัดการและผู้เล่นสำหรับตรวจทีม |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentRegistrationReview](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/list-tournament-registrations.ts:17>)

## features/registrations/application/ports/registration-repository.ts

กำหนดข้อมูลทีม/รายการที่ใช้พิจารณาใบสมัครและสัญญาการอ่าน เปลี่ยนสถานะ และ transaction

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:1>)

ผู้เรียกในโครงการ: [components/organizer/registration-review-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:1>), [components/organizer/registration-team-roster.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-team-roster.tsx:1>), [features/registrations/application/apply-to-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/apply-to-tournament.ts:1>), [features/registrations/application/cancel-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/cancel-registration.ts:1>), [features/registrations/application/decide-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/decide-registration.ts:1>), [features/registrations/application/list-owned-team-registrations.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/list-owned-team-registrations.ts:1>), [features/registrations/application/list-tournament-registrations.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/list-tournament-registrations.ts:1>), [features/registrations/application/withdraw-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/withdraw-registration.ts:1>), [features/registrations/infrastructure/get-registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/get-registration-repository.ts:1>), [features/registrations/infrastructure/prisma-registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:1>), [features/team-management/presentation/team-workflow-guidance.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-workflow-guidance.ts:1>), [features/tournaments/application/get-tournament-registration-options.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-registration-options.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/registrations/apply-to-tournament.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/apply-to-tournament.test.ts:1>), [tests/features/registrations/cancel-registration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/cancel-registration.test.ts:1>), [tests/features/registrations/decide-registration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/decide-registration.test.ts:1>), [tests/features/registrations/list-tournament-registrations.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/list-tournament-registrations.test.ts:1>), [tests/features/registrations/withdraw-registration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/withdraw-registration.test.ts:1>), [tests/features/tournaments/get-tournament-registration-options.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/get-tournament-registration-options.test.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [RegistrationApplicationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:13>), [TournamentRegistrationWithOwnership](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:29>), [TeamRegistrationListItem](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:36>), [RegistrationReviewTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:45>), [RegistrationReviewContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:54>), [RegistrationReviewPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:59>), [TournamentRegistrationReviewItem](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:66>), [ApproveRegistrationInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:85>), [RejectRegistrationInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:90>), [WithdrawRegistrationMutationInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:95>), [RegistrationRepositoryTransaction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:100>), [RegistrationRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:137>)

## features/registrations/application/withdraw-registration.ts

ถอนทีมที่อนุมัติแล้วตามเงื่อนไขการแข่งขัน โดยตรวจเหตุผล เวอร์ชัน และสิทธิ์

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/withdraw-registration.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/registrations/\[registrationId\]/withdraw/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/registrations/[registrationId]/withdraw/route.ts:1>), [features/registrations/presentation/registration-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/registrations/withdraw-registration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/withdraw-registration.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [withdrawRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/withdraw-registration.ts:24>) | 24 | ตรวจเหตุผลและสถานะก่อนถอนทีมที่อนุมัติแล้ว พร้อมป้องกันผลกระทบต่อการแข่งขันที่เริ่มไปแล้ว |

ชนิดข้อมูล/สัญญาที่ส่งออก: [WithdrawRegistrationInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/withdraw-registration.ts:16>)

## features/registrations/domain/player-age-policy.ts

ตรวจอายุเต็มปี ณ วันเริ่มรายการตามเวลาไทย; รุ่น U ต้องอายุต่ำกว่าตัวเลขรุ่น ส่วน Open ไม่จำกัด

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:1>)

ผู้เรียกในโครงการ: [features/registrations/domain/registration-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:1>), [features/registrations/presentation/registration-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/registrations/registration-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/registrations/registration-routes.test.ts:1>), [tests/features/registrations/player-age-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/player-age-policy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PlayerAgeIneligibleError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:19>) | 19 |  |
| [TournamentAgeGroupUnsupportedError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:29>) | 29 |  |
| [assertRosterAgeEligibility](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:45>) | 45 | เปรียบเทียบอายุเต็มปีในวันเริ่มแข่ง; เช่น U18 ต้องอายุต่ำกว่า 18 ปี ส่วน Open ข้ามการตรวจอายุ |
| [parseTournamentAgeGroup](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:62>) | 62 |  |
| [completedCalendarYears](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:69>) | 69 | คำนวณอายุเต็มปีและหักหนึ่งปีหากวันเกิดในปีนั้นยังมาไม่ถึง |
| [dateOnlyToUtc](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:81>) | 81 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [PlayerAgeIneligibleDetails](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:15>)

## features/registrations/domain/registration-policy.ts

รวมกฎสมัครและตารางเปลี่ยนสถานะใบสมัคร รวมวันปิดรับ ความจุ รูปแบบทีม อายุ และเหตุผล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:1>)

ผู้เรียกในโครงการ: [features/registrations/application/apply-to-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/apply-to-tournament.ts:1>), [features/registrations/application/cancel-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/cancel-registration.ts:1>), [features/registrations/application/decide-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/decide-registration.ts:1>), [features/registrations/application/ports/registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:1>), [features/registrations/application/withdraw-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/withdraw-registration.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/registrations/registration-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/registration-policy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [assertCanApply](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:64>) | 64 |  |
| [transitionRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:100>) | 100 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [RegistrationTournamentStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:17>), [RegistrationApplicationEligibility](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:30>), [RegistrationTransitionContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:47>)

## features/registrations/domain/registration.ts

กำหนดสถานะและข้อมูลใบสมัครที่ใช้ร่วมกันระหว่าง use case, repository และหน้าจอ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration.ts:1>)

ผู้เรียกในโครงการ: [components/organizer/registration-review-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-review-list.tsx:1>), [components/team/team-registration-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-registration-list.tsx:1>), [features/registrations/application/apply-to-tournament.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/apply-to-tournament.ts:1>), [features/registrations/application/cancel-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/cancel-registration.ts:1>), [features/registrations/application/decide-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/decide-registration.ts:1>), [features/registrations/application/ports/registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/ports/registration-repository.ts:1>), [features/registrations/application/withdraw-registration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/withdraw-registration.ts:1>), [features/registrations/domain/registration-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:1>), [features/registrations/infrastructure/prisma-registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:1>), [features/registrations/presentation/registration-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:1>), [features/team-management/application/ports/team-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/ports/team-repository.ts:1>), [features/team-management/infrastructure/prisma-team-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/registrations/decide-registration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/decide-registration.test.ts:1>), [tests/features/registrations/prisma-registration-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/prisma-registration-repository.test.ts:1>), [tests/features/registrations/withdraw-registration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/withdraw-registration.test.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [RegistrationStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration.ts:7>), [RegistrationAction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration.ts:14>), [TournamentRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration.ts:16>)

## features/registrations/infrastructure/get-registration-repository.ts

ประกอบ Prisma repository สำหรับอ่านและจัดการใบสมัครแข่งขัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/get-registration-repository.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/registrations/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/registrations/page.tsx:1>), [app/(admin)/team/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/[id]/page.tsx:1>), [app/(admin)/team/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/page.tsx:1>), [app/(public)/tournaments/\[slug\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:1>), [app/api/organizer/tournaments/\[id\]/registrations/\[registrationId\]/decision/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/registrations/[registrationId]/decision/route.ts:1>), [app/api/organizer/tournaments/\[id\]/registrations/\[registrationId\]/withdraw/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/registrations/[registrationId]/withdraw/route.ts:1>), [app/api/registrations/\[id\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/registrations/[id]/route.ts:1>), [app/api/tournaments/\[id\]/registrations/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/tournaments/[id]/registrations/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getRegistrationRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/get-registration-repository.ts:15>) | 15 |  |

## features/registrations/infrastructure/prisma-registration-repository.ts

อ่าน/ล็อกทีมและรายการก่อนจัดการใบสมัครผ่าน Prisma พร้อม transaction, retry และ audit

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:1>)

ผู้เรียกในโครงการ: [features/registrations/infrastructure/get-registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/get-registration-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/registrations/prisma-registration-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/registrations/prisma-registration-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PrismaRegistrationRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:38>) | 38 |  |
| [inTransaction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:46>) | 46 | ส่ง adapter ที่ผูกกับ transaction ให้ use case เพื่อรวมการอ่าน/เขียนที่ต้องสำเร็จหรือย้อนกลับพร้อมกัน |
| [getApplicationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:64>) | 64 |  |
| [findActive](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:68>) | 68 |  |
| [hasActiveNameConflict](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:73>) | 73 | ตรวจชื่อที่ normalize แล้วในขอบเขตเจ้าของทีมหรือรายการ โดยไม่นับระเบียนที่ไม่อยู่ในสถานะใช้งาน |
| [createPending](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:77>) | 77 |  |
| [findById](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:88>) | 88 |  |
| [cancelWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:92>) | 92 |  |
| [findReviewContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:110>) | 110 |  |
| [approveWithCapacity](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:114>) | 114 |  |
| [rejectWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:120>) | 120 |  |
| [withdrawWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:126>) | 126 |  |
| [findTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:132>) | 132 |  |
| [listByTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:140>) | 140 |  |
| [findTournamentForReview](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:166>) | 166 |  |
| [listByTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:183>) | 183 |  |
| [PrismaRegistrationOperations](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:228>) | 228 |  |
| [getApplicationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:231>) | 231 |  |
| [findActive](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:308>) | 308 |  |
| [hasActiveNameConflict](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:317>) | 317 | ตรวจชื่อที่ normalize แล้วในขอบเขตเจ้าของทีมหรือรายการ โดยไม่นับระเบียนที่ไม่อยู่ในสถานะใช้งาน |
| [createPending](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:333>) | 333 |  |
| [findById](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:376>) | 376 |  |
| [cancelWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:395>) | 395 |  |
| [findReviewContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:448>) | 448 |  |
| [approveWithCapacity](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:473>) | 473 |  |
| [rejectWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:506>) | 506 |  |
| [withdrawWithVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:523>) | 523 |  |
| [updateDecisionWithGovernanceLock](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:540>) | 540 |  |
| [updateDecision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:559>) | 559 |  |
| [appendDecisionAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:610>) | 610 |  |
| [mapTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:637>) | 637 | แปลงข้อมูลที่อ่านจากฐานข้อมูลเป็นรูปแบบทีมที่ application และ UI ใช้ |
| [mapPlayer](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:652>) | 652 | แปลงแถวผู้เล่นเป็นข้อมูล domain รวมรูปแบบวันที่และค่าที่เว้นว่างได้ |
| [mapRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:671>) | 671 | แปลงแถวใบสมัครเป็นข้อมูลที่ use case และหน้าจอใช้ร่วมกัน |
| [mapReviewTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:687>) | 687 |  |
| [toJsonValue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:706>) | 706 | แปลงข้อมูลให้เก็บในช่อง JSON ของ Prisma ได้ เช่น snapshot ใน audit |
| [isPrismaUniqueError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:710>) | 710 |  |
| [isPrismaSerializationConflict](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:715>) | 715 | แยกข้อผิดพลาด transaction ชนกัน เพื่อให้ retry เฉพาะกรณีที่รองรับ |

## features/registrations/presentation/registration-handler.ts

รับคำขอสมัคร ยกเลิก ตัดสิน หรือถอนทีม ตรวจ payload แล้วแปลงผล use case เป็น HTTP ภาษาไทย

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/registrations/\[registrationId\]/decision/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/registrations/[registrationId]/decision/route.ts:1>), [app/api/organizer/tournaments/\[id\]/registrations/\[registrationId\]/withdraw/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/registrations/[registrationId]/withdraw/route.ts:1>), [app/api/registrations/\[id\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/registrations/[id]/route.ts:1>), [app/api/tournaments/\[id\]/registrations/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/tournaments/[id]/registrations/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/registrations/organizer-registration-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/registrations/organizer-registration-routes.test.ts:1>), [tests/api/registrations/registration-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/registrations/registration-routes.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [handleApplyToTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:76>) | 76 |  |
| [handleCancelRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:100>) | 100 |  |
| [handleDecideRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:124>) | 124 |  |
| [handleWithdrawRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:152>) | 152 |  |
| [parseJson](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:180>) | 180 |  |
| [unauthorizedResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:189>) | 189 |  |
| [validationResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:193>) | 193 |  |
| [registrationFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:197>) | 197 |  |
| [unexpectedRegistrationFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:257>) | 257 |  |
| [createRegistrationCorrelationId](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:275>) | 275 |  |
| [logUnexpectedRegistrationFailure](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:284>) | 284 |  |
| [error](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/presentation/registration-handler.ts:301>) | 301 |  |
