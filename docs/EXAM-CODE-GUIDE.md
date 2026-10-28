# คู่มืออ่านโค้ด COURTSIDE สำหรับสอบโปรเจกต์

คู่มือนี้อ้างอิงโค้ดใน worktree `courtside-public-platform` หลังรอบปรับความอ่านง่ายวันที่ 23 ตุลาคม 2026 อ่านตามเส้นทางของงานจริง แล้วเปิดลิงก์ไปยังฟังก์ชันที่อาจารย์ถามได้ทันที

## วิธีเปิดโค้ดตอบคำถาม

1. เริ่มจาก URL ที่เห็นบนหน้าจอ แล้วหา `page.tsx` ใน [สารบัญหน้าและ API](code-reference/app.md)
2. ถ้าอาจารย์ถามปุ่มหรือฟอร์ม ให้ตาม import ไป component และฟังก์ชัน event เช่น `handleSubmit`
3. ดูว่า `fetch` ส่งไป API ใด ใช้วิธี POST/PUT/PATCH/DELETE และส่ง field อะไรใน body
4. เปิด `route.ts` ของ API นั้น แล้วตามไป presentation handler และ application use case
5. เปิด domain เพื่ออธิบายกฎ และ infrastructure repository เพื่ออธิบายว่าบันทึกตารางใด
6. เปิดเทสต์ที่เกี่ยวข้องเพื่อยกตัวอย่างทั้งกรณีสำเร็จและกรณีที่ระบบต้องปฏิเสธ

คอมเมนต์หัวไฟล์บอกหน้าที่ ผู้เรียกบางส่วน และไฟล์สำคัญที่ต้องตามต่อ ส่วนคอมเมนต์หน้าฟังก์ชัน/บล็อกสำคัญบอกเหตุผลและการไหลของข้อมูล ไม่จำเป็นต้องท่องคำแปลทุกเครื่องหมายของภาษา

## สารบัญทั้งโครงการ

- [หน้าเว็บและ API (82 ไฟล์)](code-reference/app.md)
- [ส่วนแสดงผลและฟอร์ม (68 ไฟล์)](code-reference/components.md)
- [การตั้งค่าโครงการ (6 ไฟล์)](code-reference/config.md)
- [ระบบ admin (12 ไฟล์)](code-reference/feature-admin.md)
- [ระบบ competition (38 ไฟล์)](code-reference/feature-competition.md)
- [ระบบ demo-data (4 ไฟล์)](code-reference/feature-demo-data.md)
- [ระบบ identity (19 ไฟล์)](code-reference/feature-identity.md)
- [ระบบ provinces (2 ไฟล์)](code-reference/feature-provinces.md)
- [ระบบ registrations (13 ไฟล์)](code-reference/feature-registrations.md)
- [ระบบ shared (3 ไฟล์)](code-reference/feature-shared.md)
- [ระบบ team-management (25 ไฟล์)](code-reference/feature-team-management.md)
- [ระบบ tournament-media (14 ไฟล์)](code-reference/feature-tournament-media.md)
- [ระบบ tournament-operations (21 ไฟล์)](code-reference/feature-tournament-operations.md)
- [ระบบ tournaments (15 ไฟล์)](code-reference/feature-tournaments.md)
- [ระบบ workflow-guidance (1 ไฟล์)](code-reference/feature-workflow-guidance.md)
- [ตัวเชื่อมบริการร่วม (6 ไฟล์)](code-reference/lib.md)
- [ฐานข้อมูลและ seed (2 ไฟล์)](code-reference/prisma.md)
- [สคริปต์พัฒนาและตรวจข้อมูล (4 ไฟล์)](code-reference/scripts.md)
- [ชุดทดสอบ (171 ไฟล์)](code-reference/tests.md)

ลิงก์ source ในสารบัญเปิดไฟล์ภายในเครื่องที่บรรทัดปัจจุบัน หากแก้โค้ดภายหลังเลขบรรทัดอาจเลื่อน ให้ใช้ชื่อฟังก์ชันประกอบการค้นหา

## โครงสร้างที่ควรอธิบายได้

| ส่วน | หน้าที่ | สิ่งที่ควรชี้ให้อาจารย์เห็น |
| --- | --- | --- |
| `app/` | URL, หน้า, layout, API | `page.tsx` คือหน้า และ `route.ts` คือจุดรับ HTTP |
| `components/` | ฟอร์ม ตาราง ปุ่ม และส่วนแสดงผลที่ใช้ซ้ำ | รับ props, เก็บ state, รับ event, ส่ง API |
| `features/*/presentation/` | ตรวจรูปแบบคำขอ/เตรียมข้อมูลแสดงผล | Zod, HTTP status, ข้อความภาษาไทย |
| `features/*/application/` | ประสานงานหนึ่งกรณีใช้งาน | ตรวจสิทธิ์ เจ้าของ สถานะ และเรียกกฎ/คลังข้อมูล |
| `features/*/domain/` | กฎและชนิดข้อมูลของระบบ | ฟังก์ชันที่ไม่ต้องใช้ React, Next.js หรือฐานข้อมูล |
| `features/*/infrastructure/` | เชื่อมฐานข้อมูลและบริการภายนอก | Prisma, Supabase, mapping และ transaction |
| `application/ports/` | สัญญาของบริการ/คลังข้อมูล | interface ช่วยให้ use case ใช้ของจริงหรือ mock ได้ |
| `lib/` | การเชื่อมบริการที่หลาย feature ใช้ | Prisma client และ Supabase session |
| `prisma/schema.prisma` | ตารางและความสัมพันธ์ | foreign key, unique, index, enum |
| `tests/` | ตรวจพฤติกรรมที่คาดหวัง | การจำลอง dependency และ assertions |
| `scripts/` | งานพัฒนา/ตรวจข้อมูล/ข้อมูลสาธิต | ไม่ใช่เส้นทางที่ผู้ใช้เว็บเรียกเป็นปกติ |

บางสัญญา repository ของ feature เก่ายังอยู่ในโฟลเดอร์ `infrastructure` แม้ถูกใช้เหมือน port ไม่ควรอธิบายว่าทั้งโปรเจกต์วางสัญญาไว้ใน `application/ports` ครบทุกไฟล์

การอ่านหน้าโดยทั่วไป: `page.tsx → use case → repository → PostgreSQL → props → component`

การกดปุ่มเปลี่ยนข้อมูล: `component → fetch → route.ts → handler → use case → domain/repository → response → state หรือ refresh`

## เส้นทาง 1: สมัครบัญชีและเข้าสู่ระบบ

เริ่มที่ [ฟอร์มสมัครบัญชี](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/register-form.tsx:45>) หรือ [ฟอร์มเข้าสู่ระบบ](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/auth/login-form.tsx:36>) ฟอร์มส่งข้อมูลใน body ของ POST ไป API ไม่ใช้ query string เก็บรหัสผ่าน

[auth-handler](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/identity/presentation/auth-handler.ts:107>) เป็นตัวประสานคำสั่ง ส่วน [ตัวประกอบบริการ Auth](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/identity/infrastructure/get-auth-handlers.ts:33>) เชื่อมกับ Supabase จริง การมีบัญชี Supabase กับการมีโปรไฟล์ของแอปเป็นคนละส่วน: Auth ตรวจอีเมล/รหัสผ่าน ส่วนตาราง User ของแอปเก็บบทบาทที่ใช้ตัดสินสิทธิ์

[ตัวอ่านผู้ใช้ปัจจุบัน](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/identity/infrastructure/supabase-current-actor-provider.ts:17>) ตรวจผู้ใช้จาก provider แล้วหาโปรไฟล์ ก่อนคืน `Actor` ให้ use case ไม่ควรเชื่อ role ที่ส่งมาจาก browser

คำตอบตัวอย่าง: “หน้าล็อกอินส่งข้อมูลไป Route Handler จากนั้น handler เรียก Supabase Auth ถ้าเข้าสู่ระบบได้จะอ่านโปรไฟล์ของแอปเพื่อรู้บทบาท แล้วเลือกหน้าที่บัญชีเข้าได้ครับ/ค่ะ”

## เส้นทาง 2: สร้างทีมและจัดผู้เล่น

[TeamEditor.handleSubmit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/team/team-editor.tsx:95>) รับชื่อ จังหวัด รูปแบบทีม และรายชื่อเริ่มต้น → [POST /api/teams](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/route.ts:15>) → [handleCreateTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/presentation/team-handler.ts:140>) → [createTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/create-team.ts:39>) → [PrismaTeamRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/prisma-team-repository.ts:44>)

use case ตรวจสิทธิ์ รหัสจังหวัด ชื่อทีมซ้ำภายในบัญชี และจำนวนผู้เล่น จากนั้นบันทึกทีม ผู้เล่น และ audit ใน transaction เดียวกัน ข้อมูลผู้เล่นเก็บใน TeamPlayer จึงไม่ต้องให้ผู้เล่นทุกคนสมัครบัญชี

[กฎชุดผู้เล่น](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-player-batch-policy.ts:23>) จำกัด 5v5 ไม่เกิน 15 คน และ 3v3 ไม่เกิน 4 คน พร้อมตรวจคน/เบอร์เสื้อซ้ำ ส่วนจำนวนขั้นต่ำสำหรับส่งสมัครอยู่ที่ [กฎรายชื่อสมัคร](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/domain/team-policy.ts:21>) คือ 5 และ 3 คนตามรูปแบบ

[authorizePlayerRosterAccess](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/team-access.ts:28>) ใช้ร่วมกันตอนเพิ่ม แก้ และนำผู้เล่นออก หากแอดมินทำแทนเจ้าของจะคืน `true` ให้ use case บันทึก audit เพิ่ม

การลบทีมต้องอธิบายตาม [removeOrDeactivateTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/application/remove-or-deactivate-team.ts:27>): ทีมที่ยังมีใบสมัคร active ถูกบล็อก ทีมที่ไม่มีประวัติอ้างอิงตามเงื่อนไขลบได้ ส่วนทีมที่ต้องเก็บประวัติใช้การปิดสถานะ

## เส้นทาง 3: สร้างรายการ ส่งตรวจ และอนุมัติ

[TournamentEditor.handleSubmit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-editor.tsx:57>) อ่านฟอร์มแล้วตรวจด้วย [Zod schema](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-editor-schema.ts:1>) ก่อนส่ง API การตรวจบนหน้าเว็บช่วยผู้ใช้ แต่เซิร์ฟเวอร์ต้องตรวจอีกครั้งเพราะคำขออาจไม่ได้มาจากฟอร์มของเรา

[saveTournamentHandler](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/save-tournament-handler.ts:30>) เลือกสร้างหรือแก้ผ่าน [createTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:17>) / [updateTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:32>) รายละเอียดกับกติกาเป็นข้อความว่างได้เมื่อใช้เอกสารแนบ

ปุ่มส่งตรวจเรียก [submitTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/create-tournament.ts:59>) ให้เปลี่ยนจาก DRAFT/CHANGES_REQUESTED เป็น SUBMITTED แอดมินตัดสินผ่าน [reviewTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/application/review-tournament.ts:15>) การอนุมัติและการเผยแพร่เป็นคนละขั้น จึงไม่ควรบอกว่าอนุมัติแล้วเปิดรับสมัครทันทีเสมอ

คำสั่งบันทึกใช้ version เปรียบเทียบกับข้อมูลปัจจุบัน หากมีคนแก้ก่อนจะคืน conflict ให้โหลดข้อมูลล่าสุด แทนการทับข้อมูลเงียบ ๆ

## เส้นทาง 4: ทีมสมัครและผู้จัดตรวจใบสมัคร

[submitRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-registration-action.tsx:83>) ส่ง teamId ไป [API สมัคร](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/tournaments/[id]/registrations/route.ts:13>) → [applyToTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/apply-to-tournament.ts:22>)

[assertCanApply](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/registration-policy.ts:64>) ตรวจสถานะเปิดรับสมัคร วันปิดรับ ความจุ เจ้าของทีม รูปแบบ และรายชื่อ ส่วน [assertRosterAgeEligibility](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/domain/player-age-policy.ts:45>) ตรวจอายุเต็มปี ณ วันเริ่มรายการตามปฏิทินไทย เช่น U18 ต้องอายุต่ำกว่า 18 ปี

[repository ใบสมัคร](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/prisma-registration-repository.ts:38>) ล็อกทีม/รายการ ตรวจใบสมัครที่ยัง active และชื่อทีมซ้ำในรายการเดียวกันก่อนสร้าง PENDING เมื่อผู้จัดตัดสิน [decideRegistration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/decide-registration.ts:25>) จะตรวจสิทธิ์และสถานะซ้ำ พร้อมเก็บเหตุผลเมื่อปฏิเสธ

ผู้จัดดูสมาชิกทีมผ่าน [RegistrationTeamRoster](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/registration-team-roster.tsx:9>) โดยข้อมูลมาจาก [use case อ่านใบสมัคร](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/application/list-tournament-registrations.ts:23>) ที่ตรวจเจ้าของรายการก่อน

## เส้นทาง 5: จัดสายที่อธิบายง่าย

เริ่มที่ [BracketWorkspace](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-workspace.tsx:20>) ตรึงทีมที่อนุมัติแล้ว จากนั้นเรียงตำแหน่งเองหรือสั่งสุ่ม แล้วส่งคำขอผ่าน [API สร้างสาย](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/generate/route.ts:17>) ไป [generateBracketDraft](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/generate-bracket.ts:49>)

ฟังก์ชันที่ใช้สร้างสายปัจจุบันคือ [generateOrderedSingleEliminationBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:86>) ซึ่งตรวจจำนวน 8/16/32 ทีม แล้วจับคู่ตำแหน่งติดกัน 1–2, 3–4 ต่อไปจนครบ ไม่ใช้การจัดลำดับความเก่งของทีม

[buildBracketPlan](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/bracket-generator.ts:105>) วนทีละรอบ สร้างคู่ และกำหนด `nextMatchKey` กับ `nextSlot` ว่าผู้ชนะจะไปคู่ใด จำนวนคู่รวมเป็น n−1 เช่น 8 ทีมมี 7 คู่

การสุ่มอยู่ที่ [tokenizedBracketShuffle](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/tokenized-bracket-shuffle.ts:12>) ใช้ token กับ ID ทีมสร้างลำดับที่ทำซ้ำได้ เพื่อเก็บผลจับสลากเดิมและตรวจย้อนหลัง ไม่ใช่อัลกอริทึมประเมินฝีมือทีม

ไฟล์เดียวกันยังมี `generateSingleEliminationBracket` แบบ seed เดิมที่ชุดข้อมูลสาธิต/เทสต์เรียกใช้ อย่าอธิบายว่าเป็นฟังก์ชันที่ปุ่มสร้างสายปัจจุบันเรียก หากอาจารย์ถามให้ชี้ import ของ `generateBracketDraft` เป็นหลักฐาน

โหมดเอกสารทำงานอีกเส้นทางผ่าน [uploadExternalBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:50>) ไฟล์ PDF/ภาพมีไว้เปิดดู ไม่มีการอ่านไฟล์แล้วแปลงเป็นคู่แข่งขันอัตโนมัติ

## เส้นทาง 6: ตารางและผลการแข่งขัน

[saveMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-schedule-editor.tsx:43>) ส่งเวลา สนาม และ version → [scheduleMatch](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/schedule-match.ts:27>) ตรวจเจ้าของ ช่วงวัน สถานะคู่ และการชนสนามใน 5v5 ก่อนบันทึก ส่วน 3v3 อนุญาตสนาม/เวลาเดียวกันตามกติกาที่กำหนด

[submitResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/match-result-editor.tsx:49>) แยกบันทึกร่างกับยืนยันผล: [recordMatchScore](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/record-match-score.ts:26>) เก็บคะแนนเท่านั้น ส่วน [confirmMatchResult](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/confirm-match-result.ts:26>) ใช้ [decideMatchAdvancement](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/domain/match-result-policy.ts:38>) ตัดสินผู้ชนะและส่งต่อ repository ให้บันทึกผล/เลื่อนทีมร่วมกัน

คะแนนร่างเสมอได้ แต่คะแนนยืนยันต้องไม่เสมอ ในโหมดไฟล์สายระบบเก็บผลโดยไม่เดาทางเลื่อนผู้ชนะจากเอกสาร ผู้จัดจัดคู่เองตามไฟล์

คำตอบตัวอย่าง: “เราเก็บปลายทางผู้ชนะไว้ตั้งแต่สร้างสาย พอยืนยันผลก็เลือกทีมคะแนนมากกว่าและใส่ไปช่องของคู่ถัดไปตาม ID ที่เชื่อมไว้ โดยทำใน transaction เดียวกันครับ/ค่ะ”

## เส้นทาง 7: โปสเตอร์และเอกสาร

[ตัวอัปโหลดสื่อ](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-media-manager.tsx:42>) ส่ง FormData → [handler สื่อ](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:39>) → [uploadTournamentMedia](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:47>)

[validateMediaFileContent](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-policy.ts:49>) ตรวจลายเซ็นเนื้อไฟล์ให้ตรงชนิด โดยแยกชนิดไฟล์เป็น switch ที่อ่านทีละกรณีได้ ไฟล์จริงอยู่ใน Supabase Storage ส่วนข้อมูลชื่อ ชนิด ขนาด bucket และ path อยู่ใน MediaAsset

แอดมินเปิดเอกสารแนบตรวจรายการผ่าน endpoint เฉพาะซึ่งตรวจสิทธิ์ทุกครั้ง ลิงก์ในหน้าตรวจจึงไม่ต้องผูกกับ signed URL ที่หมดอายุในไม่กี่นาที

## เส้นทาง 8: หน้าสาธารณะและการเลือกทัวร์นาเมนต์

[หน้าแรก](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/page.tsx:1>) และ [หน้ารายการแข่งขัน](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/page.tsx:1>) อ่าน query string เป็นตัวกรอง แล้วเรียก repository สำหรับข้อมูลที่ผู้ชมเห็นได้

หน้าสาย ตาราง และผลส่ง `?tournament=<slug>` ให้กันเพื่อคงรายการที่เลือก หากไม่มีค่า หน้าจะใช้เงื่อนไขเลือกค่าตั้งต้นจาก repository ดังนั้นอาจเห็นรายการเดิมเมื่อเปิด URL เปล่าหลายครั้ง ไม่ใช่หลักฐานว่ามี ID เขียนตายตัว

[PrismaTournamentRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:115>) รับผิดชอบตัวกรองและการเลือกฟิลด์ ส่วน [view model วันที่/รูปแบบ](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/presentation/tournament-view-model.ts:1>) ช่วยแปลงข้อมูลก่อนแสดง

## ฐานข้อมูลที่ควรเชื่อมให้ถูก

เปิด [schema.prisma](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/prisma/schema.prisma:1>) แล้วตามชื่อตารางและ relation

| ตาราง | อธิบายให้สั้นและตรง |
| --- | --- |
| User | โปรไฟล์และบทบาทของแอป เชื่อมบัญชี Supabase ด้วย supabaseUserId |
| Team / TeamPlayer | เจ้าของทีมและรายชื่อผู้เล่นที่ไม่จำเป็นต้องมีบัญชี |
| Tournament | รายการของผู้จัด พร้อมสถานะและวันเวลา |
| Registration | เชื่อมทีมกับรายการพร้อมสถานะใบสมัคร |
| Bracket / BracketEntry / BracketRound | หัวสาย รายชื่อทีมที่ตรึง และรอบ |
| Match | คู่ ทีม เวลา สนาม คะแนนร่าง และปลายทางผู้ชนะ |
| MatchResult | คะแนน/ผู้ชนะที่ยืนยันแล้วหนึ่งผลต่อคู่ |
| MediaAsset / ExternalBracketRevision | ที่อยู่ไฟล์และประวัติเวอร์ชันสายเอกสาร |
| TournamentReview / AuditLog | ผลตรวจรายการและประวัติคำสั่งสำคัญ |

`@id` คือคีย์หลัก, `@unique`/`@@unique` ป้องกันค่าซ้ำในขอบเขตที่กำหนด, `@relation` เชื่อมตาราง, `@@index` ช่วยการค้นหาตามคอลัมน์, `onDelete` ระบุผลต่อข้อมูลที่อ้างอิงเมื่อลบ อย่าเหมารวมว่า index ทุกตัวป้องกันข้อมูลซ้ำ

## คำถามที่อาจารย์มักถาม

**ทำไมต้องแบ่งหลายชั้น?** หน้าเว็บดูแลการแสดงผล use case ดูแลขั้นตอนงาน domain ดูแลกฎ และ repository ดูแลฐานข้อมูล จึงทดสอบกฎได้โดยไม่ต้องเปิดเว็บหรือเชื่อม Supabase ทุกครั้ง

**ซ่อนปุ่มแล้วถือว่าปลอดภัยหรือยัง?** ยัง ต้องตรวจซ้ำบนเซิร์ฟเวอร์ที่ [authorize](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/identity/application/authorize.ts:19>) และ use case เพราะคนส่ง HTTP ตรงมาได้

**version ต่างจาก transaction อย่างไร?** version ตรวจว่าคำขอใช้ข้อมูลเก่าหรือไม่ ส่วน transaction ทำให้การเขียนหลายส่วนสำเร็จหรือย้อนกลับด้วยกัน บางงานใช้ row lock/Serializable เพิ่มเพื่อป้องกันคำขอพร้อมกัน

**interface ทำงานตอนรันหรือไม่?** เป็นสัญญาชนิดข้อมูลของ TypeScript ตอนตรวจโค้ด ส่วน class/function ที่นำ interface ไปใช้คือสิ่งที่ทำงานจริง

**ทำไมมี use client?** component นั้นใช้ state, event หรือ API เบราว์เซอร์ การอ่านข้อมูลหน้าและการตรวจสิทธิ์หลักยังทำฝั่งเซิร์ฟเวอร์

**ทำไม params/searchParams ต้อง await?** เป็น API ตาม Next.js ที่ติดตั้งอยู่ ดูตัวอย่างใน page และ route ของโปรเจกต์ ไม่ใช้รูปแบบจากเวอร์ชันเก่า

**useState เปลี่ยนฐานข้อมูลหรือไม่?** เปลี่ยนข้อมูลบนหน้าจอเท่านั้น ต้องมีการส่ง API และบันทึกสำเร็จจึงเปลี่ยนข้อมูลจริง

**ทำไมยังมี mock/legacy?** mock และ development adapter มีผู้เรียกจากโหมดพัฒนาหรือเทสต์ ส่วน legacy บางส่วนอ่านข้อมูล/fixture เดิม การลบทั้งหมดเพียงเพราะไม่เห็นบนหน้าจอจะทำให้เส้นทางเหล่านั้นเสีย

**ทำไมบาง repository มีเมธอดชื่อเหมือนกันสองชั้น?** ชั้นนอกประกอบ client และเริ่ม transaction ส่วนตัวดำเนินการด้านในใช้ client ของ transaction เดียวกัน ไม่ใช่การบันทึกซ้ำสองครั้ง

**ข้อมูลทั้งหมดใช้จริงกับ production หรือไม่?** ต้องแยก runtime, test และ development ตามสารบัญ การมีไฟล์หรือชนิดข้อมูลไม่ได้แปลว่ามีหน้าจอให้ผู้ใช้ใช้ครบทุกแนวคิดแล้ว

## สิ่งที่ปรับในรอบนี้

- ตัด `components/ui/skeleton.tsx` และ `lib/supabase/browser.ts` หลังตรวจว่าไม่มีผู้เรียกใน source/test/script หรือ dynamic import ที่ค้นพบ
- รวมฟังก์ชันตรวจสิทธิ์รายชื่อผู้เล่นที่เหมือนกัน 3 แห่งมาอยู่ใน `team-access.ts` โดยรักษาเงื่อนไขและรหัสผิดพลาดเดิม
- แยกการตรวจเนื้อไฟล์จาก conditional expression ซ้อนกันเป็น switch และเลิกใช้ `as never` ในการเทียบชนิดไฟล์
- เพิ่มคำอธิบายหัวไฟล์ของ source ที่ดูแลเอง และคอมเมนต์ในฟังก์ชัน/บล็อกสำคัญ โดยรักษาคอมเมนต์เดิมที่ยังถูกต้อง
- เพิ่มคำอธิบาย model/enum ของฐานข้อมูล โดยไม่เปลี่ยนตารางหรือทำ migration

ไม่ได้แก้ไฟล์ generated, dependency, build output, credentials หรือประวัติ migration เพราะเป็นผลลัพธ์อัตโนมัติ/ข้อมูลตั้งค่า/ประวัติฐานข้อมูล ไฟล์ JSON ไม่รองรับคอมเมนต์ จึงอธิบายไว้ใน [สารบัญการตั้งค่า](code-reference/config.md)

## การตรวจคุณภาพโค้ด

ใช้ `npm run typecheck` ตรวจทั้ง source และ tests หลังสร้างชนิดข้อมูลของ Next.js ส่วน `npm run test` ตรวจพฤติกรรม และ `npm run build` ตรวจชุดเว็บสำหรับ production เป็นการตรวจคนละด้าน ไม่ใช้ผลอย่างใดอย่างหนึ่งแทนกัน รอบติดตามได้แก้ mock/fixture ที่ขาด field หรือ infer ชนิดแคบเกินไปแล้ว และเพิ่ม typecheck ใน GitHub Actions

แพ็กเกจอัปเดตเป็น Next.js 16.4.2, Prisma 7.10.1 และ Vitest 4.1.12 ส่วนคำเตือนที่ยังไม่มีแพตช์ของเครื่องมือพัฒนา ดู [รายงานตรวจและส่งงาน](VERIFICATION-AND-PUBLISH.md)

ผลตรวจรอบล่าสุดและขอบเขตการเปรียบเทียบโค้ดอยู่ใน [รายงานตรวจรอบนี้](CODE-CLEANUP-REVIEW.md)
