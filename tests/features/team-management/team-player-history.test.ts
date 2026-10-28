/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ features/team-management/domain/team-player-history.ts โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { describe, expect, it } from "vitest"

import {
  projectReusableTeamPlayers,
  type TeamPlayerHistorySource,
} from "@/features/team-management/domain/team-player-history"

function historySource(
  overrides: Partial<TeamPlayerHistorySource> = {},
): TeamPlayerHistorySource {
  return {
    id: "player-1",
    teamId: "team-a",
    teamName: "A Team",
    firstName: "Somchai",
    lastName: "Jaidee",
    nickname: null,
    birthDate: "2010-01-02",
    jerseyNumber: null,
    position: null,
    phone: null,
    isActive: true,
    deactivatedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("projectReusableTeamPlayers", () => {
  it("shows a shared identity as committed when any source membership is committed", () => {
    const result = projectReusableTeamPlayers([
      historySource({ playerIdentityId: "person-1", isCommitted: true }),
    ])
    expect(result[0]?.isCommitted).toBe(true)
  })
  it("uses the persistent player identity as the selection key", () => {
    const result = projectReusableTeamPlayers([
      historySource({ id: "membership-a", playerIdentityId: "person-1" }),
      historySource({ id: "membership-b", playerIdentityId: "person-1", teamId: "team-b" }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0]?.key).toBe("person-1")
  })
  it("combines normalized identities using the latest snapshot and unique source teams", () => {
    const sources = [
      historySource({
        id: "older",
        teamId: "team-a",
        teamName: "A Team",
        firstName: " Somchai ",
        lastName: "JAIDEE",
        isActive: false,
      }),
      historySource({
        id: "newer",
        teamId: "team-b",
        teamName: "B Team",
        firstName: "somchai",
        lastName: "jaidee",
        nickname: "ชาย",
        isActive: true,
        updatedAt: "2026-02-01T00:00:00.000Z",
      }),
      historySource({
        id: "duplicate-team-source",
        teamId: "team-a",
        teamName: "A Team",
        firstName: "SOMCHAI",
        lastName: "JAIDEE",
        isActive: true,
        updatedAt: "2026-01-15T00:00:00.000Z",
      }),
    ]

    expect(projectReusableTeamPlayers(sources)).toEqual([
      {
        key: "newer",
        player: {
          firstName: "somchai",
          lastName: "jaidee",
          nickname: "ชาย",
          birthDate: "2010-01-02",
          jerseyNumber: null,
          position: null,
          phone: null,
        },
        isActive: true,
        sourceTeams: [
          { id: "team-a", name: "A Team", playerIsActive: true },
          { id: "team-b", name: "B Team", playerIsActive: true },
        ],
      },
    ])
  })

  it("uses the smallest record id for equal timestamps and returns stable output order", () => {
    const sources = [
      historySource({
        id: "z-record",
        firstName: "Zara",
        lastName: "Young",
        birthDate: "2011-03-04",
      }),
      historySource({
        id: "b-record",
        teamId: "team-b",
        teamName: "B Team",
        nickname: "B",
      }),
      historySource({
        id: "a-record",
        teamId: "team-a",
        teamName: "A Team",
        nickname: "A",
      }),
    ]

    const result = projectReusableTeamPlayers(sources)

    expect(result.map(({ key }) => key)).toEqual(["a-record", "z-record"])
    expect(result[0]?.player.nickname).toBe("A")
    expect(projectReusableTeamPlayers([...sources].reverse())).toEqual(result)
  })

  it("marks the player and every source team inactive when all source records are inactive", () => {
    const result = projectReusableTeamPlayers([
      historySource({
        id: "inactive-a",
        teamId: "team-a",
        teamName: "A Team",
        isActive: false,
      }),
      historySource({
        id: "inactive-b",
        teamId: "team-b",
        teamName: "B Team",
        isActive: false,
        updatedAt: "2026-02-01T00:00:00.000Z",
      }),
    ])

    expect(result).toEqual([
      expect.objectContaining({
        isActive: false,
        sourceTeams: [
          { id: "team-a", name: "A Team", playerIsActive: false },
          { id: "team-b", name: "B Team", playerIsActive: false },
        ],
      }),
    ])
  })
})
