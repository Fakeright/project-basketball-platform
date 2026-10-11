import { describe, expect, it } from "vitest"

import { createOrganizerWorkflowGuidance } from "@/features/tournament-operations/presentation/organizer-workflow-guidance"

describe("createOrganizerWorkflowGuidance", () => {
  it.each([
    ["DRAFT", "ตรวจข้อมูลและส่งให้ Admin", "/organizer/tournaments/t-1"],
    [
      "CHANGES_REQUESTED",
      "แก้ไขตามข้อเสนอแนะ",
      "/organizer/tournaments/t-1",
    ],
    ["APPROVED", "ตรวจข้อมูลก่อนเผยแพร่", "/organizer/tournaments/t-1"],
    ["PUBLISHED", "ตรวจทีมที่สมัคร", "/organizer/tournaments/t-1/registrations"],
    [
      "REGISTRATION_CLOSED",
      "เตรียมสายการแข่งขัน",
      "/organizer/tournaments/t-1/bracket",
    ],
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
      expect(
        createOrganizerWorkflowGuidance({
          id: "t-1",
          status,
          governanceStatus: "ACTIVE",
          governanceReason: null,
        }).primaryAction,
      ).toBeNull()
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
    expect(guidance.primaryAction?.href).toBe(
      "/organizer/tournaments/t-1/bracket",
    )
  })
})
