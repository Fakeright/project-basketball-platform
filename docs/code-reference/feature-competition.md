# ระบบ competition

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## features/competition/application/confirm-match-result.ts

ตรวจคะแนนและบริบทคู่แข่งขัน ก่อนยืนยันผลและส่งผู้ชนะไปคู่ถัดไปภายในธุรกรรมเดียว

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/confirm-match-result.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/confirm/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/confirm/route.ts:1>), [features/competition/presentation/competition-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>), [tests/features/competition/external-match-operations.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-match-operations.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [confirmMatchResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/confirm-match-result.ts:26>) | 26 | ยืนยันคะแนนและบันทึกผู้ชนะพร้อมการเลื่อนไปคู่ถัดไป เพื่อไม่ให้ผลกับสายอัปเดตแยกกัน |

ชนิดข้อมูล/สัญญาที่ส่งออก: [ConfirmMatchResultInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/confirm-match-result.ts:17>)

## features/competition/application/correct-match-result.ts

ให้แอดมินแก้ผลที่ยืนยันแล้วตามเงื่อนไข พร้อมเหตุผลและบันทึกประวัติการแก้ไข

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/correct-match-result.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/matches/\[matchId\]/result-correction/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/matches/[matchId]/result-correction/route.ts:1>), [features/competition/presentation/competition-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [correctMatchResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/correct-match-result.ts:28>) | 28 | ตรวจอำนาจแอดมิน เหตุผล และผลกระทบต่อคู่ถัดไปก่อนแก้ผลที่เคยยืนยัน |

ชนิดข้อมูล/สัญญาที่ส่งออก: [CorrectMatchResultInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/correct-match-result.ts:18>)

## features/competition/application/create-external-match.ts

เพิ่มคู่แข่งขันสำหรับโหมดไฟล์สาย ตรวจทีม สนาม วันเวลา และสิทธิ์ก่อนบันทึก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/create-external-match.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/matches/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/route.ts:1>), [features/competition/presentation/competition-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/external-match-operations.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-match-operations.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createExternalMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/create-external-match.ts:32>) | 32 | ตรวจว่าทีมอยู่ในรายการและเงื่อนไขตารางถูกต้อง ก่อนสร้างคู่ที่ผู้จัดกรอกเอง |

ชนิดข้อมูล/สัญญาที่ส่งออก: [CreateExternalMatchInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/create-external-match.ts:18>)

## features/competition/application/external-bracket-access.ts

ตรวจเจ้าของรายการ สิทธิ์ และสถานะการกำกับดูแล ก่อนจัดการไฟล์สายการแข่งขัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/external-bracket-access.ts:1>)

ผู้เรียกในโครงการ: [features/competition/application/publish-external-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-external-bracket.ts:1>), [features/competition/application/retire-external-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/retire-external-bracket.ts:1>), [features/competition/application/select-bracket-mode.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/select-bracket-mode.ts:1>), [features/competition/application/upload-external-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [assertExternalBracketAccess](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/external-bracket-access.ts:15>) | 15 |  |

## features/competition/application/generate-bracket.ts

รับลำดับทีมที่จัดเองหรือสุ่ม แล้วสร้างสายฉบับร่างแบบจับคู่ติดกันและบันทึกรอบ/คู่พร้อมกัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/generate-bracket.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/bracket/generate/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/generate/route.ts:1>), [features/competition/presentation/competition-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [generateBracketDraft](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/generate-bracket.ts:49>) | 49 |  |
| [prepareEntries](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/generate-bracket.ts:107>) | 107 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [GenerateBracketDraftInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/generate-bracket.ts:24>)

## features/competition/application/get-competition-summary.ts

อ่านคู่และผลที่ยืนยันเพื่อสรุปผู้ชนะ รองชนะเลิศ และความพร้อมของผลการแข่งขัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-competition-summary.ts:1>)

ผู้เรียกในโครงการ: [app/(public)/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>), [app/(public)/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/page.tsx:1>), [app/(public)/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/schedule/page.tsx:1>), [components/tournaments/competition-result-summary.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/competition-result-summary.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-summary.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-summary.test.ts:1>), [tests/features/competition/demo-competition-fixtures.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/demo-competition-fixtures.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getCompetitionSummary](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-competition-summary.ts:41>) | 41 | ใช้ผลที่ยืนยันแล้วเพื่อหาคู่ตัดสินและทีมอันดับต่าง ๆ ไม่ใช้คะแนนร่างเป็นผลทางการ |
| [getConfirmedResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-competition-summary.ts:105>) | 105 | คัดผลที่ถือว่ายืนยันแล้วก่อนนำไปคิดผู้ชนะ/อันดับ |

ชนิดข้อมูล/สัญญาที่ส่งออก: [CompetitionSummaryTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-competition-summary.ts:9>), [CompetitionSummary](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-competition-summary.ts:14>)

## features/competition/application/get-external-bracket-view.ts

อ่านไฟล์สายที่เผยแพร่พร้อมข้อมูลลิงก์และความเก่าของไฟล์สำหรับผู้ชม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-external-bracket-view.ts:1>)

ผู้เรียกในโครงการ: [app/(public)/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>), [components/external-bracket-view.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/external-bracket-view.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/get-external-bracket-view.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/get-external-bracket-view.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getExternalBracketView](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-external-bracket-view.ts:22>) | 22 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [PublicExternalBracketView](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-external-bracket-view.ts:10>)

## features/competition/application/get-organizer-competition.ts

ตรวจสิทธิ์เจ้าของรายการก่อนส่งข้อมูลทีม สาย คู่แข่งขัน และสถานะให้หน้าผู้จัด

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-competition.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/tournaments/\[id\]/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/results/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/results/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/schedule/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getOrganizerCompetition](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-competition.ts:28>) | 28 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [OrganizerCompetitionView](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-competition.ts:21>)

## features/competition/application/get-organizer-external-bracket-workspace.ts

ประกอบประวัติไฟล์สายและไฟล์ปัจจุบันที่ผู้จัดมีสิทธิ์ดู พร้อมข้อมูลสำหรับแสดงตัวอย่าง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-external-bracket-workspace.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:1>), [components/organizer/external-bracket-workspace.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-workspace.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/get-organizer-external-bracket.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/get-organizer-external-bracket.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getOrganizerExternalBracketWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-external-bracket-workspace.ts:31>) | 31 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [OrganizerExternalBracketWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-external-bracket-workspace.ts:24>)

## features/competition/application/lock-bracket-entries.ts

ตรึงทีมที่อนุมัติแล้วเป็นรายชื่อในสาย โดยตรวจสถานะรายการ จำนวนทีม และเวอร์ชันก่อนบันทึก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/lock-bracket-entries.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/bracket/entries/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/entries/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [lockBracketEntries](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/lock-bracket-entries.ts:22>) | 22 | อ่านทีมที่อนุมัติและตรึงเป็น entry ของสายหลังตรวจสิทธิ์ สถานะ และจำนวนทีม |

## features/competition/application/match-result-access.ts

อ่านและตรวจบริบทคู่แข่งขันร่วมกันก่อนบันทึกหรือยืนยันคะแนน เช่น เจ้าของ สถานะ และเวอร์ชัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/match-result-access.ts:1>)

ผู้เรียกในโครงการ: [features/competition/application/confirm-match-result.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/confirm-match-result.ts:1>), [features/competition/application/record-match-score.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/record-match-score.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [loadMutableMatchResultContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/match-result-access.ts:18>) | 18 | รวมการตรวจบริบทที่การบันทึกและยืนยันผลต้องใช้ เพื่อให้ทั้งสองคำสั่งบังคับกฎเดียวกัน |

## features/competition/application/ports/competition-repository.ts

กำหนดสัญญาอ่านและแก้สาย ตาราง และผล รวมบริบทที่ use case ต้องใช้และการทำงานใน transaction

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:1>)

ผู้เรียกในโครงการ: [components/organizer/bracket-preview.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-preview.tsx:1>), [components/organizer/bracket-workspace.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:1>), [features/competition/application/confirm-match-result.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/confirm-match-result.ts:1>), [features/competition/application/correct-match-result.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/correct-match-result.ts:1>), [features/competition/application/create-external-match.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/create-external-match.ts:1>), [features/competition/application/generate-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/generate-bracket.ts:1>), [features/competition/application/get-organizer-competition.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-competition.ts:1>), [features/competition/application/lock-bracket-entries.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/lock-bracket-entries.ts:1>), [features/competition/application/match-result-access.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/match-result-access.ts:1>), [features/competition/application/publish-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-bracket.ts:1>), [features/competition/application/record-match-score.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/record-match-score.ts:1>), [features/competition/application/schedule-match.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/schedule-match.ts:1>), [features/competition/application/update-external-match-purpose.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/update-external-match-purpose.ts:1>), [features/competition/infrastructure/get-competition-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-competition-repository.ts:1>), [features/competition/infrastructure/prisma-competition-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1>), [features/competition/presentation/competition-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>), [tests/features/competition/external-match-operations.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-match-operations.test.ts:1>), [tests/ui/organizer/bracket-workspace.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/bracket-workspace.test.tsx:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [PersistGeneratedPlanInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:16>), [BracketGenerationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:29>), [OrganizerCompetitionWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:44>), [BracketPublicationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:88>), [SetBracketPublicationInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:101>), [MatchScheduleContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:112>), [ExternalMatchCreationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:127>), [CreateExternalMatchMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:143>), [ExternalMatchPurposeContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:160>), [UpdateExternalMatchPurposeMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:173>), [UpdatedExternalMatchPurpose](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:185>), [CreatedExternalMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:191>), [ScheduleMatchMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:197>), [ScheduledCompetitionMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:209>), [MatchResultContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:216>), [RecordMatchScoreMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:234>), [ConfirmMatchResultMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:245>), [ResultCompetitionMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:251>), [MatchResultCorrectionContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:260>), [CorrectMatchResultMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:278>), [PersistedCompetitionBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:294>), [BracketLockContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:300>), [LockedCompetitionWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:315>), [LockEntriesInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:325>), [CompetitionRepositoryTransaction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:333>), [CompetitionRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:393>)

## features/competition/application/ports/external-bracket-repository.ts

กำหนดสัญญาโหมดสาย เวอร์ชันไฟล์ การเผยแพร่ และการเลิกใช้ไฟล์ เพื่อแยกกฎงานออกจากที่เก็บข้อมูล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:1>)

ผู้เรียกในโครงการ: [components/organizer/bracket-workspace.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:1>), [components/organizer/external-bracket-preview.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-preview.tsx:1>), [components/organizer/external-bracket-revision-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-revision-list.tsx:1>), [features/competition/application/get-external-bracket-view.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-external-bracket-view.ts:1>), [features/competition/application/get-organizer-external-bracket-workspace.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-external-bracket-workspace.ts:1>), [features/competition/application/publish-external-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-external-bracket.ts:1>), [features/competition/application/retire-external-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/retire-external-bracket.ts:1>), [features/competition/application/select-bracket-mode.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/select-bracket-mode.ts:1>), [features/competition/application/upload-external-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:1>), [features/competition/infrastructure/development-external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:1>), [features/competition/infrastructure/get-external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-external-bracket-repository.ts:1>), [features/competition/infrastructure/prisma-external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/external-bracket-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-bracket-use-cases.test.ts:1>), [tests/features/competition/get-external-bracket-view.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/get-external-bracket-view.test.ts:1>), [tests/features/competition/get-organizer-external-bracket.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/get-organizer-external-bracket.test.ts:1>), [tests/ui/organizer/external-bracket-workspace.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/external-bracket-workspace.test.tsx:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [ExternalBracketRevisionStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:16>), [ExternalBracketRevision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:19>), [ExternalBracketWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:32>), [ExternalBracketWorkspaceContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:39>), [BracketModeSelectionContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:50>), [SelectBracketModeInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:61>), [SelectedBracketMode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:72>), [PublicExternalBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:78>), [CommitExternalRevisionInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:86>), [PublishExternalRevisionInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:98>), [RetireExternalRevisionInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:108>), [ExternalBracketRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:110>)

## features/competition/application/publish-bracket.ts

เผยแพร่หรือยกเลิกเผยแพร่สายของระบบ หลังตรวจสิทธิ์ ความพร้อม และเงื่อนไขการแก้โครงสร้าง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-bracket.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/bracket/publication/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/publication/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [publishBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-bracket.ts:24>) | 24 | ขอเผยแพร่สายผ่านขั้นตอนตรวจสิทธิ์และความพร้อมร่วมกัน |
| [unpublishBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-bracket.ts:33>) | 33 | ขอยกเลิกเผยแพร่สายผ่านขั้นตอนที่ตรวจว่ายังแก้โครงสร้างได้ |
| [changePublication](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-bracket.ts:43>) | 43 |  |
| [assertPublicationAccess](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-bracket.ts:93>) | 93 |  |

## features/competition/application/publish-external-bracket.ts

เลือกเวอร์ชันไฟล์สายที่ผ่านเงื่อนไขให้เป็นไฟล์เผยแพร่ พร้อมบันทึกผู้ดำเนินการ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-external-bracket.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/bracket/external/publication/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/publication/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/external-bracket-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-bracket-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [publishExternalBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/publish-external-bracket.ts:21>) | 21 | ตรวจสิทธิ์และเวอร์ชันก่อนกำหนดไฟล์สายที่เลือกให้เป็นฉบับเผยแพร่ |

## features/competition/application/record-match-score.ts

ตรวจคะแนนจำนวนเต็มที่ไม่ติดลบ แล้วบันทึกคะแนนร่าง โดยยังไม่เลื่อนทีมไปคู่ถัดไป

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/record-match-score.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/score/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/score/route.ts:1>), [features/competition/presentation/competition-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [recordMatchScore](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/record-match-score.ts:26>) | 26 | บันทึกคะแนนร่างหลังตรวจคู่และคะแนน; การยืนยันผลเป็นอีกคำสั่งหนึ่ง |

ชนิดข้อมูล/สัญญาที่ส่งออก: [RecordMatchScoreInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/record-match-score.ts:17>)

## features/competition/application/retire-external-bracket.ts

เลิกใช้เวอร์ชันไฟล์สายตามสิทธิ์และสถานะ พร้อมเหตุผลและประวัติ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/retire-external-bracket.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/bracket/external/revisions/\[revisionId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/[revisionId]/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/external-bracket-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-bracket-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [retireExternalBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/retire-external-bracket.ts:21>) | 21 | ตรวจเงื่อนไขแล้วเลิกใช้ไฟล์สายเวอร์ชันที่ระบุ พร้อมผู้ดำเนินการและเหตุผล |

## features/competition/application/schedule-match.ts

ตรวจสิทธิ์ เวอร์ชัน วันเวลา และสนามก่อนบันทึกตาราง; 5v5 ห้ามสนามชนเวลาเดียวกัน ส่วน 3v3 อนุญาต

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/schedule-match.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/schedule/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/schedule/route.ts:1>), [features/competition/presentation/competition-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [scheduleMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/schedule-match.ts:27>) | 27 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [ScheduleMatchInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/schedule-match.ts:17>)

## features/competition/application/select-bracket-mode.ts

เลือกใช้สายที่ระบบสร้างหรือไฟล์ภายนอกตามความพร้อมและสถานะสาย

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/select-bracket-mode.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/bracket/mode/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/mode/route.ts:1>), [features/competition/presentation/external-bracket-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/external-bracket-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-bracket-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [selectBracketMode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/select-bracket-mode.ts:28>) | 28 | ตรวจความพร้อมของสายแล้วเลือกโหมด SYSTEM_GENERATED หรือ EXTERNAL_DOCUMENT |

ชนิดข้อมูล/สัญญาที่ส่งออก: [SelectBracketModeRequest](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/select-bracket-mode.ts:15>)

## features/competition/application/update-external-match-purpose.ts

กำหนดหน้าที่คู่แข่งขันในโหมดไฟล์ เช่น คู่ทั่วไปหรือชิงชนะเลิศ โดยตรวจเงื่อนไขผลและเวอร์ชัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/update-external-match-purpose.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/purpose/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/purpose/route.ts:1>), [features/competition/presentation/competition-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/external-match-operations.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-match-operations.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [updateExternalMatchPurpose](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/update-external-match-purpose.ts:27>) | 27 | แก้ชนิดคู่แข่งขันในโหมดเอกสาร เช่น คู่ชิง โดยตรวจ version และข้อจำกัดของผลเดิม |

ชนิดข้อมูล/สัญญาที่ส่งออก: [UpdateExternalMatchPurposeInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/update-external-match-purpose.ts:18>)

## features/competition/application/upload-external-bracket.ts

ตรวจไฟล์ PDF/ภาพจริง อัปโหลดเนื้อไฟล์ แล้วบันทึกเวอร์ชันสาย; หากบันทึกไม่สำเร็จจะพยายามล้างไฟล์ที่อัปไว้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/bracket/external/revisions/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts:1>), [features/competition/presentation/external-bracket-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/external-bracket-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-bracket-use-cases.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [uploadExternalBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:50>) | 50 | ตรวจเนื้อไฟล์ อัปโหลด แล้วบันทึก revision; ข้อผิดพลาดหลังอัปโหลดต้องพยายามล้างไฟล์ที่ยังไม่มีรายการอ้างอิง |
| [compensate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:133>) | 133 | ชดเชยขั้นตอนอัปโหลดที่เสร็จแล้วเมื่อการบันทึกข้อมูลภายหลังล้มเหลว |
| [extensionFor](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:152>) | 152 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [UploadExternalBracketInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:22>)

## features/competition/domain/bracket-generator.ts

สร้างแผนรอบและคู่แข่งขันในหน่วยความจำ; เส้นทางปัจจุบันจับคู่ตำแหน่ง 1–2, 3–4 และเชื่อมผู้ชนะไปคู่ถัดไป

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:1>)

ผู้เรียกในโครงการ: [features/competition/application/generate-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/generate-bracket.ts:1>), [features/competition/application/ports/competition-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:1>), [features/competition/infrastructure/demo-competition-fixtures.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/bracket-generator.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/bracket-generator.test.ts:1>), [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>), [tests/features/competition/prisma-competition-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/prisma-competition-repository.test.ts:1>), [tests/features/competition/tournament-competition-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/tournament-competition-policy.test.ts:1>), [tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [mirroredSeedOrder](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:53>) | 53 | สร้างลำดับ seed แบบเดิมสำหรับชุดข้อมูลสาธิต/การทดสอบที่ยังใช้เส้นทางนี้ |
| [generateSingleEliminationBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:66>) | 66 |  |
| [generateOrderedSingleEliminationBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:86>) | 86 |  |
| [buildBracketPlan](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:105>) | 105 |  |
| [nextPowerOfTwo](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:185>) | 185 | หาขนาดสายกำลังสองที่ครอบจำนวนทีมสำหรับวิธี seed เดิมซึ่งรองรับบาย |
| [getRoundName](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:190>) | 190 | ตั้งชื่อรอบจากจำนวนทีมที่เหลือ เช่น 2 ทีมคือ Final |
| [sourceTeamId](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:197>) | 197 |  |
| [sourceMatchKey](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:201>) | 201 |  |
| [setEntryStart](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:206>) | 206 | จำว่าทีมเริ่มเล่นรอบใด เพื่อรองรับแผนที่มีทีมบายจากวิธีเดิม |
| [connectSourceToMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:217>) | 217 | เชื่อมคู่ก่อนหน้าให้รู้ว่าผู้ชนะจะไปคู่ไหนและอยู่ช่อง HOME หรือ AWAY |
| [assertPlanIntegrity](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:233>) | 233 | ตรวจจำนวนคู่ n−1 คู่ชิงเพียงหนึ่งคู่ และปลายทางผู้ชนะที่อ้างถึงคู่ซึ่งมีอยู่จริง |

ชนิดข้อมูล/สัญญาที่ส่งออก: [BracketGenerationEntry](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:15>), [OrderedBracketEntry](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:21>), [GeneratedMatchPlan](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:27>), [GeneratedBracketPlan](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:40>)

## features/competition/domain/bracket-policy.ts

รวมกฎตรึงทีม ลำดับทีม และข้อจำกัดการแก้สาย; สายระบบปัจจุบันใช้ 8, 16 หรือ 32 ทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-policy.ts:1>)

ผู้เรียกในโครงการ: [features/competition/application/generate-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/generate-bracket.ts:1>), [features/competition/application/lock-bracket-entries.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/lock-bracket-entries.ts:1>), [features/competition/domain/bracket-generator.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/bracket-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/bracket-policy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [assertEntriesCanBeLocked](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-policy.ts:8>) | 8 | ยอมให้ตรึงทีมเมื่อปิดรับสมัครแล้ว และจำนวนทีมที่อนุมัติไม่ซ้ำ/ไม่เกินความจุ |
| [assertBracketStructureMutable](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-policy.ts:34>) | 34 | ห้ามเปลี่ยนโครงสร้างสายหลังมีคู่เริ่มแข่ง เพื่อรักษาความหมายของผลเดิม |
| [assertSystemBracketEntryCount](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-policy.ts:43>) | 43 | จำกัดโหมดจัดสายปัจจุบันไว้ที่ 8, 16, 32 ทีม เพื่อจับคู่ครบโดยไม่ต้องมีบาย |
| [validateOrderedPositions](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-policy.ts:50>) | 50 | ตรวจ ID ทีมและตำแหน่งว่าไม่ซ้ำ และตำแหน่งอยู่ครบในช่วง 1 ถึงจำนวนทีม |
| [validateSeeds](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-policy.ts:66>) | 66 | ตรวจ seed ต่อเนื่องและไม่ซ้ำสำหรับเส้นทางจัดสายแบบเดิม |

## features/competition/domain/competition.ts

กำหนดชนิดข้อมูลสาย คู่แข่งขัน จุดส่งต่อผู้ชนะ และสถานะการแข่งขันที่ชั้นต่าง ๆ ใช้ร่วมกัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/competition.ts:1>)

ผู้เรียกในโครงการ: [components/organizer/bracket-mode-control.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-mode-control.tsx:1>), [components/organizer/external-match-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-editor.tsx:1>), [components/organizer/external-match-purpose-control.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-match-purpose-control.tsx:1>), [components/organizer/match-result-editor.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-result-editor.tsx:1>), [features/competition/application/create-external-match.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/create-external-match.ts:1>), [features/competition/application/generate-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/generate-bracket.ts:1>), [features/competition/application/get-competition-summary.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-competition-summary.ts:1>), [features/competition/application/get-organizer-competition.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-competition.ts:1>), [features/competition/application/ports/competition-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:1>), [features/competition/application/select-bracket-mode.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/select-bracket-mode.ts:1>), [features/competition/application/update-external-match-purpose.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/update-external-match-purpose.ts:1>), [features/competition/domain/bracket-generator.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:1>), [features/competition/domain/external-bracket-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/external-bracket-policy.ts:1>), [features/competition/domain/match-result-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/match-result-policy.ts:1>), [features/competition/domain/tournament-competition-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:1>), [features/competition/infrastructure/demo-competition-fixtures.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:1>), [features/competition/infrastructure/tokenized-bracket-shuffle.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/tokenized-bracket-shuffle.ts:1>), [features/tournament-operations/infrastructure/tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/tournament-operations-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/competition-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/competition-use-cases.test.ts:1>), [tests/features/competition/tournament-competition-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/tournament-competition-policy.test.ts:1>), [tests/features/tournament-operations/list-owned-tournament-workflows.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/list-owned-tournament-workflows.test.ts:1>), [tests/features/tournament-operations/tournament-competition-lifecycle.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/tournament-competition-lifecycle.test.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [BracketMode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/competition.ts:9>), [BracketGenerationMethod](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/competition.ts:11>), [MatchSlot](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/competition.ts:13>), [MatchPurpose](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/competition.ts:15>), [TournamentCompetitionLifecycleContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/competition.ts:17>), [CompetitionTournamentStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/competition.ts:44>), [LockedBracketEntry](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/competition.ts:49>), [CompetitionMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/competition.ts:60>)

## features/competition/domain/external-bracket-policy.ts

ตรวจชนิด/ขนาดไฟล์สาย เงื่อนไขเปลี่ยนโหมด และสถานะไฟล์ที่เก่ากว่าผลแข่งขันล่าสุด

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/external-bracket-policy.ts:1>)

ผู้เรียกในโครงการ: [components/organizer/external-bracket-uploader.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/external-bracket-uploader.tsx:1>), [features/competition/application/get-organizer-external-bracket-workspace.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-external-bracket-workspace.ts:1>), [features/competition/application/select-bracket-mode.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/select-bracket-mode.ts:1>), [features/competition/application/upload-external-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:1>), [features/competition/infrastructure/bracket-file-probe.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/bracket-file-probe.ts:1>), [features/competition/presentation/external-bracket-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/external-bracket-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-bracket-policy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [assertExternalBracketFile](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/external-bracket-policy.ts:20>) | 20 |  |
| [getExternalBracketMaximumBytes](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/external-bracket-policy.ts:37>) | 37 |  |
| [getExternalBracketFileKind](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/external-bracket-policy.ts:41>) | 41 |  |
| [assertCanSelectBracketMode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/external-bracket-policy.ts:50>) | 50 |  |
| [isExternalBracketStale](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/external-bracket-policy.ts:69>) | 69 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [ExternalBracketContentType](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/external-bracket-policy.ts:16>), [ExternalBracketFileKind](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/external-bracket-policy.ts:18>)

## features/competition/domain/match-result-policy.ts

ตรวจคะแนนและตัดสินทีมชนะจากคะแนน พร้อมระบุคู่และช่อง HOME/AWAY ที่ผู้ชนะจะไปต่อ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/match-result-policy.ts:1>)

ผู้เรียกในโครงการ: [features/competition/application/confirm-match-result.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/confirm-match-result.ts:1>), [features/competition/application/correct-match-result.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/correct-match-result.ts:1>), [features/competition/application/record-match-score.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/record-match-score.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/match-result-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/match-result-policy.test.ts:1>), [tests/features/competition/tournament-competition-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/tournament-competition-policy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [assertDraftScore](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/match-result-policy.ts:10>) | 10 | คะแนนร่างต้องเป็นจำนวนเต็มตั้งแต่ศูนย์ขึ้นไป แต่ยังเสมอกันได้ |
| [assertScoreCanBeConfirmed](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/match-result-policy.ts:25>) | 25 | คะแนนที่จะยืนยันต้องผ่านกฎคะแนนร่างและห้ามเสมอ เพราะต้องตัดสินทีมชนะ |
| [decideMatchAdvancement](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/match-result-policy.ts:38>) | 38 | เลือกทีมที่คะแนนมากกว่า แล้วคืนปลายทางคู่ถัดไปตามที่โครงสร้างสายกำหนดไว้ |

## features/competition/domain/tournament-competition-policy.ts

รวบรวมเงื่อนไขที่ขาดก่อนเริ่มหรือจบรายการ เช่น สาย คู่ ตาราง และผลที่ยังไม่ครบ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:1>)

ผู้เรียกในโครงการ: [components/organizer/tournament-competition-lifecycle-panel.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-competition-lifecycle-panel.tsx:1>), [features/competition/application/get-organizer-competition.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-competition.ts:1>), [features/competition/presentation/tournament-competition-issue-label.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/tournament-competition-issue-label.ts:1>), [features/tournament-operations/application/list-owned-tournament-workflows.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/list-owned-tournament-workflows.ts:1>), [features/tournament-operations/application/transition-tournament-competition.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/transition-tournament-competition.ts:1>), [features/tournament-operations/infrastructure/development-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/development-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/in-memory-tournament-operations-repository.ts:1>), [features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:1>), [features/tournament-operations/presentation/organizer-workflow-guidance.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/organizer-workflow-guidance.ts:1>), [features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/tournament-competition-lifecycle-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/competition/tournament-competition-lifecycle-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/competition/tournament-competition-lifecycle-routes.test.ts:1>), [tests/features/competition/tournament-competition-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/tournament-competition-policy.test.ts:1>), [tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-operations/prisma-tournament-operations-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentCompetitionPolicyError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:24>) | 24 |  |
| [getStartIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:35>) | 35 | รวบรวมรายการเงื่อนไขที่ยังขาดก่อนเริ่มแข่ง เพื่อให้ UI แสดงสิ่งที่ต้องแก้ได้ทั้งหมด |
| [getCompletionIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:80>) | 80 | รวบรวมเงื่อนไขที่ยังขาดก่อนจบรายการ เช่น ผลที่ยังไม่ยืนยันหรือข้อมูลคู่ตัดสิน |
| [assertTournamentCanStart](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:113>) | 113 | หยุดคำสั่งเริ่มรายการหากยังมีเงื่อนไขความพร้อมไม่ผ่าน |
| [assertTournamentCanComplete](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:120>) | 120 | หยุดคำสั่งจบรายการหากข้อมูลการแข่งขันหรือผลยังไม่ครบ |
| [getStructureIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:126>) | 126 |  |
| [assertNoIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:163>) | 163 |  |
| [uniqueIssues](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:167>) | 167 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentCompetitionIssueCode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/tournament-competition-policy.ts:9>)

## features/competition/infrastructure/bracket-file-probe.ts

อ่านโครงสร้าง PDF หรือภาพด้วยไลบรารีฝั่งเซิร์ฟเวอร์ เพื่อยืนยันว่าไฟล์เปิดได้จริงก่อนเก็บ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/bracket-file-probe.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/bracket/external/revisions/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts:1>), [features/competition/application/upload-external-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/bracket-file-probe.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/bracket-file-probe.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [probeBracketFile](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/bracket-file-probe.ts:23>) | 23 | เลือกตัวอ่าน PDF หรือภาพจากชนิดไฟล์ แล้วตรวจว่าเนื้อไฟล์ใช้งานได้จริง |
| [probePdf](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/bracket-file-probe.ts:37>) | 37 | ใช้ pdf-lib อ่าน PDF ฝั่งเซิร์ฟเวอร์ โดยไม่พึ่ง canvas หรือ DOM ของเบราว์เซอร์ |
| [probeImage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/bracket-file-probe.ts:49>) | 49 | ใช้ตัวอ่านภาพตรวจขนาดและโครงสร้างจริงของไฟล์ก่อนเก็บเป็นสาย |

ชนิดข้อมูล/สัญญาที่ส่งออก: [BracketFileProbeResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/bracket-file-probe.ts:18>)

## features/competition/infrastructure/demo-competition-fixtures.ts

สร้างชุดทีม คู่ เวลา และผลตัวอย่างที่ระบุ ID คงที่สำหรับการสาธิตและ seed

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:1>)

ผู้เรียกในโครงการ: [features/demo-data/infrastructure/demo-seed-orchestration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:1>), [features/demo-data/infrastructure/demo-seed-safety.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:1>), [features/demo-data/infrastructure/prisma-demo-seed-port.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/demo-competition-fixtures.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/demo-competition-fixtures.test.ts:1>), [tests/features/demo-data/demo-seed-orchestration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/demo-seed-orchestration.test.ts:1>), [tests/features/demo-data/demo-seed-safety.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/demo-seed-safety.test.ts:1>), [tests/features/demo-data/prisma-demo-seed-port.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/prisma-demo-seed-port.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createDemoCompetitionFixtures](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:132>) | 132 | ประกอบ fixture สำหรับสาธิตจากนิยามเคสที่มี ID และผลคงที่ |
| [createFixture](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:136>) | 136 |  |
| [winnerForSource](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:229>) | 229 |  |
| [addHours](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:236>) | 236 |  |
| [requiredRoundName](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:240>) | 240 |  |
| [requiredMapValue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:249>) | 249 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [DemoCompetitionTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:14>), [DemoCompetitionMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:22>), [DemoCompetitionFixture](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/demo-competition-fixtures.ts:42>)

## features/competition/infrastructure/development-external-bracket-repository.ts

จำลองการเก็บโหมดและเวอร์ชันไฟล์สายในสภาพแวดล้อมพัฒนา พร้อมตรวจเวอร์ชันและประวัติ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:1>)

ผู้เรียกในโครงการ: [features/competition/infrastructure/get-external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-external-bracket-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/development-external-bracket-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/development-external-bracket-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [DevelopmentExternalBracketRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:72>) | 72 |  |
| [findModeSelectionContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:81>) | 81 |  |
| [selectMode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:102>) | 102 |  |
| [commitUploadedRevision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:138>) | 138 |  |
| [publishRevision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:197>) | 197 |  |
| [retireRevision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:239>) | 239 |  |
| [findWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:271>) | 271 |  |
| [findPublicByTournamentSlug](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:279>) | 279 |  |
| [mutate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:303>) | 303 |  |
| [requireWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:308>) | 308 |  |
| [assertVersion](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:324>) | 324 | ตรวจว่า version จากคำขอตรงกับข้อมูลปัจจุบันก่อนเขียน เพื่อไม่ทับการแก้ไขที่ใหม่กว่า |
| [toWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:331>) | 331 |  |
| [toWorkspaceContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:347>) | 347 |  |
| [appendAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:364>) | 364 |  |
| [readState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:376>) | 376 |  |
| [writeState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:398>) | 398 |  |
| [withStateMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:403>) | 403 |  |

## features/competition/infrastructure/get-competition-repository.ts

ประกอบ Prisma repository สำหรับ use case สาย ตาราง และผลการแข่งขัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-competition-repository.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/tournaments/\[id\]/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/results/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/results/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/schedule/page.tsx:1>), [app/api/admin/tournaments/\[id\]/matches/\[matchId\]/result-correction/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/matches/[matchId]/result-correction/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/entries/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/entries/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/generate/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/generate/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/publication/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/publication/route.ts:1>), [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/confirm/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/confirm/route.ts:1>), [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/purpose/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/purpose/route.ts:1>), [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/schedule/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/schedule/route.ts:1>), [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/score/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/score/route.ts:1>), [app/api/organizer/tournaments/\[id\]/matches/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getCompetitionRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-competition-repository.ts:15>) | 15 |  |

## features/competition/infrastructure/get-external-bracket-repository.ts

เลือกตัวเก็บไฟล์สายที่ตรงกับสภาพแวดล้อมและค่าฐานข้อมูล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-external-bracket-repository.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/organizer/tournaments/\[id\]/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:1>), [app/(public)/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>), [app/api/organizer/tournaments/\[id\]/bracket/external/publication/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/publication/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/external/revisions/\[revisionId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/[revisionId]/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/external/revisions/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/mode/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/mode/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getExternalBracketRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-external-bracket-repository.ts:16>) | 16 |  |

## features/competition/infrastructure/prisma-competition-repository.ts

อ่าน/ล็อกข้อมูลและบันทึกสาย ตาราง คะแนน และผู้ชนะผ่าน Prisma โดยรักษา transaction และ version

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1>)

ผู้เรียกในโครงการ: [features/competition/infrastructure/get-competition-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-competition-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/prisma-competition-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/prisma-competition-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PrismaCompetitionRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:57>) | 57 |  |
| [inTransaction](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:64>) | 64 | ส่ง adapter ที่ผูกกับ transaction ให้ use case เพื่อรวมการอ่าน/เขียนที่ต้องสำเร็จหรือย้อนกลับพร้อมกัน |
| [persistGeneratedPlan](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:72>) | 72 |  |
| [findLockContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:81>) | 81 |  |
| [lockEntries](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:88>) | 88 |  |
| [findGenerationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:94>) | 94 |  |
| [findOrganizerWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:101>) | 101 |  |
| [findPublicationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:200>) | 200 |  |
| [setPublication](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:207>) | 207 |  |
| [findExternalMatchCreationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:215>) | 215 |  |
| [createExternalMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:229>) | 229 | ตรวจว่าทีมอยู่ในรายการและเงื่อนไขตารางถูกต้อง ก่อนสร้างคู่ที่ผู้จัดกรอกเอง |
| [findExternalMatchPurposeContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:238>) | 238 |  |
| [updateExternalMatchPurpose](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:249>) | 249 | แก้ชนิดคู่แข่งขันในโหมดเอกสาร เช่น คู่ชิง โดยตรวจ version และข้อจำกัดของผลเดิม |
| [findMatchScheduleContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:258>) | 258 |  |
| [scheduleMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:270>) | 270 |  |
| [findResultContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:278>) | 278 |  |
| [recordScore](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:285>) | 285 |  |
| [confirmResultAndAdvance](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:293>) | 293 |  |
| [findResultCorrectionContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:302>) | 302 |  |
| [correctResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:312>) | 312 |  |
| [PrismaCompetitionOperations](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:321>) | 321 |  |
| [findLockContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:327>) | 327 |  |
| [findGenerationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:367>) | 367 |  |
| [findPublicationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:415>) | 415 |  |
| [lockEntries](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:457>) | 457 |  |
| [persistGeneratedPlan](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:515>) | 515 |  |
| [setPublication](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:616>) | 616 |  |
| [findExternalMatchCreationContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:659>) | 659 |  |
| [createExternalMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:733>) | 733 | ตรวจว่าทีมอยู่ในรายการและเงื่อนไขตารางถูกต้อง ก่อนสร้างคู่ที่ผู้จัดกรอกเอง |
| [findExternalMatchPurposeContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:823>) | 823 |  |
| [updateExternalMatchPurpose](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:863>) | 863 | แก้ชนิดคู่แข่งขันในโหมดเอกสาร เช่น คู่ชิง โดยตรวจ version และข้อจำกัดของผลเดิม |
| [findMatchScheduleContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:916>) | 916 |  |
| [scheduleMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:973>) | 973 |  |
| [findResultContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1016>) | 1016 |  |
| [recordScore](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1074>) | 1074 |  |
| [findResultCorrectionContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1114>) | 1114 |  |
| [correctResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1183>) | 1183 |  |
| [confirmResultAndAdvance](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1269>) | 1269 |  |
| [resultMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1349>) | 1349 |  |
| [isUniqueConstraintError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1369>) | 1369 |  |
| [requiredId](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1378>) | 1378 |  |
| [toJsonValue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-competition-repository.ts:1385>) | 1385 | แปลงข้อมูลให้เก็บในช่อง JSON ของ Prisma ได้ เช่น snapshot ใน audit |

## features/competition/infrastructure/prisma-external-bracket-repository.ts

บันทึกโหมดและเวอร์ชันไฟล์สายผ่าน Prisma พร้อมล็อกสาย ตรวจ version และบันทึก audit

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:1>)

ผู้เรียกในโครงการ: [features/competition/infrastructure/get-external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-external-bracket-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/competition/prisma-external-bracket-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/prisma-external-bracket-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PrismaExternalBracketRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:37>) | 37 |  |
| [findModeSelectionContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:46>) | 46 |  |
| [selectMode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:88>) | 88 |  |
| [commitUploadedRevision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:156>) | 156 |  |
| [publishRevision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:226>) | 226 |  |
| [retireRevision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:298>) | 298 |  |
| [findWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:353>) | 353 |  |
| [findPublicByTournamentSlug](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:404>) | 404 |  |
| [lockBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:453>) | 453 |  |
| [assertExternalBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:467>) | 467 |  |
| [bracketVersionWhere](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:481>) | 481 |  |
| [loadWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:495>) | 495 |  |
| [mapRevision](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:515>) | 515 |  |
| [latestConfirmedResultAt](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:542>) | 542 |  |
| [isPrismaUniqueError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:553>) | 553 |  |
| [toJsonValue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/prisma-external-bracket-repository.ts:563>) | 563 | แปลงข้อมูลให้เก็บในช่อง JSON ของ Prisma ได้ เช่น snapshot ใน audit |

## features/competition/infrastructure/tokenized-bracket-shuffle.ts

เรียงทีมด้วยค่า hash จาก token และ ID ทีม ทำให้ token เดิมได้ลำดับเดิมสำหรับตรวจย้อนหลัง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/tokenized-bracket-shuffle.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/bracket/generate/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/generate/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [tokenizedBracketShuffle](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/tokenized-bracket-shuffle.ts:12>) | 12 | สร้างลำดับที่ทำซ้ำได้จาก token; token ใหม่ให้การจับสลากใหม่ ส่วน token เดิมใช้ตรวจย้อนหลัง |
| [hashEntry](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/tokenized-bracket-shuffle.ts:25>) | 25 | ผสม token กับ ID entry เพื่อให้แต่ละทีมมีค่าที่นำไปเรียงลำดับได้ |

## features/competition/presentation/competition-handler.ts

ตรวจ JSON และตัวตนสำหรับคำสั่งสาย ตาราง และผล แล้วเรียก use case และคืนข้อความผิดพลาดภาษาไทย

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/matches/\[matchId\]/result-correction/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/matches/[matchId]/result-correction/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/entries/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/entries/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/generate/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/generate/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/publication/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/publication/route.ts:1>), [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/confirm/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/confirm/route.ts:1>), [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/purpose/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/purpose/route.ts:1>), [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/schedule/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/schedule/route.ts:1>), [app/api/organizer/tournaments/\[id\]/matches/\[matchId\]/score/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/score/route.ts:1>), [app/api/organizer/tournaments/\[id\]/matches/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/competition/competition-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/competition/competition-routes.test.ts:1>), [tests/api/competition/external-match-route.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/competition/external-match-route.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [handleLockBracketEntries](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:177>) | 177 |  |
| [handleGenerateBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:215>) | 215 |  |
| [handlePublishBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:253>) | 253 |  |
| [handleUnpublishBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:267>) | 267 |  |
| [handlePublication](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:281>) | 281 |  |
| [handleScheduleMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:322>) | 322 |  |
| [handleCreateExternalMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:359>) | 359 |  |
| [handleUpdateExternalMatchPurpose](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:397>) | 397 |  |
| [handleRecordMatchScore](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:436>) | 436 |  |
| [handleConfirmMatchResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:453>) | 453 |  |
| [handleCorrectMatchResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:480>) | 480 |  |
| [handleMatchResultMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:508>) | 508 |  |
| [competitionFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:557>) | 557 |  |
| [generationFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:588>) | 588 |  |
| [publicationFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:627>) | 627 |  |
| [scheduleFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:659>) | 659 |  |
| [externalMatchFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:703>) | 703 |  |
| [resultFailureResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/competition-handler.ts:759>) | 759 |  |

## features/competition/presentation/external-bracket-handler.ts

รับคำขอเลือกโหมด อัปโหลด เผยแพร่ และเลิกใช้ไฟล์สาย พร้อมตรวจฟอร์มและแปลงข้อผิดพลาด

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:1>)

ผู้เรียกในโครงการ: [app/api/organizer/tournaments/\[id\]/bracket/external/publication/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/publication/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/external/revisions/\[revisionId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/[revisionId]/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/external/revisions/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/mode/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/mode/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/competition/external-bracket-real-multipart.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/competition/external-bracket-real-multipart.test.ts:1>), [tests/api/competition/external-bracket-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/competition/external-bracket-routes.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [handleSelectBracketMode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:44>) | 44 |  |
| [handleUploadExternalBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:69>) | 69 |  |
| [handlePublishExternalBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:128>) | 128 |  |
| [handleRetireExternalBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:150>) | 150 |  |
| [handleRevisionMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:173>) | 173 |  |
| [requireActor](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:216>) | 216 |  |
| [optionalFormString](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:221>) | 221 |  |
| [isUploadFile](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:225>) | 225 |  |
| [validationResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:240>) | 240 |  |
| [mapExternalBracketError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:244>) | 244 |  |

## features/competition/presentation/tournament-competition-issue-label.ts

แปลงรหัสเงื่อนไขเริ่ม/จบการแข่งขันเป็นข้อความภาษาไทยสำหรับหน้าจอ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/tournament-competition-issue-label.ts:1>)

ผู้เรียกในโครงการ: [components/organizer/tournament-competition-lifecycle-panel.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/tournament-competition-lifecycle-panel.tsx:1>), [features/tournament-operations/presentation/organizer-workflow-guidance.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/presentation/organizer-workflow-guidance.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [tournamentCompetitionIssueLabel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/tournament-competition-issue-label.ts:25>) | 25 |  |
