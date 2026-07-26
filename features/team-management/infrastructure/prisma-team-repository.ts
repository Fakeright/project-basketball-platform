import type {
  Prisma,
  PrismaClient,
  Team,
  TeamMember,
} from "@/lib/generated/prisma/client"
import type { TeamRepository } from "@/features/team-management/application/ports/team-repository"
import type { Role } from "@/features/identity/domain/actor"
import type {
  TeamRosterMember,
  TeamSummary,
} from "@/features/team-management/domain/team"

export class PrismaTeamRepository implements TeamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: { name: string; province: string; ownerId: string }) {
    const team = await this.prisma.team.create({ data: input })
    return mapTeam(team)
  }

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({ where: { id } })
    return team ? mapTeam(team) : null
  }

  async listByOwner(ownerId: string) {
    const teams = await this.prisma.team.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
    })
    return teams.map(mapTeam)
  }

  async update(id: string, input: { name: string; province: string }) {
    const team = await this.prisma.team.update({ where: { id }, data: input })
    return mapTeam(team)
  }

  async findUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, displayName: true, role: true },
    })
    return user
      ? { id: user.id, displayName: user.displayName, role: user.role as Role }
      : null
  }

  async listActiveMembers(teamId: string) {
    const members = await this.prisma.teamMember.findMany({
      where: { teamId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
    return members.map(mapMember)
  }

  async addMember(input: Parameters<TeamRepository["addMember"]>[0]) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: input.teamId, userId: input.userId } },
    })
    if (existing?.isActive) throw new Error("MEMBER_ALREADY_ACTIVE")

    try {
      const member = existing
        ? await this.prisma.teamMember.update({
            where: { id: existing.id },
            data: { role: input.role, isActive: true, deactivatedAt: null },
          })
        : await this.prisma.teamMember.create({ data: input })
      return mapMember(member)
    } catch (error) {
      if (isPrismaUniqueError(error)) throw new Error("MEMBER_ALREADY_ACTIVE")
      throw error
    }
  }

  async deactivateMember(teamId: string, memberId: string, at: string) {
    const updated = await this.prisma.teamMember.updateMany({
      where: { id: memberId, teamId, isActive: true },
      data: { isActive: false, deactivatedAt: new Date(at) },
    })
    if (updated.count !== 1) throw new Error("MEMBER_NOT_FOUND")
  }

  async appendAuditEvent(
    input: Parameters<TeamRepository["appendAuditEvent"]>[0],
  ) {
    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: "Team",
        entityId: input.entityId,
        beforeJson: toJsonValue(input.before),
        afterJson: toJsonValue(input.after),
      },
    })
  }
}

function mapTeam(team: Team): TeamSummary {
  return {
    id: team.id,
    name: team.name,
    province: team.province,
    ownerId: team.ownerId,
  }
}

function mapMember(member: TeamMember): TeamRosterMember {
  return {
    id: member.id,
    userId: member.userId,
    role: member.role,
    isActive: member.isActive,
    deactivatedAt: member.deactivatedAt?.toISOString() ?? null,
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function isPrismaUniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002"
}
