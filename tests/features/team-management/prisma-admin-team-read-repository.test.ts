/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ lib/generated/prisma/client.ts, features/team-management/infrastructure/prisma-admin-team-read-repository.ts โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import type { PrismaClient } from "@/lib/generated/prisma/client"
import { describe, expect, it, vi } from "vitest"

import { PrismaAdminTeamReadRepository } from "@/features/team-management/infrastructure/prisma-admin-team-read-repository"

describe("PrismaAdminTeamReadRepository", () => {
  it("lists every team with its creator and active player count", async () => {
    const findMany = vi.fn(async () => [
      {
        id: "team-1",
        name: "Bangkok Ballers",
        format: "FIVE_V_FIVE" as const,
        isActive: true,
        province: { nameTh: "กรุงเทพมหานคร" },
        owner: { displayName: "Coach May" },
        _count: { players: 2 },
      },
      {
        id: "team-2",
        name: "Old Team",
        format: "THREE_V_THREE" as const,
        isActive: false,
        province: { nameTh: "เชียงใหม่" },
        owner: { displayName: "Coach Art" },
        _count: { players: 0 },
      },
    ])
    const repository = new PrismaAdminTeamReadRepository({
      team: { findMany },
    } as unknown as PrismaClient)

    await expect(repository.listAll()).resolves.toEqual([
      {
        id: "team-1",
        name: "Bangkok Ballers",
        format: "FIVE_V_FIVE",
        isActive: true,
        province: "กรุงเทพมหานคร",
        ownerName: "Coach May",
        activePlayerCount: 2,
      },
      {
        id: "team-2",
        name: "Old Team",
        format: "THREE_V_THREE",
        isActive: false,
        province: "เชียงใหม่",
        ownerName: "Coach Art",
        activePlayerCount: 0,
      },
    ])
    expect(findMany).toHaveBeenCalledWith({
      include: {
        province: { select: { nameTh: true } },
        owner: { select: { displayName: true } },
        _count: { select: { players: { where: { isActive: true } } } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    })
  })

  it("returns only active players and omits phone and owner email", async () => {
    const findUnique = vi.fn(async () => ({
      id: "team-1",
      name: "Bangkok Ballers",
      format: "FIVE_V_FIVE" as const,
      isActive: true,
      province: { nameTh: "กรุงเทพมหานคร" },
      owner: { displayName: "Coach May" },
      players: [{
        id: "player-1",
        firstName: "Anan",
        lastName: "Suk",
        nickname: "Nan",
        jerseyNumber: 7,
        position: "PG" as const,
        birthDate: new Date("2010-05-12T00:00:00.000Z"),
      }],
    }))
    const repository = new PrismaAdminTeamReadRepository({
      team: { findUnique },
    } as unknown as PrismaClient)

    await expect(repository.findById("team-1")).resolves.toEqual({
      id: "team-1",
      name: "Bangkok Ballers",
      format: "FIVE_V_FIVE",
      isActive: true,
      province: "กรุงเทพมหานคร",
      ownerName: "Coach May",
      activePlayerCount: 1,
      players: [{
        id: "player-1",
        firstName: "Anan",
        lastName: "Suk",
        nickname: "Nan",
        jerseyNumber: 7,
        position: "PG",
        birthDate: "2010-05-12",
      }],
    })
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "team-1" },
      include: {
        province: { select: { nameTh: true } },
        owner: { select: { displayName: true } },
        players: {
          where: { isActive: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nickname: true,
            jerseyNumber: true,
            position: true,
            birthDate: true,
          },
        },
      },
    })
  })
})
