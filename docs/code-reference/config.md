# การตั้งค่าโครงการ

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## eslint.config.mjs

กำหนดกฎตรวจโค้ดของ Next.js/TypeScript และไฟล์ที่ไม่ต้องตรวจ เช่น generated output

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/eslint.config.mjs:1>)

## next.config.ts

กำหนด Next.js สำหรับ origin ในเครื่อง ชุด TypeScript ที่ build ราก Turbopack และแหล่งภาพภายนอกที่อนุญาต

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/next.config.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/config/next-dev-origin.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/config/next-dev-origin.test.ts:1>)

## postcss.config.mjs

เชื่อม Tailwind CSS เข้ากับขั้นตอนแปลง CSS ของแอป

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/postcss.config.mjs:1>)

## prisma.config.ts

กำหนดที่อยู่ schema/migration และอ่านค่าฐานข้อมูลสำหรับคำสั่ง Prisma

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/prisma.config.ts:1>)

## proxy.ts

จุดที่ Next.js เรียกก่อน route เพื่อประสาน session ผ่านตัวช่วย Supabase

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/proxy.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/lib/root-proxy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/lib/root-proxy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [proxy](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/proxy.ts:15>) | 15 |  |
| [handleProxyRequest](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/proxy.ts:32>) | 32 |  |
| [error](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/proxy.ts:40>) | 40 |  |

## vitest.config.mts

กำหนด Vitest ให้รันชุดทดสอบใน jsdom และแทน server-only ด้วย stub สำหรับการทดสอบ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/vitest.config.mts:1>)

## ไฟล์ที่ไม่ใส่คอมเมนต์ในเนื้อไฟล์

| ไฟล์ | หน้าที่ |
| --- | --- |
| package.json | dependencies และคำสั่ง dev/test/lint/build/seed |
| package-lock.json | ล็อก dependency ที่ติดตั้งให้ทำซ้ำได้ ห้ามลบเพื่อทำให้ไฟล์น้อยลง |
| tsconfig.json | TypeScript แบบ strict และ alias @/* |
| tsconfig.build.json | ชุด build ของแอปที่ไม่รวม tests |
| components.json | การตั้งค่าเครื่องมือ shadcn |
| .env.example | ตัวอย่างชื่อค่าที่ต้องตั้งโดยไม่มี secret จริง |
| .env.local / .env | ค่าภายในเครื่อง ไม่คัดลอกลงคู่มือหรือ Git |
| next-env.d.ts | ประเภทที่ Next.js สร้างให้ ไม่แก้ด้วยมือ |
| lib/generated/prisma | client ที่สร้างจาก schema ไม่แก้ด้วยมือ |
| prisma/migrations | ประวัติการเปลี่ยน schema ไม่แก้ migration เก่าที่ใช้งานแล้ว |
