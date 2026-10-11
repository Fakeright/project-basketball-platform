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
    expect(guidance.primaryAction).toEqual({
      label: "เพิ่มผู้เล่น",
      href: "/team/team-1",
    })
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

    expect(guidance.primaryAction).toEqual({
      label: "ตรวจสถานะการสมัคร",
      href: "/team/team-1#registrations",
    })
  })

  it.each([
    ["REGISTRATION_CLOSED", "ดูสายการแข่งขัน", "/bracket?tournament=bracket-cup"],
    ["IN_PROGRESS", "ดูตารางแข่งขัน", "/schedule?tournament=bracket-cup"],
    ["COMPLETED", "ดูผลการแข่งขัน", "/results?tournament=bracket-cup"],
  ] as const)(
    "links an approved team in %s to public progress",
    (tournamentStatus, label, href) => {
      const guidance = createTeamWorkflowGuidance({
        team: { id: "team-1", format: "THREE_V_THREE", isActive: true },
        activePlayerCount: 3,
        registrations: [{
          status: "APPROVED",
          tournamentSlug: "bracket-cup",
          tournamentStatus,
          tournamentGovernanceStatus: "ACTIVE",
        }],
      })

      expect(guidance.primaryAction).toEqual({ label, href })
    },
  )

  it("keeps inactive teams read-only", () => {
    const guidance = createTeamWorkflowGuidance({
      team: { id: "team-1", format: "THREE_V_THREE", isActive: false },
      activePlayerCount: 3,
      registrations: [],
    })

    expect(guidance.primaryAction).toBeNull()
  })
})
