# COURTSIDE

COURTSIDE คือแพลตฟอร์มการแข่งขันบาสเกตบอลที่รองรับทุกขนาดหน้าจอ ออกแบบโดยให้ภาษาไทยมาก่อน สำหรับผู้เยี่ยมชม ผู้เล่น ผู้จัดการ/โค้ช ผู้จัดการแข่งขัน และผู้ดูแลแพลตฟอร์ม

รุ่นปัจจุบันรองรับการค้นหารายการแข่งขัน การยืนยันตัวตน การอนุมัติและเผยแพร่การแข่งขัน รายชื่อทีม การสมัคร โปสเตอร์ และเอกสาร ส่วนการสร้างสายการแข่งขัน การแก้ไขตาราง ผลการแข่งขัน การแจ้งเตือน และการวิเคราะห์ขั้นสูงยังอยู่ในแผนงาน

## เทคโนโลยี

dependencies สำหรับ runtime ที่ติดตั้งมีดังนี้:

- `@base-ui/react` `^1.6.0`
- `@prisma/adapter-pg` `^7.9.0`, `@prisma/client` `^7.9.0` และ `pg` `^8.22.0`
- `@supabase/ssr` `^0.12.4` และ `@supabase/supabase-js` `^2.110.8`
- `class-variance-authority` `^0.7.1`, `clsx` `^2.1.1`, `lucide-react` `^1.26.0`, `tailwind-merge` `^3.6.0` และ `zod` `^4.4.3`
- Next.js `16.2.11` พร้อม App Router, React `19.2.4` และ React DOM `19.2.4`
- `next-themes` `^0.4.6`, shadcn `^4.14.1`, `tw-animate-css` `^1.4.0`

dependencies สำหรับการพัฒนาที่ติดตั้งมีดังนี้:

- `@tailwindcss/postcss` `^4` และ Tailwind CSS `^4`
- `@testing-library/react` `^16.3.2`, `@testing-library/user-event` `^14.6.1` และ JSDOM `^29.1.1`
- type packages สำหรับ Node, PostgreSQL, React และ React DOM: `@types/node` `^20`, `@types/pg` `^8.20.0`, `@types/react` `^19`, และ `@types/react-dom` `^19`
- `dotenv` `^17.4.2`, `tsx` `^4.23.1` และ `vite-tsconfig-paths` `^6.1.1`
- ESLint `^9` พร้อม `eslint-config-next` `16.2.11`
- Prisma CLI `^7.9.0`, TypeScript `^5` และ Vitest `^4.1.10`

สถาปัตยกรรมใช้ทิศทางการพึ่งพาดังนี้:

```text
presentation -> application -> domain
infrastructure -> application/domain contracts
```

ใช้ Server Components เป็นค่าเริ่มต้น และ Route Handlers ดูแล HTTP mutations ส่วน use cases ใน application บังคับสิทธิ์และความเป็นเจ้าของ ขณะที่ Prisma และ Supabase เป็น infrastructure adapters

## บทบาท

| บทบาท | ขอบเขตปัจจุบัน |
| --- | --- |
| `PLAYER` | บทบาทบัญชีสำหรับความสามารถในอนาคต; ผู้เล่นไม่จำเป็นต้องมีบัญชีเพื่ออยู่ในรายชื่อทีม |
| `TEAM_MANAGER_COACH` | ผู้จัดการ/โค้ชสร้างและแก้ไขทีม ดูแลรายชื่อผู้เล่น และจัดการการสมัครแข่งขันของทีมที่ตนเป็นเจ้าของ |
| `TOURNAMENT_ORGANIZER` | สร้างและดำเนินการรายการแข่งขันที่ตนเป็นเจ้าของ; การบันทึกผลอยู่ในกระบวนการแข่งขันที่วางแผนไว้ |
| `PLATFORM_ADMIN` | ตรวจทานและกำกับรายการแข่งขันทั้งแพลตฟอร์ม |

ไม่มีบทบาทผู้ตัดสิน ผลการแข่งขันเป็นส่วนหนึ่งของกระบวนการแข่งขันที่วางแผนไว้และจะบันทึกโดยผู้จัดการแข่งขัน

## ทีมและรายชื่อผู้เล่น

- ผู้จัดการ/โค้ชเลือกประเภททีม `5v5` หรือ `3v3` และเพิ่มผู้เล่นหลายคนจากตารางได้ในคำขอเดียว
- ผู้เล่นในรายชื่อเป็นข้อมูล `TeamPlayer` ที่แยกจากบัญชี `User` จึงไม่ต้องสร้างบัญชี COURTSIDE ให้ผู้เล่นแต่ละคน
- ระบบแก้ไขข้อมูลผู้เล่นและนำผู้เล่นออกแบบปิดใช้งานเพื่อรักษาประวัติ รวมทั้งตรวจรูปแบบทีม สถานะทีม จำนวนผู้เล่นขั้นต่ำ และรุ่นอายุก่อนสมัครแข่งขัน
- ทีมที่มีใบสมัครสถานะ `PENDING` หรือ `APPROVED` จะยังลบหรือปิดใช้งานไม่ได้ เมื่อผ่านเงื่อนไขนี้แล้ว ทีมจะลบถาวรได้เฉพาะเมื่อไม่มีทั้งประวัติการสมัครและ `TeamMember` เดิมแม้แต่แถวเดียว ส่วนทีมที่มีประวัติการสมัครสถานะสิ้นสุดหรือมี `TeamMember` จะถูกปิดใช้งานเพื่อรักษาข้อมูล โดยการดำเนินการต้องยืนยันชื่อทีมและผ่านการตรวจสิทธิ์บน server
- ระยะนี้ไม่รองรับการนำเข้ารายชื่อด้วย CSV

โมเดล `TeamMember` เดิมยังคงอยู่เพื่อรักษาข้อมูลระหว่างเปลี่ยนผ่าน และไม่ใช่แหล่งข้อมูลรายชื่อที่ใช้งานอยู่ ระบบไม่ backfill ข้อมูลนี้เป็น `TeamPlayer` อัตโนมัติ เพราะไม่มีวันเกิดและข้อมูลยืนยันตัวตนที่จำเป็น ห้ามสร้างวันเกิดหรือข้อมูลผู้เล่นขึ้นแทนเพื่อให้ migration ผ่าน

ตรวจสถานะรายทีมแบบอ่านอย่างเดียวได้ด้วย `npx tsx scripts/audit-legacy-team-members.ts` รายงานแสดงเฉพาะ team ID, รูปแบบทีม, จำนวนสมาชิกเดิมแบบ active/inactive แยก PLAYER/COACH, จำนวน `TeamPlayer`, จำนวนและสถานะประวัติการสมัคร และ readiness/issues โดยไม่แสดงข้อมูลส่วนบุคคล รายงานรวมทีมที่มีเฉพาะ inactive legacy history และกำหนดว่าไม่พร้อมลบข้อมูลเดิมเมื่อยังมี `TeamMember` ใด ๆ การตรวจฐาน development เมื่อ 9 สิงหาคม 2026 พบ 5 ทีมที่มี legacy rows ทั้งหมดเป็น active และยังไม่พร้อมลบข้อมูลเดิม

ก่อน production cutover ต้องตรวจรายงานและ reconcile ทุกทีมที่พบ โดยยืนยันรูปแบบ `5v5`/`3v3`, กรอก `TeamPlayer` ใหม่จากข้อมูลที่ตรวจสอบได้ และทบทวนประวัติการสมัคร ห้ามนับ `TeamMember` เป็น roster ที่มีสิทธิ์สมัคร ห้ามลบ legacy rows ระหว่างขั้นตอนนี้ และการลบโมเดลหรือตารางต้องเป็น migration แยกที่ได้รับอนุมัติหลัง reconciliation เท่านั้น

Audit ใหม่ของ `TeamPlayer` เก็บเฉพาะ player/team ID, เบอร์เสื้อ, ตำแหน่ง และสถานะใช้งาน ไม่เก็บชื่อ ชื่อเล่น วันเกิด หรือโทรศัพท์ ตรวจ audit เดิมแบบอ่านอย่างเดียวได้ด้วย `npx tsx scripts/audit-team-player-audit-pii.ts`; ฐาน development ปัจจุบันไม่พบ event เดิมในขอบเขตที่ตรวจ หากฐานอื่นพบ PII ต้องตัดสินใจ retention/redaction เป็นงานที่อนุมัติและตรวจสอบแยกต่างหาก ห้าม rewrite production audit โดยอัตโนมัติ การลบทีมถาวรจึงคง audit ขั้นต่ำสำหรับการตรวจสอบโดยไม่เพิ่ม PII ใหม่

## สิ่งที่ต้องมี

ติดตั้งหรือเตรียมสิ่งต่อไปนี้:

- Node.js 20.9.0 หรือใหม่กว่า
- npm
- โครงการ Supabase
- รายละเอียดการเชื่อมต่อ PostgreSQL

คัดลอก `.env.example` เป็น `.env.local` แล้วกำหนดค่าเฉพาะในไฟล์ท้องถิ่น ใช้ชื่อตัวแปรต่อไปนี้โดยห้าม commit ค่า:

```dotenv
DATABASE_URL=
APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_RECOVERY_SECRET=
```

ห้าม commit `.env.local`, คีย์ service-role หรือรหัสผ่านฐานข้อมูล และให้หมุนเวียนข้อมูลลับที่เผยแพร่ในแชต logs ภาพหน้าจอ หรือประวัติ source

## การติดตั้ง

รันลำดับการตั้งค่าที่ตรวจสอบแล้วจาก project root:

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

`npm run reset:development` เป็นคำสั่งทำลายข้อมูล ใช้ได้กับฐานข้อมูล development ที่ยืนยันชัดเจนเท่านั้น

## การตรวจสอบคุณภาพ

```powershell
npm run test
npm run lint
npm run build
```

- `npm run test` รันชุดทดสอบ Vitest
- `npm run lint` ตรวจสอบโครงการด้วย ESLint
- `npm run build` สร้าง production build

## ผังโครงการ

- `app/` - หน้า layouts สถานะ loading/error และ Route Handlers ของ Next.js App Router
- `components/` - presentation components และ UI primitives ที่ใช้ร่วมกัน
- `features/` - โมดูล domain, application, infrastructure และ presentation แบบยึด feature
- `prisma/` - Prisma schema, migrations และ seed data
- `tests/` - การทดสอบ unit, integration และ UI
- `docs/` - ข้อกำหนดผลิตภัณฑ์ แผนการทำงาน และเอกสารการปฏิบัติการ

[roadmap](docs/ROADMAP.md) เป็นแหล่งอ้างอิงเดียวสำหรับสถานะปัจจุบันและงานที่วางแผนไว้ เอกสารระบุวันที่ใน [docs/superpowers/specs/](docs/superpowers/specs/) และ [docs/superpowers/plans/](docs/superpowers/plans/) เป็นบันทึกการออกแบบและการดำเนินงานในอดีต
