/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ features/team-management/application/read-admin-teams.ts, features/team-management/application/ports/admin-team-read-repository.ts โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { describe, expect, it, vi } from "vitest"

import {
  getAdminTeamDetail,
  listAdminTeams,
} from "@/features/team-management/application/read-admin-teams"
import type { AdminTeamReadRepository } from "@/features/team-management/application/ports/admin-team-read-repository"
import { createTestActor } from "@/tests/fixtures/actor"

const team = {
  id: "team-1",
  name: "Bangkok Ballers",
  province: "กรุงเทพมหานคร",
  format: "FIVE_V_FIVE" as const,
  isActive: true,
  ownerName: "Coach May",
  activePlayerCount: 1,
}

function createRepository(): AdminTeamReadRepository {
  return {
    listAll: vi.fn(async () => [team]),
    findById: vi.fn(async () => ({
      ...team,
      players: [{
        id: "player-1",
        firstName: "Anan",
        lastName: "Suk",
        nickname: "Nan",
        jerseyNumber: 7,
        position: "PG" as const,
        birthDate: "2010-05-12",
      }],
    })),
  }
}

describe("admin team reading", () => {
  it("lists teams only for platform admins", async () => {
    const teams = createRepository()

    await expect(
      listAdminTeams(createTestActor("organizer-1", "TOURNAMENT_ORGANIZER"), { teams }),
    ).rejects.toThrow("NOT_FOUND")
    expect(teams.listAll).not.toHaveBeenCalled()

    await expect(
      listAdminTeams(createTestActor("admin-1", "PLATFORM_ADMIN"), { teams }),
    ).resolves.toEqual([team])
  })

  it("loads one team's active roster only after checking admin access", async () => {
    const teams = createRepository()

    await expect(
      getAdminTeamDetail("team-1", createTestActor("manager-1", "TEAM_MANAGER_COACH"), { teams }),
    ).rejects.toThrow("NOT_FOUND")
    expect(teams.findById).not.toHaveBeenCalled()

    const detail = await getAdminTeamDetail(
      "team-1",
      createTestActor("admin-1", "PLATFORM_ADMIN"),
      { teams },
    )
    expect(detail.ownerName).toBe("Coach May")
    expect(detail.players).toHaveLength(1)
  })

  it("hides missing team identifiers", async () => {
    const teams = createRepository()
    vi.mocked(teams.findById).mockResolvedValueOnce(null)

    await expect(
      getAdminTeamDetail("missing", createTestActor("admin-1", "PLATFORM_ADMIN"), { teams }),
    ).rejects.toThrow("NOT_FOUND")
  })
})
