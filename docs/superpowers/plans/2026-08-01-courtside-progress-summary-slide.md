# COURTSIDE Progress Summary Slide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a final Canva slide that summarizes COURTSIDE's current 40% progress, known problems, and immediate corrective actions.

**Architecture:** Extend the existing 38-slide Canva deck with one native Canva slide at the end. Reuse the established navy, orange, and white visual language while using a two-column information layout: progress and issues on the left, weighted progress table on the right.

**Tech Stack:** Canva editor, existing COURTSIDE presentation assets, browser-based visual verification

## Global Constraints

- Preserve all existing 38 slides and their order.
- Add exactly one slide after the current final slide, producing 39 slides total.
- Show overall progress as exactly 40%.
- Use Thai for audience-facing explanatory copy.
- Use the existing COURTSIDE navy-and-orange theme.
- Avoid placeholder text, unintended wrapping, clipping, and overlap.
- Confirm Canva reports that all changes are saved.

---

### Task 1: Create the Progress Summary Slide

**Files:**
- Modify externally: Canva design `DAHRCGEDqAE`
- Reference: `docs/superpowers/specs/2026-08-01-courtside-progress-summary-slide-design.md`

**Interfaces:**
- Consumes: the existing final workflow slide and the deck's navy, orange, and white visual language
- Produces: page 39 titled `สรุปความก้าวหน้าและปัญหาที่พบ`

- [ ] **Step 1: Open the existing Canva design and verify the baseline**

Confirm the design title is `ai midway slide project - พรีเซนเทชั่น`, the current page indicator shows `38 / 38`, and the existing final slide remains the team-approval result.

- [ ] **Step 2: Add one blank page after page 38**

Use Canva's add-page control at the end of the deck. Confirm the new page indicator shows `39 / 39` and no existing page has moved or been deleted.

- [ ] **Step 3: Establish the slide hierarchy**

Use a dark navy background. Add the title `สรุปความก้าวหน้าและปัญหาที่พบ` across the top. Use orange only for emphasis and white for primary body copy.

- [ ] **Step 4: Add the overall progress callout**

Place `ความก้าวหน้าปัจจุบัน` above a large orange `40%` on the left side. The percentage must be the dominant numeric element and must not overlap the title or lower content.

- [ ] **Step 5: Add the weighted progress table**

Create a restrained white table on the right using these exact rows:

| งาน | ความก้าวหน้า |
| --- | ---: |
| Authentication และสิทธิ์ผู้ใช้ | 8% |
| Public Search และรายละเอียดการแข่งขัน | 8% |
| การสร้าง ตรวจสอบ และเผยแพร่รายการ | 12% |
| การสร้างทีมและสมัครแข่งขัน | 8% |
| โครงสร้างฐานข้อมูลและการจัดการสื่อ | 4% |
| รวม | 40% |

Keep the total row visually stronger than the module rows. Use restrained borders and ensure every label remains readable at presentation size.

- [ ] **Step 6: Add the problems and corrective actions**

Add these two sections below the progress callout:

`ปัญหาที่พบ`

- การกำหนดสิทธิ์และสถานะของหลายบทบาทมีความซับซ้อน
- ต้องทดสอบ Workflow ตั้งแต่สร้างรายการจนถึงอนุมัติทีมเพิ่มเติม
- ตารางแข่งขัน Bracket ผลคะแนน และการแจ้งเตือนยังไม่เสร็จ

`แนวทางแก้ไข`

- เพิ่ม Automated Test และข้อมูลตัวอย่างสำหรับเดโม
- พัฒนาโมดูลที่เหลือเป็นส่วนย่อยตามลำดับความสำคัญ
- เตรียมบัญชีและข้อมูลสำรองสำหรับวันนำเสนอ

Use concise line breaks and keep the two section headings visually distinct without turning them into nested cards.

### Task 2: Verify and Save the Updated Deck

**Files:**
- Verify externally: Canva design `DAHRCGEDqAE`

**Interfaces:**
- Consumes: the completed page 39 from Task 1
- Produces: a saved 39-slide Canva presentation ready for midway delivery

- [ ] **Step 1: Verify the slide count and placement**

Confirm the page indicator shows `39 / 39`, page 38 is unchanged, and page 39 is the new progress summary.

- [ ] **Step 2: Verify the progress arithmetic**

Confirm the table values calculate to `8 + 8 + 12 + 8 + 4 = 40` and both the callout and total row display `40%`.

- [ ] **Step 3: Perform visual inspection**

Inspect page 39 at the normal presentation zoom. Confirm the title remains on one visual line where possible, table labels are legible, and no text overlaps, clips, or extends beyond the slide canvas.

- [ ] **Step 4: Scan for unresolved content**

Confirm page 39 contains no `ข้อความในย่อหน้าของคุณ`, unresolved planning markers, English sample copy, or content copied from the booking-system reference image.

- [ ] **Step 5: Confirm the save state**

Wait until Canva reports `บันทึกการเปลี่ยนแปลงทั้งหมด`, then leave the Canva tab open as the deliverable.
