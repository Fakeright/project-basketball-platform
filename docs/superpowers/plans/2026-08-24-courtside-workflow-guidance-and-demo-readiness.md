# COURTSIDE Workflow Guidance And Demo Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มคำแนะนำงานถัดไปสำหรับ Organizer, Admin และ Team Manager/Coach พร้อมชุดข้อมูลเดโม 6 checkpoint ที่รันซ้ำได้และเส้นทางสาธิต 20-25 นาที

**Architecture:** ใช้ pure presentation mapper แปลง typed state ที่ application layer อนุญาตให้เปิดเผยเป็นข้อความภาษาไทยและ navigation action โดย server policy เดิมยังเป็นผู้ตัดสิน mutation ทุกครั้ง ขยาย read projection เฉพาะ Admin และ Team ที่ต้องใช้ข้อมูลเพิ่ม และต่อยอด seed/competition fixture เดิมโดยไม่เพิ่ม schema หรือเก็บ guidance ลงฐานข้อมูล

**Tech Stack:** Next.js 16.2.11 App Router, React 19.2.4, TypeScript strict, Tailwind CSS 4, Prisma 7.9, Supabase PostgreSQL, Vitest 4.1.10, React Testing Library

**Spec:** `docs/superpowers/specs/2026-08-24-courtside-workflow-guidance-and-demo-readiness-design.md`

## Global Constraints

- อ่าน `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`, `04-linking-and-navigating.md` และ `05-server-and-client-components.md` ก่อนแก้ page หรือ navigation
- Server Components เป็นค่าเริ่มต้น; เพิ่ม `"use client"` เฉพาะ component ที่มี browser state หรือ event handler
- UI guidance เป็น navigation เท่านั้น ห้ามใช้แทน authentication, permission, ownership, lifecycle, governance หรือ optimistic concurrency check ฝั่ง server
- ไม่เพิ่ม Prisma migration, database column, role, email verification, analytics, notification, CSV, payment หรือ deployment ในแผนนี้
- ใช้ภาษาไทยสำหรับข้อความที่ผู้ใช้เห็น และใช้ชื่อไฟล์/type/function ภาษาอังกฤษที่สื่อความหมาย
- primary action มีได้สูงสุดหนึ่งรายการต่อ context และต้องไม่มี mutation button ที่ policy เดิมห้าม
- ห้ามเก็บ password, Supabase key, service role key หรือข้อมูลส่วนบุคคลจริงใน seed และ Git
- seed เดโมห้าม reset schema และห้ามลบ record ที่ไม่ได้เป็นของ fixture
- รองรับประมาณ `375px`, `768px`, `1440px`, light mode และ dark mode โดยไม่มี page-level horizontal overflow
- ทุก task ใช้ TDD และ stage เฉพาะไฟล์ที่ระบุ ห้ามรวม `.agents/`, `.claude/`, `.windsurf/` หรือ `skills-lock.json`

## File Structure

### Files To Create

- `features/workflow-guidance/presentation/workflow-guidance-view.ts` — type กลางของ stage, blocker และ navigation action ที่ไม่มี dependency ต่อ React
- `features/tournament-operations/application/list-owned-tournament-workflows.ts` — authorize actor, โหลด Tournament ของ Organizer และคำนวณ competition readiness จาก policy เดิม
- `features/tournament-operations/presentation/organizer-workflow-guidance.ts` — map Tournament state เป็น stage, copy, blocker และ primary navigation action
- `features/competition/presentation/tournament-competition-issue-label.ts` — map typed competition issue code เป็นข้อความไทยร่วมกัน
- `features/team-management/presentation/team-workflow-guidance.ts` — map team readiness และ registration history เป็นงานถัดไป
- `components/workflow/workflow-next-action.tsx` — แสดง stage, description, blockers และ action ที่ได้รับเป็น view-ready data
- `components/organizer/tournament-workflow-progress.tsx` — แสดง navigation 5 ขั้นพร้อม `aria-current`
- `features/demo-data/infrastructure/demo-workflow-fixtures.ts` — stable definitions ของ tournament/team/registration checkpoint
- `tests/features/tournament-operations/organizer-workflow-guidance.test.ts`
- `tests/features/tournament-operations/list-owned-tournament-workflows.test.ts`
- `tests/features/team-management/team-workflow-guidance.test.ts`
- `tests/features/demo-data/demo-workflow-fixtures.test.ts`
- `tests/ui/workflow/workflow-next-action.test.tsx`
- `tests/ui/organizer/tournament-workflow-progress.test.tsx`

### Files To Modify

- `app/(admin)/organizer/page.tsx` — สร้าง guidance ต่อรายการและแสดง empty action
- `app/(admin)/organizer/tournaments/[id]/page.tsx` — เพิ่ม workflow progress ที่ส่วนข้อมูลรายการ
- `app/(admin)/organizer/tournaments/[id]/registrations/page.tsx` — เพิ่ม workflow progress ที่ส่วนทีมสมัคร
- `app/(admin)/organizer/tournaments/[id]/bracket/page.tsx` — ใช้ workflow progress ที่ส่วนสาย
- `app/(admin)/organizer/tournaments/[id]/schedule/page.tsx` — ใช้ workflow progress ที่ส่วนตาราง
- `app/(admin)/organizer/tournaments/[id]/results/page.tsx` — ใช้ workflow progress ที่ส่วนผล
- `components/organizer/competition-workspace-nav.tsx` — ถูกแทนที่ด้วย progress component แล้วลบเมื่อไม่มี caller
- `components/team/team-list.tsx` — แสดงความพร้อมและงานถัดไปของแต่ละทีม
- `app/(admin)/team/page.tsx` — โหลด registration summary พร้อม workspace
- `features/team-management/domain/team-policy.ts` — เปิดเผย minimum roster count ผ่าน pure function
- `features/registrations/application/ports/registration-repository.ts` — เพิ่ม slug, tournament status และ governance status ในรายการของทีม
- `features/registrations/infrastructure/prisma-registration-repository.ts` — select และ map projection ที่เพิ่ม
- `features/admin/application/ports/admin-dashboard-repository.ts` — เพิ่ม review queue และ governance queue แบบ bounded
- `features/admin/infrastructure/prisma-admin-dashboard-repository.ts` — อ่าน queue ทั้งสองจาก Prisma
- `features/admin/presentation/admin-dashboard-view-model.ts` — map queue เป็น copy และ href
- `components/admin/admin-dashboard.tsx` — แสดงคิวงานก่อน metrics และ Audit
- `components/admin/tournament-review-panel.tsx` — แสดงทางกลับคิวตรวจหลังบันทึกผลสำเร็จ
- `components/organizer/tournament-competition-lifecycle-panel.tsx` — ใช้ issue label กลางแทน map ภายใน component
- `prisma/seed.ts` — ใช้ stable checkpoint definitions และสร้าง registration demo
- `features/competition/infrastructure/demo-competition-fixtures.ts` — เพิ่ม Bracket Cup และเปลี่ยน slug ของ Live/Championship
- `scripts/seed-competition-demos.ts` — เพิ่ม production guard และรองรับ fixture ที่สาม
- `package.json` — เพิ่ม `seed:demo`
- `docs/ROADMAP.md` — สะท้อน workflow hardening และเลื่อน auth hardening ตามการตัดสินใจล่าสุด
- focused tests เดิมที่ contract เปลี่ยน ได้แก่ `tests/features/admin/admin-dashboard.test.ts`, `tests/ui/admin/admin-dashboard.test.tsx`, `tests/features/registrations/prisma-registration-repository.test.ts`, `tests/ui/team/team-list.test.tsx` และ `tests/features/competition/demo-competition-fixtures.test.ts`
- `tests/ui/admin/tournament-review-panel.test.tsx` — ยืนยัน post-review navigation และ accessible success feedback

---

### Task 1: Organizer Workflow Guidance Mapper

**Files:**
- Create: `features/workflow-guidance/presentation/workflow-guidance-view.ts`
- Create: `features/tournament-operations/application/list-owned-tournament-workflows.ts`
- Create: `features/tournament-operations/presentation/organizer-workflow-guidance.ts`
- Create: `features/competition/presentation/tournament-competition-issue-label.ts`
- Create: `tests/features/tournament-operations/organizer-workflow-guidance.test.ts`
- Create: `tests/features/tournament-operations/list-owned-tournament-workflows.test.ts`
- Modify: `components/organizer/tournament-competition-lifecycle-panel.tsx`
- Modify: `tests/ui/organizer/tournament-competition-lifecycle-panel.test.tsx`

**Interfaces:**
- Consumes: `TournamentOperationStatus` และ `TournamentGovernanceStatus`
- Produces from shared presentation: `WorkflowPrimaryAction` และ `WorkflowGuidanceView`
- Produces from application: `OwnedTournamentWorkflowItem` และ `listOwnedTournamentWorkflows(actor, dependencies)`
- Produces from tournament presentation: `createOrganizerWorkflowGuidance(input)` และ `tournamentOperationStatusLabel(status)`
- Produces from competition presentation: `tournamentCompetitionIssueLabel(issue)`

- [ ] **Step 1: Write the failing mapping tests**

```ts
import { describe, expect, it } from "vitest"

import { createOrganizerWorkflowGuidance } from "@/features/tournament-operations/presentation/organizer-workflow-guidance"

describe("createOrganizerWorkflowGuidance", () => {
  it.each([
    ["DRAFT", "ตรวจข้อมูลและส่งให้ Admin", "/organizer/tournaments/t-1"],
    ["CHANGES_REQUESTED", "แก้ไขตามข้อเสนอแนะ", "/organizer/tournaments/t-1"],
    ["APPROVED", "ตรวจข้อมูลก่อนเผยแพร่", "/organizer/tournaments/t-1"],
    ["PUBLISHED", "ตรวจทีมที่สมัคร", "/organizer/tournaments/t-1/registrations"],
    ["REGISTRATION_CLOSED", "เตรียมสายการแข่งขัน", "/organizer/tournaments/t-1/bracket"],
    ["IN_PROGRESS", "บันทึกผลการแข่งขัน", "/organizer/tournaments/t-1/results"],
    ["COMPLETED", "ตรวจผลและอันดับ", "/organizer/tournaments/t-1/results"],
    ["ARCHIVED", "ดูผลการแข่งขัน", "/organizer/tournaments/t-1/results"],
  ] as const)("maps %s to one navigation action", (status, label, href) => {
    const guidance = createOrganizerWorkflowGuidance({
      id: "t-1",
      status,
      governanceStatus: "ACTIVE",
      governanceReason: null,
    })

    expect(guidance.primaryAction).toEqual({ label, href })
    expect(guidance.blockers).toEqual([])
  })

  it.each(["SUBMITTED", "REJECTED", "SUSPENDED"] as const)(
    "keeps %s read-only",
    (status) => {
      expect(createOrganizerWorkflowGuidance({
        id: "t-1",
        status,
        governanceStatus: "ACTIVE",
        governanceReason: null,
      }).primaryAction).toBeNull()
    },
  )

  it("prioritizes governance suspension over lifecycle guidance", () => {
    const guidance = createOrganizerWorkflowGuidance({
      id: "t-1",
      status: "PUBLISHED",
      governanceStatus: "SUSPENDED",
      governanceReason: "รอตรวจสอบเอกสาร",
    })

    expect(guidance.primaryAction).toBeNull()
    expect(guidance.blockers).toEqual(["รอตรวจสอบเอกสาร"])
  })

  it("maps competition readiness issues without hiding the corrective page", () => {
    const guidance = createOrganizerWorkflowGuidance({
      id: "t-1",
      status: "REGISTRATION_CLOSED",
      governanceStatus: "ACTIVE",
      governanceReason: null,
      competitionIssues: ["BRACKET_MISSING", "ENTRY_COUNT_INVALID"],
    })

    expect(guidance.blockers).toEqual([
      "ยังไม่มีสายการแข่งขัน",
      "ต้องมีทีมอย่างน้อย 2 ทีม",
    ])
    expect(guidance.primaryAction?.href).toBe("/organizer/tournaments/t-1/bracket")
  })
})
```

เพิ่ม application test ยืนยันว่า role อื่นถูกปฏิเสธและ repository รับ owner id จาก Actor เท่านั้น:

```ts
const organizerActor = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
const teamManagerActor = createTestActor("manager-1", "TEAM_MANAGER_COACH")
const tournament: TournamentOperation = {
  id: "t-1",
  organizerId: organizerActor.id,
  title: "COURTSIDE Bracket Cup",
  description: "การแข่งขันตัวอย่าง",
  rules: "กติกามาตรฐาน",
  provinceCode: "10",
  province: "กรุงเทพมหานคร",
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE",
  ageGroup: "Open",
  startsAt: "2026-11-15T02:00:00.000Z",
  endsAt: "2026-11-16T11:00:00.000Z",
  registrationDeadline: "2026-11-01T16:59:00.000Z",
  capacity: 8,
  status: "REGISTRATION_CLOSED",
  governanceStatus: "ACTIVE",
  governanceReason: null,
  governanceUpdatedAt: null,
  version: 2,
  createdAt: "2026-08-24T01:00:00.000Z",
  updatedAt: "2026-08-24T02:00:00.000Z",
}
const closedContext: TournamentCompetitionLifecycleContext = {
  tournamentId: tournament.id,
  organizerId: organizerActor.id,
  status: "REGISTRATION_CLOSED",
  tournamentGovernanceStatus: "ACTIVE",
  version: tournament.version,
  activeBracket: null,
}

it("lists only the current organizer tournaments", async () => {
  const listByOrganizer = vi.fn(async () => [tournament])
  const findCompetitionLifecycleContext = vi.fn(async () => closedContext)
  await expect(listOwnedTournamentWorkflows(organizerActor, {
    tournaments: { listByOrganizer, findCompetitionLifecycleContext },
  })).resolves.toEqual([{
    tournament,
    competitionIssues: ["BRACKET_MISSING"],
  }])
  expect(listByOrganizer).toHaveBeenCalledWith(organizerActor.id)
  expect(findCompetitionLifecycleContext).toHaveBeenCalledWith(tournament.id)
})

it("rejects a team manager before reading the repository", async () => {
  const listByOrganizer = vi.fn()
  const findCompetitionLifecycleContext = vi.fn()
  await expect(listOwnedTournamentWorkflows(teamManagerActor, {
    tournaments: { listByOrganizer, findCompetitionLifecycleContext },
  })).rejects.toThrow("FORBIDDEN")
  expect(listByOrganizer).not.toHaveBeenCalled()
  expect(findCompetitionLifecycleContext).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run: `npm run test -- tests/features/tournament-operations/organizer-workflow-guidance.test.ts tests/features/tournament-operations/list-owned-tournament-workflows.test.ts`

Expected: FAIL เพราะยังไม่มี mapper และ application query

- [ ] **Step 3: Implement the pure mapper**

```ts
export interface WorkflowPrimaryAction {
  label: string
  href: string
}

export interface WorkflowGuidanceView {
  stageLabel: string
  description: string
  primaryAction: WorkflowPrimaryAction | null
  blockers: string[]
}
```

เก็บสอง interface ข้างต้นใน `features/workflow-guidance/presentation/workflow-guidance-view.ts` แล้วให้ mapper import type นี้:

```ts
import type { WorkflowGuidanceView } from "@/features/workflow-guidance/presentation/workflow-guidance-view"
import type { TournamentGovernanceStatus } from "../domain/tournament-governance-policy"
import type { TournamentOperationStatus } from "../domain/tournament-operation"

export function createOrganizerWorkflowGuidance(input: {
  id: string
  status: TournamentOperationStatus
  governanceStatus: TournamentGovernanceStatus
  governanceReason: string | null
  competitionIssues?: readonly TournamentCompetitionIssueCode[]
}): WorkflowGuidanceView {
  if (input.governanceStatus === "SUSPENDED") {
    return {
      stageLabel: "ระงับชั่วคราว",
      description: "รายการถูกหยุดดำเนินงานโดยผู้ดูแลระบบ",
      primaryAction: null,
      blockers: [input.governanceReason?.trim() || "รอผู้ดูแลระบบเปิดใช้งานรายการ"],
    }
  }

  if (input.governanceStatus === "REMOVED") {
    return {
      stageLabel: "นำออกแล้ว",
      description: "รายการนี้ไม่อยู่ในพื้นที่ดำเนินงานของผู้จัด",
      primaryAction: null,
      blockers: ["ติดต่อผู้ดูแลระบบหากต้องการตรวจสอบประวัติ"],
    }
  }

  const guidance = lifecycleGuidance[input.status](input.id)
  return {
    ...guidance,
    blockers: (input.competitionIssues ?? [])
      .slice(0, 2)
      .map(tournamentCompetitionIssueLabel),
  }
}
```

ย้าย `issueLabels` ที่มีอยู่ใน `TournamentCompetitionLifecyclePanel` ไปไว้ใน pure function `tournamentCompetitionIssueLabel(issue)` แล้วให้ทั้ง panel เดิมและ organizer mapper ใช้ function เดียวกัน ข้อความทุก code ต้องคงค่าเดิมเพื่อไม่ทำให้ UI regression

เพิ่ม application query ที่ไม่ import presentation:

```ts
export interface OwnedTournamentWorkflowItem {
  tournament: TournamentOperation
  competitionIssues: TournamentCompetitionIssueCode[]
}

export async function listOwnedTournamentWorkflows(
  actor: Actor,
  dependencies: {
    tournaments: Pick<
      TournamentOperationsRepository,
      "listByOrganizer" | "findCompetitionLifecycleContext"
    >
  },
): Promise<OwnedTournamentWorkflowItem[]> {
  authorize(actor, "tournament.read", { organizerId: actor.id })
  const tournaments = await dependencies.tournaments.listByOrganizer(actor.id)
  return Promise.all(tournaments.map(async (tournament) => {
    if (tournament.status !== "REGISTRATION_CLOSED" && tournament.status !== "IN_PROGRESS") {
      return { tournament, competitionIssues: [] }
    }
    const context = await dependencies.tournaments.findCompetitionLifecycleContext(tournament.id)
    const competitionIssues = !context
      ? []
      : tournament.status === "REGISTRATION_CLOSED"
        ? getStartIssues(context)
        : getCompletionIssues(context)
    return { tournament, competitionIssues }
  }))
}
```

เพิ่ม `lifecycleGuidance` แบบ exhaustive `Record<TournamentOperationStatus, (id: string) => WorkflowGuidanceView>` ให้ครบตามตารางนี้ โดยทุก object ใช้ `blockers: []`:

| Status | Stage label | Description | Primary action |
| --- | --- | --- | --- |
| `DRAFT` | ฉบับร่าง | กรอกข้อมูลรายการให้ครบก่อนส่งตรวจ | ตรวจข้อมูลและส่งให้ Admin -> details |
| `CHANGES_REQUESTED` | ต้องแก้ไข | ตรวจข้อเสนอแนะและปรับข้อมูลก่อนส่งใหม่ | แก้ไขตามข้อเสนอแนะ -> details |
| `SUBMITTED` | รอตรวจสอบ | Admin กำลังตรวจข้อมูลรายการ | ไม่มี |
| `APPROVED` | อนุมัติแล้ว | ตรวจวันรับสมัครก่อนเผยแพร่ | ตรวจข้อมูลก่อนเผยแพร่ -> details |
| `PUBLISHED` | เปิดรับสมัคร | ติดตามและพิจารณาทีมที่สมัคร | ตรวจทีมที่สมัคร -> registrations |
| `REGISTRATION_CLOSED` | ปิดรับสมัคร | เตรียมทีมและสายก่อนเริ่มแข่งขัน | เตรียมสายการแข่งขัน -> bracket |
| `IN_PROGRESS` | กำลังแข่งขัน | จัดตารางและยืนยันผลแต่ละคู่ | บันทึกผลการแข่งขัน -> results |
| `COMPLETED` | จบการแข่งขัน | ตรวจ Winner, Runner-up และอันดับ | ตรวจผลและอันดับ -> results |
| `ARCHIVED` | เก็บถาวร | รายการปิดการแก้ไขและยังดูผลได้ | ดูผลการแข่งขัน -> results |
| `REJECTED` | ไม่อนุมัติ | รายการนี้ไม่สามารถดำเนินการต่อ | ไม่มี |
| legacy `SUSPENDED` | ระงับแบบเดิม | ต้องให้ Admin ตรวจสถานะเดิมก่อน | ไม่มี |

details คือ `/organizer/tournaments/${id}` และ suffix อื่นใช้ `/registrations`, `/bracket`, `/results` ตามชื่อในตาราง Export `tournamentOperationStatusLabel` จาก label map เดียวกันเพื่อลด status copy ซ้ำใน Organizer UI

- [ ] **Step 4: Run tests and type-check through lint**

Run: `npm run test -- tests/features/tournament-operations/organizer-workflow-guidance.test.ts tests/features/tournament-operations/list-owned-tournament-workflows.test.ts tests/ui/organizer/tournament-competition-lifecycle-panel.test.tsx`

Expected: PASS ทุก mapping, suspended blocker และ read-only state

Run: `npm run lint -- features/workflow-guidance/presentation/workflow-guidance-view.ts features/competition/presentation/tournament-competition-issue-label.ts features/tournament-operations/application/list-owned-tournament-workflows.ts features/tournament-operations/presentation/organizer-workflow-guidance.ts components/organizer/tournament-competition-lifecycle-panel.tsx tests/features/tournament-operations/organizer-workflow-guidance.test.ts tests/features/tournament-operations/list-owned-tournament-workflows.test.ts`

Expected: PASS

- [ ] **Step 5: Commit Task 1**

```powershell
git add -- features/workflow-guidance/presentation/workflow-guidance-view.ts features/competition/presentation/tournament-competition-issue-label.ts features/tournament-operations/application/list-owned-tournament-workflows.ts features/tournament-operations/presentation/organizer-workflow-guidance.ts components/organizer/tournament-competition-lifecycle-panel.tsx tests/features/tournament-operations/organizer-workflow-guidance.test.ts tests/features/tournament-operations/list-owned-tournament-workflows.test.ts tests/ui/organizer/tournament-competition-lifecycle-panel.test.tsx
git commit -m "feat(workflow): map organizer next actions"
```

### Task 2: Organizer Dashboard Guidance UI

**Files:**
- Create: `components/workflow/workflow-next-action.tsx`
- Create: `tests/ui/workflow/workflow-next-action.test.tsx`
- Modify: `app/(admin)/organizer/page.tsx`

**Interfaces:**
- Consumes: `WorkflowGuidanceView` และ `createOrganizerWorkflowGuidance` จาก Task 1
- Produces: `WorkflowNextAction({ guidance, compact? })`

- [ ] **Step 1: Write the failing component tests**

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { WorkflowNextAction } from "@/components/workflow/workflow-next-action"

describe("WorkflowNextAction", () => {
  it("shows one primary action", () => {
    render(<WorkflowNextAction guidance={{
      stageLabel: "เปิดรับสมัคร",
      description: "ตรวจสอบทีมที่ส่งใบสมัครเข้ามา",
      blockers: [],
      primaryAction: { label: "ตรวจทีมที่สมัคร", href: "/organizer/tournaments/t-1/registrations" },
    }} />)

    expect(screen.getByText("เปิดรับสมัคร")).toBeTruthy()
    expect(screen.getAllByRole("link")).toHaveLength(1)
    expect(screen.getByRole("link", { name: "ตรวจทีมที่สมัคร" }).getAttribute("href"))
      .toBe("/organizer/tournaments/t-1/registrations")
  })

  it("shows blockers without an action", () => {
    render(<WorkflowNextAction guidance={{
      stageLabel: "ระงับชั่วคราว",
      description: "รายการถูกหยุดดำเนินงานโดยผู้ดูแลระบบ",
      blockers: ["รอตรวจสอบเอกสาร"],
      primaryAction: null,
    }} />)

    expect(screen.getByText("รอตรวจสอบเอกสาร")).toBeTruthy()
    expect(screen.queryByRole("link")).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test and confirm the missing-component failure**

Run: `npm run test -- tests/ui/workflow/workflow-next-action.test.tsx`

Expected: FAIL เพราะยังไม่มี `WorkflowNextAction`

- [ ] **Step 3: Implement the server-compatible component**

ใช้ `<section>` หรือ `<div>` แบบ unframed row, `CircleAlert` สำหรับ blocker และ `<Link>` เฉพาะเมื่อ `primaryAction !== null` Component ต้องไม่มี `"use client"`, ไม่รับ role และไม่คำนวณ permission ภายใน

```tsx
export function WorkflowNextAction({ guidance, compact = false }: {
  guidance: WorkflowGuidanceView
  compact?: boolean
}) {
  return (
    <div className={compact ? "grid min-w-0 gap-2" : "border-y border-border py-5"}>
      <p className="text-xs font-semibold text-court">{guidance.stageLabel}</p>
      <p className="text-sm text-muted-foreground">{guidance.description}</p>
      {guidance.blockers.map((blocker) => <p className="text-sm" key={blocker}>{blocker}</p>)}
      {guidance.primaryAction ? <Link href={guidance.primaryAction.href}>{guidance.primaryAction.label}</Link> : null}
    </div>
  )
}
```

- [ ] **Step 4: Integrate guidance into `/organizer`**

ใน `OrganizerPage` เรียก application query แทน `repository.listByOrganizer` โดยตรง แล้วสร้าง guidance:

```tsx
const workflowItems = await listOwnedTournamentWorkflows(actor, { tournaments: repository })
const rows = workflowItems.map(({ tournament, competitionIssues }) => ({
  tournament,
  guidance: createOrganizerWorkflowGuidance({ ...tournament, competitionIssues }),
}))
```

เปลี่ยนแต่ละแถวให้แสดง title/province, `WorkflowNextAction compact`, และใช้ action จาก mapper แทนปุ่ม `เปิดรายการ` แบบคงที่ Empty state เพิ่มลิงก์ `สร้างรายการแข่งขัน` ไป `/organizer/tournaments/new` แม้ header จะมี action เดียวกัน เพื่อให้ state นั้นจบในตัวและเข้าถึงได้บน mobile

- [ ] **Step 5: Run focused UI tests**

Run: `npm run test -- tests/ui/workflow/workflow-next-action.test.tsx tests/features/tournament-operations/organizer-workflow-guidance.test.ts`

Expected: PASS และแต่ละ context มี link ไม่เกินหนึ่งรายการ

- [ ] **Step 6: Commit Task 2**

```powershell
git add -- 'app/(admin)/organizer/page.tsx' components/workflow/workflow-next-action.tsx tests/ui/workflow/workflow-next-action.test.tsx
git commit -m "feat(organizer): show actionable tournament guidance"
```

### Task 3: Tournament Workspace Progress Navigation

**Files:**
- Create: `components/organizer/tournament-workflow-progress.tsx`
- Create: `tests/ui/organizer/tournament-workflow-progress.test.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/page.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/registrations/page.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/bracket/page.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/schedule/page.tsx`
- Modify: `app/(admin)/organizer/tournaments/[id]/results/page.tsx`
- Delete: `components/organizer/competition-workspace-nav.tsx`

**Interfaces:**
- Consumes: `TournamentOperationStatus` และ `tournamentOperationStatusLabel` จาก Task 1
- Produces: `TournamentWorkflowSection` และ `TournamentWorkflowProgress({ tournamentId, currentSection, status })`

- [ ] **Step 1: Write the failing navigation tests**

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TournamentWorkflowProgress } from "@/components/organizer/tournament-workflow-progress"

describe("TournamentWorkflowProgress", () => {
  it("renders five stable links and marks the current section", () => {
    render(<TournamentWorkflowProgress
      currentSection="bracket"
      status="REGISTRATION_CLOSED"
      tournamentId="t-1"
    />)

    expect(screen.getAllByRole("link")).toHaveLength(5)
    expect(screen.getByRole("link", { name: "สายการแข่งขัน" }).getAttribute("aria-current"))
      .toBe("step")
    expect(screen.getByText("ปิดรับสมัคร")).toBeTruthy()
  })

  it("keeps the step list inside its own horizontal scroller", () => {
    const { container } = render(<TournamentWorkflowProgress
      currentSection="details"
      status="DRAFT"
      tournamentId="t-1"
    />)

    expect(container.querySelector("nav")?.className).toContain("overflow-x-auto")
    expect(container.querySelector("ol")?.className).toContain("min-w-max")
  })
})
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `npm run test -- tests/ui/organizer/tournament-workflow-progress.test.tsx`

Expected: FAIL เพราะ component ยังไม่มี

- [ ] **Step 3: Implement the progress component**

```ts
export type TournamentWorkflowSection =
  | "details"
  | "registrations"
  | "bracket"
  | "schedule"
  | "results"

const workflowSteps: ReadonlyArray<{
  id: TournamentWorkflowSection
  label: string
  suffix: string
}> = [
  { id: "details", label: "ข้อมูลรายการ", suffix: "" },
  { id: "registrations", label: "ทีมสมัคร", suffix: "/registrations" },
  { id: "bracket", label: "สายการแข่งขัน", suffix: "/bracket" },
  { id: "schedule", label: "ตารางแข่งขัน", suffix: "/schedule" },
  { id: "results", label: "ผลการแข่งขัน", suffix: "/results" },
]
```

กำหนด step array ที่มี label และ suffix คงที่ สร้าง href จาก `tournamentId`, ใส่
`aria-current="step"` เฉพาะ `currentSection`, แสดง lifecycle label แยกจาก active page,
และใช้ `overflow-x-auto` ที่ `<nav>` กับ `min-w-max` ที่ `<ol>` เพื่อจำกัดการเลื่อนในพื้นที่ navigation

- [ ] **Step 4: Replace every workspace navigation call**

ส่ง props ต่อไปนี้จากแต่ละ page:

```tsx
<TournamentWorkflowProgress
  currentSection="schedule"
  status={workspace.tournament.status}
  tournamentId={workspace.tournament.id}
/>
```

ใช้ค่า `details`, `registrations`, `bracket`, `schedule`, `results` ให้ตรง page ตามลำดับ สำหรับ registration page ใช้ `review.tournament.status` และ `review.tournament.id` หลังเพิ่ม progress แล้วจึงลบ `CompetitionWorkspaceNav` เมื่อ `rg -n "CompetitionWorkspaceNav" app components` ไม่พบ caller

- [ ] **Step 5: Run navigation and protected-workspace regressions**

Run: `npm run test -- tests/ui/organizer/tournament-workflow-progress.test.tsx tests/ui/organizer/tournament-governance-state-pages.test.tsx tests/ui/organizer/tournament-registrations-page.test.tsx`

Expected: PASS และ suspended/removed behavior เดิมไม่เปลี่ยน

Run: `npm run lint -- components/organizer/tournament-workflow-progress.tsx 'app/(admin)/organizer/tournaments/[id]'`

Expected: PASS

- [ ] **Step 6: Commit Task 3**

```powershell
git add -- components/organizer/tournament-workflow-progress.tsx components/organizer/competition-workspace-nav.tsx tests/ui/organizer/tournament-workflow-progress.test.tsx 'app/(admin)/organizer/tournaments/[id]'
git commit -m "feat(organizer): add tournament workflow progress"
```

### Task 4: Team Readiness And Registration Guidance

**Files:**
- Create: `features/team-management/presentation/team-workflow-guidance.ts`
- Create: `tests/features/team-management/team-workflow-guidance.test.ts`
- Modify: `features/team-management/domain/team-policy.ts`
- Modify: `features/registrations/application/ports/registration-repository.ts`
- Modify: `features/registrations/infrastructure/prisma-registration-repository.ts`
- Modify: `app/(admin)/team/page.tsx`
- Modify: `components/team/team-list.tsx`
- Modify: `tests/features/registrations/prisma-registration-repository.test.ts`
- Modify: `tests/ui/team/team-list.test.tsx`

**Interfaces:**
- Produces from domain: `getMinimumRosterSize(format: TeamFormat): number`
- Extends: `TeamRegistrationListItem` with `tournamentSlug`, `tournamentStatus`, `tournamentGovernanceStatus`
- Produces from presentation: `createTeamWorkflowGuidance(input): WorkflowGuidanceView`

- [ ] **Step 1: Write failing team mapper tests**

```ts
import { describe, expect, it } from "vitest"
import { createTeamWorkflowGuidance } from "@/features/team-management/presentation/team-workflow-guidance"

describe("createTeamWorkflowGuidance", () => {
  it("asks an incomplete 5v5 team to add players", () => {
    const guidance = createTeamWorkflowGuidance({
      team: { id: "team-1", format: "FIVE_V_FIVE", isActive: true },
      activePlayerCount: 4,
      registrations: [],
    })
    expect(guidance.description).toContain("4/5")
    expect(guidance.primaryAction).toEqual({ label: "เพิ่มผู้เล่น", href: "/team/team-1" })
  })

  it("prioritizes a pending registration", () => {
    const guidance = createTeamWorkflowGuidance({
      team: { id: "team-1", format: "THREE_V_THREE", isActive: true },
      activePlayerCount: 3,
      registrations: [{
        status: "PENDING",
        tournamentSlug: "registration-cup",
        tournamentStatus: "PUBLISHED",
        tournamentGovernanceStatus: "ACTIVE",
      }],
    })
    expect(guidance.primaryAction).toEqual({ label: "ตรวจสถานะการสมัคร", href: "/team/team-1#registrations" })
  })

  it.each([
    ["REGISTRATION_CLOSED", "ดูสายการแข่งขัน", "/bracket?tournament=bracket-cup"],
    ["IN_PROGRESS", "ดูตารางแข่งขัน", "/schedule?tournament=bracket-cup"],
    ["COMPLETED", "ดูผลการแข่งขัน", "/results?tournament=bracket-cup"],
  ] as const)("links an approved team in %s to public progress", (tournamentStatus, label, href) => {
    const guidance = createTeamWorkflowGuidance({
      team: { id: "team-1", format: "THREE_V_THREE", isActive: true },
      activePlayerCount: 3,
      registrations: [{ status: "APPROVED", tournamentSlug: "bracket-cup", tournamentStatus, tournamentGovernanceStatus: "ACTIVE" }],
    })
    expect(guidance.primaryAction).toEqual({ label, href })
  })

  it("keeps inactive teams read-only", () => {
    const guidance = createTeamWorkflowGuidance({
      team: { id: "team-1", format: "THREE_V_THREE", isActive: false },
      activePlayerCount: 3,
      registrations: [],
    })
    expect(guidance.primaryAction).toBeNull()
  })
})
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm run test -- tests/features/team-management/team-workflow-guidance.test.ts`

Expected: FAIL เพราะ mapper และ public minimum roster helper ยังไม่มี

- [ ] **Step 3: Expose roster minimum without duplicating policy**

ใน `team-policy.ts`:

```ts
export function getMinimumRosterSize(format: TeamFormat): number {
  return minimumPlayersByFormat[format]
}
```

ให้ `assertMinimumActivePlayerCount` เรียก helper นี้ เพื่อให้ mapper และ validation ใช้ source เดียวกัน

- [ ] **Step 4: Extend the registration read projection**

เพิ่มใน `TeamRegistrationListItem`:

```ts
tournamentSlug: string
tournamentStatus: RegistrationTournamentStatus
tournamentGovernanceStatus: TournamentGovernanceStatus
```

เปลี่ยน Prisma include เป็น:

```ts
tournament: {
  select: { title: true, slug: true, status: true, governanceStatus: true },
}
```

และ map ทั้งสามค่าโดยไม่เปลี่ยน mutation contract จากนั้นปรับ fixture ใน repository และ component tests ที่สร้าง `TeamRegistrationListItem`

- [ ] **Step 5: Implement the pure team guidance mapper**

Mapper ต้องเรียง priority เป็น inactive, roster incomplete, pending registration, approved active tournament, browse tournaments เลือก approved registration ตัวแรกจาก array ที่ repository เรียง `createdAt desc`; ข้ามรายการ governance ที่ไม่ใช่ `ACTIVE`

```ts
export interface TeamWorkflowGuidanceInput {
  team: Pick<TeamSummary, "id" | "format" | "isActive">
  activePlayerCount: number
  registrations: ReadonlyArray<Pick<
    TeamRegistrationListItem,
    "status" | "tournamentSlug" | "tournamentStatus" | "tournamentGovernanceStatus"
  >>
}

export function createTeamWorkflowGuidance(input: TeamWorkflowGuidanceInput): WorkflowGuidanceView {
  if (!input.team.isActive) return readOnlyTeamGuidance
  const minimum = getMinimumRosterSize(input.team.format)
  if (input.activePlayerCount < minimum) return incompleteRosterGuidance(input, minimum)
  const pending = input.registrations.find((item) => item.status === "PENDING")
  if (pending) return pendingRegistrationGuidance(input.team.id)
  const approved = input.registrations.find((item) =>
    item.status === "APPROVED" && item.tournamentGovernanceStatus === "ACTIVE")
  return approved ? approvedTournamentGuidance(approved) : browseTournamentGuidance
}
```

- [ ] **Step 6: Load registration summaries and render team guidance**

ใน Team page โหลดแต่ละ workspace และ registration list ภายใน `Promise.all` เดียว:

```ts
const workspaces = await Promise.all(teams.map(async (team) => {
  const [workspace, registrations] = await Promise.all([
    getOwnedTeamWorkspace(team.id, actor, { teams: teamRepository }),
    listOwnedTeamRegistrations(team.id, actor, { registrations: registrationRepository }),
  ])
  return { ...workspace, registrations }
}))
```

ส่ง guidance ที่สร้างจาก active player count และ registrations เข้า `WorkflowNextAction compact` ใน `TeamList` โดยคงชื่อ รูปแบบ จำนวนผู้เล่น และ active status เดิม

- [ ] **Step 7: Run focused domain, repository, and UI tests**

Run: `npm run test -- tests/features/team-management/team-workflow-guidance.test.ts tests/features/team-management/team-policy.test.ts tests/features/registrations/prisma-registration-repository.test.ts tests/ui/team/team-list.test.tsx`

Expected: PASS สำหรับ 3v3/5v5 minimum, registration projection, action priority และ inactive state

- [ ] **Step 8: Commit Task 4**

```powershell
git add -- 'app/(admin)/team/page.tsx' components/team/team-list.tsx features/team-management/domain/team-policy.ts features/team-management/presentation/team-workflow-guidance.ts features/registrations/application/ports/registration-repository.ts features/registrations/infrastructure/prisma-registration-repository.ts tests/features/team-management/team-workflow-guidance.test.ts tests/features/registrations/prisma-registration-repository.test.ts tests/ui/team/team-list.test.tsx
git commit -m "feat(team): guide managers through roster and registrations"
```

### Task 5: Admin Review And Governance Work Queues

**Files:**
- Modify: `features/admin/application/ports/admin-dashboard-repository.ts`
- Modify: `features/admin/infrastructure/prisma-admin-dashboard-repository.ts`
- Modify: `features/admin/presentation/admin-dashboard-view-model.ts`
- Modify: `components/admin/admin-dashboard.tsx`
- Modify: `components/admin/tournament-review-panel.tsx`
- Modify: `tests/features/admin/admin-dashboard.test.ts`
- Modify: `tests/ui/admin/admin-dashboard.test.tsx`
- Modify: `tests/ui/admin/tournament-review-panel.test.tsx`

**Interfaces:**
- Adds: `AdminDashboardTaskItem`
- Extends: `AdminDashboardReadModel` with `reviewQueue` and `governanceQueue`
- Extends: `AdminDashboardViewModel` with view-ready queues and exact href

- [ ] **Step 1: Update tests first with the new read model contract**

```ts
export interface AdminDashboardTaskItem {
  id: string
  title: string
  organizerName: string
  status: string
  governanceReason: string | null
  updatedAt: string
}

export interface AdminDashboardReadModel {
  metrics: AdminDashboardMetrics
  reviewQueue: AdminDashboardTaskItem[]
  governanceQueue: AdminDashboardTaskItem[]
  recentAudits: AdminDashboardAudit[]
}
```

ใน test repository คาดว่า `tournament.findMany` ถูกเรียกสองครั้งด้วย `take: 4`, review query ใช้ `status: "SUBMITTED", governanceStatus: "ACTIVE"` และ governance query ใช้ `governanceStatus: "SUSPENDED"`

ใน UI test ยืนยันหัวข้อ `งานที่ต้องตรวจ`, รายการ `COURTSIDE Review Cup`, link `/admin/reviews/tournament-submitted`, หัวข้อ `รายการที่ถูกระงับ` และ link `/admin/tournaments/tournament-suspended`

เพิ่ม test ใน `tournament-review-panel.test.tsx` หลัง API ตอบ `200`:

```tsx
expect(
  (await screen.findByRole("link", { name: "กลับคิวตรวจสอบ" })).getAttribute("href"),
).toBe("/admin/reviews")
expect(screen.getByRole("status").textContent).toContain("อนุมัติรายการแล้ว")
```

- [ ] **Step 2: Run focused admin tests and confirm contract failures**

Run: `npm run test -- tests/features/admin/admin-dashboard.test.ts tests/ui/admin/admin-dashboard.test.tsx tests/ui/admin/tournament-review-panel.test.tsx`

Expected: FAIL เพราะ read model และ UI ยังไม่มี queues

- [ ] **Step 3: Implement bounded Prisma projections**

เพิ่มสอง query เข้า `Promise.all` เดิม:

```ts
const taskItemSelect = {
  id: true,
  title: true,
  status: true,
  governanceReason: true,
  updatedAt: true,
  organizer: { select: { displayName: true } },
} as const

this.prisma.tournament.findMany({
  where: { status: "SUBMITTED", governanceStatus: "ACTIVE" },
  orderBy: { updatedAt: "asc" },
  take: 4,
  select: taskItemSelect,
})

this.prisma.tournament.findMany({
  where: { governanceStatus: "SUSPENDED" },
  orderBy: { governanceUpdatedAt: "desc" },
  take: 4,
  select: taskItemSelect,
})
```

`taskItemSelect` เลือก `id`, `title`, `status`, `governanceReason`, `updatedAt` และ `organizer.displayName` เท่านั้น จากนั้น map Date เป็น ISO string

- [ ] **Step 4: Map queues to view-ready Thai content**

View model ของ review item ใช้ label `ตรวจรายการ`, href `/admin/reviews/${id}` และเวลาส่งตรวจ ส่วน governance item ใช้ label `เปิดหน้ากำกับ`, href `/admin/tournaments/${id}` และเหตุผลหรือ `ไม่ระบุเหตุผลล่าสุด`

- [ ] **Step 5: Render operational queues before metric tiles**

ใน `AdminDashboard` เรียง section เป็น header, review queue, governance queue เมื่อมีรายการ, metrics และ recent audits ใช้ row/divider layout ไม่สร้าง nested cards Empty review queue แสดง `ไม่มีรายการรอตรวจ` และยังคง link `/admin/reviews` ใน header

- [ ] **Step 6: Add post-review navigation and run focused tests**

หลัง mutation สำเร็จ ให้ `TournamentReviewPanel` คงข้อความสำเร็จใน element `role="status"` และแสดง Link `กลับคิวตรวจสอบ` ไป `/admin/reviews` โดยไม่ redirect อัตโนมัติ ผู้ใช้จึงอ่านข้อความผลลัพธ์ได้ก่อนออกจากหน้า

Run: `npm run test -- tests/features/admin/admin-dashboard.test.ts tests/ui/admin/admin-dashboard.test.tsx tests/ui/admin/tournament-review-panel.test.tsx`

Expected: PASS สำหรับ bounded query, queue ordering, empty copy, href และ post-review navigation

- [ ] **Step 7: Commit Task 5**

```powershell
git add -- components/admin/admin-dashboard.tsx components/admin/tournament-review-panel.tsx features/admin/application/ports/admin-dashboard-repository.ts features/admin/infrastructure/prisma-admin-dashboard-repository.ts features/admin/presentation/admin-dashboard-view-model.ts tests/features/admin/admin-dashboard.test.ts tests/ui/admin/admin-dashboard.test.tsx tests/ui/admin/tournament-review-panel.test.tsx
git commit -m "feat(admin): prioritize review and governance queues"
```

### Task 6: Idempotent Six-Checkpoint Demo Data

**Files:**
- Create: `features/demo-data/infrastructure/demo-workflow-fixtures.ts`
- Create: `tests/features/demo-data/demo-workflow-fixtures.test.ts`
- Modify: `prisma/seed.ts`
- Modify: `features/competition/infrastructure/demo-competition-fixtures.ts`
- Modify: `scripts/seed-competition-demos.ts`
- Modify: `tests/features/competition/demo-competition-fixtures.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `demoWorkflowTournaments`, `demoRegistrationScenarios`, `assertDemoEnvironment(environment)`
- Extends: `DemoCompetitionFixture["tournamentId"]` ให้รองรับ `tournament-closed`
- Produces command: `npm run seed:demo`

- [ ] **Step 1: Write fixture tests before changing seed behavior**

```ts
import { describe, expect, it } from "vitest"
import {
  assertDemoEnvironment,
  demoWorkflowTournaments,
} from "@/features/demo-data/infrastructure/demo-workflow-fixtures"

describe("workflow demo fixtures", () => {
  it("defines six stable checkpoints", () => {
    expect(demoWorkflowTournaments.map(({ id, title, status }) => ({ id, title, status })))
      .toEqual([
        { id: "tournament-draft", title: "COURTSIDE Draft Cup", status: "DRAFT" },
        { id: "tournament-submitted", title: "COURTSIDE Review Cup", status: "SUBMITTED" },
        { id: "tournament-published", title: "COURTSIDE Registration Cup", status: "PUBLISHED" },
        { id: "tournament-closed", title: "COURTSIDE Bracket Cup", status: "REGISTRATION_CLOSED" },
        { id: "tournament-ongoing", title: "COURTSIDE Live Cup", status: "IN_PROGRESS" },
        { id: "tournament-completed", title: "COURTSIDE Championship", status: "COMPLETED" },
      ])
    expect(new Set(demoWorkflowTournaments.map(({ id }) => id)).size).toBe(6)
    expect(new Set(demoWorkflowTournaments.map(({ slug }) => slug)).size).toBe(6)
  })

  it("rejects an explicitly production environment", () => {
    expect(() => assertDemoEnvironment({ NODE_ENV: "production" })).toThrow("DEMO_SEED_PRODUCTION_BLOCKED")
    expect(() => assertDemoEnvironment({ VERCEL_ENV: "production" })).toThrow("DEMO_SEED_PRODUCTION_BLOCKED")
  })
})
```

เพิ่ม test ใน `demo-competition-fixtures.test.ts` ว่า `tournament-closed` มี 4 ทีม, bracket published, 3 matches และทุก match ยังเป็น `SCHEDULED`

- [ ] **Step 2: Run fixture tests and confirm failures**

Run: `npm run test -- tests/features/demo-data/demo-workflow-fixtures.test.ts tests/features/competition/demo-competition-fixtures.test.ts`

Expected: FAIL เพราะ checkpoint fixture และ Bracket Cup ยังไม่มี

- [ ] **Step 3: Define stable demo checkpoints and environment guard**

สร้าง readonly definitions ที่มี id, slug, title, status, organizerId, format และ location ครบ 6 รายการ ใช้ `THREE_V_THREE` อย่างน้อยหนึ่งรายการ และ export:

```ts
export function assertDemoEnvironment(environment: NodeJS.ProcessEnv): void {
  if (environment.NODE_ENV === "production" || environment.VERCEL_ENV === "production") {
    throw new Error("DEMO_SEED_PRODUCTION_BLOCKED")
  }
}
```

ใช้ checkpoint metadata ต่อไปนี้ โดยทุกวันเวลาใช้ค่าเดิมของ seed ปัจจุบันและ province code `10`:

| ID | Slug | Organizer | Format |
| --- | --- | --- | --- |
| `tournament-draft` | `courtside-draft-cup` | `organizer-1` | `THREE_V_THREE` |
| `tournament-submitted` | `courtside-review-cup` | `organizer-1` | `FIVE_V_FIVE` |
| `tournament-published` | `courtside-registration-cup` | `organizer-1` | `FIVE_V_FIVE` |
| `tournament-closed` | `courtside-bracket-cup` | `organizer-1` | `FIVE_V_FIVE` |
| `tournament-ongoing` | `courtside-live-cup` | `organizer-1` | `FIVE_V_FIVE` |
| `tournament-completed` | `courtside-championship` | `organizer-1` | `FIVE_V_FIVE` |

สร้าง `demoRegistrationScenarios` สำหรับ Registration Cup ด้วย stable records:

| Team ID | Registration ID | Status |
| --- | --- | --- |
| `demo-registration-team-pending` | `demo-registration-pending` | `PENDING` |
| `demo-registration-team-approved` | `demo-registration-approved` | `APPROVED` |
| `demo-registration-team-rejected` | `demo-registration-rejected` | `REJECTED` |

ทุกทีมใช้ `FIVE_V_FIVE`, owner `team-manager-1`, มี active players อย่างน้อย 5 คน และ record ที่ถูกปฏิเสธใช้ `decisionNote: "เอกสารทีมยังไม่ครบ"` ค่า `createdAt`, `decidedAt` และวันที่อื่นที่ fixture ควบคุมต้องเป็น ISO timestamp คงที่ ห้ามใช้ `new Date()` โดยไม่มี argument ในข้อมูลเดโม

- [ ] **Step 4: Make base seed use the definitions with upsert only**

เรียก `assertDemoEnvironment(process.env)` ก่อนเชื่อมฐานข้อมูล เปลี่ยน tournament array เดิมให้ import `demoWorkflowTournaments`, upsert ด้วย stable id/slug และสร้าง team/player/registration scenario ด้วย `upsert` ทุก record ห้ามใช้ `deleteMany` ใน `prisma/seed.ts`

ผู้เล่นใช้ชื่อสมมติ วันเกิดคงที่ และจำนวนขั้นต่ำตรงกับ team format สร้างทีมตัวอย่างทั้ง 3v3 และ 5v5 ภายใต้ `team-manager-1`

- [ ] **Step 5: Extend competition fixtures for Bracket Cup**

เพิ่ม definition:

```ts
{
  tournamentId: "tournament-closed",
  tournamentSlug: "courtside-bracket-cup",
  prefix: "demo-bracket",
  generationMethod: "SEEDED",
  teamNames: ["Bangkok Pivot", "Thonburi Five", "Nonthaburi Drive", "Pathum Press"],
  completedScores: [],
  startsAt: "2026-11-15T02:00:00.000Z",
}
```

ปรับ slug ของ ongoing/completed ให้ตรง `courtside-live-cup` และ `courtside-championship` จาก stable definitions กำหนด `publishedAt`, `decidedAt` และ Audit timestamp เป็น `2026-08-24T03:00:00.000Z` แทนเวลาปัจจุบัน การลบ bracket ใน script ยังคงอนุญาตเฉพาะ `fixture.bracketId` หลัง `assertOnlyDemoRows` ตรวจว่าไม่มี user-owned rows

- [ ] **Step 6: Add the unified demo command**

เพิ่ม production guard ใน `scripts/seed-competition-demos.ts` และเพิ่ม package script:

```json
"seed:demo": "npm run prisma:seed && npm run seed:competition-demos"
```

คง `seed:competition-demos` ไว้เพื่อ backward compatibility

- [ ] **Step 7: Verify fixture tests and idempotence**

Run: `npm run test -- tests/features/demo-data/demo-workflow-fixtures.test.ts tests/features/competition/demo-competition-fixtures.test.ts`

Expected: PASS

เมื่อ development database พร้อม:

Run: `npm run seed:demo`

Expected: สร้าง checkpoints ทั้ง 6 โดยไม่มี error

Run: `npm run seed:demo`

Expected: สำเร็จครั้งที่สองโดยไม่มี unique constraint error และจำนวน tournament IDs ทั้ง 6 ไม่เพิ่ม

หาก database ไม่พร้อม ให้บันทึกข้อจำกัดไว้ใน handoff และไม่อ้างว่า integration seed ผ่าน

- [ ] **Step 8: Commit Task 6**

```powershell
git add -- package.json prisma/seed.ts scripts/seed-competition-demos.ts features/demo-data/infrastructure/demo-workflow-fixtures.ts features/competition/infrastructure/demo-competition-fixtures.ts tests/features/demo-data/demo-workflow-fixtures.test.ts tests/features/competition/demo-competition-fixtures.test.ts
git commit -m "feat(demo): seed six workflow checkpoints"
```

### Task 7: Roadmap, Full Verification, And Browser Demo Audit

**Files:**
- Modify: `docs/ROADMAP.md`

**Interfaces:**
- Consumes all deliverables from Tasks 1-6
- Produces a verified 20-25 minute demo path and authoritative roadmap status

- [ ] **Step 1: Update the authoritative Roadmap**

เพิ่มใน `เสร็จแล้ว` หลัง verification:

```md
- Workflow Guidance สำหรับ Organizer, Platform Admin และ Team Manager/Coach พร้อมงานถัดไป blocker ภาษาไทย แถบขั้นตอน Tournament และชุดข้อมูลเดโม 6 checkpoint แบบ idempotent
```

เปลี่ยน `ลำดับการส่งมอบถัดไป` เป็น:

```md
1. **Final demo UX และข้อมูลนำเสนอ** — ทบทวนข้อความ เส้นทางสาธิต และข้อมูลที่ใช้ในวันนำเสนอ
2. **Remaining media และ notification delivery** — ทำเฉพาะส่วนที่จำเป็นต่อการส่งมอบหลัง workflow หลักนิ่งแล้ว
3. **Authentication hardening, monitoring และ deployment** — ทำ email verification, production configuration, observability และลิงก์ออนไลน์ในช่วงเตรียมใช้งานจริง
```

คง Email Verification ใน `กำลังพัฒนา` และระบุว่าพักไว้ตามลำดับความสำคัญ ไม่ลบออกจาก Roadmap

- [ ] **Step 2: Run all focused workflow suites together**

Run:

```powershell
npm run test -- tests/features/tournament-operations/list-owned-tournament-workflows.test.ts tests/features/tournament-operations/organizer-workflow-guidance.test.ts tests/ui/organizer/tournament-competition-lifecycle-panel.test.tsx tests/ui/workflow/workflow-next-action.test.tsx tests/ui/organizer/tournament-workflow-progress.test.tsx tests/features/team-management/team-workflow-guidance.test.ts tests/features/team-management/team-policy.test.ts tests/features/registrations/prisma-registration-repository.test.ts tests/ui/team/team-list.test.tsx tests/features/admin/admin-dashboard.test.ts tests/ui/admin/admin-dashboard.test.tsx tests/ui/admin/tournament-review-panel.test.tsx tests/features/demo-data/demo-workflow-fixtures.test.ts tests/features/competition/demo-competition-fixtures.test.ts
```

Expected: PASS ทุกไฟล์

- [ ] **Step 3: Run project-wide verification**

```powershell
npm run test
npm run lint
npm run build
npx prisma validate
git diff --check
git status --short
```

Expected: test, lint, build, Prisma validation และ diff check ผ่าน; status แสดงเฉพาะไฟล์ใน Task 7 และ untracked local tooling ที่มีอยู่ก่อนเริ่มงาน

- [ ] **Step 4: Start the app and perform responsive browser checks**

Run: `npm run dev`

ตรวจด้วย session ของแต่ละ role:

- Organizer: `/organizer`, Draft Cup, Registration Cup, Bracket Cup, Live Cup และ Championship
- Admin: `/admin`, `/admin/reviews`, Review Cup และ governance queue เมื่อมี suspended fixture
- Team Manager/Coach: `/team`, incomplete team, ready team, pending registration และ approved registration link
- Public: `/tournaments/courtside-championship`, `/schedule?tournament=courtside-live-cup`, `/bracket?tournament=courtside-bracket-cup`, `/results?tournament=courtside-championship`

ที่ viewport `375x812`, `768x1024`, `1440x900` ตรวจว่า navigation หลักไม่เลื่อนแนวนอน, progress scroller อยู่ในขอบเขตตนเอง, ภาษาไทยไม่ซ้อน, primary action ไม่เกินหนึ่ง, focus ใช้งานได้ และ light/dark mode อ่านได้

- [ ] **Step 5: Walk the timed demo route**

จับเวลาเส้นทาง Organizer -> Admin -> Team Manager/Coach -> Registration Cup -> Bracket Cup -> Live Cup -> Championship เป้าหมาย 20-25 นาที ทุก checkpoint ต้องเปิดตรงได้และห้ามพึ่ง email delivery

- [ ] **Step 6: Commit the Roadmap update**

```powershell
git add -- docs/ROADMAP.md
git commit -m "docs(roadmap): record workflow demo readiness"
```

- [ ] **Step 7: Final repository audit**

Run:

```powershell
git log --oneline -8
git status --short
git diff HEAD~7..HEAD --check
```

Expected: มี commit แยกตาม Task, ไม่มี secret หรือ generated output และ untracked local tooling ไม่ถูก stage
