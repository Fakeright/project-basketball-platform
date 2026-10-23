# ตัวเชื่อมบริการร่วม

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## lib/server/prisma.ts

สร้างและใช้ Prisma client กับ PostgreSQL ร่วมกันในฝั่งเซิร์ฟเวอร์

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/server/prisma.ts:1>)

ผู้เรียกในโครงการ: [app/api/teams/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/route.ts:1>), [features/admin/infrastructure/get-admin-dashboard-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/infrastructure/get-admin-dashboard-repository.ts:1>), [features/competition/infrastructure/get-competition-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-competition-repository.ts:1>), [features/competition/infrastructure/get-external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/get-external-bracket-repository.ts:1>), [features/identity/infrastructure/get-auth-handlers.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/identity/infrastructure/get-auth-handlers.ts:1>), [features/identity/infrastructure/get-user-profile-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/identity/infrastructure/get-user-profile-repository.ts:1>), [features/registrations/infrastructure/get-registration-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/registrations/infrastructure/get-registration-repository.ts:1>), [features/team-management/infrastructure/get-admin-team-read-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/get-admin-team-read-repository.ts:1>), [features/team-management/infrastructure/get-team-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/team-management/infrastructure/get-team-repository.ts:1>), [features/tournament-media/infrastructure/get-tournament-media-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/get-tournament-media-repository.ts:1>), [features/tournament-operations/infrastructure/get-tournament-operations-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-operations/infrastructure/get-tournament-operations-repository.ts:1>), [features/tournaments/infrastructure/get-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/get-tournament-repository.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getPrismaClient](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/server/prisma.ts:19>) | 19 | ใช้ Prisma client ร่วมกันตามสภาพแวดล้อม เพื่อลดการสร้าง connection ซ้ำเมื่อโหลดโมดูล |

## lib/supabase/admin.ts

สร้าง Supabase client สิทธิ์บริการสำหรับฝั่งเซิร์ฟเวอร์เท่านั้น ไม่ส่ง service key ไปเบราว์เซอร์

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/admin.ts:1>)

ผู้เรียกในโครงการ: [features/identity/infrastructure/get-auth-handlers.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/identity/infrastructure/get-auth-handlers.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createAdminSupabaseClient](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/admin.ts:15>) | 15 | สร้าง client ฝั่งเซิร์ฟเวอร์ด้วย service key สำหรับงานที่ได้รับสิทธิ์แล้วเท่านั้น |

## lib/supabase/config.ts

อ่านและตรวจ configuration ของ Supabase แยกค่าที่เปิดเผยได้กับค่าที่ใช้เฉพาะเซิร์ฟเวอร์

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/config.ts:1>)

ผู้เรียกในโครงการ: [features/identity/infrastructure/get-auth-handlers.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/identity/infrastructure/get-auth-handlers.ts:1>), [lib/supabase/admin.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/admin.ts:1>), [lib/supabase/proxy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/proxy.ts:1>), [lib/supabase/server.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:1>), [proxy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/proxy.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/lib/supabase-config.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/lib/supabase-config.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getPublicSupabaseConfiguration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/config.ts:13>) | 13 |  |
| [resolvePublicSupabaseConfigurationForRuntime](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/config.ts:44>) | 44 |  |
| [getApplicationUrl](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/config.ts:59>) | 59 |  |
| [getRecoverySecret](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/config.ts:98>) | 98 |  |
| [getAdminSupabaseConfiguration](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/config.ts:110>) | 110 |  |

## lib/supabase/proxy.ts

ต่ออายุ session และประสาน cookie ระหว่าง request/response ก่อนเข้าหน้าเว็บ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/proxy.ts:1>)

ผู้เรียกในโครงการ: [proxy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/proxy.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/lib/supabase-proxy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/lib/supabase-proxy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [refreshSupabaseSession](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/proxy.ts:29>) | 29 |  |
| [getAll](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/proxy.ts:39>) | 39 |  |
| [setAll](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/proxy.ts:42>) | 42 |  |
| [isProviderOutage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/proxy.ts:76>) | 76 |  |
| [getProxyDependencies](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/proxy.ts:85>) | 85 |  |

## lib/supabase/server.ts

สร้าง Supabase client ที่อ่าน/เขียน cookie ของคำขอ Next.js เพื่อจัดการ session

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:1>)

ผู้เรียกในโครงการ: [features/identity/infrastructure/get-auth-handlers.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/identity/infrastructure/get-auth-handlers.ts:1>), [features/identity/infrastructure/next-cookie-current-actor-provider.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/identity/infrastructure/next-cookie-current-actor-provider.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/lib/supabase-server.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/lib/supabase-server.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createReadOnlyCookieMethods](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:30>) | 30 |  |
| [createMutableCookieMethods](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:39>) | 39 |  |
| [setAll](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:44>) | 44 |  |
| [createServerComponentSupabaseClient](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:55>) | 55 |  |
| [createRouteHandlerSupabaseContext](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:66>) | 66 |  |
| [setCookie](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:74>) | 74 |  |
| [setHeader](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:77>) | 77 |  |
| [finalizeResponse](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:85>) | 85 |  |
| [createServerSupabaseClient](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/supabase/server.ts:98>) | 98 | สร้าง Supabase client ผูกกับ cookie ของคำขอ เพื่ออ่านและอัปเดต session |

## lib/utils.ts

รวมตัวช่วย className สำหรับ component โดยใช้ clsx และ tailwind-merge

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/utils.ts:1>)

ผู้เรียกในโครงการ: [components/organizer/bracket-mode-control.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/organizer/bracket-mode-control.tsx:1>), [components/province-combobox.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/province-combobox.tsx:1>), [components/ui/button.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/button.tsx:1>), [components/ui/input.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/input.tsx:1>), [components/ui/select.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/select.tsx:1>), [components/ui/sheet.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/sheet.tsx:1>), [components/ui/tooltip.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/ui/tooltip.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [cn](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/lib/utils.ts:11>) | 11 | รวม className และแก้คลาส Tailwind ที่ชนกัน ให้ component กำหนดรูปแบบเพิ่มเติมได้ |
