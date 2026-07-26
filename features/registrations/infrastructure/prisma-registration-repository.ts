import type { Prisma, PrismaClient, Registration, Team, TeamMember } from "@/lib/generated/prisma/client"
import type {
  RegistrationApplicationContext,
  RegistrationRepository,
  RegistrationRepositoryTransaction,
  TeamRegistrationListItem,
  TournamentRegistrationWithOwnership,
} from "@/features/registrations/application/ports/registration-repository"
import type { TeamRosterMember, TeamSummary } from "@/features/team-management/domain/team"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"

type RegistrationDatabaseClient = Pick<
  PrismaClient,
  "registration" | "team" | "teamMember" | "tournament" | "auditLog"
>

export class PrismaRegistrationRepository implements RegistrationRepository {
  private readonly operations: PrismaRegistrationOperations

  constructor(private readonly prisma: PrismaClient) {
    this.operations = new PrismaRegistrationOperations(prisma)
  }

  inTransaction<T>(
    operation: (repository: RegistrationRepositoryTransaction) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction((transaction) =>
      operation(new PrismaRegistrationOperations(transaction)),
    )
  }

  getApplicationContext(tournamentId: string, teamId: string) {
    return this.operations.getApplicationContext(tournamentId, teamId)
  }

  findActive(tournamentId: string, teamId: string) {
    return this.operations.findActive(tournamentId, teamId)
  }

  createPending(input: { tournamentId: string; teamId: string; actorId: string }) {
    return this.operations.createPending(input)
  }

  findById(id: string) {
    return this.operations.findById(id)
  }

  cancelWithVersion(id: string, version: number, actorId: string, at: string) {
    return this.operations.cancelWithVersion(id, version, actorId, at)
  }

  async findTeam(teamId: string): Promise<TeamSummary | null> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } })
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
}

class PrismaRegistrationOperations implements RegistrationRepositoryTransaction {
  constructor(private readonly prisma: RegistrationDatabaseClient) {}

  async getApplicationContext(
    tournamentId: string,
    teamId: string,
  ): Promise<RegistrationApplicationContext | null> {
    const [team, tournament, roster] = await Promise.all([
      this.prisma.team.findUnique({ where: { id: teamId } }),
      this.prisma.tournament.findUnique({ where: { id: tournamentId } }),
      this.prisma.teamMember.findMany({
        where: { teamId, isActive: true },
        orderBy: { createdAt: "asc" },
      }),
    ])
    if (!team || !tournament) return null

    return {
      team: mapTeam(team),
      roster: roster.map(mapMember),
      tournament: {
        id: tournament.id,
        format: tournament.format,
        status: tournament.status,
        registrationDeadline: tournament.registrationDeadline.toISOString(),
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

  async createPending(input: { tournamentId: string; teamId: string; actorId: string }) {
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
      return mapRegistration(registration)
    } catch (error) {
      if (isPrismaUniqueError(error)) throw new Error("REGISTRATION_ALREADY_ACTIVE")
      throw error
    }
  }

  async findById(id: string): Promise<TournamentRegistrationWithOwnership | null> {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: { team: true },
    })
    return registration
      ? { ...mapRegistration(registration), team: mapTeam(registration.team) }
      : null
  }

  async cancelWithVersion(id: string, version: number, actorId: string, at: string) {
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
    return mapRegistration(registration)
  }
}

function mapTeam(team: Team): TeamSummary {
  return { id: team.id, name: team.name, province: team.province, ownerId: team.ownerId }
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

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function isPrismaUniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002"
}
