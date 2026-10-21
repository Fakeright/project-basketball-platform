import type { PrismaClient } from "@/lib/generated/prisma/client"

import type {
  AdminTeamDetail,
  AdminTeamListItem,
  AdminTeamReadRepository,
} from "../application/ports/admin-team-read-repository"

export class PrismaAdminTeamReadRepository implements AdminTeamReadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listAll(): Promise<AdminTeamListItem[]> {
    const teams = await this.prisma.team.findMany({
      include: {
        province: { select: { nameTh: true } },
        owner: { select: { displayName: true } },
        _count: { select: { players: { where: { isActive: true } } } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    })

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      province: team.province.nameTh,
      format: team.format,
      isActive: team.isActive,
      ownerName: team.owner.displayName,
      activePlayerCount: team._count.players,
    }))
  }

  async findById(id: string): Promise<AdminTeamDetail | null> {
    const team = await this.prisma.team.findUnique({
      where: { id },
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
    if (!team) return null

    return {
      id: team.id,
      name: team.name,
      province: team.province.nameTh,
      format: team.format,
      isActive: team.isActive,
      ownerName: team.owner.displayName,
      activePlayerCount: team.players.length,
      players: team.players.map((player) => ({
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        nickname: player.nickname,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        birthDate: player.birthDate.toISOString().slice(0, 10),
      })),
    }
  }
}
