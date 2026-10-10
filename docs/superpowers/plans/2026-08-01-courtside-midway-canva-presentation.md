# COURTSIDE Midway Canva Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine all 38 pages of the existing COURTSIDE Canva deck into an accurate, concise, and continuous 20-minute midway presentation without deleting any page.

**Architecture:** Edit the existing Canva design in place and preserve its blue-orange basketball template. Treat pages 1-20 as the explanatory foundation and pages 21-38 as one continuous role-based system walkthrough, then visually verify every edited page in Canva grid and presentation views.

**Tech Stack:** Canva editor, COURTSIDE Next.js 16 application, React 19, TypeScript, Supabase Auth/PostgreSQL/Storage, Prisma ORM, Zod, Vitest, React Testing Library

## Global Constraints

- Keep all 38 pages in their current order.
- Do not delete pages or move content into an appendix.
- Preserve the blue, orange, and white basketball theme.
- Keep pages that already communicate clearly; avoid unnecessary visual rebuilding.
- Use concise Thai audience-facing copy and standard English technology names.
- Do not claim unfinished brackets, results, notifications, analytics, Supabase Realtime, or Edge Functions as implemented.
- Keep the existing screenshots and improve the headings and captions around them.
- Do not expose timing or rehearsal notes in visible slide content.

---

### Task 1: Correct the Cover and Project Introduction

**Pages:** 1-5

**Interfaces:**
- Consumes: Existing Canva template, student name and student ID, approved project name.
- Produces: A clear opening that introduces COURTSIDE, its problem, objective, and system scope.

- [ ] **Step 1: Correct page 1 cover copy**

  Replace `propossal` with `COURTSIDE` and add or replace the secondary line with `การสอบความก้าวหน้าโครงงาน (Midway)` while preserving the existing student identification line.

- [ ] **Step 2: Refine page 2 project title**

  Use `ระบบแพลตฟอร์มจัดการรายการแข่งขันบาสเก็ตบอล` and `(Basketball Tournament Management Platform)` without the extra space before the closing parenthesis.

- [ ] **Step 3: Condense page 3 problem statement**

  Title: `ปัญหาการจัดการแข่งขันบาสเก็ตบอลในปัจจุบัน`

  Body:
  - `ข้อมูลการแข่งขันกระจายอยู่หลายช่องทาง เช่น Facebook เอกสาร และสเปรดชีต`
  - `การรับสมัคร จัดตาราง และติดตามผลต้องทำงานซ้ำและเกิดข้อผิดพลาดได้ง่าย`
  - `ผู้จัด ทีม และผู้ชมไม่มีแหล่งข้อมูลกลางที่ติดตามสถานะได้อย่างต่อเนื่อง`

- [ ] **Step 4: Clarify page 4 objectives**

  Title: `วัตถุประสงค์ของโครงงาน`

  Body:
  - `พัฒนาแพลตฟอร์มกลางสำหรับสร้างและบริหารรายการแข่งขันบาสเก็ตบอล`
  - `ลดเวลาและข้อผิดพลาดในการรับสมัครและจัดการข้อมูลการแข่งขัน`
  - `ช่วยให้ทีม ผู้เล่น และผู้ชมค้นหาและติดตามข้อมูลได้สะดวกขึ้น`

- [ ] **Step 5: Summarize page 5 system scope**

  Title: `ขอบเขตระบบ COURTSIDE`

  Body:
  - `ส่วนสาธารณะ: ค้นหาและดูรายละเอียดการแข่งขัน`
  - `ส่วนปฏิบัติงาน: สร้าง ตรวจสอบ เผยแพร่ และรับสมัครทีม`
  - `ส่วนผู้ใช้งาน: แยกบทบาทและสิทธิ์ตามหน้าที่`

- [ ] **Step 6: Verify pages 1-5**

  Confirm the cover spelling is correct, no title wraps unexpectedly, body text is readable, and the basketball decorations do not cover any text.

---

### Task 2: Make Scope, Roles, and Benefits Match the Real System

**Pages:** 6-9

**Interfaces:**
- Consumes: COURTSIDE roles and the current midway feature scope.
- Produces: An honest distinction between implemented functions and planned next-phase functions.

- [ ] **Step 1: Refine page 6 public functions**

  Title: `ขอบเขตส่วนผู้ใช้งานทั่วไป`

  Body:
  - `ค้นหาและกรองรายการแข่งขันโดยไม่ต้องเข้าสู่ระบบ`
  - `ดูรายละเอียด สถานที่ วันแข่งขัน กติกา และสถานะรับสมัคร`
  - `สมัครเข้าร่วมการแข่งขันผ่านทีมที่ตนเองจัดการ`
  - `ระยะถัดไป: ตารางแข่ง ผลการแข่งขัน สายการแข่งขัน และอันดับ`

- [ ] **Step 2: Refine page 7 operations functions**

  Title: `ขอบเขตส่วนจัดการระบบ`

  Body:
  - `Organizer สร้าง แก้ไข ส่งตรวจ และเผยแพร่การแข่งขัน`
  - `Admin ตรวจสอบรายการและกำกับดูแลแพลตฟอร์ม`
  - `Team Manager สร้างทีม จัดการสมาชิก และสมัครแข่งขัน`
  - `ระบบบันทึกสิทธิ์ สถานะ และประวัติการดำเนินงาน`
  - `ระยะถัดไป: ตารางแข่ง ผลคะแนน สถิติ และรายงาน`

- [ ] **Step 3: Correct page 8 user groups**

  Title: `กลุ่มผู้ใช้งานและบทบาท`

  Body:
  - `Platform Admin — ตรวจสอบและกำกับดูแลทั้งระบบ`
  - `Tournament Organizer — สร้างและบริหารการแข่งขันของตนเอง`
  - `Team Manager — สร้างทีมและสมัครเข้าร่วมการแข่งขัน`
  - `Coach / Player — อยู่ในรายชื่อทีมตามหน้าที่`
  - `ผู้ชมทั่วไป — ค้นหาและดูข้อมูลสาธารณะ`

- [ ] **Step 4: Tighten page 9 expected benefits**

  Title: `ผลที่คาดว่าจะได้รับ`

  Body:
  - `มีแพลตฟอร์มกลางสำหรับจัดการแข่งขันบาสเก็ตบอล`
  - `ลดขั้นตอนซ้ำซ้อนและข้อผิดพลาดในการบริหารข้อมูล`
  - `ทีมและผู้ชมเข้าถึงข้อมูลที่เป็นปัจจุบันได้สะดวก`
  - `วางพื้นฐานสำหรับตารางแข่ง ผลคะแนน และสถิติในระยะถัดไป`

- [ ] **Step 5: Verify pages 6-9**

  Confirm the five platform roles are represented accurately and planned functions are visibly labelled `ระยะถัดไป`.

---

### Task 3: Condense Theory and Technology Content

**Pages:** 10-16

**Interfaces:**
- Consumes: Actual COURTSIDE architecture and installed technology stack.
- Produces: Theory slides that explain why each concept matters to this project.

- [ ] **Step 1: Correct page 10 section title**

  Replace `ทฤษฎีและความรู้เกี่ยวข้อง` with `ทฤษฎีและเทคโนโลยีที่เกี่ยวข้อง`.

- [ ] **Step 2: Replace page 11 report paragraph with three points**

  Title: `แนวคิดแพลตฟอร์มจัดการแข่งขันแบบรวมศูนย์`

  Body:
  - `รวมการประชาสัมพันธ์ การรับสมัคร และสถานะการแข่งขันไว้ในระบบเดียว`
  - `ลดข้อมูลซ้ำจาก Facebook เอกสาร และสเปรดชีตหลายชุด`
  - `ทำให้ผู้จัด ทีม และผู้ชมอ้างอิงข้อมูลชุดเดียวกัน`

- [ ] **Step 3: Clean page 12 FIBA 5x5 copy**

  Title: `รูปแบบการแข่งขัน 5x5`

  Body:
  - `ทีมละ 5 คนในสนาม และมีผู้เล่นสำรอง`
  - `แข่งขัน 4 ควอเตอร์ ควอเตอร์ละ 10 นาที`
  - `คะแนนจากลูกโทษ 1 คะแนน เขตสองแต้ม 2 คะแนน และนอกเส้น 3 คะแนน`
  - `ระบบ COURTSIDE ใช้รูปแบบการแข่งขันเป็นข้อมูลหลักของรายการ`

- [ ] **Step 4: Clean page 13 FIBA 3x3 copy**

  Title: `รูปแบบการแข่งขัน 3x3`

  Body:
  - `ทีมละ 3 คนในสนาม และผู้เล่นสำรอง 1 คน`
  - `แข่งขันครึ่งสนาม 10 นาที หรือทีมแรกที่ทำได้ 21 คะแนน`
  - `ยิงในเส้นโค้ง 1 คะแนน และนอกเส้นโค้ง 2 คะแนน`
  - `กำหนดเวลาบุก 12 วินาที`

- [ ] **Step 5: Refine page 14 React explanation**

  Title: `React 19 — สร้างส่วนติดต่อผู้ใช้แบบ Component`

  Body:
  - `แบ่งหน้าเว็บเป็นส่วนประกอบที่นำกลับมาใช้ซ้ำได้`
  - `ใช้กับ Search Form, Login Form, Dashboard และ Tournament Editor`
  - `ช่วยให้ UI แต่ละบทบาทพัฒนาและทดสอบแยกกันได้`

- [ ] **Step 6: Refine page 15 Next.js explanation**

  Title: `Next.js 16 — โครงสร้างเว็บแบบ Full-stack`

  Body:
  - `App Router จัดการหน้าเว็บและเส้นทางของระบบ`
  - `Server Components โหลดข้อมูลและสร้างหน้าเว็บจากฝั่งเซิร์ฟเวอร์`
  - `Route Handlers รับคำขอและตรวจสิทธิ์ก่อนเปลี่ยนข้อมูล`
  - `รองรับทั้งหน้าสาธารณะและ Dashboard ในโครงการเดียว`

- [ ] **Step 7: Connect page 16 REST API to the implementation**

  Title: `REST API และ Route Handlers`

  Body:
  - `หน้าเว็บส่งคำขอผ่าน HTTP ไปยัง Route Handler`
  - `Zod ตรวจรูปแบบข้อมูลก่อนเข้าสู่ Use Case`
  - `ระบบตรวจ Authentication, Role, Ownership และสถานะข้อมูลบน Server`
  - `ตอบกลับด้วยรหัสสถานะ เช่น 401, 403, 409 และ 422`

- [ ] **Step 8: Verify pages 10-16**

  Confirm no text contains broken Thai spacing, every technology is tied to a COURTSIDE use, and pages 12-13 describe formats without claiming the bracket subsystem is complete.

---

### Task 4: Reframe Related Platforms as Design References

**Pages:** 17-20

**Interfaces:**
- Consumes: Existing THAI RUN, FIBA Tournament System, and Challonge references.
- Produces: A concise comparison showing the lesson COURTSIDE takes from each reference.

- [ ] **Step 1: Correct page 17 section title**

  Replace `งานวิจัยที่เกี่ยวข้อง` with `ระบบและแพลตฟอร์มที่เกี่ยวข้อง`.

- [ ] **Step 2: Refine page 18 THAI RUN copy**

  Title: `THAI RUN — การจัดกิจกรรมออนไลน์สำหรับผู้ใช้ไทย`

  Body:
  - `รวมการสมัครและข้อมูลผู้เข้าร่วมไว้ในแพลตฟอร์มเดียว`
  - `รองรับภาษาไทยและบริบทการใช้งานภายในประเทศ`
  - `แนวทางที่นำมาใช้: ลดขั้นตอนและทำให้ผู้ใช้เข้าถึงข้อมูลได้ง่าย`

- [ ] **Step 3: Refine page 19 FIBA Tournament System copy**

  Title: `FIBA Tournament System — มาตรฐานการแข่งขันระดับสากล`

  Body:
  - `รองรับตาราง ผลการแข่งขัน สถิติ และอันดับของกีฬาประเภททีม`
  - `เชื่อมข้อมูลการแข่งขัน ผู้เล่น ทีม โค้ช และสนาม`
  - `แนวทางที่นำมาใช้: โครงสร้างสถานะและข้อมูลการแข่งขันที่ชัดเจน`

- [ ] **Step 4: Refine page 20 Challonge copy**

  Title: `Challonge — การจัดสายการแข่งขันที่ยืดหยุ่น`

  Body:
  - `สร้าง Bracket และรองรับการแข่งขันหลายรูปแบบ`
  - `แสดงผู้ชนะ ผู้แพ้ และการผ่านเข้ารอบได้ชัดเจน`
  - `แนวทางที่นำมาใช้ในระยะถัดไป: สายการแข่งขันที่อ่านง่ายและตรวจสอบได้`

- [ ] **Step 5: Verify pages 17-20**

  Confirm the section no longer calls product websites research papers, spelling is correct, and every page states a concrete lesson for COURTSIDE.

---

### Task 5: Turn the Existing Screenshots into a Continuous Workflow

**Pages:** 21-38

**Interfaces:**
- Consumes: Existing screenshots and the verified Organizer -> Admin -> Team Manager workflow.
- Produces: A numbered, role-based walkthrough whose final state demonstrates the current midway implementation.

- [ ] **Step 1: Rename page 21 section divider**

  Use `การดำเนินงานของระบบ COURTSIDE`.

- [ ] **Step 2: Refine public discovery pages 22-24**

  - Page 22 title: `ขั้นตอนที่ 1: ผู้ใช้ค้นหารายการแข่งขัน`
    Caption: `ผู้ใช้ทั่วไปเริ่มค้นหาได้โดยไม่ต้องเข้าสู่ระบบ`
  - Page 23 title: `ขั้นตอนที่ 2: กรองรายการตามเงื่อนไข`
    Caption: `ค้นหาจากชื่อ จังหวัด รูปแบบ รุ่นอายุ สนาม และวันที่`
  - Page 24 title: `ขั้นตอนที่ 3: ดูรายละเอียดการแข่งขัน`
    Caption: `ตรวจสอบสถานที่ วันแข่งขัน กติกา กำหนดรับสมัคร และสถานะรายการ`

- [ ] **Step 3: Refine identity pages 25-26**

  - Page 25 title: `ขั้นตอนที่ 4: สมัครสมาชิกและเลือกบทบาท`
    Caption: `Supabase Auth ดูแลบัญชีและการยืนยันตัวตนของผู้ใช้`
  - Page 26 title: `ขั้นตอนที่ 5: เข้าสู่ระบบตามบทบาท`
    Caption: `ระบบเชื่อมบัญชีกับโปรไฟล์และสิทธิ์ก่อนเปิดพื้นที่ทำงาน`

- [ ] **Step 4: Refine organizer creation pages 27-29**

  - Page 27 title: `ขั้นตอนที่ 6: Organizer เปิด Dashboard`
    Caption: `ผู้จัดเห็นเฉพาะรายการแข่งขันที่ตนเองรับผิดชอบ`
  - Page 28 title: `ขั้นตอนที่ 7: Organizer สร้างการแข่งขัน`
    Caption: `กรอกชื่อ จังหวัด สนาม รูปแบบ วันแข่งขัน และจำนวนทีม`
  - Page 29 title: `ขั้นตอนที่ 8: ส่งรายการให้ Admin ตรวจสอบ`
    Caption: `รายการถูกบันทึกและเปลี่ยนสถานะจาก Draft เป็น Submitted`

- [ ] **Step 5: Refine admin review pages 30-32**

  - Page 30 title: `ขั้นตอนที่ 9: Admin ตรวจภาพรวมแพลตฟอร์ม`
    Caption: `Dashboard แสดงจำนวนรายการ ผู้ใช้ ทีม และรายการที่รอตรวจ`
  - Page 31 title: `ขั้นตอนที่ 10: Admin เปิดคิวตรวจสอบ`
    Caption: `Admin ตรวจข้อมูลและเลือกอนุมัติ ขอแก้ไข หรือปฏิเสธ`
  - Page 32 title: `ขั้นตอนที่ 11: อนุมัติและเผยแพร่รายการ`
    Caption: `Admin เปลี่ยนสถานะเป็น Approved ก่อน Organizer เผยแพร่เป็น Published`

- [ ] **Step 6: Refine publication and team workspace pages 33-35**

  - Page 33 title: `ขั้นตอนที่ 12: รายการแสดงต่อสาธารณะ`
    Caption: `ผู้ใช้ค้นหาและเปิดรายละเอียดรายการที่ Published ได้`
  - Page 34 title: `ขั้นตอนที่ 13: Team Manager เปิดพื้นที่จัดการทีม`
    Caption: `ระบบแสดงทีม สมาชิก และรายการที่สามารถสมัครได้`
  - Page 35 title: `ขั้นตอนที่ 14: Team Manager สร้างทีม`
    Caption: `กำหนดชื่อทีม จังหวัด และจัดการรายชื่อสมาชิก`

- [ ] **Step 7: Refine registration decision pages 36-38**

  - Page 36 title: `ขั้นตอนที่ 15: Team Manager สมัครแข่งขัน`
    Caption: `เลือกทีมและส่งใบสมัครเข้าสู่สถานะ Pending`
  - Page 37 title: `ขั้นตอนที่ 16: Organizer พิจารณาทีมที่สมัคร`
    Caption: `Organizer ตรวจข้อมูลก่อนอนุมัติหรือปฏิเสธการสมัคร`
  - Page 38 title: `ผลลัพธ์: ทีมได้รับการอนุมัติเข้าร่วม`
    Caption: `ระบบบันทึกสถานะ Approved และแสดงผลให้ผู้เกี่ยวข้องตรวจสอบได้`
    Closing line: `ความคืบหน้าปัจจุบัน: กระบวนการหลักตั้งแต่สร้างรายการถึงอนุมัติทีมทำงานได้แล้ว`

- [ ] **Step 8: Verify pages 21-38**

  Confirm numbering is continuous from 1 to 16, every page names the acting role, placeholder text is removed, status names use Draft, Submitted, Approved, Published, and Pending consistently, and the last page communicates the current midway achievement.

---

### Task 6: Final Visual and Narrative Quality Check

**Pages:** 1-38

**Interfaces:**
- Consumes: All edited Canva pages.
- Produces: A saved Canva deck ready for rehearsal and screenshot replacement.

- [ ] **Step 1: Inspect all pages in grid view**

  Confirm all 38 pages remain present, the blue-orange theme is consistent, and no page appears unexpectedly empty or duplicated.

- [ ] **Step 2: Inspect each edited page at normal size**

  Check title wrapping, body overflow, text contrast, screenshot crops, spelling, and unintended overlap.

- [ ] **Step 3: Verify the 20-minute narrative**

  Read the sequence as four chapters: context (1-9), theory and references (10-20), system workflow (21-38), and midway outcome (38). Confirm every transition advances the same COURTSIDE story.

- [ ] **Step 4: Confirm Canva save state**

  Wait for Canva to report that all changes are saved, then keep the design open for the user to review.

