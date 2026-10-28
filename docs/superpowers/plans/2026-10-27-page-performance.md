# Page Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ลดเวลารอหน้าเว็บจริง โดยไม่ลดการตรวจสิทธิ์หรือแสดงผลการแข่งขันเก่า

**Architecture:** กำหนด Vercel Functions ไว้ที่ sin1 ใกล้ Supabase PostgreSQL ap-southeast-1 ใช้ getCurrentActor ที่มีอยู่แล้วร่วมกันระหว่าง Server Components เพื่อให้ React cache ลดการอ่าน Auth/profile ซ้ำภายใน request เดียว ส่วน Route Handlers ยังคงอ่าน session และตรวจสิทธิ์ตามเดิม

**Tech Stack:** Next.js 16.4.2, React 19.2.4, Prisma 7.10.1, Supabase, Vercel Hobby, Vitest

**Spec:** คำขอผู้ใช้วันที่ 27 ตุลาคมให้แก้หน้าเว็บจริงที่โหลดช้า และอนุมัติ commit/push เฉพาะชุดปรับความเร็ว ไม่รวมเอกสาร/คอมเมนต์ค้าง

## Global Constraints

- ไม่เพิ่มค่าใช้จ่าย ใช้ region เดียว sin1 ไม่เพิ่มแพ็กเกจหรือเปลี่ยนฐานข้อมูล
- ไม่ใช้ global actor cache, TTL cache ของสิทธิ์ หรือ cache ของข้อมูลผลการแข่งขัน
- ไม่แก้ API authorization, business rules, migrations หรือข้อมูลจริง
- เก็บและไม่ stage การแก้ไขเดิมที่ไม่เกี่ยวกับ performance

## Evidence Before Changes

- Response header ของเว็บจริงเป็น sin1::iad1 แสดงเส้นทางไปประมวลผล iad1 ขณะที่ pooler ในเครื่องระบุ ap-southeast-1
- Warm response body completion จากเครื่องนี้: / 1001ms, /tournaments 1233ms, /schedule 2544ms, /bracket 3612ms, /results 2542ms, /login 356ms
- หน้า protected และ layout สร้าง actor provider คนละตัว ขณะที่ getCurrentActor แบบ React cache มีอยู่แล้วแต่ใช้เฉพาะ public layout
- ตัวเลขเป็น HTTP timing ไม่ใช่ browser Core Web Vitals และไม่ใช่ค่ารับประกัน

## Review Focus

- ไม่ทำให้ actor ของบัญชีหนึ่งรั่วไปอีก request
- login/logout ต้องเห็น actor ล่าสุดใน request ถัดไป
- หน้า protected ยังปฏิเสธผู้ไม่มีสิทธิ์ และ API ใช้ provider เดิม
- vercel.json ต้องเลือก region เดียวที่ Hobby รองรับ
- เก็บ baseline และวัดหลัง Ready บนโดเมนจริง ไม่ใช้ผล local อ้างเป็นผล production

## Task 1: Colocate Functions With the Database

**Files:** Create vercel.json; Create tests/config/vercel-region.test.ts

- [x] เขียนและรันเทสต์ตรวจ regions เท่ากับ ["sin1"] ให้ล้มเมื่อไม่มี configuration
- [x] เพิ่ม vercel.json ตาม Vercel schema โดยไม่ใช้ preferredRegion ที่ Next.js รุ่นนี้ deprecated แล้ว
- [x] รันเทสต์เฉพาะให้ผ่าน

## Task 2: Deduplicate Actor Reads Within a Render

**Files:** Modify app/(admin)/**/page.tsx, app/(admin)/layout.tsx, app/(public)/tournaments/[slug]/page.tsx; Create tests/config/server-render-auth.test.ts; Extend tests/features/identity/get-current-actor.test.ts

**Interface:** getCurrentActor(): Promise<Actor | null> จาก features/identity/infrastructure/get-current-actor.ts ซึ่งใช้ React cache ไม่ใช่ process-wide state

- [x] เพิ่มเทสต์ตรวจว่า server page/layout ไม่สร้าง actor provider แยกเอง และดูผลล้มก่อนแก้
- [x] เพิ่มกรณี request ใหม่ต้องอ่าน actor ใหม่ในเทสต์ resolver ที่จำลอง request cache
- [x] เปลี่ยนเฉพาะ import/call ไปใช้ getCurrentActor ที่มีอยู่ใน 19 page/layout ไม่ย้ายกฎสิทธิ์ออกจาก use case
- [x] รันเทสต์ identity/config/UI pages และตรวจ diff ไม่เปลี่ยน permission/ข้อมูลที่โหลด: 58 files / 281 tests ผ่าน

Ruling: เทสต์ contract ตรวจเฉพาะ named import ของ createNextCookieCurrentActorProvider ไม่ห้าม import utility จากโมดูลเดียวกัน เพราะหน้า login ยังต้องใช้ isDevelopmentCookieSessionMode โดยไม่ได้อ่าน actor ซ้ำ

## Task 3: Verify, Deliver, and Measure

- [x] npm run test, npm run typecheck, npm run lint, npm run build, git diff --check: 170 files / 1,228 tests ผ่าน
- [x] stage เฉพาะไฟล์ performance/test/แผนใหม่ ไม่ stage CODE-TOUR หรือไฟล์คอมเมนต์ค้าง
- [ ] commit/push ตามอนุมัติ แล้วรอ GitHub/Vercel สำเร็จ
- [ ] ตรวจ x-vercel-id ว่า Function เป็น sin1 และวัด routes เดิมเทียบ baseline
- [ ] ตรวจ anonymous protected/API และหน้าเว็บจริง พร้อมรายงานข้อจำกัดของ authenticated timing ถ้าไม่มี session ให้ตรวจ

## Pre-Publish Review

- Independent read-only review ไม่พบ actionable findings ใน 19 page/layout, resolver เดิม, config และ tests
- Request isolation test จำลอง lifecycle ของ request cache ไม่ใช่การทดสอบ concurrent session ผ่าน Next.js จริง
- Baseline แบบ median 3 ครั้งก่อนส่งขึ้นเว็บ: / 1064ms, /tournaments 1280ms, /schedule 2707ms, /bracket 3884ms, /results 2719ms, /login 367ms ทุกหน้าตอบ 200 และระบุเส้นทาง sin1::iad1

## References

- https://vercel.com/docs/functions/configuring-functions/region
- https://vercel.com/docs/project-configuration/vercel-json#regions
- Local node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/preferredRegion.md
- Local node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md
