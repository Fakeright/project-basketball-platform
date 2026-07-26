import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"
import type {
  Tournament,
  TournamentSearchFilters,
  TournamentStatus,
} from "@/features/tournaments/domain/tournament"

import type { TournamentRepository } from "./tournament-repository"

const publicStatuses = [
  "PUBLISHED",
  "REGISTRATION_CLOSED",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
] as const

const publicTournamentInclude = {
  registrations: {
    where: { status: "APPROVED" },
    orderBy: { createdAt: "asc" },
    include: { team: { select: { id: true, name: true } } },
  },
  matches: {
    orderBy: [{ scheduledAt: "asc" }, { sequence: "asc" }],
    include: {
      round: { select: { name: true } },
      result: { select: { homeScore: true, awayScore: true } },
    },
  },
  mediaAssets: {
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.TournamentInclude

type PublicTournamentRow = Prisma.TournamentGetPayload<{
  include: typeof publicTournamentInclude
}>

const statusMap = {
  PUBLISHED: "OPEN",
  REGISTRATION_CLOSED: "CLOSED",
  IN_PROGRESS: "ONGOING",
  COMPLETED: "COMPLETED",
  ARCHIVED: "COMPLETED",
} as const satisfies Record<(typeof publicStatuses)[number], TournamentStatus>

export class PrismaTournamentRepository implements TournamentRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: ObjectStorage,
  ) {}

  async list(filters: TournamentSearchFilters): Promise<Tournament[]> {
    const rows = await this.prisma.tournament.findMany({
      where: { status: { in: [...publicStatuses] } },
      include: publicTournamentInclude,
      orderBy: { startsAt: "desc" },
    })

    return Promise.all(
      rows
        .filter((row) => matchesFilters(row, filters))
        .map((row) => this.mapTournament(row)),
    )
  }

  async findBySlug(slug: string): Promise<Tournament | null> {
    const row = await this.prisma.tournament.findFirst({
      where: {
        slug,
        status: { in: [...publicStatuses] },
      },
      include: publicTournamentInclude,
    })

    return row ? this.mapTournament(row) : null
  }

  private async mapTournament(row: PublicTournamentRow): Promise<Tournament> {
    const teamNames = new Map(
      row.registrations.map(({ team }) => [team.id, team.name]),
    )
    const poster = row.mediaAssets.find((asset) => asset.kind === "POSTER")
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

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      province: row.province,
      venue: row.venue,
      format: row.format,
      ageGroup: row.ageGroup,
      status: statusMap[row.status as keyof typeof statusMap],
      startsAt: row.startsAt.toISOString(),
      endsAt: row.endsAt.toISOString(),
      registrationDeadline: row.registrationDeadline.toISOString(),
      description: row.description,
      posterUrl: poster
        ? this.storage.getPublicUrl(poster.bucket, poster.objectPath)
        : undefined,
      documents,
      teams: row.registrations.map(({ team }) => team.name),
      matches: row.matches.map((match) => ({
        id: match.id,
        tournamentSlug: row.slug,
        round: match.round.name,
        court: match.court ?? "ยังไม่กำหนดสนาม",
        scheduledAt: match.scheduledAt?.toISOString() ?? null,
        homeTeam: teamNames.get(match.homeTeamId ?? "") ?? "รอยืนยันทีม",
        awayTeam: teamNames.get(match.awayTeamId ?? "") ?? "รอยืนยันทีม",
        homeScore: match.result?.homeScore ?? null,
        awayScore: match.result?.awayScore ?? null,
      })),
    }
  }
}

function matchesFilters(
  tournament: PublicTournamentRow,
  filters: TournamentSearchFilters,
) {
  const searchText = [
    tournament.slug,
    tournament.title,
    tournament.province,
    tournament.venue,
    tournament.ageGroup,
    tournament.description,
    ...tournament.registrations.map(({ team }) => team.name),
  ].join(" ")

  return (
    (!filters.query || matchesText(searchText, filters.query)) &&
    (!filters.province ||
      matchesText(tournament.province, filters.province)) &&
    (!filters.format || tournament.format === filters.format) &&
    (!filters.ageGroup ||
      matchesText(tournament.ageGroup, filters.ageGroup)) &&
    (!filters.venue || matchesText(tournament.venue, filters.venue)) &&
    (!filters.date ||
      tournament.startsAt.toISOString().startsWith(filters.date)) &&
    (!filters.status ||
      statusMap[tournament.status as keyof typeof statusMap] === filters.status)
  )
}

function matchesText(value: string, filter: string) {
  return value
    .toLocaleLowerCase("th-TH")
    .includes(filter.toLocaleLowerCase("th-TH"))
}
