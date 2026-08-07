import type {
  Prisma,
  PrismaClient,
  Team,
  TeamMember,
} from "@/lib/generated/prisma/client"
import type {
  TeamMutationRepository,
  TeamRepository,
} from "@/features/team-management/application/ports/team-repository"
import type { Role } from "@/features/identity/domain/actor"
import type {
  TeamRosterMember,
  TeamSummary,
} from "@/features/team-management/domain/team"

const teamWithProvinceInclude = {
  province: true,
} satisfies Prisma.TeamInclude

type TeamDatabaseClient = Pick<
  PrismaClient,
  "team" | "teamMember" | "auditLog"
>

export class PrismaTeamRepository implements TeamRepository {
  private readonly mutations: PrismaTeamMutationRepository

  constructor(private readonly prisma: PrismaClient) {
    this.mutations = new PrismaTeamMutationRepository(prisma)
  }

  async inTransaction<T>(
    operation: (repository: TeamMutationRepository) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction((transaction) =>
      operation(new PrismaTeamMutationRepository(transaction)),
    )
  }

  create(input: Parameters<TeamMutationRepository["create"]>[0]) {
    return this.mutations.create(input)
  }

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: teamWithProvinceInclude,
    })
    return team ? mapTeam(team) : null
  }

  async listByOwner(ownerId: string) {
    const teams = await this.prisma.team.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
      include: teamWithProvinceInclude,
    })
    return teams.map(mapTeam)
  }

  update(
    id: string,
    input: Parameters<TeamMutationRepository["update"]>[1],
  ) {
    return this.mutations.update(id, input)
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

  async listUsersByRoles(roles: readonly Role[]) {
    const users = await this.prisma.user.findMany({
      where: { role: { in: [...roles] } },
      select: { id: true, displayName: true, role: true },
      orderBy: { displayName: "asc" },
    })

    return users.map((user) => ({
      id: user.id,
      displayName: user.displayName,
      role: user.role as Role,
    }))
  }

  async listActiveMembers(teamId: string) {
    const members = await this.prisma.teamMember.findMany({
      where: { teamId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
    return members.map(mapMember)
  }

  addMember(input: Parameters<TeamMutationRepository["addMember"]>[0]) {
    return this.mutations.addMember(input)
  }

  deactivateMember(
    teamId: string,
    memberId: string,
    at: string,
  ) {
    return this.mutations.deactivateMember(teamId, memberId, at)
  }

  appendAuditEvent(
    input: Parameters<TeamMutationRepository["appendAuditEvent"]>[0],
  ) {
    return this.mutations.appendAuditEvent(input)
  }
}

class PrismaTeamMutationRepository implements TeamMutationRepository {
  constructor(private readonly prisma: TeamDatabaseClient) {}

  async create(input: Parameters<TeamMutationRepository["create"]>[0]) {
    const team = await this.prisma.team.create({
      data: input,
      include: teamWithProvinceInclude,
    })
    return mapTeam(team)
  }

  async update(
    id: string,
    input: Parameters<TeamMutationRepository["update"]>[1],
  ) {
    const team = await this.prisma.team.update({
      where: { id },
      data: input,
      include: teamWithProvinceInclude,
    })
    return mapTeam(team)
  }

  async addMember(input: Parameters<TeamMutationRepository["addMember"]>[0]) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: input.teamId, userId: input.userId } },
    })
    if (existing?.isActive) throw new Error("MEMBER_ALREADY_ACTIVE")

    if (existing) {
      const updated = await this.prisma.teamMember.updateMany({
        where: {
          id: existing.id,
          teamId: input.teamId,
          userId: input.userId,
          isActive: false,
        },
        data: { role: input.role, isActive: true, deactivatedAt: null },
      })
      if (updated.count !== 1) throw new Error("MEMBER_ALREADY_ACTIVE")

      const member = await this.prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: input.teamId, userId: input.userId } },
      })
      if (!member) throw new Error("MEMBER_NOT_FOUND")
      return mapMember(member)
    }

    try {
      const member = await this.prisma.teamMember.create({ data: input })
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
    input: Parameters<TeamMutationRepository["appendAuditEvent"]>[0],
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

function mapTeam(team: Team & { province: { nameTh: string } }): TeamSummary {
  return {
    id: team.id,
    name: team.name,
    provinceCode: team.provinceCode,
    province: team.province.nameTh,
    ownerId: team.ownerId,
    format: team.format,
    isActive: team.isActive,
    deactivatedAt: team.deactivatedAt?.toISOString() ?? null,
    version: team.version,
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
