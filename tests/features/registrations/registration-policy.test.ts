import { describe, expect, it } from "vitest"

import { assertCanApply, transitionRegistration } from "@/features/registrations/domain/registration-policy"
import type { TeamPlayer, TeamSummary } from "@/features/team-management/domain/team"

const team: TeamSummary = {
  id: "team-1",
  name: "Bangkok Ballers",
  provinceCode: "10",
  province: "กรุงเทพมหานคร",
  ownerId: "manager-1",
  format: "FIVE_V_FIVE",
  isActive: true,
  deactivatedAt: null,
  version: 0,
}

const roster: TeamPlayer[] = Array.from({ length: 5 }, (_, index) => ({
  id: `player-${index + 1}`,
  teamId: team.id,
  firstName: "Player",
  lastName: String(index + 1),
  nickname: null,
  birthDate: "2008-01-01",
  jerseyNumber: index + 1,
  position: null,
  phone: null,
  isActive: true,
  deactivatedAt: null,
  createdAt: "2026-08-07T00:00:00.000Z",
  updatedAt: "2026-08-07T00:00:00.000Z",
}))

const eligibleApplication = {
  actorId: "manager-1",
  team,
  roster,
  tournament: {
    format: "FIVE_V_FIVE" as const,
    ageGroup: "Open",
    startsAt: "2026-11-15T02:00:00.000Z",
    status: "PUBLISHED",
    registrationDeadline: "2026-07-26T12:00:00.000Z",
    capacity: 8,
    approvedCount: 7,
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

  it("rejects an application when approved teams already fill capacity", () => {
    expect(() =>
      assertCanApply({
        ...eligibleApplication,
        tournament: {
          ...eligibleApplication.tournament,
          approvedCount: eligibleApplication.tournament.capacity,
        },
      }),
    ).toThrow("TOURNAMENT_CAPACITY_REACHED")
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
