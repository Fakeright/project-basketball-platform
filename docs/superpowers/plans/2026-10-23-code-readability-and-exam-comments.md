# COURTSIDE Code Readability and Exam Comments Implementation Plan

**Goal:** ตรวจโค้ดที่ใช้งานจริง ลดส่วนเกินที่พิสูจน์ได้ และอธิบายโค้ดภาษาไทยสำหรับสอบ โดยรักษาพฤติกรรมเดิม

**Architecture:** รักษา App Router และลำดับ presentation → application → domain; infrastructure เชื่อม Prisma/Supabase ตามสัญญาเดิม

**Tech Stack:** Next.js, React, TypeScript, Prisma, Supabase, Vitest ตามเวอร์ชันที่ติดตั้ง

**Spec:** คำขอผู้ใช้วันที่ 23 ตุลาคม 2026 ให้ตรวจ/ลดโค้ดส่วนเกินและเพิ่มคอมเมนต์อธิบายทั้งโครงการ

## Constraints

- เก็บงานที่ยังไม่ commit ทั้งหมด ไม่เปลี่ยนฐานข้อมูลหรือข้อมูลจริง
- คงสิทธิ์ ความเป็นเจ้าของ การตรวจข้อมูล ธุรกรรม audit และกฎแข่งขัน
- ไม่ลบ mock, development adapter, script หรือ test เพียงเพราะไม่อยู่ในเส้นทาง production; ตรวจผู้เรียกก่อน
- คอมเมนต์เน้นหน้าที่ เหตุผล ข้อมูลเข้า/ออก และปลายทาง ไม่แปล syntax ทีละบรรทัด
- ไม่แก้ generated client, node_modules, build output หรือประวัติ migration
- ไม่ commit/push/deploy ในงานนี้

## Review Focus

- Next.js เรียก page/layout/route ผ่านชื่อไฟล์ จึงห้ามใช้จำนวน import เป็นเหตุผลเดียวในการลบ
- ฟังก์ชันที่ถูกใช้ผ่าน interface, dynamic import, script และ test ต้องนับเป็นการใช้งาน
- โค้ดกำหนดสิทธิ์และป้องกันการอัปเดตชนกันยังจำเป็นแม้ไม่เห็นผลบนหน้าจอ
- คอมเมนต์ต้องตรงกับ implementation ปัจจุบัน และไม่เปิดเผยค่าใน .env
- การเพิ่มคอมเมนต์ต้องรักษา use client/use server และตำแหน่ง directive ของเครื่องมือ

## Work

- [x] 1. เก็บ baseline และตรวจ import graph, unused declarations และจุดเริ่มต้นของระบบ
- [x] 2. ตัด/ย่อส่วนเกินที่ยืนยันได้ พร้อมระบุหลักฐานและทดสอบส่วนที่มีพฤติกรรมเกี่ยวข้อง
- [x] 3. เพิ่มคอมเมนต์ภาษาไทยใน source/config/schema/test/script ที่ดูแลเอง และจัดทำคู่มือเชื่อมหน้า → component → API → use case → database
- [x] 4. ตรวจว่าไฟล์ที่เพิ่มเฉพาะคอมเมนต์มีโครงสร้างโค้ดเหมือน baseline; รัน test/lint/build/diff-check และตรวจไฟล์ที่เปลี่ยน

ผล: 1,225 tests ผ่าน, lint ผ่าน, build ผ่านเมื่อรันซ้ำพร้อมคำเตือนความปลอดภัยของ Next.js, diff-check ผ่าน; รายละเอียดและข้อจำกัดอยู่ใน `docs/CODE-CLEANUP-REVIEW.md`

## Verification

- ใช้ TypeScript AST เปรียบเทียบโค้ดก่อน/หลังโดยไม่นับคอมเมนต์
- ตรวจ source files ที่ไม่มีคำอธิบายและลิงก์ในคู่มือ
- `npm run test -- --maxWorkers=4 --testTimeout=15000`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git status --short`
