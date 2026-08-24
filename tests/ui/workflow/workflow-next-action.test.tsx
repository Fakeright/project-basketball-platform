import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { WorkflowNextAction } from "@/components/workflow/workflow-next-action"

afterEach(cleanup)

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
