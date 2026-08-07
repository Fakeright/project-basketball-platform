import {
  Prisma,
  type PrismaClient,
  type Team,
  type TeamPlayer as PrismaTeamPlayer,
} from "@/lib/generated/prisma/client"
import type {
  TeamMutationRepository,
  TeamRepository,
} from "@/features/team-management/application/ports/team-repository"
import type {
  TeamPlayer,
  TeamPlayerDraft,
  TeamSummary,
} from "@/features/team-management/domain/team"

const teamWithProvinceInclude = {
  province: true,
} satisfies Prisma.TeamInclude

type TeamDatabaseClient = Pick<
  PrismaClient,
  "team" | "teamPlayer" | "auditLog"
  | "registration" | "$queryRaw"
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

  findByIdForUpdate(id: string) {
    return this.mutations.findByIdForUpdate(id)
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

  hasActiveRegistration(teamId: string) {
    return this.mutations.hasActiveRegistration(teamId)
  }

  async listActivePlayers(teamId: string) {
    const players = await this.prisma.teamPlayer.findMany({
      where: { teamId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
    return players.map(mapPlayer)
  }

  findExistingPlayersByIdentities(
    teamId: string,
    players: readonly TeamPlayerDraft[],
  ) {
    return this.mutations.findExistingPlayersByIdentities(teamId, players)
  }

  addPlayers(
    teamId: string,
    players: readonly TeamPlayerDraft[],
  ) {
    return this.mutations.addPlayers(teamId, players)
  }

  updatePlayer(
    teamId: string,
    playerId: string,
    input: TeamPlayerDraft,
  ) {
    return this.mutations.updatePlayer(teamId, playerId, input)
  }

  deactivatePlayer(teamId: string, playerId: string, at: string) {
    return this.mutations.deactivatePlayer(teamId, playerId, at)
  }

  appendAuditEvent(
    input: Parameters<TeamMutationRepository["appendAuditEvent"]>[0],
  ) {
    return this.mutations.appendAuditEvent(input)
  }
}

class PrismaTeamMutationRepository implements TeamMutationRepository {
  constructor(private readonly prisma: TeamDatabaseClient) {}

  async findByIdForUpdate(id: string) {
    const lockedTeams = await this.prisma.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        SELECT "id"
        FROM "Team"
        WHERE "id" = ${id}
        FOR UPDATE
      `,
    )
    if (!lockedTeams[0]) return null

    const team = await this.prisma.team.findUnique({
      where: { id },
      include: teamWithProvinceInclude,
    })
    return team ? mapTeam(team) : null
  }

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
    const { expectedVersion, ...data } = input
    const updated = await this.prisma.team.updateMany({
      where: { id, version: expectedVersion },
      data: { ...data, version: { increment: 1 } },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    const team = await this.prisma.team.findUnique({
      where: { id },
      include: teamWithProvinceInclude,
    })
    if (!team) throw new Error("NOT_FOUND")
    return mapTeam(team)
  }

  async hasActiveRegistration(teamId: string) {
    const registration = await this.prisma.registration.findFirst({
      where: { teamId, status: { in: ["PENDING", "APPROVED"] } },
      select: { id: true },
    })
    return registration !== null
  }

  async findExistingPlayersByIdentities(
    teamId: string,
    players: readonly TeamPlayerDraft[],
  ) {
    if (players.length === 0) return []

    const existingPlayers = await this.prisma.teamPlayer.findMany({
      where: {
        teamId,
        OR: players.map((player) => ({
          firstName: player.firstName,
          lastName: player.lastName,
          birthDate: new Date(player.birthDate),
        })),
      },
      orderBy: { createdAt: "asc" },
    })
    return existingPlayers.map(mapPlayer)
  }

  async addPlayers(teamId: string, players: readonly TeamPlayerDraft[]) {
    const addedPlayers: TeamPlayer[] = []
    for (const player of players) {
      addedPlayers.push(await this.addPlayer(teamId, player))
    }
    return addedPlayers
  }

  async updatePlayer(
    teamId: string,
    playerId: string,
    input: TeamPlayerDraft,
  ) {
    try {
      const updated = await this.prisma.teamPlayer.updateMany({
        where: { id: playerId, teamId, isActive: true },
        data: playerData(input),
      })
      if (updated.count !== 1) throw new Error("PLAYER_NOT_FOUND")

      const player = await this.prisma.teamPlayer.findUnique({ where: { id: playerId } })
      if (!player) throw new Error("PLAYER_NOT_FOUND")
      return mapPlayer(player)
    } catch (error) {
      throw mapPlayerUniqueError(error)
    }
  }

  async deactivatePlayer(teamId: string, playerId: string, at: string) {
    const updated = await this.prisma.teamPlayer.updateMany({
      where: { id: playerId, teamId, isActive: true },
      data: { isActive: false, deactivatedAt: new Date(at) },
    })
    if (updated.count !== 1) throw new Error("PLAYER_NOT_FOUND")

    const player = await this.prisma.teamPlayer.findUnique({ where: { id: playerId } })
    if (!player) throw new Error("PLAYER_NOT_FOUND")
    return mapPlayer(player)
  }

  private async addPlayer(teamId: string, input: TeamPlayerDraft): Promise<TeamPlayer> {
    const identity = {
      teamId,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: new Date(input.birthDate),
    }
    const existing = await this.prisma.teamPlayer.findUnique({
      where: { teamId_firstName_lastName_birthDate: identity },
    })
    if (existing?.isActive) throw new Error("PLAYER_ALREADY_EXISTS")

    if (existing) {
      try {
        const updated = await this.prisma.teamPlayer.updateMany({
          where: { id: existing.id, teamId, isActive: false },
          data: { ...optionalPlayerData(input), isActive: true, deactivatedAt: null },
        })
        if (updated.count !== 1) throw new Error("PLAYER_ALREADY_EXISTS")

        const player = await this.prisma.teamPlayer.findUnique({ where: { id: existing.id } })
        if (!player) throw new Error("PLAYER_NOT_FOUND")
        return mapPlayer(player)
      } catch (error) {
        throw mapPlayerUniqueError(error)
      }
    }

    try {
      const player = await this.prisma.teamPlayer.create({
        data: { teamId, ...playerData(input) },
      })
      return mapPlayer(player)
    } catch (error) {
      throw mapPlayerUniqueError(error)
    }
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

function mapPlayer(player: PrismaTeamPlayer): TeamPlayer {
  return {
    id: player.id,
    teamId: player.teamId,
    firstName: player.firstName,
    lastName: player.lastName,
    nickname: player.nickname,
    birthDate: toDateOnly(player.birthDate),
    jerseyNumber: player.jerseyNumber,
    position: player.position,
    phone: player.phone,
    isActive: player.isActive,
    deactivatedAt: player.deactivatedAt?.toISOString() ?? null,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString(),
  }
}

function playerData(input: TeamPlayerDraft) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    birthDate: new Date(input.birthDate),
    ...optionalPlayerData(input),
  }
}

function optionalPlayerData(input: TeamPlayerDraft) {
  return {
    nickname: input.nickname,
    jerseyNumber: input.jerseyNumber,
    position: input.position,
    phone: input.phone,
  }
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function isPrismaUniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002"
}

function mapPlayerUniqueError(error: unknown): unknown {
  if (!isPrismaUniqueError(error)) return error

  const target = getPrismaConstraintTarget(error)
  if (target.includes("jersey")) return new Error("JERSEY_ALREADY_IN_USE")
  if (
    target.includes("firstname") ||
    target.includes("lastname") ||
    target.includes("birthdate")
  ) {
    return new Error("PLAYER_ALREADY_EXISTS")
  }

  return error
}

function getPrismaConstraintTarget(error: unknown): string {
  if (
    typeof error !== "object" ||
    error === null ||
    !("meta" in error) ||
    typeof error.meta !== "object" ||
    error.meta === null ||
    !("target" in error.meta)
  ) {
    return ""
  }

  const { target } = error.meta
  return (Array.isArray(target) ? target.join("_") : String(target)).toLowerCase()
}
