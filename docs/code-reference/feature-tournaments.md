# ระบบ tournaments

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## features/tournaments/application/get-tournament-by-slug.ts

อ่านรายละเอียดรายการสาธารณะจาก slug ผ่าน repository ที่ส่งเข้ามา

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-by-slug.ts:1>)

ผู้เรียกในโครงการ: [app/(public)/tournaments/\[slug\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/get-tournament-by-slug.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/get-tournament-by-slug.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getTournamentBySlug](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-by-slug.ts:10>) | 10 | ส่ง slug ให้ repository อ่านรายการสาธารณะตามสัญญาเดียวกันทั้งข้อมูลจริงและ mock |

## features/tournaments/application/get-tournament-competition-by-slug.ts

อ่านข้อมูลการแข่งขันของรายการที่เลือกผ่าน slug เพื่อใช้ร่วมกันในสาย ตาราง และผล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-competition-by-slug.ts:1>)

ผู้เรียกในโครงการ: [app/(public)/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>), [app/(public)/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/page.tsx:1>), [app/(public)/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/schedule/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getTournamentCompetitionBySlug](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-competition-by-slug.ts:10>) | 10 | ส่ง slug ให้ repository อ่านสาย/คู่/ผลของรายการที่ผู้ชมเลือก |

## features/tournaments/application/get-tournament-registration-options.ts

ตรวจผู้ใช้และความพร้อมของทีม/รายการ เพื่อสร้างตัวเลือกทีมที่นำไปสมัครได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-registration-options.ts:1>)

ผู้เรียกในโครงการ: [app/(public)/tournaments/\[slug\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:1>), [components/tournaments/tournament-registration-action.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-registration-action.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/get-tournament-registration-options.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/get-tournament-registration-options.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getTournamentRegistrationOptions](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-registration-options.ts:33>) | 33 | ประกอบทีมที่ผู้ใช้ส่งสมัครได้และเหตุผลที่บางทีมยังไม่พร้อม |
| [getTournamentRegistrationAvailability](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-registration-options.ts:50>) | 50 | ตัดสินสถานะปุ่มสมัครจากบัญชีและสถานะการรับสมัครของรายการ |

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentRegistrationAvailability](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-registration-options.ts:14>)

## features/tournaments/application/search-tournaments.ts

ส่งเงื่อนไขค้นหารายการไป repository และคืนผลให้หน้าแรก/หน้ารายการ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/search-tournaments.ts:1>)

ผู้เรียกในโครงการ: [app/(public)/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/page.tsx:1>), [app/(public)/tournaments/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/search-tournaments.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/search-tournaments.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [searchTournaments](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/search-tournaments.ts:11>) | 11 | ส่งตัวกรองที่ผ่านการจัดรูปแบบไป repository โดยไม่ผูกกับ Prisma ใน use case |

## features/tournaments/domain/public-tournament-status.ts

แปลงสถานะจัดการและกำหนดเวลาของรายการเป็นสถานะที่ผู้ชมควรเห็น

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/public-tournament-status.ts:1>)

ผู้เรียกในโครงการ: [features/tournaments/infrastructure/mock-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:1>), [features/tournaments/infrastructure/prisma-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/public-tournament-status.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/public-tournament-status.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [resolvePublicTournamentStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/public-tournament-status.ts:10>) | 10 | แยกสถานะที่ใช้แสดงสาธารณะออกจากสถานะตรวจงานภายใน |

## features/tournaments/domain/tournament-calendar.ts

ช่วยแปลงวันที่เวลาไทยเป็นช่วง UTC เพื่อค้นหาการแข่งขันตามวันได้ถูกต้อง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/tournament-calendar.ts:1>)

ผู้เรียกในโครงการ: [features/registrations/domain/player-age-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:1>), [features/tournaments/infrastructure/mock-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:1>), [features/tournaments/infrastructure/prisma-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:1>), [features/tournaments/presentation/schedule-view-model.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/schedule-view-model.ts:1>), [features/tournaments/presentation/tournament-view-model.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-view-model.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [toBangkokCalendarDate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/tournament-calendar.ts:15>) | 15 |  |
| [getBangkokCalendarDayUtcRange](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/tournament-calendar.ts:26>) | 26 |  |

## features/tournaments/domain/tournament.ts

กำหนดข้อมูลรายการ คู่แข่งขัน สื่อ และตัวกรองที่หน้าสาธารณะใช้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/tournament.ts:1>)

ผู้เรียกในโครงการ: [components/bracket-view.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/bracket-view.tsx:1>), [components/schedule-table.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/schedule-table.tsx:1>), [components/tournament-row.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-row.tsx:1>), [components/tournament-search-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-search-form.tsx:1>), [features/competition/application/ports/competition-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/competition-repository.ts:1>), [features/tournament-operations/domain/tournament-operation.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/domain/tournament-operation.ts:1>), [features/tournaments/application/get-tournament-registration-options.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-registration-options.ts:1>), [features/tournaments/application/search-tournaments.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/search-tournaments.ts:1>), [features/tournaments/domain/public-tournament-status.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/public-tournament-status.ts:1>), [features/tournaments/infrastructure/mock-tournament-data.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-data.ts:1>), [features/tournaments/infrastructure/mock-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:1>), [features/tournaments/infrastructure/prisma-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:1>), [features/tournaments/infrastructure/tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/tournament-repository.ts:1>), [features/tournaments/presentation/schedule-view-model.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/schedule-view-model.ts:1>), [features/tournaments/presentation/tournament-search-params.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-search-params.ts:1>), [features/tournaments/presentation/tournament-view-model.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-view-model.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/get-tournament-registration-options.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/get-tournament-registration-options.test.ts:1>), [tests/features/tournaments/schedule-view-model.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/schedule-view-model.test.ts:1>), [tests/ui/tournaments/public-bracket.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-bracket.test.tsx:1>), [tests/ui/tournaments/public-results-page.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-results-page.test.tsx:1>), [tests/ui/tournaments/public-schedule-results.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-schedule-results.test.tsx:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/tournament.ts:7>), [TournamentFormat](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/tournament.ts:8>), [TournamentSearchFilters](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/tournament.ts:10>), [Match](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/tournament.ts:20>), [TournamentDocument](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/tournament.ts:38>), [Tournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/domain/tournament.ts:46>)

## features/tournaments/infrastructure/get-tournament-repository.ts

เลือกฐานข้อมูลจริงเมื่อมี DATABASE_URL หรือข้อมูลจำลองในโหมดพัฒนา; production ต้องมีฐานข้อมูล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/get-tournament-repository.ts:1>)

ผู้เรียกในโครงการ: [app/(public)/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>), [app/(public)/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/page.tsx:1>), [app/(public)/results/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/page.tsx:1>), [app/(public)/schedule/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/schedule/page.tsx:1>), [app/(public)/tournaments/\[slug\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:1>), [app/(public)/tournaments/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getTournamentRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/get-tournament-repository.ts:18>) | 18 | เลือก adapter ที่ใช้ข้อมูลจริงหรือข้อมูลจำลองตาม environment โดย production ไม่ fallback ไป mock |

## features/tournaments/infrastructure/mock-tournament-data.ts

ข้อมูลรายการจำลองสำหรับพัฒนา UI และทดสอบโดยไม่ต้องมีฐานข้อมูล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-data.ts:1>)

ผู้เรียกในโครงการ: [features/tournaments/infrastructure/mock-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/search-tournaments.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/search-tournaments.test.ts:1>), [tests/ui/public-competition-prefetch.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-competition-prefetch.test.tsx:1>), [tests/ui/public-navigation-prefetch.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-navigation-prefetch.test.tsx:1>)

## features/tournaments/infrastructure/mock-tournament-repository.ts

ค้นหาและอ่านรายการจากข้อมูลจำลอง โดยใช้สัญญาเดียวกับ repository จริง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:1>)

ผู้เรียกในโครงการ: [features/tournaments/infrastructure/get-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/get-tournament-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/get-tournament-by-slug.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/get-tournament-by-slug.test.ts:1>), [tests/features/tournaments/search-tournaments.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/search-tournaments.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [normalize](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:14>) | 14 |  |
| [matchesText](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:18>) | 18 |  |
| [matchesExactText](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:22>) | 22 |  |
| [MockTournamentRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:26>) | 26 |  |
| [list](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:29>) | 29 |  |
| [findBySlug](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:65>) | 65 |  |
| [findCompetitionBySlug](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:83>) | 83 |  |
| [findFirstCompetitionByStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:88>) | 88 |  |

## features/tournaments/infrastructure/prisma-tournament-repository.ts

อ่านรายการที่อนุญาตให้เผยแพร่และข้อมูลการแข่งขันจาก Prisma พร้อมตัวกรองและการเลือกข้อมูลสำหรับหน้าสาธารณะ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:1>)

ผู้เรียกในโครงการ: [features/tournaments/infrastructure/get-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/get-tournament-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/prisma-tournament-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/prisma-tournament-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PrismaTournamentRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:115>) | 115 |  |
| [list](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:122>) | 122 |  |
| [findBySlug](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:135>) | 135 |  |
| [findCompetitionBySlug](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:149>) | 149 |  |
| [findFirstCompetitionByStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:162>) | 162 |  |
| [mapDiscoveryTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:177>) | 177 |  |
| [mapCompetitionTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:183>) | 183 |  |
| [mapDetailTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:236>) | 236 |  |
| [buildDiscoveryWhere](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:259>) | 259 | ประกอบ Prisma where จากตัวกรองค้นหาและข้อจำกัดการเผยแพร่รายการ |
| [containsText](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:319>) | 319 |  |
| [mapTournamentBase](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:326>) | 326 |  |
| [mapPublicStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:368>) | 368 |  |
| [getPosterUrl](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:374>) | 374 |  |

## features/tournaments/infrastructure/tournament-repository.ts

กำหนดสัญญาค้นหารายการ อ่านรายละเอียด และเลือกรายการสำหรับหน้าสาย/ตาราง/ผล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/tournament-repository.ts:1>)

ผู้เรียกในโครงการ: [features/tournaments/application/get-tournament-by-slug.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-by-slug.ts:1>), [features/tournaments/application/get-tournament-competition-by-slug.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/get-tournament-competition-by-slug.ts:1>), [features/tournaments/application/search-tournaments.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/application/search-tournaments.ts:1>), [features/tournaments/infrastructure/get-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/get-tournament-repository.ts:1>), [features/tournaments/infrastructure/mock-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/mock-tournament-repository.ts:1>), [features/tournaments/infrastructure/prisma-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [DefaultCompetitionStatus](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/tournament-repository.ts:9>), [TournamentRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/tournament-repository.ts:11>)

## features/tournaments/presentation/schedule-view-model.ts

จัดคู่แข่งขันเป็นกลุ่มตามวันที่และสนามสำหรับตารางสาธารณะ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/schedule-view-model.ts:1>)

ผู้เรียกในโครงการ: [components/schedule-table.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/schedule-table.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/schedule-view-model.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/schedule-view-model.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [groupMatchesByDateAndCourt](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/schedule-view-model.ts:14>) | 14 | จัดกลุ่มคู่ตามวันและสนามให้ตารางแสดงเป็นช่วงที่อ่านได้ง่าย |

ชนิดข้อมูล/สัญญาที่ส่งออก: [ScheduledMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/schedule-view-model.ts:11>)

## features/tournaments/presentation/tournament-search-params.ts

แปลง query string เป็นตัวกรองค้นหาและแปลงกลับ เพื่อให้ URL เก็บเงื่อนไขที่เลือก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-search-params.ts:1>)

ผู้เรียกในโครงการ: [app/(public)/tournaments/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/page.tsx:1>), [components/tournament-search-form.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-search-form.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/tournament-search-params.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/tournament-search-params.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [scalarValue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-search-params.ts:19>) | 19 |  |
| [parseTournamentSearchParams](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-search-params.ts:29>) | 29 | อ่าน query string และคืนเฉพาะตัวกรองที่ระบบรองรับ |
| [toTournamentSearchParams](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-search-params.ts:54>) | 54 | สร้าง query string จากตัวกรอง เพื่อคงตัวเลือกไว้ใน URL |

## features/tournaments/presentation/tournament-view-model.ts

จัดข้อความวันที่และรูปแบบการแข่งขันให้อ่านเป็นภาษาไทยก่อนแสดงใน component

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-view-model.ts:1>)

ผู้เรียกในโครงการ: [app/(public)/tournaments/\[slug\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:1>), [components/tournament-row.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournament-row.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournaments/tournament-view-model.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/tournament-view-model.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [parseDate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-view-model.ts:18>) | 18 |  |
| [formatThaiCalendarDate](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-view-model.ts:22>) | 22 |  |
| [formatTournamentDateRange](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-view-model.ts:26>) | 26 |  |
| [formatTournamentFormat](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-view-model.ts:48>) | 48 |  |
