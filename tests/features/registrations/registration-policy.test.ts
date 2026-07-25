import { describe, expect, it } from "vitest"

import { assertCanApply, transitionRegistration } from "@/features/registrations/domain/registration-policy"
import type { TeamRosterMember, TeamSummary } from "@/features/team-management/domain/team"

const team: TeamSummary = {
  id: "team-1",
  name: "Bangkok Ballers",
  province: "Bangkok",
  ownerId: "manager-1",
}

const roster: TeamRosterMember[] = Array.from({ length: 5 }, (_, index) => ({
  id: `player-${index + 1}`,
  userId: `user-${index + 1}`,
  role: "PLAYER",
  isActive: true,
  deactivatedAt: null,
}))

const eligibleApplication = {
  actorId: "manager-1",
  team,
  roster,
  tournament: {
    format: "FIVE_V_FIVE" as const,
    status: "PUBLISHED",
    registrationDeadline: "2026-07-26T12:00:00.000Z",
  },
  hasActiveRegistration: false,
  now: new Date("2026-07-26T11:59:59.999Z"),
}

describe("assertCanApply", () => {
  it("allows an owned team with an eligible roster before the deadline", () => {
    expect(() => assertCanApply(eligibleApplication)).not.toThrow()
  })

  it("rejects an application after the registration deadline", () => {
    expect(() =>
      assertCanApply({
        ...eligibleApplication,
        now: new Date("2026-07-26T12:00:00.001Z"),
      }),
    ).toThrow("REGISTRATION_DEADLINE_PASSED")
  })

  it("rejects a team manager who does not own the team", () => {
    expect(() =>
      assertCanApply({
        ...eligibleApplication,
        actorId: "manager-2",
      }),
    ).toThrow("TEAM_NOT_OWNED")
  })

  it("rejects an active attempt for the same team and tournament", () => {
    expect(() =>
      assertCanApply({
        ...eligibleApplication,
        hasActiveRegistration: true,
      }),
    ).toThrow("REGISTRATION_ALREADY_ACTIVE")
  })
})

describe("transitionRegistration", () => {
  it("allows an organizer to approve a pending application after registration closes", () => {
    expect(
      transitionRegistration("PENDING", "APPROVE", {
        tournamentStatus: "REGISTRATION_CLOSED",
        reason: "",
      }),
    ).toBe("APPROVED")
  })

  it("requires a reason when an approved team is withdrawn", () => {
    expect(() =>
      transitionRegistration("APPROVED", "WITHDRAW", {
        tournamentStatus: "REGISTRATION_CLOSED",
        reason: "",
      }),
    ).toThrow("REASON_REQUIRED")
  })

  it("requires a reason when an organizer rejects a pending application", () => {
    expect(() =>
      transitionRegistration("PENDING", "REJECT", {
        tournamentStatus: "PUBLISHED",
        reason: "  ",
      }),
    ).toThrow("REASON_REQUIRED")
  })

  it("rejects organizer decisions outside published registration states", () => {
    expect(() =>
      transitionRegistration("PENDING", "APPROVE", {
        tournamentStatus: "IN_PROGRESS",
        reason: "",
      }),
    ).toThrow("REGISTRATION_DECISION_UNAVAILABLE")
  })
})
