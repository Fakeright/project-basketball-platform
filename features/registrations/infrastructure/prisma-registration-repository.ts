import { Prisma, type PrismaClient, type Registration, type Team, type TeamPlayer as PrismaTeamPlayer } from "@/lib/generated/prisma/client"
import type {
  ApproveRegistrationInput,
  RegistrationApplicationContext,
  RegistrationRepository,
  RegistrationRepositoryTransaction,
  RegistrationReviewContext,
  RegistrationReviewTournament,
  RejectRegistrationInput,
  TeamRegistrationListItem,
  TournamentRegistrationReviewItem,
  TournamentRegistrationWithOwnership,
  WithdrawRegistrationMutationInput,
} from "@/features/registrations/application/ports/registration-repository"
import type { TeamPlayer, TeamSummary } from "@/features/team-management/domain/team"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"

type RegistrationDatabaseClient = Pick<
  PrismaClient,
  | "registration"
  | "team"
  | "teamPlayer"
  | "tournament"
  | "auditLog"
  | "$queryRaw"
>

const maxSerializationAttempts = 3

export class PrismaRegistrationRepository implements RegistrationRepository {
  private readonly operations: PrismaRegistrationOperations

  constructor(private readonly prisma: PrismaClient) {
    this.operations = new PrismaRegistrationOperations(prisma)
  }

  async inTransaction<T>(
    operation: (repository: RegistrationRepositoryTransaction) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxSerializationAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          (transaction) => operation(new PrismaRegistrationOperations(transaction)),
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        )
      } catch (error) {
        if (!isPrismaSerializationConflict(error)) throw error
        if (attempt === maxSerializationAttempts) throw new Error("CONFLICT")
      }
    }

    throw new Error("CONFLICT")
  }

  getApplicationContext(tournamentId: string, teamId: string) {
    return this.operations.getApplicationContext(tournamentId, teamId)
  }

  findActive(tournamentId: string, teamId: string) {
    return this.operations.findActive(tournamentId, teamId)
  }

  createPending(input: {
    tournamentId: string
    teamId: string
    actorId: string
    adminOverride: boolean
  }) {
    return this.operations.createPending(input)
  }

  findById(id: string) {
    return this.operations.findById(id)
  }

  cancelWithVersion(
    id: string,
    version: number,
    actorId: string,
    at: string,
    adminOverride: boolean,
  ) {
    return this.operations.cancelWithVersion(
      id,
      version,
      actorId,
      at,
      adminOverride,
    )
  }

  findReviewContext(id: string) {
    return this.operations.findReviewContext(id)
  }

  approveWithCapacity(input: ApproveRegistrationInput) {
    return this.operations.approveWithCapacity(input)
  }

  rejectWithVersion(input: RejectRegistrationInput) {
    return this.operations.rejectWithVersion(input)
  }

  withdrawWithVersion(input: WithdrawRegistrationMutationInput) {
    return this.operations.withdrawWithVersion(input)
  }

  async findTeam(teamId: string): Promise<TeamSummary | null> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { province: true },
    })
    return team ? mapTeam(team) : null
  }

  async listByTeam(teamId: string): Promise<TeamRegistrationListItem[]> {
    const registrations = await this.prisma.registration.findMany({
      where: { teamId },
      include: { tournament: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    })
    return registrations.map((registration) => ({
      ...mapRegistration(registration),
      tournamentName: registration.tournament.title,
      submittedAt: registration.createdAt.toISOString(),
      organizerNote: registration.decisionNote,
    }))
  }

  async findTournamentForReview(
    tournamentId: string,
  ): Promise<RegistrationReviewTournament | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        title: true,
        organizerId: true,
        status: true,
        capacity: true,
      },
    })
    return tournament ? mapReviewTournament(tournament) : null
  }

  async listByTournament(
    tournamentId: string,
  ): Promise<TournamentRegistrationReviewItem[]> {
    const registrations = await this.prisma.registration.findMany({
      where: { tournamentId },
      include: {
        team: {
          include: {
            province: true,
            players: {
              where: { isActive: true },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return registrations.map((registration) => ({
      ...mapRegistration(registration),
      teamName: registration.team.name,
      province: registration.team.province.nameTh,
      playerCount: registration.team.players.length,
      managerCoachCount: registration.team.ownerId ? 1 : 0,
      submittedAt: registration.createdAt.toISOString(),
    }))
  }
}

class PrismaRegistrationOperations implements RegistrationRepositoryTransaction {
  constructor(private readonly prisma: RegistrationDatabaseClient) {}

  async getApplicationContext(
    tournamentId: string,
    teamId: string,
  ): Promise<RegistrationApplicationContext | null> {
    const lockedTournaments = await this.prisma.$queryRaw<
      Array<{
        id: string
        format: RegistrationApplicationContext["tournament"]["format"]
        ageGroup: RegistrationApplicationContext["tournament"]["ageGroup"]
        startsAt: Date
        status: RegistrationApplicationContext["tournament"]["status"]
        registrationDeadline: Date
        capacity: number
      }>
    >(
      Prisma.sql`
        SELECT "id", "format", "ageGroup", "startsAt", "status", "registrationDeadline", "capacity"
        FROM "Tournament"
        WHERE "id" = ${tournamentId}
        FOR UPDATE
      `,
    )
    const tournament = lockedTournaments[0]
    if (!tournament) return null

    await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT "id"
        FROM "TeamPlayer"
        WHERE "teamId" = ${teamId} AND "isActive" = true
        FOR UPDATE
      `,
    )

    const [team, roster, approvedCount] = await Promise.all([
      this.prisma.team.findUnique({
        where: { id: teamId },
        include: { province: true },
      }),
      this.prisma.teamPlayer.findMany({
        where: { teamId, isActive: true },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.registration.count({
        where: { tournamentId, status: "APPROVED" },
      }),
    ])
    if (!team) return null

    return {
      team: mapTeam(team),
      roster: roster.map(mapPlayer),
      tournament: {
        id: tournament.id,
        format: tournament.format,
        ageGroup: tournament.ageGroup,
        startsAt: tournament.startsAt.toISOString(),
        status: tournament.status,
        registrationDeadline: tournament.registrationDeadline.toISOString(),
        capacity: tournament.capacity,
        approvedCount,
      },
    }
  }

  async findActive(tournamentId: string, teamId: string): Promise<TournamentRegistration | null> {
    const registration = await this.prisma.registration.findFirst({
      where: { tournamentId, teamId, status: { in: ["PENDING", "APPROVED"] } },
      orderBy: { createdAt: "desc" },
    })
    return registration ? mapRegistration(registration) : null
  }

  async createPending(input: {
    tournamentId: string
    teamId: string
    actorId: string
    adminOverride: boolean
  }) {
    try {
      const registration = await this.prisma.registration.create({
        data: { tournamentId: input.tournamentId, teamId: input.teamId, status: "PENDING" },
      })
      await this.prisma.auditLog.create({
        data: {
          actorId: input.actorId,
          tournamentId: input.tournamentId,
          action: "registration.created",
          entityType: "Registration",
          entityId: registration.id,
          afterJson: toJsonValue(mapRegistration(registration)),
        },
      })
      if (input.adminOverride) {
        await this.prisma.auditLog.create({
          data: {
            actorId: input.actorId,
            tournamentId: input.tournamentId,
            action: "registration.admin_override",
            entityType: "Registration",
            entityId: registration.id,
            afterJson: toJsonValue(mapRegistration(registration)),
          },
        })
      }
      return mapRegistration(registration)
    } catch (error) {
      if (isPrismaUniqueError(error)) throw new Error("REGISTRATION_ALREADY_ACTIVE")
      throw error
    }
  }

  async findById(id: string): Promise<TournamentRegistrationWithOwnership | null> {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: { team: { include: { province: true } } },
    })
    return registration
      ? { ...mapRegistration(registration), team: mapTeam(registration.team) }
      : null
  }

  async cancelWithVersion(
    id: string,
    version: number,
    actorId: string,
    at: string,
    adminOverride: boolean,
  ) {
    const cancelledAt = new Date(at)
    const updated = await this.prisma.registration.updateMany({
      where: { id, status: "PENDING", version },
      data: { status: "CANCELLED", cancelledAt, version: { increment: 1 } },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    const registration = await this.prisma.registration.findUnique({ where: { id } })
    if (!registration) throw new Error("NOT_FOUND")
    await this.prisma.auditLog.create({
      data: {
        actorId,
        tournamentId: registration.tournamentId,
        action: "registration.cancelled",
        entityType: "Registration",
        entityId: registration.id,
        beforeJson: toJsonValue({ status: "PENDING", version }),
        afterJson: toJsonValue(mapRegistration(registration)),
      },
    })
    if (adminOverride) {
      await this.prisma.auditLog.create({
        data: {
          actorId,
          tournamentId: registration.tournamentId,
          action: "registration.admin_override",
          entityType: "Registration",
          entityId: registration.id,
          beforeJson: toJsonValue({ status: "PENDING", version }),
          afterJson: toJsonValue(mapRegistration(registration)),
        },
      })
    }
    return mapRegistration(registration)
  }

  async findReviewContext(id: string): Promise<RegistrationReviewContext | null> {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        tournament: {
          select: {
            id: true,
            title: true,
            organizerId: true,
            status: true,
            capacity: true,
          },
        },
      },
    })
    return registration
      ? {
          registration: mapRegistration(registration),
          tournament: mapReviewTournament(registration.tournament),
        }
      : null
  }

  async approveWithCapacity(
    input: ApproveRegistrationInput,
  ): Promise<TournamentRegistration> {
    const lockedTournament = await this.prisma.$queryRaw<
      Array<{ capacity: number }>
    >(
      Prisma.sql`
        SELECT "capacity"
        FROM "Tournament"
        WHERE "id" = ${input.before.tournamentId}
        FOR UPDATE
      `,
    )
    const capacity = lockedTournament[0]?.capacity
    if (capacity === undefined) throw new Error("NOT_FOUND")

    const approvedCount = await this.prisma.registration.count({
      where: {
        tournamentId: input.before.tournamentId,
        status: "APPROVED",
      },
    })
    if (approvedCount >= capacity) {
      throw new Error("TOURNAMENT_CAPACITY_REACHED")
    }

    return this.updateDecision({
      before: input.before,
      version: input.version,
      actorId: input.actorId,
      at: input.at,
      adminOverride: input.adminOverride,
      sourceStatus: "PENDING",
      status: "APPROVED",
      note: input.note,
      action: "registration.approved",
      timestampField: "decidedAt",
    })
  }

  rejectWithVersion(
    input: RejectRegistrationInput,
  ): Promise<TournamentRegistration> {
    return this.updateDecision({
      before: input.before,
      version: input.version,
      actorId: input.actorId,
      at: input.at,
      adminOverride: input.adminOverride,
      sourceStatus: "PENDING",
      status: "REJECTED",
      note: input.note,
      action: "registration.rejected",
      timestampField: "decidedAt",
    })
  }

  withdrawWithVersion(
    input: WithdrawRegistrationMutationInput,
  ): Promise<TournamentRegistration> {
    return this.updateDecision({
      before: input.before,
      version: input.version,
      actorId: input.actorId,
      at: input.at,
      adminOverride: input.adminOverride,
      sourceStatus: "APPROVED",
      status: "WITHDRAWN",
      note: input.reason,
      action: "registration.withdrawn",
      timestampField: "withdrawnAt",
    })
  }

  private async updateDecision(input: {
    before: TournamentRegistration
    version: number
    actorId: string
    at: string
    adminOverride: boolean
    sourceStatus: "PENDING" | "APPROVED"
    status: "APPROVED" | "REJECTED" | "WITHDRAWN"
    note: string
    action:
      | "registration.approved"
      | "registration.rejected"
      | "registration.withdrawn"
    timestampField: "decidedAt" | "withdrawnAt"
  }): Promise<TournamentRegistration> {
    const timestamp = new Date(input.at)
    const updated = await this.prisma.registration.updateMany({
      where: {
        id: input.before.id,
        ...(input.status === "APPROVED"
          ? { tournamentId: input.before.tournamentId }
          : {}),
        status: input.sourceStatus,
        version: input.version,
      },
      data: {
        status: input.status,
        decisionNote: input.note || null,
        [input.timestampField]: timestamp,
        version: { increment: 1 },
      },
    })
    if (updated.count !== 1) throw new Error("CONFLICT")

    const registration = await this.prisma.registration.findUnique({
      where: { id: input.before.id },
    })
    if (!registration) throw new Error("NOT_FOUND")
    const after = mapRegistration(registration)

    await this.appendDecisionAudit({
      actorId: input.actorId,
      action: input.action,
      before: input.before,
      after,
      adminOverride: input.adminOverride,
    })

    return after
  }

  private async appendDecisionAudit(input: {
    actorId: string
    action: string
    before: TournamentRegistration
    after: TournamentRegistration
    adminOverride: boolean
  }) {
    const auditData = {
      actorId: input.actorId,
      tournamentId: input.before.tournamentId,
      entityType: "Registration",
      entityId: input.before.id,
      beforeJson: toJsonValue(input.before),
      afterJson: toJsonValue(input.after),
    }
    await this.prisma.auditLog.create({
      data: { ...auditData, action: input.action },
    })
    if (input.adminOverride) {
      await this.prisma.auditLog.create({
        data: { ...auditData, action: "registration.admin_override" },
      })
    }
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
    birthDate: player.birthDate.toISOString().slice(0, 10),
    jerseyNumber: player.jerseyNumber,
    position: player.position,
    phone: player.phone,
    isActive: player.isActive,
    deactivatedAt: player.deactivatedAt?.toISOString() ?? null,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString(),
  }
}

function mapRegistration(registration: Registration): TournamentRegistration {
  return {
    id: registration.id,
    tournamentId: registration.tournamentId,
    teamId: registration.teamId,
    status: registration.status,
    decisionNote: registration.decisionNote,
    decidedAt: registration.decidedAt?.toISOString() ?? null,
    cancelledAt: registration.cancelledAt?.toISOString() ?? null,
    withdrawnAt: registration.withdrawnAt?.toISOString() ?? null,
    version: registration.version,
    createdAt: registration.createdAt.toISOString(),
    updatedAt: registration.updatedAt.toISOString(),
  }
}

function mapReviewTournament(tournament: {
  id: string
  title: string
  organizerId: string
  status: RegistrationReviewTournament["status"]
  capacity: number
}): RegistrationReviewTournament {
  return {
    id: tournament.id,
    title: tournament.title,
    organizerId: tournament.organizerId,
    status: tournament.status,
    capacity: tournament.capacity,
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function isPrismaUniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002"
}

function isPrismaSerializationConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034"
}
