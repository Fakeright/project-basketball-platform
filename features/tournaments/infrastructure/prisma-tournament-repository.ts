import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"
import type {
  Tournament,
  TournamentSearchFilters,
  TournamentStatus,
} from "@/features/tournaments/domain/tournament"
import { getBangkokCalendarDayUtcRange } from "@/features/tournaments/domain/tournament-calendar"

import type { TournamentRepository } from "./tournament-repository"

const publicStatuses = [
  "PUBLISHED",
  "REGISTRATION_CLOSED",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
] as const

const approvedRegistrationsInclude = {
  where: { status: "APPROVED" },
  orderBy: { createdAt: "asc" },
  include: { team: { select: { id: true, name: true } } },
} satisfies Prisma.Tournament$registrationsArgs

const publishedMatchesInclude = {
  where: {
    bracket: {
      is: { status: "PUBLISHED" },
    },
  },
  orderBy: [{ scheduledAt: "asc" }, { sequence: "asc" }],
  include: {
    bracket: { select: { status: true } },
    round: { select: { name: true } },
    result: { select: { homeScore: true, awayScore: true } },
  },
} satisfies Prisma.Tournament$matchesArgs

const posterMediaInclude = {
  where: { deletedAt: null, kind: "POSTER" },
  orderBy: { createdAt: "desc" },
  take: 1,
} satisfies Prisma.Tournament$mediaAssetsArgs

const publicDiscoveryInclude = {
  mediaAssets: posterMediaInclude,
} satisfies Prisma.TournamentInclude

const publicCompetitionInclude = {
  registrations: approvedRegistrationsInclude,
  matches: publishedMatchesInclude,
  mediaAssets: posterMediaInclude,
} satisfies Prisma.TournamentInclude

const publicDetailInclude = {
  registrations: approvedRegistrationsInclude,
  matches: publishedMatchesInclude,
  mediaAssets: {
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.TournamentInclude

type PublicDiscoveryRow = Prisma.TournamentGetPayload<{
  include: typeof publicDiscoveryInclude
}>

type PublicCompetitionRow = Prisma.TournamentGetPayload<{
  include: typeof publicCompetitionInclude
}>

type PublicDetailRow = Prisma.TournamentGetPayload<{
  include: typeof publicDetailInclude
}>

const statusMap = {
  PUBLISHED: "OPEN",
  REGISTRATION_CLOSED: "CLOSED",
  IN_PROGRESS: "ONGOING",
  COMPLETED: "COMPLETED",
  ARCHIVED: "COMPLETED",
} as const satisfies Record<(typeof publicStatuses)[number], TournamentStatus>

const databaseStatusesByPublicStatus = {
  OPEN: ["PUBLISHED"],
  CLOSED: ["REGISTRATION_CLOSED"],
  ONGOING: ["IN_PROGRESS"],
  COMPLETED: ["COMPLETED", "ARCHIVED"],
} as const satisfies Record<TournamentStatus, readonly (typeof publicStatuses)[number][]>

export class PrismaTournamentRepository implements TournamentRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: ObjectStorage,
  ) {}

  async list(filters: TournamentSearchFilters): Promise<Tournament[]> {
    const rows = await this.prisma.tournament.findMany({
      where: buildDiscoveryWhere(filters),
      include: publicDiscoveryInclude,
      orderBy: { startsAt: "desc" },
    })

    return rows.map((row) => this.mapDiscoveryTournament(row))
  }

  async findBySlug(slug: string): Promise<Tournament | null> {
    const row = await this.prisma.tournament.findFirst({
      where: {
        slug,
        status: { in: [...publicStatuses] },
      },
      include: publicDetailInclude,
    })

    return row ? this.mapDetailTournament(row) : null
  }

  async findCompetitionBySlug(slug: string): Promise<Tournament | null> {
    const row = await this.prisma.tournament.findFirst({
      where: {
        slug,
        status: { in: [...publicStatuses] },
      },
      include: publicCompetitionInclude,
    })

    return row ? this.mapCompetitionTournament(row) : null
  }

  private mapDiscoveryTournament(row: PublicDiscoveryRow): Tournament {
    return mapTournamentBase(row, {
      posterUrl: getPosterUrl(row.mediaAssets, this.storage),
    })
  }

  private mapCompetitionTournament(
    row: PublicCompetitionRow | PublicDetailRow,
  ): Tournament {
    const teamNames = new Map(
      row.registrations.map(({ team }) => [team.id, team.name]),
    )

    return mapTournamentBase(row, {
      posterUrl: getPosterUrl(row.mediaAssets, this.storage),
      teams: row.registrations.map(({ team }) => team.name),
      matches: row.matches
        .filter((match) => match.bracket.status === "PUBLISHED")
        .map((match) => ({
          id: match.id,
          tournamentSlug: row.slug,
          round: match.round.name,
          court: match.court ?? "ยังไม่กำหนดสนาม",
          scheduledAt: match.scheduledAt?.toISOString() ?? null,
          homeTeam:
            teamNames.get(match.homeTeamId ?? "") ?? "รอยืนยันทีม",
          awayTeam:
            teamNames.get(match.awayTeamId ?? "") ?? "รอยืนยันทีม",
          homeScore: match.result?.homeScore ?? null,
          awayScore: match.result?.awayScore ?? null,
        })),
    })
  }

  private async mapDetailTournament(row: PublicDetailRow): Promise<Tournament> {
    const tournament = this.mapCompetitionTournament(row)
    const documents = await Promise.all(
      row.mediaAssets
        .filter((asset) => asset.kind === "DOCUMENT")
        .map(async (asset) => ({
          id: asset.id,
          fileName: asset.fileName,
          contentType: asset.contentType,
          byteSize: asset.byteSize,
          url: await this.storage.createSignedUrl(
            asset.bucket,
            asset.objectPath,
            60 * 10,
          ),
        })),
    )

    return { ...tournament, documents }
  }
}

function buildDiscoveryWhere(
  filters: TournamentSearchFilters,
): Prisma.TournamentWhereInput {
  const statuses = filters.status
    ? databaseStatusesByPublicStatus[filters.status]
    : publicStatuses
  const calendarDayRange = filters.date
    ? getBangkokCalendarDayUtcRange(filters.date)
    : undefined

  return {
    status: { in: [...statuses] },
    ...(filters.query
      ? {
          OR: [
            { slug: containsText(filters.query) },
            { title: containsText(filters.query) },
            { province: containsText(filters.query) },
            { venue: containsText(filters.query) },
            { ageGroup: containsText(filters.query) },
            { description: containsText(filters.query) },
            {
              registrations: {
                some: {
                  status: "APPROVED",
                  team: { name: containsText(filters.query) },
                },
              },
            },
          ],
        }
      : {}),
    ...(filters.province
      ? { province: containsText(filters.province) }
      : {}),
    ...(filters.format ? { format: filters.format } : {}),
    ...(filters.ageGroup
      ? { ageGroup: containsText(filters.ageGroup) }
      : {}),
    ...(filters.venue ? { venue: containsText(filters.venue) } : {}),
    ...(calendarDayRange ? { startsAt: calendarDayRange } : {}),
    ...(filters.date && !calendarDayRange ? { id: { in: [] } } : {}),
  }
}

function containsText(value: string) {
  return {
    contains: value,
    mode: "insensitive" as const,
  }
}

function mapTournamentBase(
  row: PublicDiscoveryRow | PublicCompetitionRow | PublicDetailRow,
  additions: Partial<
    Pick<Tournament, "posterUrl" | "documents" | "teams" | "matches">
  >,
): Tournament {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    province: row.province,
    venue: row.venue,
    format: row.format,
    ageGroup: row.ageGroup,
    status: mapPublicStatus(row.status),
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    registrationDeadline: row.registrationDeadline.toISOString(),
    description: row.description,
    documents: additions.documents ?? [],
    teams: additions.teams ?? [],
    matches: additions.matches ?? [],
    ...(additions.posterUrl ? { posterUrl: additions.posterUrl } : {}),
  }
}

function mapPublicStatus(status: string): TournamentStatus {
  const publicStatus = statusMap[status as keyof typeof statusMap]
  if (!publicStatus) throw new Error("NON_PUBLIC_TOURNAMENT_STATUS")
  return publicStatus
}

function getPosterUrl(
  mediaAssets: Array<{
    bucket: string
    objectPath: string
    kind: string
  }>,
  storage: ObjectStorage,
): string | undefined {
  const poster = mediaAssets.find((asset) => asset.kind === "POSTER")
  return poster
    ? storage.getPublicUrl(poster.bucket, poster.objectPath)
    : undefined
}
