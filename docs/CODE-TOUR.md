# แผนที่โค้ด COURTSIDE สำหรับอธิบายโปรเจกต์

> อัปเดต 28 ตุลาคม 2026 จาก source ปัจจุบันใน worktree `courtside-public-platform` บน branch `feat/courtside-public-platform` รวมการแก้ไขที่ยังอยู่ในเครื่อง เอกสารนี้ใช้เปิดตอบคำถามแบบเร็ว ส่วน [EXAM-CODE-GUIDE.md](EXAM-CODE-GUIDE.md) และ [สารบัญ source](code-reference/app.md) ใช้อ่านเจาะลึก เลขบรรทัดในหัวข้อใหม่ตรวจจาก source รอบนี้; หัวข้อเดิมอาจเปลี่ยนเมื่อมีการแก้โค้ดครั้งถัดไป

เอกสารนี้เป็นจุดเริ่มต้นเวลาอาจารย์ถามว่า "หน้านี้อยู่ตรงไหน" หรือ "กดปุ่มแล้วเกิดอะไรขึ้น" ให้เปิดไฟล์ตามตาราง แล้วตามการเรียกฟังก์ชันจากหน้าเว็บไปยัง use case และฐานข้อมูล คอมเมนต์ในไฟล์ต้นทางเน้นจุดที่เป็นกฎหรือทางแยกสำคัญ ไม่ได้อธิบายทุกบรรทัด

## เปิดเร็ว: โค้ดที่แสดงรายชื่อผู้เล่น

เลือกตามคนที่กำลังใช้หน้าจอ หน้าทีมและแอดมินอ่านสมาชิกทีมพร้อมชื่อจาก `PlayerIdentity` ส่วนผู้จัดอ่าน snapshot `RegistrationPlayer` ของใบสมัคร (ข้อมูลเก่าบางรายการที่ไม่มี snapshot ยังใช้ roster ปัจจุบันเป็นทางสำรอง)

| หน้าจอที่อาจารย์ชี้ | เปิดหน้าเริ่มต้น | กระโดดไปจุดแสดงผู้เล่นทันที |
| --- | --- | --- |
| **แอดมิน:** ทีมทั้งหมด → กดชื่อทีม → รายชื่อผู้เล่น | [หน้าแอดมินดูทีม:14](<../app/(admin)/admin/teams/[id]/page.tsx#L14>) | [`team.players.map`:67](<../app/(admin)/admin/teams/[id]/page.tsx#L67>) วนสร้างแถวผู้เล่นแต่ละคน; ชื่อเล่น เบอร์เสื้อ ตำแหน่ง และวันเกิดอยู่ในแถวเดียวกัน |
| **ผู้จัดการ/โค้ช:** ทีมของฉัน → เปิดทีม → รายชื่อผู้เล่น | [หน้าทีมของตัวเอง:19](<../app/(admin)/team/[id]/page.tsx#L19>) | [`players.map`:195](../components/team/team-player-roster.tsx#L195) สร้างแถวรายชื่อ และเลือกระหว่างแสดงข้อมูลกับฟอร์มแก้ไข |
| **ผู้จัดรายการ:** ทีมสมัคร → ดูสมาชิกทีม | [หน้าตรวจใบสมัคร:25](<../app/(admin)/organizer/tournaments/[id]/registrations/page.tsx#L25>) | [`players.map`:35](../components/organizer/registration-team-roster.tsx#L35) แสดงชื่อ–นามสกุลและเบอร์เสื้อใต้ปุ่มขยาย |

คำว่า **ผู้จัดการทีม** หมายถึงเจ้าของทีมบทบาท `TEAM_MANAGER_COACH` ส่วน **ผู้จัดรายการ** คือเจ้าของการแข่งขันบทบาท `TOURNAMENT_ORGANIZER` ไม่ใช่คนละชื่อของบทบาทเดียวกัน ดูทางเดินข้อมูลแบบละเอียดในหัวข้อ **6. อ่านรายชื่อผู้เล่นตามบทบาท** ด้านล่าง

ถ้าถามเรื่อง **5x5 สนามชนเวลา** ให้เปิด [เงื่อนไขที่สั่งห้ามบันทึก:69](../features/competition/application/schedule-match.ts#L69) คู่กับ [query ค้นหาคู่ที่ชน:951](../features/competition/infrastructure/prisma-competition-repository.ts#L951) แล้วอ่านคำอธิบายในหัวข้อ **4A. ตรวจสนามและเวลาเริ่มซ้ำของ 5x5**

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

เทคโนโลยีตาม `package.json` ปัจจุบัน: Next.js **16.4.2**, React **19.2.4**, TypeScript, Tailwind CSS 4, Prisma **7.10.1**, Supabase Auth/Storage และ PostgreSQL; ใช้ Vitest **4.1.12** กับ React Testing Library ตรวจพฤติกรรม ชื่อชั้นเป็นแนวทางแบ่งความรับผิดชอบ บาง repository interface รุ่นเดิมยังวางใน `infrastructure` จึงควรตาม import จริงประกอบคำอธิบาย

สิ่งที่เพิ่มจากแผนที่รอบก่อน: หน้าแอดมินดูทีมทั้งหมด/รายละเอียดทีม, รายชื่อผู้เล่นให้ผู้จัดตรวจใบสมัคร, เงื่อนไขชื่อทีมซ้ำ, การเปิดเอกสารตรวจรายการผ่าน API ที่ตรวจสิทธิ์ และคำอธิบายกรณีเฉพาะของ 3v3/5v5 อยู่ในตารางและแนวตอบด้านล่าง

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
| `/admin/teams` | `app/(admin)/admin/teams/page.tsx` | ดูทีมทุกบัญชี ชื่อผู้สร้าง สถานะ และจำนวนผู้เล่นปัจจุบัน |
| `/admin/teams/[id]` | `app/(admin)/admin/teams/[id]/page.tsx` | ดูรายละเอียดทีมและผู้เล่นที่ใช้งานอยู่แบบอ่านอย่างเดียว |
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
6. **แอดมินดูสมาชิกทีม:** `/admin/teams` → กดชื่อทีม → `/admin/teams/[id]` → `getAdminTeamDetail` ตรวจแอดมิน → repository อ่านทีม/ผู้สร้าง/ผู้เล่น active → หน้า detail วน `team.players.map` แสดงผล
7. **ผู้จัดการ/โค้ชดูสมาชิกทีมตัวเอง:** `/team/[id]` → `getOwnedTeamWorkspace` ตรวจเจ้าของทีม → `listActivePlayers` อ่านรายชื่อ → `TeamWorkspaceManager` ส่งให้ `TeamPlayerRoster` แสดงและจัดการรายชื่อ
8. **ผู้จัดรายการดูสมาชิกทีมที่สมัคร:** `/organizer/tournaments/[id]/registrations` → `listTournamentRegistrations` ตรวจเจ้าของรายการ → repository อ่านใบสมัครพร้อมสมาชิก → `RegistrationReviewList` ส่งรายชื่อให้ `RegistrationTeamRoster` แสดงในส่วนขยาย

## จุดกระโดดไปโค้ดหลัก (ไฟล์และเลขบรรทัด)

เลขบรรทัดด้านล่างตรวจใหม่วันที่ 27 ต.ค. 2026 หากโค้ดเปลี่ยน เลขอาจเลื่อน ให้ค้นชื่อฟังก์ชันประกอบ ลิงก์ใช้ชื่อไฟล์แบบสั้นเพื่ออ่านตารางง่ายขึ้น แต่เป้าหมายลิงก์ระบุโฟลเดอร์จริงครบ; `#L...` ใช้เปิดบรรทัดบน GitHub ส่วนใน editor ให้เปิดไฟล์แล้วไปเลขบรรทัดนั้น หาก repository มีเมธอดชื่อซ้ำ ตารางจะชี้ตัวที่ทำงานจริง ไม่ใช่ตัวส่งต่อ

วิธีอ่านแต่ละแถว: **จุดในโค้ด** บอกว่าควรเปิดไฟล์ไหน → **ฟังก์ชันหลัก** คือชื่อที่ค้นในไฟล์ → **ทำอะไร / ทำงานอย่างไร** อธิบายสิ่งที่รับ ขั้นตอนสำคัญ และสิ่งที่ส่งต่อ อ่านจากบนลงล่างในแต่ละหัวข้อได้ตามลำดับการทำงาน

คำที่ใช้บ่อย: **props** คือข้อมูลที่ส่งให้ component, **state** คือค่าที่หน้าจอเก็บไว้ระหว่างใช้งาน, **handler** คือตัวรับคำขอ, **use case** คือขั้นตอนทำงานฝั่งเซิร์ฟเวอร์, **repository** คือตัวอ่าน/เขียนฐานข้อมูล และ **transaction** คือชุดงานฐานข้อมูลที่ต้องสำเร็จหรือย้อนกลับด้วยกัน

### 0. สร้างรายการแข่งขัน

เริ่มจากผู้จัดกรอกฟอร์มบนหน้า `/organizer/tournaments/new` การกดบันทึกจะส่งข้อมูลไปเซิร์ฟเวอร์ ไม่ได้เขียนฐานข้อมูลจาก component โดยตรง

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| ฟอร์ม: [tournament-editor.tsx:57](../components/admin/tournament-editor.tsx#L57) | `handleSubmit` | **รับ:** ค่าที่กรอกและปุ่มที่กด อ่านผ่าน `FormData` แล้วตรวจ schema เบื้องต้น **ส่งต่อ:** สร้างใหม่ใช้ `POST /api/admin/tournaments`, แก้เดิมใช้ `PUT`, ส่งตรวจใช้ endpoint `/submit`; ถ้าไม่ผ่านจะแสดงข้อความและไม่ส่งคำขอ |
| ทางเข้าฝั่งเซิร์ฟเวอร์: [route.ts:13](../app/api/admin/tournaments/route.ts#L13) | `POST` | **รับ:** HTTP request จากฟอร์ม อ่านผู้ใช้ปัจจุบันและเตรียม repository แล้วเรียก `saveTournamentHandler` เส้นทางมีคำว่า admin แต่สิทธิ์จริงต้องดูการตรวจใน use case ไม่ได้ตัดสินจากชื่อ URL |
| ตัวตรวจคำขอ: [save-tournament-handler.ts:30](../features/admin/presentation/save-tournament-handler.ts#L30) | `saveTournamentHandler` | **รับ:** ผู้ใช้, request และ ID ถ้าเป็นการแก้ไข ตรวจว่าล็อกอินและ JSON ตรง schema แล้วเลือก `createTournament` หรือ `updateTournament` **คืน:** JSON ของรายการ; สร้างสำเร็จใช้ 201, แก้สำเร็จใช้ 200 ส่วนข้อมูลผิด/ไม่มีสิทธิ์แปลงเป็นรหัสข้อผิดพลาด |
| ขั้นตอนสร้างรายการ: [create-tournament.ts:17](../features/tournament-operations/application/create-tournament.ts#L17) | `createTournament` | **รับ:** ข้อมูลรายการที่ผ่านการแปลงจาก handler และผู้ใช้ ตรวจ permission จังหวัดและกฎข้อมูลรายการ **ส่งต่อ:** repository สร้างฉบับร่าง การมีข้อมูลถูกต้องในฟอร์มจึงยังไม่พอถ้าสิทธิ์หรือกฎฝั่งเซิร์ฟเวอร์ไม่ผ่าน |
| จุดเขียนฐานข้อมูล: [prisma-tournament-operations-repository.ts:143](../features/tournament-operations/infrastructure/prisma-tournament-operations-repository.ts#L143) | `create` | **รับ:** ข้อมูลที่ use case อนุญาตแล้ว ใช้ Prisma สร้างรายการและประวัติคำสั่ง (audit) ภายใน transaction **คืน:** ข้อมูลรายการให้ชั้นบนส่งกลับไปแสดง ไม่ใช่หน้าที่ของ repository ที่จะวาดฟอร์ม |

### 1. สร้างทีม เพิ่มผู้เล่น และเลือกผู้เล่นเดิม

หน้านี้มีสองงาน: โหลดคนที่เคยใช้มาให้เลือก และบันทึกทีมใหม่พร้อมรายชื่อที่เลือก การติ๊กผู้เล่นเดิมเติมข้อมูลลงฟอร์มพร้อมเก็บ `playerIdentityId` เพื่ออ้างคนเดิมจริง ไม่ย้ายสมาชิกออกจากทีมต้นทาง

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| หน้าเปิดฟอร์ม: [page.tsx:12](<../app/(admin)/team/new/page.tsx#L12>) | `NewTeamPage` | **รับ:** ผู้ใช้จาก session โหลดประวัติผู้เล่นที่บัญชีนี้นำกลับมาใช้ได้ แล้วส่งเป็น props ให้ฟอร์มสร้างทีม หน้าเว็บไม่ข้าม use case ไปอ่านผู้เล่นของทุกบัญชี |
| สิทธิ์อ่านประวัติ: [list-reusable-team-players.ts:17](../features/team-management/application/list-reusable-team-players.ts#L17) | `listReusableTeamPlayers` | **รับ:** ผู้ใช้ปัจจุบัน ตรวจสิทธิ์สร้างทีม แล้วขอประวัติด้วย ID ของเจ้าของทีม **คืน:** ตัวเลือกผู้เล่นให้หน้าใหม่ใช้ ไม่ได้สร้างทีมในขั้นตอนนี้ |
| Query ประวัติ: [prisma-team-repository.ts:91](../features/team-management/infrastructure/prisma-team-repository.ts#L91) | `listPlayerHistoryByOwner` | **รับ:** `ownerId` ค้น `TeamPlayer` เฉพาะทีมของเจ้าของคนนั้น พร้อมชื่อทีมต้นทาง รวมรายการที่ inactive เพื่อให้คนที่เคยนำออกยังนำกลับมาเลือกได้ |
| รวมคนซ้ำในตัวเลือก: [team-player-history.ts:32](../features/team-management/domain/team-player-history.ts#L32) | `projectReusableTeamPlayers` | **รับ:** ประวัติหลายทีม จัดกลุ่มด้วย `playerIdentityId` และใช้ค่าจากรายการที่อัปเดตล่าสุด **คืน:** ตัวเลือกคนเดิมหนึ่งครั้งต่อ ID; ระบบระบุตัวตนภายในบัญชีเจ้าของทีม ไม่ยืนยันคนข้ามบัญชี |
| ติ๊กผู้เล่นเดิม: [team-creation-roster-editor.tsx:70](../components/team/team-creation-roster-editor.tsx#L70) | `updateSelection` | **รับ:** ตัวเลือกที่ถูกติ๊ก/เอาติ๊กออก แล้วปรับแถวผู้เล่นใน state โดยคัดลอกข้อมูลมารอแก้ไข `sourceKey` ใช้จำว่าเลือกตัวเลือกใดบนหน้าจอ ยังไม่มีการเขียนฐานข้อมูล |
| เพิ่มแถวกรอกเอง: [team-creation-roster-editor.tsx:118](../components/team/team-creation-roster-editor.tsx#L118) | `addManualRow` | **รับ:** การกดเพิ่มผู้เล่นใหม่ ตรวจว่าเพิ่มได้อีกหรือไม่ตามรูปแบบทีม แล้วเพิ่มแถวว่างใน state ผู้ใช้ต้องกดบันทึกทีมจึงจะส่งแถวเหล่านี้ไปเซิร์ฟเวอร์ |
| ตรวจแถวก่อนส่ง: [team-creation-roster-editor.tsx:255](../components/team/team-creation-roster-editor.tsx#L255) | `validateTeamCreationPlayerRows` | **รับ:** แถวผู้เล่นที่กำลังกรอก ตรวจช่องข้อมูล ชื่อ–นามสกุล–วันเกิดซ้ำ และเบอร์เสื้อซ้ำ **คืน:** ข้อผิดพลาดให้ฟอร์มแสดงใกล้ช่อง เป็นเพียงการช่วยตรวจบนหน้าเว็บ ไม่แทน validation ฝั่งเซิร์ฟเวอร์ |
| กดบันทึกทีม: [team-editor.tsx:95](../components/team/team-editor.tsx#L95) | `handleSubmit` | **รับ:** ค่าทีมและแถวผู้เล่น ส่งข้อมูลผู้เล่นพร้อม `playerIdentityId` ที่เลือกผ่าน `POST /api/teams` โดยไม่ส่ง `sourceKey` **หลังสำเร็จ:** พาไปหน้าทีมที่สร้าง; ถ้าเซิร์ฟเวอร์ปฏิเสธให้แสดงข้อความแทน |
| รับคำขอสร้างทีม: [team-handler.ts:140](../features/team-management/presentation/team-handler.ts#L140) | `handleCreateTeam` | **รับ:** request และผู้ใช้ ตรวจว่ามีผู้ใช้และข้อมูลตรง schema แล้วเรียก `createTeam` **คืน:** ข้อมูลที่สร้างหรือ HTTP error ที่หน้าเว็บนำไปแสดงได้ ไม่ให้ฟอร์มเป็นคนตัดสินสิทธิ์เอง |
| สร้างทีมจริง: [create-team.ts:39](../features/team-management/application/create-team.ts#L39) | `createTeam` | **รับ:** ข้อมูลทีม/ผู้เล่นและผู้ใช้ ตรวจจังหวัด permission จำนวนผู้เล่นและชื่อทีมซ้ำในบัญชี **ส่งต่อ:** repository สร้างทีม รายชื่อเริ่มต้น และ audit ใน transaction เดียว ไม่ปล่อยให้ทีมสร้างสำเร็จแต่รายชื่อบันทึกเพียงบางส่วน |
| กฎเพดานผู้เล่น: [team-player-batch-policy.ts:12](../features/team-management/domain/team-player-batch-policy.ts#L12) | `getMaximumTeamPlayerCount` | **รับ:** รูปแบบทีม **คืน:** 5v5 ได้ 15 คน, 3v3 ได้ 4 คน ส่วน [`assertTeamPlayerBatch`:23](../features/team-management/domain/team-player-batch-policy.ts#L23) ใช้เพดานนี้ตรวจจำนวนรวมและข้อมูลซ้ำ จึงแยก “ค่าขีดจำกัด” ออกจาก “ฟังก์ชันตรวจชุดข้อมูล” |
| เพิ่มผู้เล่นลงทีม: [prisma-team-repository.ts:442](../features/team-management/infrastructure/prisma-team-repository.ts#L442) | `addPlayer` | **รับ:** ID ทีมและข้อมูลผู้เล่น ถ้าตรงกับคนเดิมที่ inactive ในทีมเดียวกันจะเปิดใช้งานอีกครั้ง ถ้าเป็นทีมใหม่จะสร้างแถวของทีมนั้น **ไม่ทำ:** ลบหรือย้ายแถวจากทีมต้นทาง |

ถ้าทีมสร้างแล้ว หน้า `/team/[id]` ใช้ [`submitPlayers`](../components/team/team-player-batch-form.tsx#L84) ใน `TeamPlayerBatchForm` → [`addTeamPlayers`](../features/team-management/application/add-team-players.ts#L22) ซึ่งตรวจสิทธิ์เจ้าของทีม จำนวนคน และบันทึกใน transaction; ตัวเลือกค้นประวัติข้างบนอยู่ที่หน้าสร้างทีม

### 1A. ใช้ผู้เล่นเดิมจริงและกันลงแข่งซ้อน

**ภาพรวมที่ใช้อธิบาย:** `PlayerIdentity` คือรหัสของคนหนึ่งคนภายในบัญชีผู้จัดการทีม ส่วน `TeamPlayer` คือการอยู่ในทีมหนึ่งทีม จึงมีหลายแถวสมาชิกทีมที่อ้างคนเดียวกันได้โดยไม่สร้างตัวตนใหม่ `RegistrationPlayer` เก็บรายชื่อ ณ วันที่ส่งสมัคร เพื่อให้การแก้ทีมภายหลังไม่เปลี่ยนรายชื่อในใบสมัครเดิม

| จุดในโค้ด | ฟังก์ชัน/ข้อมูลหลัก | ทำอะไร / ส่งต่อไปไหน |
| --- | --- | --- |
| [schema.prisma:222](../prisma/schema.prisma#L222) | `PlayerIdentity` | เก็บ ID กลาง ชื่อ วันเกิด และเจ้าของบัญชี; คีย์ชื่อที่ปรับรูปแบบกับวันเกิดต้องไม่ซ้ำภายในเจ้าของเดียวกัน |
| [schema.prisma:241](../prisma/schema.prisma#L241) | `TeamPlayer` | เก็บสมาชิกของแต่ละทีม เบอร์เสื้อ ตำแหน่ง และสถานะ `isActive`; `playerIdentityId` ชี้คนกลาง จึงนำคนเดิมไปอีกทีมได้ |
| [เลือกผู้เล่นเดิม:70](../components/team/team-creation-roster-editor.tsx#L70) → [ส่งคำขอสร้างทีม:95](../components/team/team-editor.tsx#L95) | `updateSelection` → `handleSubmit` | ช่องติ๊กเก็บ ID กลางไว้ใน `sourceKey`; ฟอร์มส่ง `playerIdentityId` พร้อมเบอร์เสื้อ/ตำแหน่งไป `POST /api/teams` ไม่ใช้ชื่อที่คัดลอกมาเป็นหลักฐานว่าคือคนเดิม |
| [ประวัติและสถานะ:92](../features/team-management/infrastructure/prisma-team-repository.ts#L92) → [จัดกลุ่ม:34](../features/team-management/domain/team-player-history.ts#L34) | `listPlayerHistoryByOwner` → `projectReusableTeamPlayers` | อ่านเฉพาะผู้เล่นของเจ้าของทีม รวมสมาชิกหลายทีมด้วย ID เดียว และตรวจใบสมัคร `PENDING`/`APPROVED` ที่รายการยังไม่จบเพื่อแสดง [“ติดใบสมัคร”:188](../components/team/reusable-player-selector.tsx#L188) |
| [บันทึกสมาชิกทีม:486](../features/team-management/infrastructure/prisma-team-repository.ts#L486) | `addPlayer` | ถ้ามี ID จากฟอร์ม จะตรวจว่าเป็นของเจ้าของทีมจริง; ถ้ากรอกคนใหม่ จะหา/สร้างตัวตนจากชื่อ นามสกุล วันเกิด แล้วจึงสร้างหรือเปิดใช้สมาชิกในทีม ไม่เชื่อ ID ข้ามบัญชี |
| [แก้ข้อมูลผู้เล่น:427](../features/team-management/infrastructure/prisma-team-repository.ts#L427) → [แสดงข้อมูล:597](../features/team-management/infrastructure/prisma-team-repository.ts#L597) | `updatePlayer` → `mapPlayer` | การแก้ชื่อ/วันเกิดปรับตัวตนกลาง ส่วนเบอร์เสื้อ/ตำแหน่งปรับเฉพาะทีม; หน้าอ่านชื่อล่าสุดจากตัวตนกลาง แต่ไม่เขียนทับชื่อเก่าในแถวสมาชิกหรือใบสมัครเก่า |
| [schema.prisma:350](../prisma/schema.prisma#L350) | `RegistrationPlayer` | เก็บ ID คนกับ snapshot ชื่อ วันเกิด เบอร์เสื้อ และตำแหน่งของใบสมัครแต่ละครั้ง; เป็นข้อมูลที่ใช้ตรวจว่าคนนี้ยังติดรายการอยู่หรือไม่ |
| [ขั้นตอนสมัคร:22](../features/registrations/application/apply-to-tournament.ts#L22) → [ตรวจชน:348](../features/registrations/infrastructure/prisma-registration-repository.ts#L348) | `applyToTournament` → `findConflictingPlayers` | ส่ง ID ผู้เล่นและวันเวลาเริ่ม–สิ้นสุดของรายการใหม่เข้า transaction; ล็อก ID ตามลำดับ แล้วค้นใบสมัคร `PENDING`/`APPROVED` ของรายการที่ยังไม่จบ **เฉพาะเมื่อช่วงแข่งทับกัน** (`เดิมเริ่ม < ใหม่สิ้นสุด` และ `เดิมสิ้นสุด > ใหม่เริ่ม`) ถ้าวันเวลาไม่ทับ แม้เป็นผู้เล่นคนเดิมก็สมัครได้; ถ้าทับจะคืน `PLAYER_ALREADY_COMPETING` |
| [สร้างใบสมัคร:366](../features/registrations/infrastructure/prisma-registration-repository.ts#L366) → [อ่านรายชื่อผู้จัด:182](../features/registrations/infrastructure/prisma-registration-repository.ts#L182) | `createPending` → `listByTournament` | เมื่อไม่ชนจึงสร้างใบสมัครกับ snapshot ใน transaction เดียว; หน้าผู้จัดอ่าน snapshot นี้ ไม่อ่านรายชื่อทีมปัจจุบัน ส่วน [ข้อความ 409:235](../features/registrations/presentation/registration-handler.ts#L235) บอกเหตุผลโดยไม่เผยข้อมูลทีมอื่น |
| [migration.sql:3](../prisma/migrations/20261028090000_shared_player_identity/migration.sql#L3) | backfill และข้อจำกัดฐานข้อมูล | ตรวจสมาชิก active ซ้ำในทีมก่อนย้าย; เติม ID กลางให้แถวเก่าและ snapshot ให้ใบสมัครที่ยัง active โดยไม่ลบทีม/ผลการแข่งขันเก่า หากเจอสมาชิกซ้ำแบบต้องตัดสินด้วยคนจะหยุด migration และย้อน transaction ทั้งก้อน |

**ข้อจำกัดที่ควรตอบให้ตรง:** ระบบจับคนเดิมได้ภายในบัญชีเจ้าของทีมเดียวกันจากชื่อ นามสกุล และวันเกิด ไม่ยืนยันว่าเป็นคนเดียวกันข้ามบัญชี ใบสมัครเก่าที่มีผู้เล่นซ้อนกันก่อนเปิดกฎใหม่ไม่ถูกยกเลิกอัตโนมัติ แต่จะกันใบสมัครใหม่ที่ **ช่วงแข่งทับกัน** เท่านั้น ถ้ารายการเก่าสิ้นสุดพอดีกับเวลาเริ่มรายการใหม่ถือว่าไม่ทับ ส่วน snapshot ของใบสมัครเก่าที่ backfill สะท้อน roster ตอนย้ายข้อมูล ไม่สามารถย้อนพิสูจน์รายชื่อ ณ วันสมัครจริงได้

### 2. สมัครแข่งขันและผู้จัดตัดสินใบสมัคร

การสมัครสร้าง `Registration` เชื่อมทีมกับรายการและ `RegistrationPlayer` เก็บรายชื่อที่ส่งในครั้งนั้น ส่วนการอนุมัติเปลี่ยนสถานะใบสมัคร ไม่ได้สร้างทีมใหม่ซ้ำอีกทีม

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| ปุ่มสมัคร: [tournament-registration-action.tsx:83](../components/tournaments/tournament-registration-action.tsx#L83) | `submitRegistration` | **รับ:** ทีมที่ผู้ใช้เลือก ส่งคำขอสมัครไป API ของรายการนั้น **หลังตอบกลับ:** แสดงสถานะสำเร็จหรือเหตุผลที่สมัครไม่ได้ การเลือกทีมในหน้าจอไม่ได้แปลว่าระบบอนุมัติให้สมัครแล้ว |
| ขั้นตอนสมัคร: [apply-to-tournament.ts:22](../features/registrations/application/apply-to-tournament.ts#L22) | `applyToTournament` | **รับ:** ID ทีม/รายการและผู้ใช้ เปิด transaction แล้วให้ [`loadEligibleApplicationContext`:38](../features/registrations/application/apply-to-tournament.ts#L38) ตรวจบริบททีม รายการ ใบสมัครเดิมและชื่อซ้ำ **ส่งต่อ:** สร้างใบสมัคร `PENDING` เมื่อทุกเงื่อนไขผ่าน |
| กฎที่ทำให้สมัครได้: [registration-policy.ts:64](../features/registrations/domain/registration-policy.ts#L64) | `assertCanApply` | **รับ:** สถานะทีม รายชื่อผู้เล่น และข้อมูลการรับสมัคร ตรวจความพร้อมตามกฎ ถ้าไม่ผ่านจะ throw ข้อผิดพลาดเพื่อหยุดขั้นตอน ไม่คืนค่าที่บอกให้ UI อนุมัติแทนเซิร์ฟเวอร์ |
| ยืนยันคำตัดสินบนหน้าเว็บ: [registration-review-list.tsx:94](../components/organizer/registration-review-list.tsx#L94) | `submitConfirmation` | **รับ:** ใบสมัครและคำสั่งที่ยืนยันใน dialog เลือกส่งอนุมัติ ปฏิเสธ หรือถอนทีม พร้อมเหตุผลตามคำสั่งและ version **หลังตอบกลับ:** ปรับสถานะ/ข้อความบนหน้าจอ ถ้าข้อมูลเก่าให้จัดการข้อผิดพลาดแทนทับผลใหม่ |
| ตรวจคำตัดสินฝั่งเซิร์ฟเวอร์: [decide-registration.ts:25](../features/registrations/application/decide-registration.ts#L25) | `decideRegistration` | **รับ:** ใบสมัคร คำตัดสิน เหตุผล และ version ตรวจว่าเป็นรายการที่ผู้ใช้มีสิทธิ์ดูแลและสถานะยังตัดสินได้ **ส่งต่อ:** อนุมัติใช้ `approveWithCapacity`; ปฏิเสธใช้ `rejectWithVersion` ภายใน transaction |
| อนุมัติพร้อมตรวจจำนวนทีม: [prisma-registration-repository.ts:473](../features/registrations/infrastructure/prisma-registration-repository.ts#L473) | `approveWithCapacity` | **รับ:** คำสั่งอนุมัติที่ผ่าน use case ตรวจความจุและ version ตอนบันทึกจริง แล้วบันทึกสถานะกับ audit ไม่ใช้จำนวนคงเหลือบนหน้าจอเป็นหลักฐานสุดท้าย เพราะผู้จัดอาจเปิดหลายหน้าต่างพร้อมกัน |

### 3. ล็อกทีม จัดสาย และเผยแพร่

แยกสามจังหวะให้ชัด: **ล็อกทีม** คือเก็บรายชื่อทีมที่ใช้จัดสาย → **สร้างตัวอย่าง** คือบันทึกโครงสร้างสายฉบับร่าง → **เผยแพร่** คืออนุญาตให้หน้าสาธารณะอ่านสายนี้

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| ปุ่มล็อกทีม: [bracket-workspace.tsx:79](../components/organizer/bracket-workspace.tsx#L79) | `lockEntries` | **รับ:** การกดล็อกรายชื่อ ส่งคำขอไป endpoint `/bracket/entries` เพื่อให้เซิร์ฟเวอร์เลือกทีมที่อนุมัติแล้ว เก็บ snapshot เฉพาะทีม/ชื่อทีม ไม่ได้แช่แข็งรายชื่อผู้เล่นทุกคน |
| ตรวจเงื่อนไขล็อก: [lock-bracket-entries.ts:22](../features/competition/application/lock-bracket-entries.ts#L22) | `lockBracketEntries` | **รับ:** รายการและผู้ใช้ ตรวจเจ้าของ permission สถานะปิดรับสมัครและจำนวนทีมก่อนเรียก repository **ผล:** ได้ชุดทีมที่ตรึงไว้ให้ขั้นตอนเรียง/สุ่มใช้ต่อ |
| ลูกศรเลื่อนทีม: [bracket-workspace.tsx:86](../components/organizer/bracket-workspace.tsx#L86) | `moveEntry` | **รับ:** ตำแหน่งทีมและทิศทาง -1/+1 คัดลอก array แล้วสลับกับทีมข้างเคียง พร้อมกันไม่ให้เลื่อนเลยขอบ **ผล:** state บนหน้าจอเปลี่ยน แต่ยังไม่บันทึกสายลงฐานข้อมูล |
| ปุ่มสร้าง/สุ่ม: [bracket-workspace.tsx:101](../components/organizer/bracket-workspace.tsx#L101) | `generateBracket` | **รับ:** วิธีจัดสายและลำดับปัจจุบัน ถ้าเรียงเองส่งตำแหน่งของทุกทีมด้วย `ORDERED`; ถ้าสุ่มใช้ `RANDOM_ORDERED` **ส่งต่อ:** API `/bracket/generate` พร้อม version; `redraw` คือขอสุ่มใหม่และต้องยืนยันก่อน |
| ตัวรับคำขอจัดสาย: [competition-handler.ts:217](../features/competition/presentation/competition-handler.ts#L217) | `handleGenerateBracket` | **รับ:** ID รายการ request และตัวอ่านผู้ใช้ ตรวจว่าล็อกอิน/JSON ตรง schema แล้วเรียก use case **คืน:** สายที่บันทึกหรือ HTTP error ไม่ใช้ค่าที่ browser ส่งมาเป็นสิทธิ์โดยอัตโนมัติ |
| ขั้นตอนสร้างสายจริง: [generate-bracket.ts:49](../features/competition/application/generate-bracket.ts#L49) | `generateBracketDraft` | **รับ:** วิธีจัด ตำแหน่ง และ expectedVersion ตรวจเจ้าของ สถานะฉบับร่าง โหมดระบบ จำนวน 8/16/32 ทีม และข้อห้ามสร้างใหม่เมื่อจัดตารางหรือเริ่มแข่งแล้ว **ส่งต่อ:** เตรียมลำดับ → สร้างแผนคู่ → บันทึกภายใน transaction |
| เตรียมตำแหน่งทีม: [generate-bracket.ts:108](../features/competition/application/generate-bracket.ts#L108) | `prepareEntries` | **รับ:** คำขอและทีมที่ล็อกไว้ เรียงเองต้องส่งทีมครบและตำแหน่งไม่ซ้ำ; ถ้าขอสุ่มเดิมโดยไม่ redraw ให้ใช้ลำดับเดิม **คืน:** ทีมพร้อม `drawPosition` และ token ที่จะบันทึก; สุ่มใหม่จึงสร้าง token ใหม่ |
| เรียงจาก token: [tokenized-bracket-shuffle.ts:12](../features/competition/infrastructure/tokenized-bracket-shuffle.ts#L12) | `tokenizedBracketShuffle` | **รับ:** ทีมที่ล็อกกับ token ใช้ hash ของ token/ID แต่ละ entry เป็นค่าจัดลำดับ **คืน:** รายชื่อเรียงใหม่ที่ทำซ้ำได้เมื่อใช้ token เดิม ไม่ประเมินฝีมือทีมและไม่สุ่มผู้ชนะ |
| ทางเข้าตัวสร้างตามตำแหน่ง: [bracket-generator.ts:86](../features/competition/domain/bracket-generator.ts#L86) | `generateOrderedSingleEliminationBracket` | **รับ:** ทีมและ position 1 ถึงจำนวนทีม ตรวจจำนวน/ตำแหน่งแล้วแปลงเป็นทีมต้นทางเรียงลำดับ **ส่งต่อ:** `buildBracketPlan` ฟังก์ชันนี้สร้างข้อมูลแผน ไม่เรียก Prisma และไม่วาด HTML |
| จุดจับคู่ทีละรอบ: [bracket-generator.ts:111](../features/competition/domain/bracket-generator.ts#L111) | `buildBracketPlan` | **รับ:** ทีมต้นทางตามลำดับ วนครั้งละสองช่องเป็นคู่ 1–2, 3–4 แล้วให้ผู้ชนะเป็นต้นทางของรอบถัดไป **คืน:** รอบ คู่ และทางไปช่อง HOME/AWAY; เช่น 8 ทีมได้ 3 รอบ 7 คู่ ส่วนเงื่อนไข Bye ในฟังก์ชันรองรับทางเก่า ไม่ใช่กฎของโหมด ordered ปัจจุบัน |
| บันทึกแผนลงฐานข้อมูล: [prisma-competition-repository.ts:516](../features/competition/infrastructure/prisma-competition-repository.ts#L516) | `persistGeneratedPlan` | **รับ:** แผนคู่และตำแหน่งที่คำนวณเสร็จ ตรวจ version/เงื่อนไขการแก้สายแล้วเขียนรอบ คู่ การเชื่อมปลายทาง และ audit **คืน:** ข้อมูลสายที่บันทึกให้หน้าแสดงตัวอย่าง หากข้อมูลเก่าหรือสถานะไม่ตรงต้องไม่ทับสายใหม่ |
| ปุ่มเผยแพร่: [bracket-workspace.tsx:122](../components/organizer/bracket-workspace.tsx#L122) | `publishBracket` | **รับ:** การยืนยันเผยแพร่ ส่งคำขอไป API publication **ผล:** เมื่อเซิร์ฟเวอร์ตรวจผ่านและเผยแพร่แล้ว หน้าสาธารณะจึงอ่านสายได้ การสร้างตัวอย่างสำเร็จอย่างเดียวยังไม่เท่ากับเผยแพร่ |

อย่าสับสนกับ [`generateSingleEliminationBracket`](../features/competition/domain/bracket-generator.ts#L66) บรรทัด 66: ฟังก์ชันนี้เป็นตัวจัดตาม Seed ที่ยังอยู่ในโค้ดและมีผู้เรียกใน demo/เทสต์ แต่ `generateBracketDraft` ของหน้าผู้จัดปัจจุบันเรียกตัวจัด **ตามตำแหน่ง** บรรทัด 86 ไม่ได้เรียกตัว Seed

### 4. จัดตาราง บันทึกคะแนน และยืนยันผล

เวลาและคะแนนเป็นข้อมูลคนละชุด ปุ่มบันทึกคะแนนร่างยังไม่ทำให้ผู้ชนะขึ้นรอบถัดไป ต้องใช้ปุ่มยืนยันผลให้สำเร็จก่อน

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| ปุ่มบันทึกตาราง: [match-schedule-editor.tsx:43](../components/organizer/match-schedule-editor.tsx#L43) | `saveMatch` | **รับ:** วันเวลาไทยและสนามจากฟอร์ม แปลงเวลาเป็น UTC **ส่งต่อ:** `PATCH` schedule พร้อม `expectedVersion` ถ้าเซิร์ฟเวอร์ไม่รับให้แสดงเหตุผล ไม่เปลี่ยนเวลาในฐานข้อมูลเองจาก component |
| ตรวจตารางก่อนบันทึก: [schedule-match.ts:27](../features/competition/application/schedule-match.ts#L27) | `scheduleMatch` | **รับ:** วันเวลา สนาม คู่แข่งขัน และผู้ใช้ ตรวจสิทธิ์ version สายที่เผยแพร่ และช่วงวันรายการ สำหรับ 5v5 ปฏิเสธสนามเดียวกันเวลาเริ่มเดียวกันของคู่ที่ยังไม่จบในรายการเดียวกัน; 3v3 อนุญาต **ส่งต่อ:** repository เมื่อผ่านทุกกฎ |
| เขียนตาราง: [prisma-competition-repository.ts:978](../features/competition/infrastructure/prisma-competition-repository.ts#L978) | `scheduleMatch` | **รับ:** ตารางที่ use case อนุญาต เขียน `scheduledAt`/`court` ภายใต้เงื่อนไข version และบันทึก audit **คืน:** ข้อมูลคู่ที่อัปเดตแล้ว ไม่ได้สร้างคู่แข่งขันใหม่ในขั้นตอนนี้ |
| ปุ่มคะแนนสองแบบ: [match-result-editor.tsx:49](../components/organizer/match-result-editor.tsx#L49) | `submitResult` | **รับ:** คะแนนที่กรอกและคำสั่งที่เลือก บันทึกร่างส่ง `PATCH .../score`; ยืนยันผลถามยืนยันก่อนส่ง `POST .../confirm` **หลังตอบกลับ:** แสดงผลหรือข้อความผิดพลาดให้ผู้จัดทราบ |
| บันทึกคะแนนร่าง: [record-match-score.ts:26](../features/competition/application/record-match-score.ts#L26) | `recordMatchScore` | **รับ:** คะแนน ID คู่และ version ตรวจสิทธิ์และบริบทการแก้คะแนนก่อนให้ repository บันทึกร่าง **ยังไม่ทำ:** สร้างผลยืนยันหรือเลื่อนทีมชนะ ร่างจึงยอมรับคะแนนเสมอได้ |
| ยืนยันผู้ชนะ: [confirm-match-result.ts:26](../features/competition/application/confirm-match-result.ts#L26) | `confirmMatchResult` | **รับ:** คะแนนสองทีมและ version ตรวจบริบทแล้วให้ domain หาผู้ชนะ/ปลายทาง ยืนยันแบบเสมอไม่ได้ **ส่งต่อ:** repository บันทึกผล; ถ้าเป็นไฟล์ภายนอกจะตัดปลายทางออก ไม่เดาทางเลื่อนทีมจาก PDF |
| เขียนผลกับเลื่อนทีมร่วมกัน: [prisma-competition-repository.ts:1274](../features/competition/infrastructure/prisma-competition-repository.ts#L1274) | `confirmResultAndAdvance` | **รับ:** ผู้ชนะ คะแนนและช่องปลายทาง บันทึกผลยืนยันและใส่ผู้ชนะลงคู่ถัดไปใน transaction เดียว **กรณีผิด:** ถ้าปลายทางขัดแย้งต้องย้อนกลับงาน ไม่ปล่อยให้ผลยืนยันแล้วแต่ทีมยังไม่ถูกเลื่อน |

#### 4A. ตรวจสนามและเวลาเริ่มซ้ำของ 5x5

**กฎที่ใช้อยู่:** ในรายการ 5x5 เดียวกัน คู่ที่ยังไม่จบต้องไม่ใช้ **สนามเดียวกันและวันเวลาเริ่มตรงกันพร้อมกัน** ไม่ได้ห้ามใช้สนามเดิมตลอดทั้งรายการ และไม่ได้ห้ามทุกสนามแข่งพร้อมกัน ถ้าเปลี่ยนสนามหรือเปลี่ยนเวลาเริ่มก็ไม่ชนตามกฎข้อนี้

**ทางเดินข้อมูล:** กรอกเวลาไทย/สนาม → `saveMatch` แปลงเวลาเป็น UTC → `PATCH .../schedule` → handler ตรวจคำขอ → `scheduleMatch` ตรวจสิทธิ์และสถานะ → repository ค้นคู่ที่ชน → ถ้าเป็น 5x5 และพบคู่ชนให้ตอบ 409; ถ้าไม่ชนและผ่านกฎอื่นจึงบันทึก

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| ปุ่มบันทึกเวลา/สนาม: [match-schedule-editor.tsx:43](../components/organizer/match-schedule-editor.tsx#L43) | `saveMatch` | **รับ:** วันเวลาในช่อง `datetime-local` และชื่อสนาม ตัดช่องว่างหัวท้ายของชื่อสนาม แล้วตรวจว่ากรอกครบ **ส่งต่อ:** เวลา UTC, `court` และ `expectedVersion` ไป API ยังไม่ตรวจคู่ชนทั้งหมดใน browser เพราะข้อมูลคู่แข่งอาจถูกเปลี่ยนจากอีกหน้าต่าง |
| แปลงเวลาไทย: [tournament-editor-time.ts:14](../features/admin/presentation/tournament-editor-time.ts#L14) | `bangkokDateTimeLocalToUtc` | **รับ:** วันเวลาไทยที่ไม่มี timezone ติดมาในค่าของช่องกรอก **คืน:** เวลา UTC สำหรับส่งและจัดเก็บ ทำให้การเทียบเวลาฝั่งฐานข้อมูลใช้จุดเวลาเดียวกัน ไม่เทียบแค่ข้อความว่า “10:00” โดยไม่สนใจวัน |
| ทางเข้าของ API: [route.ts:14](<../app/api/organizer/tournaments/[id]/matches/[matchId]/schedule/route.ts#L14>) | `PATCH` | **รับ:** ID รายการและ ID คู่จาก URL พร้อม request เตรียมตัวอ่าน session กับ repository แล้วส่งเข้า `handleScheduleMatch` โดยเชื่อมคำสั่งบันทึกกับ application `scheduleMatch` |
| ตรวจ request: [competition-handler.ts:324](../features/competition/presentation/competition-handler.ts#L324) | `handleScheduleMatch` | **รับ:** request/ผู้ใช้ ถ้าไม่ล็อกอินตอบ 401 ถ้า JSON ไม่ผ่าน `scheduleMatchSchema` ตอบ 422 **ส่งต่อ:** use case พร้อม actor ที่ได้จาก session; ถ้าเกิดข้อผิดพลาดที่รู้จักให้แปลงผ่าน `scheduleFailureResponse` |
| ตรวจสิทธิ์และกฎ: [schedule-match.ts:27](../features/competition/application/schedule-match.ts#L27) | `scheduleMatch` | **รับ:** เวลา สนาม version และ actor เปิด transaction เพื่ออ่านบริบท ตรวจเจ้าของรายการ/permission, version, governance, สถานะรายการ สายที่เผยแพร่ และคู่ที่ยัง SCHEDULED **จุดตัดสิน:** [บรรทัด 69](../features/competition/application/schedule-match.ts#L69) ตรวจ `FIVE_V_FIVE` ร่วมกับ `hasCourtConflict` ถ้าจริงทั้งสองอย่างให้หยุดก่อนเขียนข้อมูล |
| ค้นหาคู่ชนในฐานข้อมูล: [prisma-competition-repository.ts:921](../features/competition/infrastructure/prisma-competition-repository.ts#L921) | `findMatchScheduleContext` | **รับ:** ID รายการ/คู่ เวลาและสนาม โหลดบริบทและล็อกแถวรายการก่อนตรวจคู่ชน **query ที่บรรทัด 951:** ค้นคู่อื่นในรายการเดียวกันที่เวลาเริ่มตรงกัน สนามชื่อเดียวกันแบบไม่แยกตัวพิมพ์ และสถานะไม่ใช่ COMPLETED **คืน:** `hasCourtConflict` พร้อม format และบริบทให้ use case ตัดสิน ไม่ใช่ repository เป็นผู้ตัดสินยกเว้น 3x3 เอง |
| แปลงเป็นข้อความให้ผู้ใช้: [competition-handler.ts:661](../features/competition/presentation/competition-handler.ts#L661) | `scheduleFailureResponse` | **รับ:** ข้อผิดพลาดจาก use case ถ้าเป็น `MATCH_SCHEDULE_CONFLICT` **คืน:** HTTP 409 พร้อม “สนามนี้มีการแข่งขันในเวลาดังกล่าวแล้ว” ฟอร์มรับข้อความนี้มาแสดงผ่าน `setMessage` โดยไม่ refresh หน้าเป็นผลสำเร็จ |
| เขียนเมื่อผ่านแล้ว: [prisma-competition-repository.ts:978](../features/competition/infrastructure/prisma-competition-repository.ts#L978) | `scheduleMatch` | **รับ:** ค่าที่ use case อนุญาตแล้ว อัปเดตคู่ที่ ID/รายการ/version ตรงและยัง SCHEDULED เพิ่ม version และบันทึก audit `MATCH_SCHEDULED` **ถ้าไม่พบแถวตรงเงื่อนไข:** throw `CONFLICT` เพื่อไม่เขียนทับข้อมูลใหม่ |

**โค้ดที่บอกว่าใช้เฉพาะ 5x5** อยู่ใน [schedule-match.ts:69](../features/competition/application/schedule-match.ts#L69):

```ts
if (context.tournamentFormat === "FIVE_V_FIVE" && context.hasCourtConflict) {
  throw new Error("MATCH_SCHEDULE_CONFLICT")
}
```

`&&` แปลว่า **ต้องจริงทั้งสองเงื่อนไข**: เป็นรายการ 5x5 และค้นพบคู่ชน ถ้าเป็น 3x3 แม้ repository พบคู่ใช้สนาม/เวลาเดียวกัน ก็ไม่เข้า if นี้ แต่ยังต้องผ่านสิทธิ์ สถานะ version และช่วงวันที่ตามปกติ

**ตัวค้นหาคู่ชน** อยู่ใน [prisma-competition-repository.ts:951](../features/competition/infrastructure/prisma-competition-repository.ts#L951):

```ts
const conflict = await this.prisma.match.findFirst({
  where: {
    tournamentId: input.tournamentId,
    id: { not: input.matchId },
    scheduledAt: new Date(input.scheduledAt),
    court: { equals: input.court, mode: "insensitive" },
    status: { not: "COMPLETED" },
  },
  select: { id: true },
})
```

อ่าน query นี้ทีละเงื่อนไข:

1. `tournamentId` จำกัดให้ตรวจภายในรายการเดียวกัน ไม่ใช่ระบบจองสนามรวมทุกรายการ
2. `id: { not: input.matchId }` ไม่นับตัวเองเป็นคู่ชน จึงกดบันทึกเวลาเดิมของคู่เดิมได้ถ้าผ่านเงื่อนไขอื่น
3. `scheduledAt` ต้องตรงทั้งวันและเวลาเริ่ม ไม่ใช่ดูแค่ชั่วโมงหรือนาทีของคนละวัน
4. `court` เทียบชื่อสนามแบบไม่แยกตัวพิมพ์ เช่น `Court A` กับ `court a` ถือว่าตรงกัน แต่ไม่ได้แก้คำสะกดหรือรวมชื่อสนามคนละชื่อให้เอง
5. `status` ตัดคู่ COMPLETED ออก จึงไม่เอาคู่ที่จบแล้วมาบล็อก แต่คู่ SCHEDULED/IN_PROGRESS ยังนับได้
6. `select: { id: true }` ขอแค่ ID เพราะต้องรู้เพียงว่ามีคู่ชนหรือไม่ จากนั้นส่ง `Boolean(conflict)` กลับเป็น `hasCourtConflict`

**ตัวอย่างอธิบายหรือซ้อม:** สมมุติมีคู่ A ในรายการเดียวกัน ใช้สนาม 1 วันที่ 28 ต.ค. เวลา 10:00 และยังไม่จบ ผลด้านล่างหมายถึงกฎสนาม/เวลาเท่านั้น ไม่ข้ามกฎสิทธิ์หรือช่วงวันรายการ

| ค่าที่กำลังบันทึกให้คู่อื่น | ผลตามกฎนี้ | เหตุผล |
| --- | --- | --- |
| 5x5, สนาม 1, วันเดียวกัน 10:00 | ไม่ให้บันทึก: 409 | สนามและวันเวลาเริ่มตรงกับคู่ A |
| 5x5, สนาม 2, วันเดียวกัน 10:00 | ไม่ติดกฎชน | เวลาเดียวกันแต่คนละสนาม |
| 5x5, สนาม 1, วันเดียวกัน 11:00 | ไม่ติดกฎชน | สนามเดียวกันแต่เวลาเริ่มต่างกัน |
| 5x5, สนาม 1, วันถัดไป 10:00 | ไม่ติดกฎชน | นาฬิกาเวลาเท่ากันแต่คนละวันที่ |
| 5x5, สนาม 1, วันเวลาเดิม แต่คู่ A จบแล้ว | ไม่ติดกฎชน | query ไม่เอาคู่ COMPLETED มาบล็อก |
| รายการ 3x3 มีคู่อื่นใช้สนาม/วันเวลาเดียวกัน | ไม่ติดกฎชน | use case บังคับเงื่อนไขนี้เฉพาะ FIVE_V_FIVE |

**ขอบเขตที่ไม่ควรตอบเกินโค้ด:** ไม่มีการคำนวณระยะเวลาต่อแมตช์หรือเวลาจบ ดังนั้น 10:00 กับ 10:01 ไม่ถูกมองว่าชนด้วยกฎนี้ แม้ในชีวิตจริงอาจแข่งไม่จบ และการยกเว้นแอดมินให้นัดนอกช่วงวันพร้อมเหตุผลก็ไม่ได้ข้ามข้อห้ามสนาม/เวลาเริ่มซ้ำของ 5x5

**ประโยคตอบอาจารย์:** “ตอนกดบันทึก ระบบแปลงเวลาไทยเป็น UTC แล้วไปตรวจที่เซิร์ฟเวอร์ครับ repository ค้นคู่อื่นในรายการเดียวกันที่ชื่อสนามและวันเวลาเริ่มตรงกัน โดยไม่นับคู่ที่จบแล้ว จากนั้น use case จะปฏิเสธเฉพาะรายการ 5x5 ด้วย error ที่แปลงเป็น 409 ส่วน 3x3 อนุญาตให้ใช้สนามและเวลาเดียวกันได้ กฎนี้ยังไม่ได้คำนวณช่วงเวลาทับซ้อนครับ”

หลักฐานให้เปิดอ่านเพิ่ม: [เทสต์ปฏิเสธบริบท 5x5 ที่มีคู่ชน:750](../tests/features/competition/competition-use-cases.test.ts#L750), [เทสต์อนุญาต 3x3 ใช้สนาม/เวลาเดียวกัน:772](../tests/features/competition/competition-use-cases.test.ts#L772) และ [เทสต์ repository ล็อกรายการก่อนค้นพร้อมตัด COMPLETED:37](../tests/features/competition/prisma-competition-repository.test.ts#L37) เป็นเทสต์แบบจำลอง dependencies ไม่ใช่หลักฐานทดสอบบน production ในรอบเอกสารนี้

### 5. หน้าสาธารณะ: สาย ตาราง และผล

สามหน้าใช้ slug ใน `?tournament=...` เพื่อเปิดรายการเดียวกัน เป็นเส้นทางอ่านข้อมูล ไม่ได้เรียก API ยืนยันผลหรือสร้างสายเมื่อผู้ชมเปิดหน้า

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| หน้าสาย: [page.tsx:21](<../app/(public)/bracket/page.tsx#L21>) | `BracketPage` | **รับ:** query เลือกรายการ ถ้ามี slug ให้โหลดรายการนั้น ถ้าไม่มีเลือกค่าเริ่มต้น `OPEN` **แสดง:** ไฟล์เมื่อใช้โหมดเอกสาร หรือโครงสายระบบเมื่อมีข้อมูล; ถ้ายังไม่มีสายให้แสดง empty state |
| หน้าตาราง: [page.tsx:17](<../app/(public)/schedule/page.tsx#L17>) | `SchedulePage` | **รับ:** slug หรือค่าเริ่มต้น โหลดการแข่งขันแล้วกรองเฉพาะคู่ที่มี `scheduledAt` **แสดง:** วัน เวลา สนาม และคู่แข่งขัน คู่ที่สร้างไว้แต่ยังไม่กำหนดเวลาไม่ได้แปลว่าหายจากสาย |
| หน้าผล: [page.tsx:23](<../app/(public)/results/page.tsx#L23>) | `ResultsPage` | **รับ:** slug ของรายการ ถ้าไม่ระบุให้หา `ONGOING` ก่อนแล้วจึง `COMPLETED` **ส่งต่อ:** คู่แข่งขันไปสรุปผล และแสดงแชมป์/รองแชมป์เมื่อมีผลชิงที่ยืนยัน ไม่ถือว่าคะแนนร่างคือผลสุดท้าย |
| Query รายการสาธารณะ: [prisma-tournament-repository.ts:149](../features/tournaments/infrastructure/prisma-tournament-repository.ts#L149) | `findCompetitionBySlug` | **รับ:** slug ค้นรายการที่สถานะเปิดให้ผู้ชมและ governance ยัง ACTIVE พร้อมข้อมูลแข่งขัน **คืน:** รายการที่แปลงพร้อมแสดง หรือ null ถ้าไม่มีรายการที่เปิดดูได้ โดยไม่เปิดเผยสายฉบับร่าง |
| สรุปผลและอันดับ: [get-competition-summary.ts:41](../features/competition/application/get-competition-summary.ts#L41) | `getCompetitionSummary` | **รับ:** ข้อมูลคู่แข่งขัน ตรวจผลที่ยืนยันแล้วและประเภท/ความสัมพันธ์ของคู่ **คืน:** ผู้ชนะ รองชนะเลิศ และข้อมูลสรุปที่ UI นำไปแสดง ฟังก์ชันนี้ไม่บันทึกคะแนนใหม่ลงฐานข้อมูล |

**เวลาไล่ปัญหา:** เริ่มจากฟังก์ชัน UI ที่กด → route/handler ที่รับคำขอ → use case ที่ตรวจสิทธิ์และกฎ → repository ที่เขียนฐานข้อมูล ถ้าหน้าจอให้กดได้แต่ server ปฏิเสธ ให้ดูข้อความตอบกลับและเงื่อนไขใน use case ก่อน ไม่สรุปว่าปุ่มเสียทันที

### 6. อ่านรายชื่อผู้เล่นตามบทบาท

#### 6A. แอดมิน: ดูทีมทั้งหมดและกดเข้าไปดูสมาชิก

**ทางเดินบนเว็บ:** `/admin/teams` → เลือกทีม → `/admin/teams/[id]` ส่วนนี้เป็นหน้าดูข้อมูล ไม่ใช่หน้าฟอร์มแก้ผู้เล่น

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| หน้า “ทีมทั้งหมด”: [page.tsx:14](<../app/(admin)/admin/teams/page.tsx#L14>) | `AdminTeamListPage` | **รับ:** ผู้ใช้จาก session เรียก `listAdminTeams` แล้ววนทีมสร้างลิงก์ `/admin/teams/{id}` **แสดง:** ชื่อทีม ผู้สร้าง จังหวัด รูปแบบ สถานะ และจำนวนผู้เล่น active; ยังไม่แสดงรายคนในหน้านี้ |
| สิทธิ์อ่านทุกทีม: [read-admin-teams.ts:18](../features/team-management/application/read-admin-teams.ts#L18) | `listAdminTeams` | **รับ:** ผู้ใช้ เรียก `assertAdminTeamAccess` ก่อน `teams.listAll()` **คืน:** รายการทีมที่ทุกบัญชีสร้าง จึงต้องจำกัดเฉพาะแอดมิน ไม่ใช่กรองแค่ทีมของตัวเอง |
| Query รายการทีม: [prisma-admin-team-read-repository.ts:18](../features/team-management/infrastructure/prisma-admin-team-read-repository.ts#L18) | `listAll` | **รับ:** ไม่มีตัวกรองเจ้าของ เพราะผู้เรียกตรวจแอดมินแล้ว ใช้ Prisma อ่านทีมพร้อมชื่อจังหวัด/ผู้สร้าง และ `_count` ของผู้เล่น `isActive: true` **คืน:** ข้อมูลสรุปทีม ไม่มีการโหลดผู้เล่นเต็มทุกคนเพื่อแสดงจำนวน |
| หน้ารายละเอียดทีม: [page.tsx:14](<../app/(admin)/admin/teams/[id]/page.tsx#L14>) | `AdminTeamDetailPage` | **รับ:** `params.id` และผู้ใช้ปัจจุบัน เรียก `getAdminTeamDetail` **หลังได้ข้อมูล:** แสดงหัวทีม ผู้สร้าง จำนวนผู้เล่น และรายชื่อด้านล่าง; ถ้าไม่พบ/ไม่มีสิทธิ์ตาม use case ให้เป็นหน้า not found |
| ขั้นตอนอ่านทีมเดียว: [read-admin-teams.ts:27](../features/team-management/application/read-admin-teams.ts#L27) | `getAdminTeamDetail` | **รับ:** `teamId` กับผู้ใช้ ตรวจแอดมินก่อน `teams.findById(teamId)` **คืน:** `AdminTeamDetail`; ถ้าไม่พบทีม throw `NOT_FOUND` ไม่คืน object ว่างให้หน้าทำเหมือนทีมมีอยู่ |
| จุดตรวจบทบาท: [read-admin-teams.ts:38](../features/team-management/application/read-admin-teams.ts#L38) | `assertAdminTeamAccess` | **รับ:** actor ถ้าไม่ใช่ `PLATFORM_ADMIN` ให้หยุดด้วย `NOT_FOUND` จากนั้นตรวจ `team.read` อีกชั้น ฟังก์ชันนี้ทำให้การเปิด URL ตรงไม่ได้ข้ามสิทธิ์เพียงเพราะไม่เห็นปุ่มในเมนู |
| Query ทีมพร้อมผู้เล่น: [prisma-admin-team-read-repository.ts:39](../features/team-management/infrastructure/prisma-admin-team-read-repository.ts#L39) | `findById` | **รับ:** ID ทีม อ่านทีม/จังหวัด/ชื่อผู้สร้าง และ players เฉพาะ `isActive: true` เลือกชื่อ นามสกุล ชื่อเล่น เบอร์เสื้อ ตำแหน่ง วันเกิด **คืน:** ข้อมูลพร้อมแสดง โดยแปลงวันเกิดเป็น `YYYY-MM-DD` และไม่เลือกเบอร์โทรผู้เล่น |
| **จุดที่สร้างแถวรายชื่อจริง**: [page.tsx:67](<../app/(admin)/admin/teams/[id]/page.tsx#L67>) | `team.players.map` ใน `AdminTeamDetailPage` | **รับ:** array `team.players` วนหนึ่งครั้งต่อผู้เล่นหนึ่งคน คืน `<li>` ที่มีชื่อกับรายละเอียด; `key={player.id}` ให้ React แยกแถวได้ และ `index + 1` เป็นเลขลำดับบนหน้า ถ้ารายชื่อว่างจะแสดงข้อความแทน ไม่เรียก query ใหม่ใน map |

**ประโยคตอบตัวอย่าง:** “หน้ารายชื่ออ่านทีมผ่าน use case ที่ตรวจแอดมินก่อนครับ repository ดึงเฉพาะผู้เล่นที่ใช้งาน แล้วหน้า detail เอา `team.players` มาวน `map` สร้างหนึ่งแถวต่อคน หน้านี้ดูได้อย่างเดียวและไม่ส่งเบอร์โทรผู้เล่นออกมา”

#### 6B. ผู้จัดการ/โค้ช: ดูและจัดการสมาชิกทีมของตัวเอง

**ทางเดินบนเว็บ:** `/team` → เลือกทีม → `/team/[id]` ต่างจากหน้าแอดมินข้างบน เพราะเจ้าของทีมมีฟอร์มเพิ่ม/แก้ไข/นำผู้เล่นออกด้วย

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| หน้าเริ่มต้นของทีม: [page.tsx:19](<../app/(admin)/team/[id]/page.tsx#L19>) | `TeamDetailPage` | **รับ:** ID ทีมและผู้ใช้ เรียก `loadTeamDetail` เพื่ออ่าน workspace และใบสมัคร **ส่งต่อ:** `workspace.players` ผ่าน `initialPlayers` ให้ `TeamWorkspaceManager`; ทีมปิดใช้งานส่ง `readOnly` เพื่อไม่แสดงคำสั่งแก้ไข |
| รวมข้อมูลที่หน้าใช้: [page.tsx:59](<../app/(admin)/team/[id]/page.tsx#L59>) | `loadTeamDetail` | **รับ:** ID ทีมกับ actor ใช้ `Promise.all` โหลด `getOwnedTeamWorkspace` และใบสมัครของทีมควบคู่กัน **คืน:** ข้อมูลสองชุดให้หน้าใช้; `NOT_FOUND`/`FORBIDDEN` ถูกแปลงเป็นหน้า not found ไม่แสดงทีมของคนอื่นต่อ |
| ตรวจเจ้าของแล้วอ่านรายชื่อ: [get-owned-team-workspace.ts:28](../features/team-management/application/get-owned-team-workspace.ts#L28) | `getOwnedTeamWorkspace` | **รับ:** ID ทีม ผู้ใช้และ repository โหลดทีม ตรวจ `authorizeTeamAccess(actor, "team.update", team)` ก่อนอ่าน players **คืน:** `team`, `players` และข้อมูลเทียบสมาชิก legacy ให้หน้า โดยผู้เล่นปัจจุบันมาจาก `TeamPlayer` |
| ตรวจว่าเป็นเจ้าของทีม: [team-access.ts:14](../features/team-management/application/team-access.ts#L14) | `authorizeTeamAccess` | **รับ:** actor คำสั่ง และทีม ถ้าไม่ใช่แอดมินและ `team.ownerId` ไม่ตรง actor ให้ `NOT_FOUND` แล้วตรวจ permission **ผล:** จำกัดเจ้าของทีม ไม่ใช่ใครมีบทบาทผู้จัดการก็เปิดทีมของผู้จัดการคนอื่นได้ |
| Query ผู้เล่นปัจจุบัน: [prisma-team-repository.ts:374](../features/team-management/infrastructure/prisma-team-repository.ts#L374) | `listActivePlayers` | **รับ:** `teamId` ใช้ `teamPlayer.findMany` พร้อม `where: { teamId, isActive: true }` แล้วเรียงตามเวลาสร้าง **คืน:** array ที่แปลงผ่าน `mapPlayer`; ตัวส่งต่อชื่อเดียวกันที่บรรทัด 202 ยังไม่ใช่จุด query จริง |
| ส่งข้อมูลให้ส่วนรายชื่อ: [team-workspace-manager.tsx:18](../components/team/team-workspace-manager.tsx#L18) | `TeamWorkspaceManager` | **รับ:** ทีมเริ่มต้นและผู้เล่น เก็บทีมล่าสุดใน state เพื่อให้ฟอร์มทีมกับรายชื่อใช้ format เดียวกัน **ส่งต่อ:** [`<TeamPlayerRoster>`:44](../components/team/team-workspace-manager.tsx#L44) พร้อม `team.id`, `team.format`, `initialPlayers` และ `readOnly` |
| ตั้งค่ารายชื่อบนหน้าจอ: [team-player-roster.tsx:36](../components/team/team-player-roster.tsx#L36) | `TeamPlayerRoster` | **รับ:** props จากตัวประกอบหน้า ตั้ง state `players` โดยกรอง active และหาเพดานตาม format **แสดง:** จำนวนคน ฟอร์มเพิ่ม และรายชื่อ; ไม่ query Prisma จาก component นี้ |
| **จุดที่สร้างแถวรายชื่อจริง**: [team-player-roster.tsx:195](../components/team/team-player-roster.tsx#L195) | `players.map` ใน `TeamPlayerRoster` | **รับ:** players ใน state วนสร้างแถวชื่อ ชื่อเล่น วันเกิด เบอร์เสื้อ ตำแหน่งและเบอร์โทรของพื้นที่จัดการทีม ถ้าแถวถูกเลือกแก้จะแสดงฟอร์มแทน เมื่อ `readOnly` เป็น true จะไม่แสดงปุ่มแก้/นำออก |

**ประโยคตอบตัวอย่าง:** “หน้าทีมของตัวเองตรวจ owner ก่อนอ่านรายชื่อครับ แล้วส่งข้อมูลลง `TeamPlayerRoster` ผ่าน props component เก็บรายชื่อใน state เพื่ออัปเดตหน้าจอหลัง API ตอบสำเร็จ ส่วน `players.map` คือจุดเปลี่ยนข้อมูลแต่ละคนเป็นแถวบนหน้า”

#### 6C. ผู้จัดรายการ: ดูสมาชิกของทีมที่ส่งใบสมัคร

**ทางเดินบนเว็บ:** รายการของฉัน → ทีมสมัคร → กด “ดูสมาชิกทีม” ไม่จำเป็นต้องเป็นเจ้าของทีม แต่ต้องมีสิทธิ์ดูแลรายการที่ทีมนั้นสมัคร

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| หน้าตรวจทีมสมัคร: [page.tsx:25](<../app/(admin)/organizer/tournaments/[id]/registrations/page.tsx#L25>) | `TournamentRegistrationsPage` | **รับ:** ID รายการและผู้ใช้ เรียก `listTournamentRegistrations` แล้วจัดรูปวันที่ส่งใบสมัคร **ส่งต่อ:** รายการใบสมัครพร้อม `players` ให้ `RegistrationReviewList`; ถ้าไม่มี session ส่งไป login และถ้ารายการถูกนำออกไม่แสดงข้อมูล |
| ตรวจสิทธิ์ดูใบสมัคร: [list-tournament-registrations.ts:23](../features/registrations/application/list-tournament-registrations.ts#L23) | `listTournamentRegistrations` | **รับ:** `tournamentId` กับ actor ตรวจว่ารายการมีอยู่และเป็นเจ้าของรายการหรือแอดมิน แล้วตรวจ `registration.decide` **ส่งต่อ:** `listByTournament` หลังผ่านสิทธิ์เท่านั้น; คืนทั้งหัวรายการและใบสมัคร |
| Query ใบสมัครพร้อมสมาชิก: [prisma-registration-repository.ts:183](../features/registrations/infrastructure/prisma-registration-repository.ts#L183) | `listByTournament` | **รับ:** ID รายการ ค้น Registration ของรายการนั้นพร้อมทีม จังหวัด ผู้สร้าง และ players ที่ active **คืน:** ชื่อทีม จำนวนคน ชื่อผู้จัดการ/โค้ช และรายชื่อ; ผู้เล่นเลือกเฉพาะ ID ชื่อ นามสกุล เบอร์เสื้อ ไม่ดึงวันเกิดหรือข้อมูลติดต่อมาส่งหน้านี้ |
| จุดส่งรายชื่อเข้าตัวขยาย: [registration-review-list.tsx:206](../components/organizer/registration-review-list.tsx#L206) | `<RegistrationTeamRoster>` ใน `RegistrationReviewList` | **รับ:** ใบสมัครแต่ละใบ ส่ง `teamName`, `managerCoachName`, `players` ให้ component ลูก ปุ่มอนุมัติ/ปฏิเสธอยู่ส่วนอื่นของรายการเดียวกัน การดูรายชื่อจึงยังไม่เปลี่ยนสถานะใบสมัคร |
| กล่อง “ดูสมาชิกทีม”: [registration-team-roster.tsx:9](../components/organizer/registration-team-roster.tsx#L9) | `RegistrationTeamRoster` | **รับ:** ข้อมูลที่โหลดจาก server แล้ว ใช้ `<details>` กับ `<summary>` ทำส่วนพับ/ขยาย **แสดง:** ผู้จัดการ/โค้ช จำนวนคน และรายชื่อ; การกดขยายไม่ได้ fetch รายชื่อรอบใหม่หรือเขียนฐานข้อมูล |
| **จุดที่สร้างแถวรายชื่อจริง**: [registration-team-roster.tsx:35](../components/organizer/registration-team-roster.tsx#L35) | `players.map` ใน `RegistrationTeamRoster` | **รับ:** array ผู้เล่น วนคืน `<li>` ทีละคน แสดงชื่อ–นามสกุลและ `#เบอร์เสื้อ`; ถ้าเบอร์เป็น null แสดง “ไม่มีเบอร์เสื้อ” และถ้าไม่มีผู้เล่นแสดง empty state ไม่แสดงช่องแก้ข้อมูลผู้เล่น |

**ประโยคตอบตัวอย่าง:** “ผู้จัดเห็นทีมที่สมัครรายการของตัวเองได้ครับ server ตรวจเจ้าของรายการก่อนอ่านใบสมัครพร้อมผู้เล่น แล้วส่งไป component พับ/ขยาย การเปิดรายชื่อเป็นแค่การแสดงข้อมูล ไม่ใช่การอนุมัติและไม่ใช่สิทธิ์แก้ผู้เล่นของทีมนั้น”

**ขอบเขตสำคัญของทั้งสามหน้า:** เป็นรายชื่อปัจจุบันที่ active ใน `TeamPlayer` ไม่ใช่ snapshot ณ วันสมัคร ส่วน `BracketEntry` ตรึงทีม/ชื่อทีมสำหรับสายแข่งขัน ไม่ได้ตรึงรายละเอียดผู้เล่น เมื่อเจ้าของทีมแก้รายชื่อ หน้าดูที่โหลดใหม่จึงอ่านค่าปัจจุบันตามข้อมูลที่เซิร์ฟเวอร์คืน

คู่มือพร้อมโค้ดเต็ม: [ADMIN-TEAM-DIRECTORY-CODE-GUIDE.md](ADMIN-TEAM-DIRECTORY-CODE-GUIDE.md) และ [ORGANIZER-REGISTRATION-ROSTER.md](ORGANIZER-REGISTRATION-ROSTER.md) ส่วนเลขบรรทัดใน CODE-TOUR นี้อ้างอิง source ปัจจุบันที่ตรวจในรอบนี้

### 7. ตัวตนและสิทธิ์

การโหลดผู้ใช้กับการอนุญาตทำงานเป็นคนละขั้น มี session แล้วก็ยังต้องตรวจว่าบทบาทและเจ้าของข้อมูลตรงกับคำสั่งหรือไม่

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| โหลดตัวตนของคำขอ: [supabase-current-actor-provider.ts:24](../features/identity/infrastructure/supabase-current-actor-provider.ts#L24) | `getCurrentActor` | **รับ:** ผลยืนยันผู้ใช้จาก Auth provider นำ Supabase user ID ไปหาโปรไฟล์แอป **คืน:** actor ที่มี ID/บทบาทให้ use case ตรวจต่อ จึงไม่ใช้ role ที่พิมพ์เพิ่มเองใน request เป็นแหล่งสิทธิ์ |
| ตรวจสิทธิ์รายคำสั่ง: [authorize.ts:19](../features/identity/application/authorize.ts#L19) | `authorize` | **รับ:** actor, action เช่น `team.read` และข้อมูลเจ้าของทรัพยากร ตรวจ permission และเงื่อนไข ownership **ถ้าไม่ผ่าน:** หยุดด้วยข้อผิดพลาด; แอดมินผ่านตัวตรวจนี้ได้ แต่ยังไม่ข้ามกฎสถานะ version หรือเหตุผลที่ use case บังคับ |

บทบาทที่มีใน [source ปัจจุบัน](../features/identity/domain/actor.ts#L7) และ [ตารางสิทธิ์](../features/identity/domain/permission.ts) มี 4 ค่า:

| บทบาท | อธิบายจากสิทธิ์ปัจจุบัน |
| --- | --- |
| `PLATFORM_ADMIN` | ตรวจ/กำกับรายการ อ่านทีมทั้งหมด และใช้คำสั่งแก้ผลที่อนุญาต |
| `TOURNAMENT_ORGANIZER` | ดูแลรายการของตน ตรวจใบสมัคร จัดสาย ตาราง และผล |
| `TEAM_MANAGER_COACH` | ผู้จัดการ/โค้ชรวมเป็นบทบาทเดียว สร้างทีม จัดรายชื่อ และสมัครรายการ |
| `PLAYER` | มีชนิดบทบาทในระบบ แต่ชุด permission ใน `permissionsByRole` ว่าง ไม่ควรอ้างว่ามีระบบจัดการทีมของผู้เล่นครบแล้ว |

Auth ตอบว่า “เป็นใคร” ส่วน authorization ตอบว่า “ทำคำสั่งนี้กับข้อมูลชิ้นนี้ได้ไหม” บทบาทที่ใช้ตัดสินมาจากโปรไฟล์ฝั่ง server การแก้ role ในข้อมูลที่ browser ส่งมาไม่ใช่การมอบสิทธิ์

### 8. สายเอกสารและไฟล์แนบตรวจรายการ

แยก “อัปโหลดไฟล์ไว้เปิดดู” ออกจาก “สร้างคู่ในฐานข้อมูล” ไฟล์ PDF ไม่ได้ถูกแปลงเป็นคู่แข่งขันอัตโนมัติ

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| อัปโหลดสายจากภายนอก: [upload-external-bracket.ts:50](../features/competition/application/upload-external-bracket.ts#L50) | `uploadExternalBracket` | **รับ:** ไฟล์และข้อมูลรายการ ตรวจสิทธิ์/ชนิด/ขนาด อัปโหลดชั่วคราวแล้วตรวจการอ่าน ก่อนย้ายไปที่เก็บ revision และบันทึก metadata **กรณีล้มเหลว:** เรียกการชดเชยเพื่อพยายามล้างไฟล์ที่ค้าง ไม่อ้างว่า transaction ฐานข้อมูลย้อน Storage ได้เอง |
| กรอกคู่ในโหมดเอกสาร: [create-external-match.ts:32](../features/competition/application/create-external-match.ts#L32) | `createExternalMatch` | **รับ:** ทีมเหย้า/เยือน รอบ ลำดับ เวลา สนาม และประเภทคู่จากผู้จัด ตรวจทีมจากชุดที่ล็อกไว้และเงื่อนไขโหมดไฟล์ที่เผยแพร่แล้ว **ส่งต่อ:** repository สร้างคู่ ไม่มีขั้นตอนอ่านชื่อทีมออกจาก PDF มาสร้างให้อัตโนมัติ |
| โหลดสื่อในหน้าตรวจ: [get-admin-review-media.ts:23](../features/tournament-media/application/get-admin-review-media.ts#L23) | `getAdminReviewMedia` | **รับ:** รายการและ actor ตรวจว่าเป็นแอดมินและรายการอยู่สถานะ `SUBMITTED` แล้วอ่าน assets ที่ใช้งาน **คืน:** URL โปสเตอร์และรายการเอกสารเฉพาะ ID/ชื่อ/ขนาด ให้หน้าตรวจสร้างส่วนแสดงผล |
| เปิดเอกสารให้แอดมิน: [get-admin-review-media.ts:44](../features/tournament-media/application/get-admin-review-media.ts#L44) | `getAdminReviewDocumentUrl` | **รับ:** ID รายการ/ไฟล์และผู้ใช้ ตรวจแอดมินกับไฟล์ที่ยังใช้งาน ชนิด DOCUMENT และตรงรายการ **คืน:** signed URL อายุ 10 นาทีให้ endpoint พาไปเปิด ลิงก์บนหน้าเป็น endpoint คงเดิม; กดใหม่จะตรวจสิทธิ์และออก URL ใหม่ ไม่ต้องสร้างเอกสารใหม่เมื่อ URL ชั่วคราวหมดอายุ |

ไฟล์จริงอยู่ใน Storage ส่วนฐานข้อมูลเก็บที่อยู่และ metadata การอัปโหลดไฟล์กับการเขียนฐานข้อมูลไม่ได้ย้อนกลับร่วมกันโดย transaction ของ PostgreSQL จึงมี `compensate` พยายามล้างไฟล์เมื่อเกิดข้อผิดพลาด อย่าอ้างว่า PDF ถูกอ่านแล้วสร้างคู่แข่งให้อัตโนมัติ หรือไฟล์สายถูกวาดใหม่หลังบันทึกผล

### 9. เริ่มรายการ จบรายการ และแก้ผลที่ยืนยันแล้ว

ปุ่มเริ่ม/จบไม่ใช่แค่ตั้งข้อความบนหน้า แต่ขอเปลี่ยน lifecycle ของรายการ และต้องผ่านกฎความพร้อมฝั่งเซิร์ฟเวอร์ก่อน

| จุดในโค้ด | ฟังก์ชันหลัก | ทำอะไร / ทำงานอย่างไร |
| --- | --- | --- |
| คำสั่งเริ่มแข่ง: [transition-tournament-competition.ts:28](../features/tournament-operations/application/transition-tournament-competition.ts#L28) | `startTournamentCompetition` | **รับ:** รายการ version ผู้ใช้และเหตุผลเมื่อทำแทน ส่งคำสั่ง START เข้าขั้นตอนกลางเพื่อตรวจสิทธิ์/สถานะ/ความพร้อม **ผล:** เปลี่ยนจากปิดรับสมัครเป็น `IN_PROGRESS` เมื่อผ่าน ไม่ได้แปลว่าทุกคู่มีผลแล้ว |
| รายการสิ่งที่ยังไม่พร้อม: [tournament-competition-policy.ts:35](../features/competition/domain/tournament-competition-policy.ts#L35) | `getStartIssues` | **รับ:** บริบท lifecycle สายที่เผยแพร่และคู่แข่ง ตรวจโครงสร้าง ทีมที่ล็อก และช่องทีม **คืน:** รหัสปัญหาเป็น array; ช่องรอบถัดไปยังว่างได้ถ้ามีคู่ต้นทางส่งผู้ชนะมาถูกต้อง จึงไม่บังคับรู้ทีมชิงตั้งแต่เริ่ม |
| คำสั่งจบการแข่งขัน: [transition-tournament-competition.ts:43](../features/tournament-operations/application/transition-tournament-competition.ts#L43) | `completeTournamentCompetition` | **รับ:** คำขอจบพร้อม version/ผู้ใช้ ส่ง COMPLETE ไปตรวจผ่านขั้นตอนกลาง **ผล:** เปลี่ยนจาก `IN_PROGRESS` เป็น `COMPLETED` เมื่อผลและโครงสร้างพร้อม ไม่ให้ผู้จัดกดจบขณะมีคู่ที่ต้องยืนยันค้างอยู่ |
| ตรวจผลก่อนจบ: [tournament-competition-policy.ts:80](../features/competition/domain/tournament-competition-policy.ts#L80) | `getCompletionIssues` | **รับ:** บริบทและผลของคู่แข่งขัน ตรวจโครงสร้าง/คู่ชิง ผลทุกคู่ต้อง COMPLETED และยืนยันแล้ว รวมถึงผู้ชนะต้องเป็นทีมหนึ่งในคู่นั้น **คืน:** รายการปัญหาที่ใช้หยุดคำสั่งจบและอธิบายสิ่งที่ต้องแก้ |
| แอดมินแก้ผลยืนยัน: [correct-match-result.ts:28](../features/competition/application/correct-match-result.ts#L28) | `correctMatchResult` | **รับ:** คะแนนใหม่ version และเหตุผล ตรวจบทบาทแอดมินกับกฎการแก้ผล **หากเปลี่ยนผู้ชนะ:** ต้องตรวจว่าคู่ถัดไปยังเปลี่ยนทีมได้ ก่อนเขียนผล/การเลื่อนทีมและ audit ไม่ล้างผลปลายทางที่เริ่มแล้วให้เงียบ ๆ |

เส้นทางหลักของรายการคือ `DRAFT → SUBMITTED → APPROVED → PUBLISHED → REGISTRATION_CLOSED → IN_PROGRESS → COMPLETED` การขอแก้ไข/ปฏิเสธ/ระงับเป็นทางแยกที่ตรวจด้วยกฎ ไม่ได้ตั้งสถานะใดก็ได้จากฟอร์ม การเผยแพร่รายการกับเผยแพร่สายเป็นคนละสถานะ และปุ่มเริ่มแข่งต้องผ่านกฎความพร้อมอีกครั้ง

## เชื่อมตารางฐานข้อมูลให้ตอบได้

| ข้อมูล | หลักฐานและความสัมพันธ์ที่ควรรู้ |
| --- | --- |
| บัญชีกับผู้เล่น | [User](../prisma/schema.prisma#L137) เก็บโปรไฟล์/บทบาท ส่วน [TeamPlayer](../prisma/schema.prisma#L221) ผูกกับทีมและไม่บังคับมีบัญชีผู้ใช้ |
| ทีมกับรายการ | [Registration](../prisma/schema.prisma#L304) เป็นตัวเชื่อมทีมกับรายการ มีสถานะและ version; ทีมหนึ่งสมัครหลายรายการได้ภายใต้เงื่อนไข |
| การตรึงทีม | [BracketEntry](../prisma/schema.prisma#L348) อ้างทีม/ใบสมัครและเก็บชื่อทีม ณ เวลาล็อกสาย |
| คู่และการเลื่อนผู้ชนะ | [Match](../prisma/schema.prisma#L381) มี `nextMatchId` และ `nextSlot` ระบุปลายทาง; [MatchResult](../prisma/schema.prisma#L414) เก็บผลยืนยัน และ `matchId` เป็น unique |
| ไฟล์และเวอร์ชัน | [MediaAsset](../prisma/schema.prisma#L426) เก็บที่อยู่ไฟล์ ส่วน [ExternalBracketRevision](../prisma/schema.prisma#L448) เก็บเวอร์ชันสายเอกสาร |
| ประวัติคำสั่ง | [AuditLog](../prisma/schema.prisma#L467) บันทึกผู้ทำ คำสั่ง และข้อมูลก่อน/หลังตาม use case ไม่ใช่ log ทุกการคลิกบนเว็บ |

`@id` คือคีย์หลัก, `@relation` คือความสัมพันธ์, `@@unique` ป้องกันค่าซ้ำเป็นชุด และ `@@index` ช่วยค้นหาโดยไม่ได้ห้ามค่าซ้ำเสมอ ตัวอย่าง `TeamPlayer` มี unique ของ **ทีม + ชื่อ + นามสกุล + วันเกิด** จึงไม่ใช่ทะเบียนบุคคลกลางที่ห้ามชื่อเดียวกันอยู่คนละทีม

## แนวตอบอาจารย์พร้อมจุดเปิดหลักฐาน

ใช้รูปประโยค “รับอะไร → ตรวจอะไร → เปลี่ยน/คืนอะไร → ถ้าไม่ผ่านเกิดอะไร” แล้วเปิดฟังก์ชันประกอบ ไม่จำเป็นต้องท่องชื่อไฟล์ทั้งหมด

**1. ทำไมแบ่งหลายชั้น ทั้งที่เขียนรวมในหน้าเดียวได้?** หน้าและ component จัดการการแสดงผล, handler ตรวจรูปแบบ HTTP, use case ประสานขั้นตอน, domain เก็บกฎ และ repository เชื่อมฐานข้อมูล ตัวอย่าง `generateBracketDraft` เรียกตัวคำนวณสายซึ่งคืนแผนก่อน repository บันทึก ทำให้ทดสอบการจับคู่โดยไม่ต้องเปิดเว็บได้ เหตุผลนี้เป็นการอธิบายประโยชน์จากโครงสร้างที่มี ไม่ได้แปลว่าทุกไฟล์ทำตามขอบเขตสมบูรณ์แล้ว

**2. ซ่อนปุ่มแอดมินพอไหม?** ต้องตรวจบน server ด้วย เพราะส่ง HTTP ตรงได้ ดู `authorize` และ `listAdminTeams` ซึ่งตรวจบทบาทก่อนเรียก repository; ถ้ามีสิทธิ์จัดรายการก็ยังต้องเป็นเจ้าของรายการนั้น เว้นแต่เป็นแอดมินตามเงื่อนไขของ use case

**3. transaction กับ version ต่างกันอย่างไร?** transaction ทำให้งานเขียนหลายส่วนสำเร็จ/ย้อนกลับร่วมกัน เช่น ยืนยันผลกับเลื่อนทีม ส่วน version ตรวจว่าคำขอยังอ้างข้อมูลรุ่นล่าสุด ถ้าคนสองคนเปิด version เดียวกันและคนแรกบันทึกแล้ว คำขอของอีกคนต้องไม่ทับข้อมูลใหม่อย่างเงียบ ๆ ดู `confirmResultAndAdvance` และ `expectedVersion` ไม่ควรอ้างว่า transaction เพียงอย่างเดียวแก้ปัญหาคำขอชนกันได้ทุกแบบ

**4. ล็อกทีมแล้วล็อกผู้เล่นย้อนหลังด้วยไหม?** ตอนจัดสายตรึงทีมและชื่อทีม แต่รายชื่อที่ผู้จัดเปิดจากใบสมัครยังอ่านผู้เล่น active ปัจจุบัน ดู `listByTournament` จึงไม่ใช่หลักฐานรายชื่อในอดีต หากต้องการ roster snapshot ณ วันสมัครต้องพัฒนาเพิ่ม

**5. ผู้เล่นเดิมคือบัญชีคนเดิมหรือไม่?** เป็นการรวมประวัติด้วยชื่อ นามสกุล วันเกิด แล้วใช้ข้อมูลล่าสุดมาเติมฟอร์ม ไม่ใช่ยืนยันตัวตนด้วยรหัสบุคคลกลาง ชื่อเหมือนและวันเกิดตรงกันอาจถูกจัดกลุ่มเดียวกันได้ เลือกไปทีมใหม่จะสร้างรายการของทีมใหม่ ส่วนการนำคนเดิมกลับทีมเดิมอาจเปิดใช้รายการเก่าที่ inactive

**6. ชื่อทีมซ้ำได้ไหม?** ตอนสร้าง/แก้ทีมตรวจชื่อที่ใช้งานในบัญชีเดียวกัน และตอนสมัครตรวจชื่อทีมอื่นในรายการเดียวกันที่ยัง `PENDING`/`APPROVED` โดยเทียบหลังตัดช่องว่างหัวท้ายและไม่แยกตัวพิมพ์ ไม่ใช่กฎห้ามชื่อซ้ำทั่วระบบ ดู `createTeam`, `applyToTournament` และ `hasActiveNameConflict` ใน repository ของแต่ละ feature

**7. อายุ U18 คิดจากวันไหน?** [assertRosterAgeEligibility](../features/registrations/domain/player-age-policy.ts#L45) ใช้อายุเต็มปี ณ วันเริ่มรายการ โดยแปลงวันเริ่มเป็นวันที่ตามเขตเวลา `Asia/Bangkok`; U18 ต้องต่ำกว่า 18 ปี ส่วน Open ข้ามการตรวจอายุ ตัวอย่างวันเริ่มแข่งเป็นวันเกิดครบ 18 ปีพอดีจะไม่ผ่าน U18

**8. ทำไมมีสายแล้วบางช่องยังไม่มีทีม?** ช่องรอบถัดไปอ้างผู้ชนะจากคู่ก่อนหน้า จึงยังไม่รู้ชื่อทีมจนยืนยันผล `buildBracketPlan` เชื่อมปลายทางไว้ และ `getStartIssues` ตรวจว่าช่องว่างมีต้นทางที่ถูกต้อง ส่วนสายระบบ 8 ทีมจะมี 7 คู่รวมทุกกลุ่มรอบ

**9. สุ่มแล้วทำไมกดสร้างอีกครั้งได้ผลเดิม?** ระบบเก็บลำดับจับสลากและ token เพื่อรักษาผลเดิม การกดสุ่มใหม่จึงสร้าง token ใหม่ ไม่รับประกันว่าลำดับใหม่ต้องต่างทุกครั้ง และไม่มีการจัดอันดับฝีมือจากข้อมูลทีม

**10. บันทึกร่างกับยืนยันผลต่างกันอย่างไร?** ร่างเก็บคะแนนและยอมให้เสมอได้ ยืนยันต้องมีผู้ชนะแล้วจึงเลื่อนทีมในโหมดระบบ หากแอดมินแก้ผู้ชนะภายหลังต้องมีเหตุผล และไม่เปลี่ยนทีมของคู่ถัดไปที่เริ่มบันทึกคะแนน/แข่งขันแล้วตามกฎ `correctMatchResult`

**11. ระบบตรวจเวลาชนกันได้ละเอียดแค่ไหน?** กฎปัจจุบันตรวจสนามเดียวกันและวันเวลาเริ่มตรงกันของคู่อื่นที่ยังไม่จบภายในรายการเดียวกัน และปฏิเสธสำหรับ 5v5; 3v3 อนุญาต ไม่ได้คำนวณเวลาจบหรือช่วงเวลาทับซ้อนทุกนาที และไม่ได้ตรวจสนามข้ามทุกรายการ เปิด [query ค้นหาคู่ชน:951](../features/competition/infrastructure/prisma-competition-repository.ts#L951) คู่กับ [if ที่ใช้เฉพาะ 5x5:69](../features/competition/application/schedule-match.ts#L69) ตามคำอธิบายและตัวอย่างในหัวข้อ 4A

**12. ลบทีมแล้วประวัติหายหมดไหม?** [removeOrDeactivateTeam](../features/team-management/application/remove-or-deactivate-team.ts#L27) ตรวจ version และชื่อยืนยันก่อน ถ้ามีใบสมัครรอพิจารณา/อนุมัติจะห้ามนำออก ถ้ามีประวัติที่ต้องรักษาจะปิดใช้งาน ถ้าไม่มีประวัติใบสมัครและสมาชิก legacy จึงลบจริง ผลต่อข้อมูลอ้างอิงต้องดู relation ใน schema เพิ่มด้วย

**13. ทดสอบผ่านแปลว่า production พร้อมทั้งหมดไหม?** ต้องบอกชนิดหลักฐาน: unit test ตรวจฟังก์ชัน, repository/handler/UI test ตรวจขอบเขตนั้น, typecheck ตรวจชนิดข้อมูล, build ตรวจการประกอบเว็บ ส่วน login, สิทธิ์บัญชีจริง, Storage และฐานข้อมูลจริงต้องทดสอบในสภาพแวดล้อมนั้นด้วย รายงานรอบก่อนอยู่ที่ [VERIFICATION-AND-PUBLISH.md](VERIFICATION-AND-PUBLISH.md) ไม่ใช่ผลทดสอบใหม่ของวันนี้

## ถ้าอาจารย์สั่งแก้ เพิ่ม หรือลบโค้ดต่อหน้า

เริ่มด้วยบอกผลที่ต้องการให้ชัด เช่น “เปลี่ยนชื่ออย่างเดียว” หรือ “เปลี่ยนจำนวนผู้เล่นสูงสุด” จากนั้นเปิดฟังก์ชันต้นทางและค้นผู้เรียกก่อนแก้ ตรวจ `git status` เพื่อรู้ว่ามีงานอื่นค้างอยู่ และดู diff หลังแก้เพื่ออธิบายขอบเขตได้

| โจทย์ซ้อม | เริ่มที่ไหน | ต้องตรวจอะไรต่อ |
| --- | --- | --- |
| เปลี่ยนชื่อตัวแปร `maximumPlayerCount` | component ที่ประกาศตัวแปร ใช้ Rename Symbol | ผู้ใช้อ้างอิงใน scope และชนิดข้อมูล; ถ้าเป็นชื่อ field ใน JSON/ฐานข้อมูลต้องตามสัญญาข้ามชั้นด้วย |
| สมมติปรับเพดานผู้เล่น 3v3 จาก 4 เป็น 5 | `getMaximumTeamPlayerCount` ในตารางข้อ 1 | ตรวจผู้เรียกฝั่ง UI/server ข้อความแจ้งเตือน และเทสต์ 4/5/6 คน รวมกรณีมีผู้เล่นอยู่ก่อนแล้ว; อย่าสับสนเพดานกับขั้นต่ำสมัคร 3 คน |
| เพิ่มช่องข้อมูลผู้เล่นที่ต้องเก็บจริง | `TeamPlayerDraft` และฟอร์ม → schema ใน handler → use case/repository | ตรวจว่าเป็นช่องบังคับไหม ข้อมูลเก่าจะมีค่าอะไร ต้องเพิ่ม Prisma migration หรือไม่ และต้องเปิดเผยให้บทบาทใดบ้าง |
| เอาช่องข้อมูลออกจากหน้าจอ | component และ mapping ที่ส่ง props | ซ่อนช่องกับลบคอลัมน์ฐานข้อมูลเป็นคนละขอบเขต ต้องตรวจ API/ผู้เรียก/ข้อมูลเก่าก่อนตัดสินใจลบจริง |
| เปลี่ยนกฎจับคู่หรือสุ่ม | `generateBracketDraft` และตัวสร้างแบบ ordered | ตรวจจำนวนคู่ n−1 ทีมไม่ซ้ำ/ไม่หาย ทางไปคู่ถัดไป และข้อห้ามสร้างใหม่เมื่อเผยแพร่/จัดตาราง/เริ่มแข่ง |

ขั้นตอนซ้อม: อธิบายพฤติกรรมเดิม → ระบุผลใหม่ → หา test ที่อธิบายกฎเดิม → เพิ่ม/ปรับกรณีให้ตรงข้อกำหนดใหม่ → แก้จุดต้นทาง → ตรวจกรณีปกติและขอบเขต → สรุป diff กับผลตรวจ การเปลี่ยนชื่อตัวแปรอย่างเดียวไม่จำเป็นต้องสร้างเทสต์ใหม่ที่ไม่มีพฤติกรรมให้ตรวจ

## ใช้ชุดทดสอบเป็นหลักฐานตอนตอบ

| เรื่องที่ถูกถาม | เปิดเทสต์ | ตัวอย่างที่อธิบายได้ |
| --- | --- | --- |
| จำนวนและคนซ้ำในทีม | [team-policy.test.ts](../tests/features/team-management/team-policy.test.ts) | ต่ำกว่าขั้นต่ำ, เกินเพดาน, ผู้เล่น inactive และข้อมูลซ้ำ |
| การอ่านทีมของแอดมิน | [admin-team-read.test.ts](../tests/features/team-management/admin-team-read.test.ts) | ตรวจสิทธิ์ก่อนอ่าน และกรณีไม่พบทีม |
| ผู้จัดดูรายชื่อทีม | [registration-review-list.test.tsx](../tests/ui/organizer/registration-review-list.test.tsx) | แสดงผู้จัดการ/ผู้เล่นตามข้อมูลที่หน้าได้รับ |
| อายุผู้เล่น | [player-age-policy.test.ts](../tests/features/registrations/player-age-policy.test.ts) | วันเกิดและขอบเขตอายุของรุ่น |
| การจับคู่ | [bracket-generator.test.ts](../tests/features/competition/bracket-generator.test.ts) | คู่ตำแหน่งติดกันและจำนวนคู่รวม; แยกเทสต์ ordered จาก seed เดิม |
| สุ่ม/ตาราง/ผล | [competition-use-cases.test.ts](../tests/features/competition/competition-use-cases.test.ts) | คงผลสุ่มเดิม, 3v3 ใช้สนาม/เวลาเดียวกัน, ร่างเสมอได้, ยืนยันแล้วเลื่อนผู้ชนะ |
| เริ่ม/จบรายการ | [tournament-competition-policy.test.ts](../tests/features/competition/tournament-competition-policy.test.ts) | สายไม่พร้อม ผลไม่ครบ หรือช่องผู้ชนะในอนาคตมีต้นทาง |
| เอกสารให้แอดมินเปิด | [get-admin-review-media.test.ts](../tests/features/tournament-media/get-admin-review-media.test.ts) | ตรวจสิทธิ์และเอกสารก่อนออก URL |

คำสั่งตรวจเมื่อแก้โค้ดจริง ใช้ตามความเกี่ยวข้องและข้อกำหนดโปรเจกต์:

```powershell
# ตัวอย่างตรวจเรื่องจำนวนผู้เล่นแบบเจาะจง
npm run test -- tests/features/team-management/team-policy.test.ts
# ตรวจชนิดข้อมูล พฤติกรรมรวม รูปแบบโค้ด และการ build แยกกัน
npm run typecheck
npm run test
npm run lint
npm run build
git diff --check
git status --short
```

การมีชื่อเทสต์ในตารางหมายถึงมีกรณีให้เปิดศึกษา ไม่ได้หมายความว่ารันผ่านในรอบนี้ หากแก้เฉพาะเอกสารให้ตรวจลิงก์ เลขบรรทัด และข้อความกับ source; อย่านำผลตรวจเอกสารไปอ้างเป็นผลทดสอบแอป

## ตอบคำถามจัดสายแบบสั้น

ระบบปัจจุบันรองรับ **8, 16 หรือ 32 ทีม** สำหรับสายที่สร้างในระบบ ผู้จัดล็อกรายชื่อทีมที่อนุมัติแล้ว จากนั้นเลือกเรียงตำแหน่งเอง หรือให้ระบบสุ่มตำแหน่ง การสร้างคู่รอบแรกใช้ทีมตำแหน่ง 1 พบ 2, 3 พบ 4 และเรียงต่อไป; รอบถัดไปเชื่อมจากผู้ชนะของคู่ก่อนหน้า ไม่คำนวณ Seed หรือจัดอันดับทีม การกดสุ่มใหม่เป็นการขอตำแหน่งชุดใหม่ก่อนเผยแพร่ เมื่อเผยแพร่แล้วจึงแสดงหน้าเว็บสาธารณะ อีกทางหนึ่งคือใช้ไฟล์สาย PDF/รูปภาพจากภายนอก ซึ่งไม่เลื่อนผู้ชนะในไฟล์อัตโนมัติ

ถ้าอาจารย์ชี้โค้ด ให้ตอบตามลำดับ: **ไฟล์นี้เป็นชั้นไหน → รับอะไร → ตรวจอะไร → ส่งต่อหรือแสดงอะไร** และแยกให้ชัดว่าฟอร์มช่วยตรวจเบื้องต้น แต่การตรวจสิทธิ์และกฎจริงอยู่ฝั่ง server
