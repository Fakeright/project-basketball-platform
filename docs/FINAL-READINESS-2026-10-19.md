# COURTSIDE: แผนความพร้อมสำหรับสอบไฟนอล 19 ตุลาคม 2026

ตรวจเมื่อ 9 ตุลาคม 2026 จาก branch `feat/courtside-public-platform`, commit `ea9eaf0b`

เอกสารนี้เป็นผลตรวจและข้อเสนอการส่งมอบ ยังไม่ใช่คำรับรองว่าใช้งาน production ได้แล้ว ผู้ใช้ยืนยันใช้ฟรีทั้งหมดและนำเสนอ 20-25 นาที คง Next.js 16, React, TypeScript, Tailwind, Prisma และ Supabase ตามเดิม

## ผลทดสอบเพิ่มเติม 10 ตุลาคม 2026

- แก้การแสดงสถานะสาธารณะของรายการ `PUBLISHED` ที่เลยวันปิดรับสมัครให้เป็น `ปิดรับสมัคร` โดยไม่เปลี่ยน lifecycle ในฐานข้อมูล หน้า Home จึงไม่ดึงรายการหมดเขตมาแสดงเป็นรายการที่ยังเปิดอยู่ ขอบเขตวันปิดรับสมัครยังรวมเวลาตรง deadline และการสมัครบน server ยังคงตรวจ deadline เอง
- กรณี A ใช้รายการ QA ใหม่แยกจากข้อมูลเดิม: Organizer สร้าง/ส่งตรวจ, Admin อนุมัติ, Organizer เผยแพร่, Manager สมัครครบ 6 ทีม, Organizer อนุมัติ/ปิดรับ/ล็อกรายชื่อ/สุ่มสาย/เผยแพร่/จัดตาราง/เริ่มแข่ง/ยืนยันผลทั้ง 5 คู่/จบรายการ หน้า `/bracket`, `/schedule` และ `/results` แสดง Bye 2 ทีม, ตารางคะแนน และแชมป์/รองแชมป์ถูกต้อง (`tournament-9966c96b-11de-4853-8d66-8ab28cfe39ad`)
- ระหว่างกรณี A พบ `P2002` เมื่อสลับ seed ในสายที่ล็อกแล้ว จึงเพิ่มเทสจำลอง unique constraint และแก้การอัปเดต seed เป็นสองช่วงใน transaction เดิม ก่อนทดสอบ API กับ PostgreSQL จริงจนสร้างสายสำเร็จ
- กรณี B ใช้ `QA External Bracket Cup` ที่มี PDF revision 2 เผยแพร่แล้ว: ตรวจ signed download ตอบ 200 และเป็น PDF, เพิ่มคู่ทั่วไป/อันดับ 3/ชิงชนะเลิศจากทีมที่ล็อกไว้, เริ่มแข่ง, บันทึกคะแนนร่าง, ยืนยันผล, Admin แก้คะแนนพร้อมเหตุผล และจบรายการ หน้า `/results?tournament=qa-external-bracket` แสดงแชมป์ รองแชมป์ และอันดับ 3 ถูกต้อง
- Negative cases ที่ทดสอบจริง: Team Manager ตัดสินใบสมัครหรือล็อกสายของ Organizer ไม่ได้, Organizer แก้ผลที่ยืนยันแล้วแทน Admin ไม่ได้, ทีมเหย้า/เยือนซ้ำและคะแนนเสมอถูกปฏิเสธ, ยืนยันผลก่อนเริ่มรายการถูกปฏิเสธ ยังไม่ใช่การครอบคลุม negative cases ทั้งรายการด้านล่าง
- หน้าผลบนมือถือ 375px อ่านได้ และหน้าผลไม่มี horizontal page overflow ที่ 375/768/1440px ตัวอย่าง PDF ใน in-app browser แสดงพื้นที่มืดแม้ signed file ดาวน์โหลดได้ 200; ต้องตรวจ preview และการเปิดไฟล์ในเบราว์เซอร์/มือถือจริงก่อนสอบ
- ตรวจหลังแก้: Vitest 157 files, 1,118/1,118 tests ผ่าน; lint และ production build ผ่าน การทดสอบยังใช้ local development actors ไม่ใช่บัญชี Supabase จริง ไม่มี deployment HTTPS จึงยังไม่ถือว่าพร้อมใช้งานออนไลน์

ขั้นถัดไปที่มีผลต่อวันสอบสูงสุดคือ deployment ฟรีครั้งแรกและทดสอบบัญชีจริง/Storage จากลิงก์สาธารณะ ไม่เพิ่ม analytics, logo หรือระบบอีเมลก่อนปิดงานนี้

## เป้าหมายและขอบเขต

ให้ผู้ใช้จริงเข้าเว็บ HTTPS จากเครื่องอื่นได้ สมัคร/เข้าสู่ระบบ ใช้งานตามสิทธิ์ และเดินการแข่งขันตั้งแต่สร้างรายการจนประกาศผลได้ครบ พร้อมข้อมูลสาธิตที่ตรวจสอบได้และแผนสำรองวันสอบ

แนวทางที่เลือกเสนอคือทำระบบหลักให้ครบวงจรและทดสอบออนไลน์เร็ว การทำฟีเจอร์ทั้งหมดในรายการเดิมภายในสิบวันเสี่ยงต่อความเสถียร ส่วนการใช้เพียงข้อมูลเดโมที่ข้ามขั้นตอนก็ไม่เพียงพอสำหรับเป้าหมายใช้งานจริง

ช่วงนี้เป็นงานความพร้อมข้ามหลายส่วนของระบบ แบ่งเป็นแพ็กเกจเล็กตามลำดับด้านล่าง ไม่เขียนใหม่ทั้งระบบ ไม่เพิ่ม framework หรือบริการเสียเงิน

## หลักฐานจากการตรวจรอบนี้

| รายการ | ผลตรวจ |
| --- | --- |
| Git | Worktree หลักของแอปยังอยู่ที่ `ea9eaf0b`; ahead remote tracking branch 16 commits ณ เวลาตรวจ ยังไม่ได้ fetch ยืนยัน remote ใหม่ |
| Worktree | ไม่มี tracked source เปลี่ยนก่อนตรวจ; มี local tooling untracked เดิม; checkout `master` มีงานค้างแยกต่างหาก ต้องตรวจ diff ก่อน merge |
| Environment | ตัวแปรจำเป็นทั้ง 6 ตัวมีค่า ตรวจเฉพาะการมีอยู่ ไม่พิมพ์ค่าลับ |
| PostgreSQL | เชื่อมต่อและอ่านได้; Prisma รายงาน 12 migrations และ schema up to date |
| Auth | Settings endpoint ตอบ 200; email login เปิด; signup เปิด; `mailer_autoconfirm=true` |
| บัญชีจริง | มี Supabase-linked Admin 1, Organizer 1, Manager/Coach 2, Player 2; ตรวจเพียงจำนวน ยังไม่ได้ทดสอบรหัสผ่านหรือเดิน flow ของบัญชีเหล่านี้ |
| Storage | มี posters แบบ public, documents และ brackets แบบ private; ยังไม่ได้ทดสอบ upload/download จริงรอบนี้ |
| Database access | 19 ตารางใน public ไม่เปิด RLS; ไม่พบ direct table grants ให้ anon/authenticated จาก query ที่ใช้; anonymous request ไป User ถูกปฏิเสธ 401 ยังไม่ใช่การพิสูจน์สิทธิ์ทุกตารางหรือทุก role |
| Build / lint | ผ่านทั้งสองคำสั่ง; ยังมีคำเตือน multiple lockfiles |
| Tests รอบแรก | 1,099/1,100 ผ่าน; team-delete-dialog timeout 5 วินาทีขณะรันพร้อม build/lint |
| Tests แยกเคส | team-delete-dialog ผ่าน 2/2 |
| Tests ทั้งชุดรอบยืนยัน | ลดการรันพร้อมกันด้วย --maxWorkers=2: ผ่าน 156 files, 1,100/1,100 tests ใน 191.14 วินาที; timeout รอบแรกยังเป็นความเสี่ยงด้านเสถียรภาพของชุดทดสอบ ไม่ใช่หลักฐานว่าบั๊ก workflow ไม่มีอยู่ |
| หลังแก้ lifecycle | เทสทั้งชุดผ่าน 156 files, 1,112/1,112; lint และ production build ผ่าน; `git diff --check` ผ่าน; หน้า Home ในเครื่องตอบ HTTP 200 แต่ยังไม่ได้ทดสอบ flow ผ่าน browser/บัญชีจริง |
| TypeScript แยกจาก build | `npx tsc --noEmit` ยังรายงาน type errors ใน test fixtures หลายชุดที่ไม่อยู่ใน production build; ต้องจัดการก่อนเพิ่ม typecheck ทั้งโครงการเป็น CI gate |
| Dependency audit | npm audit --omit=dev รายงาน 28 package findings: critical 2, high 22, moderate 4; ต้องแยก runtime exposure กับเครื่องมือ CLI และ dependency ซ้อน |
| Release foundation หลังอัปเดต | Next.js 16.4.0, Prisma 7.10.0, sharp 0.35.5; audit ลดเหลือ high 4, critical 0; install ใหม่ในโฟลเดอร์ชั่วคราวพร้อม Prisma generate, tests 1,112/1,112, lint และ build ผ่านด้วยค่า CI ที่ไม่ใช่คีย์จริง |
| CI | เพิ่ม workflow ใช้ Node 24 และ PostgreSQL ชั่วคราวสำหรับ migrate deploy, tests, lint, build และ audit ระดับ critical; ยังไม่ได้รันบน GitHub และเครื่องนี้ไม่มี Docker สำหรับจำลอง service |
| Browser / online | เปิดหน้า Home และ Tournament List ด้วยเบราว์เซอร์จริงหลังอัปเดต dependency แล้ว ไม่พบ console error ในสองหน้านี้ แต่ยังไม่ได้เดิน workflow ที่เขียนข้อมูลหรือทดสอบ deployment |

หน้า Home และ Tournament List ยังแสดงรายการที่แข่งไปแล้วในเดือนสิงหาคม/กันยายน 2026 เป็น `เปิดรับสมัคร` ณ วันที่ 9 ตุลาคม ต้องตรวจว่าเป็นเพียงข้อมูลทดลองที่ไม่อัปเดต lifecycle หรือกติกาการรับสมัครยังยอมให้สมัครหลัง deadline ได้ และปิดความคลาดเคลื่อนก่อนใช้ข้อมูลจริงในการสอบ

## ปัญหาที่ต้องปิดก่อนส่งมอบ

### P0: สายอัตโนมัติเริ่มแข่งไม่ได้ (แก้และทดสอบแล้ว 10 ตุลาคม)

ใช้ `generateSingleEliminationBracket` สร้าง 6, 8, 16 และ 32 ทีม แล้วส่งผลจริงเข้า `getStartIssues` ได้ `PLACEMENT_TEAMS_INCOMPLETE` ทุกกรณี คู่ชิงยังไม่มีทีมเป็นเรื่องปกติของสายอัตโนมัติ แต่ policy บังคับให้ทีมครบตั้งแต่ก่อนเริ่ม ในขณะเดียวกัน `match-result-access.ts` ไม่อนุญาตยืนยันผลก่อน IN_PROGRESS จึงเดินต่อไม่ได้

ความคืบหน้า 9 ตุลาคม: ปรับ policy ให้รับช่องที่รอผลจากคู่ต้นทางที่เชื่อมถูกต้อง พร้อมส่ง mode, รอบ และปลายทางคู่แข่งขันจาก Prisma ไปถึงหน้า Organizer และคำสั่งเปลี่ยนสถานะ เทสใหม่ครอบคลุม 2/6/8/16/32 ทีม, Bye, สายเสียโครงสร้าง และโหมดไฟล์ภายนอก วันที่ 10 ตุลาคมทดสอบรายการใหม่ 6 ทีมผ่าน API กับ PostgreSQL จริงจนจบและตรวจหน้าสาธารณะหลังโหลดสำเร็จแล้ว รวมทั้งแก้ unique seed ที่พบระหว่างสุ่มสาย

ตำแหน่งหลัก: `features/competition/domain/tournament-competition-policy.ts`, `features/competition/domain/bracket-generator.ts`, `features/competition/application/match-result-access.ts`

แนวทางที่ใช้: แยก readiness สำหรับเริ่มออกจากจบการแข่งขัน และแยกโหมดสายอัตโนมัติ/ไฟล์ภายนอก สำหรับสายอัตโนมัติอนุญาตช่องทีมที่รอผู้ชนะเมื่อมี source match ที่ถูกต้องและมีคู่เปิดสนามพร้อมเล่น ยังคงบล็อกโครงสร้างเสีย ทีมที่ไม่อยู่ในรายการ และผลไม่ครบเมื่อจบ

### P0: Dependency และข้อมูลลับก่อนเปิดออนไลน์

Audit พบ Next.js เป็น direct dependency ระดับ critical และ sharp ระดับ high พร้อมรายการจาก dependency ซ้อน การพบ advisory ไม่ได้หมายความว่าทุกช่องโหว่ถูกใช้โจมตีแอปนี้ได้ ต้องตรวจ advisory เทียบเส้นทางที่ใช้งานและอัปเดตเวอร์ชันที่แก้แล้วในตระกูลเดิม แยก shadcn CLI ออกจาก runtime เมื่อเหมาะสม ห้ามใช้ `npm audit fix --force` แล้วปล่อยให้ downgrade/major change โดยไม่ตรวจ

ความคืบหน้า 9 ตุลาคม: อัปเดต Next.js, sharp, Prisma และย้าย shadcn CLI ไป devDependency แล้ว ล็อกแพ็กเกจย่อย fast-uri, nanoid และ source-map-js ที่มีรุ่นแก้แล้ว audit หลังติดตั้งใหม่ไม่พบ critical เหลือ 4 high จาก Prisma CLI/@prisma/config/deepmerge-ts/mysql2 โดยแอปใช้ PostgreSQL ไม่เรียก MySQL driver การอัปเดต Prisma เป็น 7.10.0 ยังไม่แก้ advisory เหล่านี้ จึงต้องติดตามรุ่นแก้ก่อนประกาศว่า dependency ปลอดช่องโหว่ครบ ระบบ CI ตั้ง audit ให้บล็อก critical และยังแสดงรายการ high ทุกครั้ง

ก่อนตั้งค่า hosting ให้หมุนเวียน database password และ service-role credential ที่เคยถูกเผยแพร่ในบทสนทนา ตรวจสิทธิ์ Data API/Storage ด้วยบัญชี anonymous และ authenticated ที่ไม่ใช่เจ้าของ เก็บ defense-in-depth ที่จำเป็นเป็น migration/config ที่ทำซ้ำได้ ไม่อ้างว่าการมี RLS เพียงอย่างเดียวทดแทน server authorization

### P0: Upload ต้องเข้ากับ hosting

ปัจจุบัน Route Handler รับ multipart และอ่านทั้งไฟล์ ขณะที่ PDF/รูปมีเพดานเกิน 4.5MB หากใช้ Vercel Function จะรับไฟล์ใหญ่ตามที่หน้า UI สัญญาไม่ได้

ทางส่งมอบเร็วที่แนะนำ: จำกัดไฟล์ไม่เกิน 4MB ให้ตรงกันทั้ง UI, server และเอกสาร พร้อมข้อความชัดเจน และทดสอบไฟล์ใกล้เพดานบน hosting จริง ถ้าต้องคง 20MB ให้ทำ signed upload ไป private staging ใน Supabase ตรวจสิทธิ์ ขนาด ชนิด และเนื้อหาอีกครั้งก่อน attach/publish พร้อม cleanup ไฟล์ค้าง งานนี้มีขอบเขตมากกว่าและควรเลือกหลังยืนยันว่า 4MB ไม่พอสำหรับไฟล์สอบ

### P0: บัญชีจริงและบริการอีเมล

ใช้ Supabase Auth จริงทุกบทบาทหลักบนลิงก์สอบ บัญชี seed ที่มีแค่ Prisma user ไม่ใช่บัญชีที่ล็อกอินได้ ห้ามใช้ development actor switcher เป็นหลักฐาน production readiness

Email verification ยังพักได้ตามขอบเขตเดิม แต่ password recovery ต้องระบุให้ชัดว่าส่งอีเมลได้จริงหรือยัง ตรวจ SMTP, Site URL และ redirect allowlist บนโดเมนจริง Supabase default SMTP จำกัดผู้รับในทีมและมีข้อจำกัดการส่ง จึงใช้พิสูจน์ recovery สำหรับบุคคลทั่วไปไม่ได้โดยอัตโนมัติ บริการ SMTP ฟรีและตัวตนผู้ส่งที่อนุญาตต้องตรวจได้ก่อนรับปากว่าเสร็จ โดยไม่บังคับซื้อโดเมน

## ลำดับงานที่เสนอ

| ชุดงาน | สิ่งที่จะทำ | เกณฑ์ผ่าน |
| --- | --- | --- |
| 1. Workflow ที่ติดขัด | แก้ lifecycle อัตโนมัติ; ตรวจ Bye, capacity, deadline, age cutoff, การแก้ผลและการจบรายการ | สร้างรายการใหม่ 6 และ 8 ทีมจนได้แชมป์ผ่าน UI/API จริง; ขอบเขต 2-32 ทีมผ่าน domain tests; ไม่มีการแก้ DB ข้ามสถานะ |
| 2. Release foundation | อัปเดตแพ็กเกจที่มี advisory; clean install; Prisma generate/build/migrate deploy; CI; ตรวจ secrets และ origin/permission boundaries | build จาก checkout ใหม่ได้; CI ผ่าน; ไม่มี critical/high runtime risk ที่ยังไม่ตัดสินใจ; dev session ใช้ไม่ได้บน production |
| 3. บัญชีและ deployment แรก | ตั้ง HTTPS, APP_URL, redirect, pooler, storage และขนาดไฟล์; ทดสอบบัญชีจริงสามบทบาทและผู้เยี่ยมชม | ผู้ทดสอบเปิดลิงก์จากมือถือ/อีกเครื่องได้; login/logout/session-expired ทำงาน; upload/download และไฟล์ private ผ่าน |
| 4. ความครบของ UX | Profile แก้ชื่อ/ข้อมูลติดต่อขั้นต่ำ; แสดงบทบาทแต่แก้สิทธิ์เองไม่ได้; ข้อความไทย; error recovery; วันที่/เวลาไทย; navigation และ empty state | ผู้ใช้เดิน flow โดยไม่ต้องอธิบายทางลัด; ข้อมูลที่ถูกจำกัดไม่รั่ว; layout 375/768/1440 ไม่มีส่วนทับกัน |
| 5. เพิ่มเฉพาะที่คุ้ม | Team logo; Dashboard กราฟ 2 แบบจากข้อมูลจริง; สถานะผลสมัคร/ลิงก์ตารางชัดเจน | ทำหลัง P0 ผ่านและมีเวลา; ไม่เพิ่ม visitor tracking หรือระบบอีเมลทุกเหตุการณ์เพื่อให้หน้าดูเต็ม |
| 6. Final acceptance | ซ้อมสองกรณี, สรุป test evidence, ERD/architecture/role matrix, backup/rollback และคู่มือเดโม | มี release candidate ที่ freeze แล้ว; คนอื่นทดสอบตามคู่มือได้; มีแผนสำรองที่ตรวจใช้ได้ |

## การทดสอบรับมอบที่ต้องทำจริง

- กรณี A: Organizer สร้าง -> Admin อนุมัติ -> เผยแพร่ -> Manager สร้างทีมและสมัคร -> อนุมัติ -> ปิดรับ -> สายอัตโนมัติ 6 ทีมพร้อม Bye -> เริ่ม -> ใส่ผลและเลื่อนทีม -> จบ -> ผู้เยี่ยมชมเห็น Winner/Runner-up
- กรณี B: ใช้ไฟล์สายภายนอก -> upload -> publish -> สร้างคู่ manual -> กำหนด Final/อันดับ 3 -> ตาราง/ผล -> แก้ผลแบบมีเหตุผล -> จบ -> ดูผลและไฟล์สาธารณะ
- Negative cases: เข้าถึงทีมคนอื่น, organizer คนอื่น, role escalation, stale version, กดส่งซ้ำ, จำนวนเต็ม, หมดรับสมัคร, อายุ/format ไม่ผ่าน, คะแนนเสมอหรือผิดรูปแบบ, เปลี่ยนผู้ชนะหลังรอบต่อไปเริ่ม, ไฟล์ใหญ่/ปลอมชนิด, session หมดอายุ
- ใช้รายการทดลองที่แยกชัดเจนสำหรับการทดสอบที่เขียนข้อมูล ไม่ reset ฐานเดิมทั้งก้อน
- หน้าสาธารณะตรวจแบบไม่ล็อกอินจริง รวมรายการที่ถูกระงับ/นำออกและ private file URLs
- browser E2E ต้องตรวจเนื้อหาหลังโหลดสำเร็จ; ไม่ถือว่ามี h1 หรือ HTTP 200 เพียงอย่างเดียวคือผ่าน
- ซ้อมพูดจริง 20-25 นาทีพร้อมผู้ใช้ การตั้งเวลารออัตโนมัติหรือเปิด checkpoint อย่างเดียวไม่ใช่หลักฐานการซ้อมนำเสนอ

## แผนวันที่ 9-19 ตุลาคม 2026

| วันที่ | เป้าหมาย |
| --- | --- |
| 9 ต.ค. | ตรวจระบบและล็อกขอบเขต พร้อมลำดับ P0 และบัญชีสำหรับทดสอบ |
| 10 ต.ค. | แก้ auto bracket lifecycle และทดสอบจากต้นจนจบ |
| 11 ต.ค. | Dependency/security และ clean-build pipeline |
| 12 ต.ค. | Upload/host config และให้มีลิงก์ deployment แรก |
| 13 ต.ค. | บัญชีจริง, callback, recovery, permission/ownership บนลิงก์จริง |
| 14 ต.ค. | Profile/UX ที่จำเป็น; ตรวจข้อมูลผู้เล่น/ไฟล์/วันที่ |
| 15 ต.ค. | เพิ่ม logo/กราฟเฉพาะที่ไม่ทำให้ P0 ล่าช้า; ทดสอบกับผู้ใช้ |
| 16 ต.ค. | Full browser acceptance ทั้งสองโหมด; freeze feature |
| 17 ต.ค. | แก้เฉพาะบั๊ก เตรียม ERD/role matrix/คู่มือ/ภาพหลักฐาน |
| 18 ต.ค. | ซ้อมกับผู้ใช้จริง สำรองข้อมูล ตรวจ restore/rollback และลิงก์บนเครือข่ายอื่น |
| 19 ต.ค. | ตรวจความพร้อมก่อนสอบ ไม่เปลี่ยน schema/ฟีเจอร์ใหญ่ |

ตารางนี้เป็นแผนเป้าหมาย ไม่ใช่การตั้ง automation หรือการรับประกันระยะเวลา หาก P0 ยังไม่ผ่าน ให้ตัด logo/กราฟก่อน และรักษาวันสำหรับทดสอบ/ซ้อม

## Hosting ฟรีและการปฏิบัติการ

เสนอ Vercel Hobby สำหรับเว็บโครงงานส่วนบุคคลที่ไม่ใช่เชิงพาณิชย์ ใช้โดเมนที่บริการให้ ร่วมกับ Supabase Free เดิม ต้องแก้ root directory/branch ให้ใช้แอปจริงใน worktree เพราะ checkout master ยังไม่ใช่ source ล่าสุดสำหรับ deploy

CI ใช้ npm ci, prisma generate, test, lint และ build ตาม env ที่แยกจากข้อมูลจริง; migration ใช้ migrate deploy ในขั้นปล่อยรุ่น ไม่ใช้ migrate dev/reset กับ production

ตรวจ Supabase ว่าไม่ถูกพักก่อนซ้อมและวันสอบ เก็บ log แบบไม่เผยข้อมูลส่วนบุคคล มี health check ที่ไม่เปิด secret และคู่มือแก้ปัญหา login/database/storage เก็บ backup นอก Git และทดสอบการกู้คืนที่ฐานแยก ไม่อ้างว่า local preview เป็น offline fallback เพราะยังพึ่ง Supabase

ข้อกำหนดที่ตรวจจากเอกสารผู้ให้บริการ:

- Vercel Hobby ฟรีและจำกัด personal/non-commercial use: https://vercel.com/docs/plans/hobby
- Vercel Function request/response payload limit 4.5MB: https://vercel.com/docs/functions/limitations
- Supabase default SMTP recipient restrictions: https://supabase.com/docs/guides/auth/auth-smtp
- Supabase Free มีการพัก project เมื่อกิจกรรมน้อย: https://supabase.com/docs/guides/platform/free-project-pausing

## สิ่งที่พักไว้เพื่อคุมขอบเขต

CSV/Excel import, referee, payment, realtime chat/live streaming, visitor analytics, gallery/banner หลายชุด, notification email ทุกเหตุการณ์, player social workspace และ tournament formats ใหม่

PLAYER ยังเป็น role ที่มีอยู่แต่ความสามารถเฉพาะยังไม่ครบ ควรอธิบายขอบเขตหรือไม่ให้สมัคร role ที่ไม่มีประโยชน์ในรุ่นส่งสอบ แทนการสร้าง workspace ใหม่ทั้งชุด โดยเก็บข้อมูลบัญชีเดิมไว้

Admin UI จัด role และ organizer verification เต็มรูปแบบให้ทำเฉพาะเมื่อมีเกณฑ์สอบบังคับ ปัจจุบันการตรวจทุก tournament โดย Admin ยังเป็นจุดอนุมัติหลัก และการจัดบัญชี Admin ต้องทำผ่านขั้นตอนที่ควบคุมได้

## สิ่งที่ต้องใช้จากเจ้าของโครงการภายหลัง

การเข้าถึงบัญชี hosting/GitHub/Supabase เพื่อเชื่อมโครงการและตั้งค่าลับ, บัญชีทดสอบที่เจ้าของควบคุม, วิธีส่ง recovery email ที่ใช้ฟรีได้จริง และเอกสารเกณฑ์สอบหากมีเพิ่มเติม ไม่ส่งรหัสผ่านหรือ service key ลงแชต

รอบตรวจนี้อ่านฐานข้อมูลอย่างเดียว ไม่สร้างบัญชี ส่งอีเมล ล้างข้อมูล เปลี่ยนสิทธิ์ หรือ deploy
