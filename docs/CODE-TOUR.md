# แผนที่โค้ด COURTSIDE สำหรับอธิบายโปรเจกต์

> คู่มือฉบับขยายวันที่ 23 ตุลาคม 2026: [EXAM-CODE-GUIDE.md](EXAM-CODE-GUIDE.md) มีเส้นทางหลัก คำถามสำหรับสอบ และสารบัญ source ทั้งโครงการพร้อมบรรทัดหลังเพิ่มคอมเมนต์ เลขบรรทัดในเอกสารเดิมด้านล่างอาจเลื่อนแล้ว

เอกสารนี้เป็นจุดเริ่มต้นเวลาอาจารย์ถามว่า "หน้านี้อยู่ตรงไหน" หรือ "กดปุ่มแล้วเกิดอะไรขึ้น" ให้เปิดไฟล์ตามตาราง แล้วตามการเรียกฟังก์ชันจากหน้าเว็บไปยัง use case และฐานข้อมูล คอมเมนต์ในไฟล์ต้นทางเน้นจุดที่เป็นกฎหรือทางแยกสำคัญ ไม่ได้อธิบายทุกบรรทัด

## อ่านโครงสร้างก่อน

| ตำแหน่ง | หน้าที่ |
| --- | --- |
| `app/(public)/` | หน้าสาธารณะและหน้าบัญชี; `page.tsx` เป็นทางเข้าของ URL |
| `app/(admin)/` | หน้าหลังเข้าสู่ระบบของทีม ผู้จัด และแอดมิน |
| `app/api/` | Route Handler รับคำขอที่เปลี่ยนข้อมูล เช่น `POST` และ `PATCH` |
| `components/` | ส่วนแสดงผลและฟอร์มที่หน้าเว็บนำมาใช้ |
| `features/*/presentation/` | ตรวจรูปแบบคำขอและแปลงผลลัพธ์เป็น HTTP |
| `features/*/application/` | Use case ตรวจสิทธิ์ เจ้าของรายการ สถานะ และประสานงานการบันทึก |
| `features/*/domain/` | กฎการแข่งขันและการคำนวณที่ไม่พึ่ง Next.js หรือฐานข้อมูล |
| `features/*/infrastructure/` | ตัวเชื่อม Prisma, Supabase และบริการภายนอก |
| `prisma/schema.prisma` | ตาราง ความสัมพันธ์ และข้อจำกัดของฐานข้อมูล |

หน้าที่อ่านข้อมูล: `page.tsx` → application → repository interface → infrastructure → PostgreSQL → component

ปุ่มที่เปลี่ยนข้อมูล: client component → `app/api/.../route.ts` → presentation handler → application → domain/repository → PostgreSQL โดยตรวจสิทธิ์บน server เสมอ การซ่อนปุ่มใน UI ไม่ใช่การป้องกันข้อมูล

## หน้าเว็บทั้งหมด

กลุ่มในวงเล็บ เช่น `(public)` และ `(admin)` เป็น route group ไม่ปรากฏใน URL ส่วน `[id]` และ `[slug]` เป็นค่าที่เปลี่ยนตามรายการ

| URL | ไฟล์หน้า | ใช้ทำอะไร |
| --- | --- | --- |
| `/` | `app/(public)/page.tsx` | หน้าแรกและรายการที่เปิดรับสมัคร |
| `/tournaments` | `app/(public)/tournaments/page.tsx` | ค้นหาและกรองรายการแข่งขัน |
| `/tournaments/[slug]` | `app/(public)/tournaments/[slug]/page.tsx` | รายละเอียดรายการ โปสเตอร์ เอกสาร และทางไปสมัคร |
| `/bracket` | `app/(public)/bracket/page.tsx` | สายการแข่งขันที่เผยแพร่แล้ว |
| `/schedule` | `app/(public)/schedule/page.tsx` | คู่ที่กำหนดวันเวลาแล้ว |
| `/results` | `app/(public)/results/page.tsx` | ผลที่ยืนยันและอันดับ |
| `/login` | `app/(public)/login/page.tsx` | เข้าสู่ระบบ |
| `/register` | `app/(public)/register/page.tsx` | สมัครบัญชี |
| `/forgot-password` | `app/(public)/forgot-password/page.tsx` | ขอรีเซ็ตรหัสผ่าน |
| `/reset-password` | `app/(public)/reset-password/page.tsx` | ตั้งรหัสผ่านใหม่ |
| `/team` | `app/(admin)/team/page.tsx` | รายการทีมของผู้จัดการ/โค้ช |
| `/team/new` | `app/(admin)/team/new/page.tsx` | สร้างทีม |
| `/team/[id]` | `app/(admin)/team/[id]/page.tsx` | แก้ทีมและรายชื่อผู้เล่น |
| `/organizer` | `app/(admin)/organizer/page.tsx` | รายการที่ผู้จัดเป็นเจ้าของ |
| `/organizer/tournaments/new` | `app/(admin)/organizer/tournaments/new/page.tsx` | สร้างรายการแข่งขัน |
| `/organizer/tournaments/[id]` | `app/(admin)/organizer/tournaments/[id]/page.tsx` | แก้รายละเอียดและสถานะรายการ |
| `/organizer/tournaments/[id]/registrations` | `app/(admin)/organizer/tournaments/[id]/registrations/page.tsx` | ตรวจและตัดสินใบสมัครทีม |
| `/organizer/tournaments/[id]/bracket` | `app/(admin)/organizer/tournaments/[id]/bracket/page.tsx` | เลือกโหมด จัดลำดับ/สุ่มสาย หรือจัดการไฟล์สาย |
| `/organizer/tournaments/[id]/schedule` | `app/(admin)/organizer/tournaments/[id]/schedule/page.tsx` | กำหนดวันเวลาและสนามของคู่แข่งขัน |
| `/organizer/tournaments/[id]/results` | `app/(admin)/organizer/tournaments/[id]/results/page.tsx` | บันทึกร่างคะแนน ยืนยันผล และจบรายการ |
| `/admin` | `app/(admin)/admin/page.tsx` | ภาพรวมงานแอดมิน |
| `/admin/tournaments` | `app/(admin)/admin/tournaments/page.tsx` | ดูรายการแข่งขันทั้งหมดในขอบเขตแอดมิน |
| `/admin/tournaments/[id]` | `app/(admin)/admin/tournaments/[id]/page.tsx` | กำกับรายการและสถานะ |
| `/admin/tournaments/[id]/results` | `app/(admin)/admin/tournaments/[id]/results/page.tsx` | แก้ผลที่ยืนยันแล้วภายใต้เงื่อนไขและเหตุผล |
| `/admin/reviews` | `app/(admin)/admin/reviews/page.tsx` | คิวตรวจรายการที่ผู้จัดส่งมา |
| `/admin/reviews/[id]` | `app/(admin)/admin/reviews/[id]/page.tsx` | อนุมัติ ขอแก้ไข หรือปฏิเสธรายการ |

## เส้นทางหลักที่ควรอธิบายได้

1. **สร้างรายการ:** `app/(admin)/organizer/tournaments/new/page.tsx` แสดงฟอร์ม → `app/api/admin/tournaments/route.ts` รับคำขอ → `features/tournament-operations/application/create-tournament.ts` ตรวจข้อมูลและสิทธิ์ → repository บันทึก
2. **จัดสาย:** หน้า `.../bracket/page.tsx` โหลดทีมที่อนุมัติและสถานะสาย → `components/organizer/bracket-workspace.tsx` ให้เรียงทีมเองหรือสุ่ม → `app/api/organizer/tournaments/[id]/bracket/generate/route.ts` → `features/competition/application/generate-bracket.ts` ตรวจสิทธิ์/เวอร์ชัน/จำนวนทีม → `features/competition/domain/bracket-generator.ts` จับคู่ตามตำแหน่งที่เรียงไว้
3. **จัดตาราง:** หน้า `.../schedule/page.tsx` แปลงเวลา UTC เป็นเวลาประเทศไทยสำหรับฟอร์ม → `components/organizer/match-schedule-editor.tsx` ส่ง `PATCH` → `features/competition/application/schedule-match.ts` ตรวจสถานะ เวอร์ชัน วันเวลา และสนามก่อนบันทึก
4. **บันทึกผล:** หน้า `.../results/page.tsx` ส่งข้อมูลให้ `components/organizer/match-result-editor.tsx`; ปุ่มบันทึกร่างเรียก `score` ส่วนยืนยันเรียก `confirm` → `features/competition/application/confirm-match-result.ts` ยืนยันและเลื่อนผู้ชนะไปคู่ถัดไปในโหมดระบบ ภายในธุรกรรมเดียว
5. **เปิดดูสาธารณะ:** `/bracket`, `/schedule`, `/results` รับ `?tournament=<slug>` เพื่อเลือกงานเดียวกัน ถ้าไม่ส่งค่า หน้า bracket/schedule เลือกรายการ `OPEN` แรก ส่วน results เลือก `ONGOING` ก่อน `COMPLETED`; จึงไม่ใช่ ID ที่เขียนตายตัว ผู้ชมเห็นเฉพาะข้อมูลที่เผยแพร่ผ่าน `features/tournaments/infrastructure/prisma-tournament-repository.ts`

## จุดกระโดดไปโค้ดหลัก (ไฟล์และเลขบรรทัด)

เลขบรรทัดด้านล่างตรวจจาก worktree `courtside-public-platform` ณ วันที่ 19 ต.ค. 2026 ซึ่งมีไฟล์บางส่วนที่ยังแก้ค้างอยู่ หากโค้ดเปลี่ยน เลขอาจเลื่อน ให้ค้นชื่อฟังก์ชันที่ระบุในตารางแทน ลิงก์ `#L...` ใช้เปิดบรรทัดบน GitHub; ใน editor ใช้ชื่อไฟล์กับเลขบรรทัดเพื่อกระโดดไปจุดเดียวกัน คำอธิบายในคอลัมน์สุดท้ายคือคอมเมนต์อ่านโค้ด ไม่ใช่คำสั่งให้แก้ไฟล์

### 0. สร้างรายการแข่งขัน

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| [`components/admin/tournament-editor.tsx:49`](../components/admin/tournament-editor.tsx#L49) | `handleSubmit` | อ่านฟอร์ม ตรวจข้อมูลเบื้องต้น แล้วเลือก `POST` เพื่อสร้างฉบับร่างหรือ endpoint อื่นเมื่อแก้/ส่งตรวจ |
| [`app/api/admin/tournaments/route.ts:7`](../app/api/admin/tournaments/route.ts#L7) | `POST` | จุดรับคำขอสร้างรายการ อ่านผู้ใช้ปัจจุบันแล้วส่งต่อให้ handler |
| [`features/admin/presentation/save-tournament-handler.ts:23`](../features/admin/presentation/save-tournament-handler.ts#L23) | `saveTournamentHandler` | ตรวจ payload/ตัวตน แล้วเลือก use case สร้างหรือแก้รายการ |
| [`features/tournament-operations/application/create-tournament.ts:10`](../features/tournament-operations/application/create-tournament.ts#L10) | `createTournament` | ตรวจจังหวัด ข้อมูลรายการ และสิทธิ์ ก่อนสั่ง repository สร้าง |
| [`features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts:136`](../features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts#L136) | `create` | เขียนรายการแข่งขันและ audit ใน transaction เดียว |

### 1. สร้างทีม เพิ่มผู้เล่น และเลือกผู้เล่นเดิม

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| [`app/(admin)/team/new/page.tsx:6`](<../app/(admin)/team/new/page.tsx#L6>) | `NewTeamPage` | อ่านผู้ใช้ปัจจุบัน โหลดประวัติผู้เล่นของบัญชีนี้ แล้วส่งให้ฟอร์มสร้างทีม |
| [`features/team-management/application/list-reusable-team-players.ts:9`](../features/team-management/application/list-reusable-team-players.ts#L9) | `listReusableTeamPlayers` | ตรวจสิทธิ์สร้างทีมก่อนขอประวัติจากทีมที่บัญชีนี้เป็นเจ้าของ ไม่ค้นผู้เล่นทุกบัญชี |
| [`features/team-management/infrastructure/prisma-team-repository.ts:78`](../features/team-management/infrastructure/prisma-team-repository.ts#L78) | `listPlayerHistoryByOwner` | อ่าน `TeamPlayer` ของทีมที่มี `ownerId` ตรงกับผู้ใช้ พร้อมชื่อทีมต้นทาง รวมรายการที่เคยนำออกด้วย |
| [`features/team-management/domain/team-player-history.ts:25`](../features/team-management/domain/team-player-history.ts#L25) | `projectReusableTeamPlayers` | รวมประวัติที่ชื่อ–นามสกุล–วันเกิดตรงกันเป็นตัวเลือกเดียว และใช้ข้อมูลจากรายการที่อัปเดตล่าสุด |
| [`components/team/team-creation-roster-editor.tsx:62`](../components/team/team-creation-roster-editor.tsx#L62) | `updateSelection` | ติ๊กผู้เล่นเดิมแล้วคัดลอกข้อมูลลงแถวฟอร์ม `sourceKey` ใช้จำการเลือกบนหน้าจอ ไม่ใช่คำสั่งย้ายผู้เล่นจากทีมเดิม |
| [`components/team/team-creation-roster-editor.tsx:108`](../components/team/team-creation-roster-editor.tsx#L108) | `addManualRow` | กด “เพิ่มผู้เล่นใหม่” แล้วเพิ่มแถวว่าง โดยไม่เกินจำนวนที่รูปแบบทีมอนุญาต |
| [`components/team/team-creation-roster-editor.tsx:242`](../components/team/team-creation-roster-editor.tsx#L242) | `validateTeamCreationPlayerRows` | ตรวจช่องที่กรอก รวมถึงชื่อ–นามสกุล–วันเกิดซ้ำและเบอร์เสื้อซ้ำ ก่อนส่งฟอร์ม |
| [`components/team/team-editor.tsx:87`](../components/team/team-editor.tsx#L87) | `handleSubmit` | เก็บค่าทีมและแถวผู้เล่น ส่ง `POST /api/teams` แล้วพาไปหน้าทีมเมื่อบันทึกสำเร็จ; ส่งค่าของผู้เล่น ไม่ส่ง `sourceKey` |
| [`features/team-management/presentation/team-handler.ts:133`](../features/team-management/presentation/team-handler.ts#L133) | `handleCreateTeam` | รับคำขอ ตรวจข้อมูลด้วย schema และแปลงข้อผิดพลาดเป็น HTTP response |
| [`features/team-management/application/create-team.ts:30`](../features/team-management/application/create-team.ts#L30) | `createTeam` | ตรวจสิทธิ์/จำนวนคน สร้างทีมและรายชื่อเริ่มต้นใน transaction เดียว พร้อมบันทึก audit |
| [`features/team-management/domain/team-player-batch-policy.ts:5`](../features/team-management/domain/team-player-batch-policy.ts#L5) | `getMaximumTeamPlayerCount` | กำหนดเพดานผู้เล่น: 3v3 ไม่เกิน 4 คน, 5v5 ไม่เกิน 15 คน; `assertTeamPlayerBatch` ที่บรรทัด 15 ตรวจจำนวนและข้อมูลซ้ำ |
| [`features/team-management/infrastructure/prisma-team-repository.ts:405`](../features/team-management/infrastructure/prisma-team-repository.ts#L405) | `addPlayer` | ถ้าเป็นคนเดิมที่ถูกปิดใช้งานใน **ทีมเดียวกัน** จะเปิดใช้อีกครั้ง; ถ้าเป็นทีมใหม่จะสร้างรายการผู้เล่นใหม่ของทีมนั้น ไม่ลบจากทีมต้นทาง |

ถ้าทีมสร้างแล้ว หน้า `/team/[id]` ใช้ฟอร์มเพิ่มหลายคนผ่าน [`TeamPlayerBatchForm`](../components/team/team-player-batch-form.tsx#L75) → [`addTeamPlayers`](../features/team-management/application/add-team-players.ts#L14) ซึ่งตรวจสิทธิ์เจ้าของทีม จำนวนคน และบันทึกใน transaction; ตัวเลือกค้นประวัติข้างบนอยู่ที่หน้าสร้างทีม

### 2. สมัครแข่งขันและผู้จัดตัดสินใบสมัคร

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| [`components/tournaments/tournament-registration-action.tsx:76`](../components/tournaments/tournament-registration-action.tsx#L76) | `submitRegistration` | ส่งทีมที่เลือกไป API สมัครแข่งขัน แล้วแสดงผลหรือข้อผิดพลาดกลับบนหน้า |
| [`features/registrations/application/apply-to-tournament.ts:15`](../features/registrations/application/apply-to-tournament.ts#L15) | `applyToTournament` | เปิด transaction ตรวจทีม/รายการ/ใบสมัครเดิมผ่าน `loadEligibleApplicationContext` บรรทัด 30 แล้วสร้างใบสมัครสถานะรอพิจารณา |
| [`features/registrations/domain/registration-policy.ts:57`](../features/registrations/domain/registration-policy.ts#L57) | `assertCanApply` | กฎสมัครจริง เช่น ความพร้อมของทีม/รายชื่อและสถานะรายการ; เปิดอ่านเมื่อสงสัยว่าทำไมสมัครไม่ได้ |
| [`components/organizer/registration-review-list.tsx:82`](../components/organizer/registration-review-list.tsx#L82) | `submitConfirmation` | หลังยืนยันบนหน้าจอ ส่งคำสั่งอนุมัติ/ปฏิเสธหรือถอน พร้อม `version` ป้องกันตัดสินจากข้อมูลเก่า |
| [`features/registrations/application/decide-registration.ts:18`](../features/registrations/application/decide-registration.ts#L18) | `decideRegistration` | ตรวจว่าผู้จัดเป็นเจ้าของรายการและเปลี่ยนสถานะได้ ก่อนให้ repository บันทึก; การอนุมัติตรวจความจุซ้ำตอนบันทึก |
| [`features/registrations/infrastructure/prisma-registration-repository.ts:429`](../features/registrations/infrastructure/prisma-registration-repository.ts#L429) | `approveWithCapacity` | จุดบันทึกการอนุมัติในฐานข้อมูลพร้อมเงื่อนไขความจุ ไม่เชื่อเพียงจำนวนที่เคยแสดงในหน้าเว็บ |

### 3. ล็อกทีม จัดสาย และเผยแพร่

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| [`components/organizer/bracket-workspace.tsx:70`](../components/organizer/bracket-workspace.tsx#L70) | `lockEntries` | ส่งคำขอล็อกรายชื่อที่อนุมัติแล้วก่อนจัดสาย; ฝั่ง server ทำ snapshot รายชื่อ |
| [`features/competition/application/lock-bracket-entries.ts:15`](../features/competition/application/lock-bracket-entries.ts#L15) | `lockBracketEntries` | ตรวจเจ้าของรายการ สถานะปิดรับสมัคร และจำนวนทีม ก่อนสั่ง repository ล็อกรายชื่อ |
| [`components/organizer/bracket-workspace.tsx:77`](../components/organizer/bracket-workspace.tsx#L77) | `moveEntry` | ขยับทีมทีละหนึ่งตำแหน่งในหน้าจอ; ยังไม่บันทึกสายจนกดสร้างตัวอย่าง |
| [`components/organizer/bracket-workspace.tsx:87`](../components/organizer/bracket-workspace.tsx#L87) | `generateBracket` | ส่งตำแหน่งครบทุกทีมแบบ `ORDERED` หรือขอ `RANDOM_ORDERED`; `redraw` คือขอสุ่มใหม่โดยยืนยันก่อน |
| [`features/competition/presentation/competition-handler.ts:208`](../features/competition/presentation/competition-handler.ts#L208) | `handleGenerateBracket` | รับ JSON ตรวจผู้ใช้และรูปแบบข้อมูล แล้วเรียก use case หรือคืนรหัสข้อผิดพลาด |
| [`features/competition/application/generate-bracket.ts:42`](../features/competition/application/generate-bracket.ts#L42) | `generateBracketDraft` | ตรวจเจ้าของ เวอร์ชัน สถานะฉบับร่าง และจำนวน 8/16/32 ทีม ก่อนสร้างแผนและบันทึกใน transaction |
| [`features/competition/application/generate-bracket.ts:100`](../features/competition/application/generate-bracket.ts#L100) | `prepareEntries` | เรียงเองต้องมีตำแหน่งครบไม่ซ้ำ; สุ่มเดิมใช้ผลเดิมจนกว่าจะ `redraw`; สุ่มใหม่สร้าง token และเรียงทีมใหม่ |
| [`features/competition/infrastructure/tokenized-bracket-shuffle.ts:5`](../features/competition/infrastructure/tokenized-bracket-shuffle.ts#L5) | `tokenizedBracketShuffle` | ใช้ token กับ ID รายการทีมในสายสร้างค่า hash เพื่อเรียงลำดับได้ซ้ำจาก token เดิม ไม่ได้สุ่มผลการแข่งขัน |
| [`features/competition/domain/bracket-generator.ts:78`](../features/competition/domain/bracket-generator.ts#L78) | `generateOrderedSingleEliminationBracket` | ทางที่หน้าผู้จัดใช้จริง: แปลง `drawPosition` เป็นลำดับทีม แล้วส่งให้ตัวสร้างคู่ |
| [`features/competition/domain/bracket-generator.ts:98`](../features/competition/domain/bracket-generator.ts#L98) | `buildBracketPlan` | จับทีมตำแหน่ง 1–2, 3–4 ต่อไปทีละรอบ และเก็บปลายทางว่าผู้ชนะต้องเข้า HOME/AWAY ของคู่ไหน |
| [`features/competition/infrastructure/prisma-competition-repository.ts:502`](../features/competition/infrastructure/prisma-competition-repository.ts#L502) | `persistGeneratedPlan` | บันทึกตำแหน่ง รอบ คู่แข่งขัน การเชื่อมคู่ และ audit; ตรวจ `expectedVersion` กันข้อมูลเก่าทับข้อมูลใหม่ |
| [`components/organizer/bracket-workspace.tsx:107`](../components/organizer/bracket-workspace.tsx#L107) | `publishBracket` | ส่งคำสั่งเผยแพร่หลังตรวจตัวอย่างสายแล้ว; ฝั่ง server ตรวจเงื่อนไขอีกครั้ง |

อย่าสับสนกับ [`generateSingleEliminationBracket`](../features/competition/domain/bracket-generator.ts#L58) บรรทัด 58: ฟังก์ชันนี้เป็นตัวจัดตาม Seed ที่ยังอยู่ในโค้ด แต่ `generateBracketDraft` ของหน้าผู้จัดปัจจุบันเรียกตัวจัด **ตามตำแหน่ง** บรรทัด 78 ไม่ได้เรียกตัว Seed

### 4. จัดตาราง บันทึกคะแนน และยืนยันผล

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| [`components/organizer/match-schedule-editor.tsx:36`](../components/organizer/match-schedule-editor.tsx#L36) | `saveMatch` | อ่านเวลาไทยจากฟอร์ม แปลงเป็น UTC แล้วส่งวันเวลา สนาม และ `expectedVersion` |
| [`features/competition/application/schedule-match.ts:20`](../features/competition/application/schedule-match.ts#L20) | `scheduleMatch` | ตรวจผู้จัด เวอร์ชัน การเผยแพร่สาย ช่วงวันรายการ และสนามชนกัน ก่อนบันทึกตาราง |
| [`features/competition/infrastructure/prisma-competition-repository.ts:950`](../features/competition/infrastructure/prisma-competition-repository.ts#L950) | `scheduleMatch` | เขียนเวลาคู่แข่งขันลงฐานข้อมูลภายใต้เงื่อนไขเวอร์ชันและบันทึก audit |
| [`components/organizer/match-result-editor.tsx:42`](../components/organizer/match-result-editor.tsx#L42) | `submitResult` | ปุ่ม “บันทึกร่าง” ส่ง `PATCH .../score`; ปุ่ม “ยืนยันผล” ส่ง `POST .../confirm` หลังถามยืนยัน |
| [`features/competition/application/record-match-score.ts:19`](../features/competition/application/record-match-score.ts#L19) | `recordMatchScore` | ตรวจเงื่อนไขการบันทึกคะแนนร่าง โดยยังไม่เลื่อนผู้ชนะ |
| [`features/competition/application/confirm-match-result.ts:19`](../features/competition/application/confirm-match-result.ts#L19) | `confirmMatchResult` | หาทีมชนะและปลายทางในสายระบบ; โหมดไฟล์ภายนอกไม่เดาเส้นทางผู้ชนะจากไฟล์ |
| [`features/competition/infrastructure/prisma-competition-repository.ts:1246`](../features/competition/infrastructure/prisma-competition-repository.ts#L1246) | `confirmResultAndAdvance` | ยืนยันผลและใส่ทีมชนะในช่องคู่ถัดไปใน transaction เดียว; ถ้าช่องปลายทางขัดแย้งให้ล้มทั้งงาน |

### 5. หน้าสาธารณะ: สาย ตาราง และผล

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| [`app/(public)/bracket/page.tsx:15`](<../app/(public)/bracket/page.tsx#L15>) | `BracketPage` | อ่าน `?tournament=<slug>` หรือเลือกงาน `OPEN`; ถ้าเป็นโหมดไฟล์แสดงเอกสาร มิฉะนั้นแสดงสายระบบ |
| [`app/(public)/schedule/page.tsx:11`](<../app/(public)/schedule/page.tsx#L11>) | `SchedulePage` | เลือกงานด้วย slug หรือค่าเริ่มต้น แล้วแสดงเฉพาะคู่ที่มีวันเวลา |
| [`app/(public)/results/page.tsx:17`](<../app/(public)/results/page.tsx#L17>) | `ResultsPage` | เลือกงาน `ONGOING` ก่อน `COMPLETED` เมื่อไม่มี slug แล้วสรุปผลที่ยืนยันแล้ว |
| [`features/tournaments/infrastructure/prisma-tournament-repository.ts:142`](../features/tournaments/infrastructure/prisma-tournament-repository.ts#L142) | `findCompetitionBySlug` | โหลดงานตาม slug โดยกรองสถานะที่เปิดสาธารณะและรายการที่ยังใช้งานอยู่ |
| [`features/competition/application/get-competition-summary.ts:35`](../features/competition/application/get-competition-summary.ts#L35) | `getCompetitionSummary` | คำนวณข้อมูลสรุปจากคู่แข่งขันที่ยืนยันแล้วสำหรับหน้าสาธารณะ |

**เวลาไล่ปัญหา:** เริ่มจากฟังก์ชัน UI ที่กด → route/handler ที่รับคำขอ → use case ที่ตรวจสิทธิ์และกฎ → repository ที่เขียนฐานข้อมูล ถ้าหน้าจอให้กดได้แต่ server ปฏิเสธ ให้ดูข้อความตอบกลับและเงื่อนไขใน use case ก่อน ไม่สรุปว่าปุ่มเสียทันที

## ตอบคำถามจัดสายแบบสั้น

ระบบปัจจุบันรองรับ **8, 16 หรือ 32 ทีม** สำหรับสายที่สร้างในระบบ ผู้จัดล็อกรายชื่อทีมที่อนุมัติแล้ว จากนั้นเลือกเรียงตำแหน่งเอง หรือให้ระบบสุ่มตำแหน่ง การสร้างคู่รอบแรกใช้ทีมตำแหน่ง 1 พบ 2, 3 พบ 4 และเรียงต่อไป; รอบถัดไปเชื่อมจากผู้ชนะของคู่ก่อนหน้า ไม่คำนวณ Seed หรือจัดอันดับทีม การกดสุ่มใหม่เป็นการขอตำแหน่งชุดใหม่ก่อนเผยแพร่ เมื่อเผยแพร่แล้วจึงแสดงหน้าเว็บสาธารณะ อีกทางหนึ่งคือใช้ไฟล์สาย PDF/รูปภาพจากภายนอก ซึ่งไม่เลื่อนผู้ชนะในไฟล์อัตโนมัติ

ถ้าอาจารย์ชี้โค้ด ให้ตอบตามลำดับ: **ไฟล์นี้เป็นชั้นไหน → รับอะไร → ตรวจอะไร → ส่งต่อหรือแสดงอะไร** และแยกให้ชัดว่าฟอร์มช่วยตรวจเบื้องต้น แต่การตรวจสิทธิ์และกฎจริงอยู่ฝั่ง server
