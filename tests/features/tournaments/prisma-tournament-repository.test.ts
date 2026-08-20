import { describe, expect, it, vi } from "vitest"

import type { PrismaClient } from "@/lib/generated/prisma/client"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"
import { PrismaTournamentRepository } from "@/features/tournaments/infrastructure/prisma-tournament-repository"

const publicTournamentRow = {
  id: "tournament-published",
  slug: "published-bangkok-open",
  title: "Published Bangkok Open",
  provinceCode: "10",
  province: { nameTh: "กรุงเทพมหานคร", nameEn: "Bangkok" },
  venue: "COURTSIDE Arena",
  format: "FIVE_V_FIVE" as const,
  ageGroup: "Open",
  status: "PUBLISHED" as const,
  startsAt: new Date("2026-11-15T02:00:00.000Z"),
  endsAt: new Date("2026-11-16T11:00:00.000Z"),
  registrationDeadline: new Date("2026-11-01T16:59:00.000Z"),
  description: "การแข่งขันระดับประเทศ",
  registrations: [
    {
      team: {
        id: "team-1",
        name: "Bangkok Ballers",
      },
    },
    {
      team: {
        id: "team-2",
        name: "Chiang Mai Hoops",
      },
    },
  ],
  matches: [
    {
      id: "match-1",
      sequence: 1,
      purpose: "CHAMPIONSHIP" as const,
      scheduledAt: new Date("2026-11-15T02:00:00.000Z"),
      court: "Court 1",
      homeTeamId: "team-1",
      awayTeamId: "team-2",
      homeScore: 99,
      awayScore: 98,
      bracket: {
        status: "PUBLISHED" as const,
        mode: "SYSTEM_GENERATED" as const,
        entries: [
          {
            teamId: "team-1",
            teamNameSnapshot: "Bangkok Five (Locked)",
            startRoundSequence: 2,
          },
          {
            teamId: "team-2",
            teamNameSnapshot: "Chiang Mai Hoops (Locked)",
            startRoundSequence: 1,
          },
        ],
      },
      round: { name: "รอบชิงชนะเลิศ", sequence: 2 },
      result: {
        homeScore: 72,
        awayScore: 68,
      },
    },
  ],
  mediaAssets: [
    {
      id: "poster-1",
      kind: "POSTER" as const,
      bucket: "tournament-posters",
      objectPath: "tournaments/tournament-published/poster/poster.webp",
      fileName: "poster.webp",
      contentType: "image/webp",
      byteSize: 4_000,
      createdAt: new Date("2026-07-26T02:00:00.000Z"),
    },
    {
      id: "document-1",
      kind: "DOCUMENT" as const,
      bucket: "tournament-documents",
      objectPath: "tournaments/tournament-published/documents/rules.pdf",
      fileName: "rules.pdf",
      contentType: "application/pdf",
      byteSize: 20_000,
      createdAt: new Date("2026-07-26T03:00:00.000Z"),
    },
  ],
}

function createRepository(
  rows = [publicTournamentRow],
  options: { signedUrlError?: Error } = {},
) {
  const prisma = {
    tournament: {
      findMany: vi.fn(async () => rows),
      findFirst: vi.fn(async () => rows[0] ?? null),
    },
  }
  const storage: ObjectStorage = {
    upload: vi.fn(),
    move: vi.fn(),
    remove: vi.fn(),
    getPublicUrl: vi.fn(
      (_bucket, objectPath) => `https://storage.test/public/${objectPath}`,
    ),
    createSignedUrl: vi.fn(async (_bucket, objectPath) => {
      if (options.signedUrlError) throw options.signedUrlError
      return `https://storage.test/signed/${objectPath}?token=public`
    }),
  }

  return {
    prisma,
    storage,
    repository: new PrismaTournamentRepository(
      prisma as unknown as PrismaClient,
      storage,
    ),
  }
}

describe("PrismaTournamentRepository", () => {
  it("filters public tournaments by the exact province code", async () => {
    const { prisma, repository } = createRepository([])

    await repository.list({ provinceCode: "92" })

    expect(prisma.tournament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ provinceCode: "92" }),
      }),
    )
  })

  it("returns only public lifecycle states and maps stable public ids", async () => {
    const { prisma, repository } = createRepository()

    const tournaments = await repository.list({})

    expect(prisma.tournament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: {
            in: [
              "PUBLISHED",
              "REGISTRATION_CLOSED",
              "IN_PROGRESS",
              "COMPLETED",
              "ARCHIVED",
            ],
          },
        },
      }),
    )
    expect(tournaments).toEqual([
      expect.objectContaining({
        id: "tournament-published",
        slug: "published-bangkok-open",
        status: "OPEN",
      }),
    ])
  })

  it("maps approved teams, confirmed scores, poster, and signed documents", async () => {
    const { repository, storage } = createRepository()

    const tournament = await repository.findBySlug("published-bangkok-open")

    expect(tournament).toEqual(
      expect.objectContaining({
        teams: ["Bangkok Ballers", "Chiang Mai Hoops"],
        posterUrl:
          "https://storage.test/public/tournaments/tournament-published/poster/poster.webp",
        documents: [
          expect.objectContaining({
            id: "document-1",
            fileName: "rules.pdf",
            url: expect.stringContaining("token=public"),
          }),
        ],
        matches: [
          expect.objectContaining({
            id: "match-1",
            homeTeam: "Bangkok Five (Locked)",
            awayTeam: "Chiang Mai Hoops (Locked)",
            homeScore: 72,
            awayScore: 68,
          }),
        ],
      }),
    )
    expect(storage.createSignedUrl).toHaveBeenCalledWith(
      "tournament-documents",
      "tournaments/tournament-published/documents/rules.pdf",
      600,
    )
  })

  it("never exposes matches from draft or archived brackets", async () => {
    const rowWithPrivateBrackets = {
      ...publicTournamentRow,
      matches: [
        publicTournamentRow.matches[0],
        {
          ...publicTournamentRow.matches[0],
          id: "match-draft",
          sequence: 2,
          bracket: { status: "DRAFT" as const },
        },
        {
          ...publicTournamentRow.matches[0],
          id: "match-archived",
          sequence: 3,
          bracket: { status: "ARCHIVED" as const },
        },
      ],
    }
    const { prisma, repository } = createRepository([rowWithPrivateBrackets])

    const tournament = await repository.findBySlug("published-bangkok-open")

    expect(tournament?.matches.map((match) => match.id)).toEqual(["match-1"])
    expect(prisma.tournament.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          matches: expect.objectContaining({
            where: {
              bracket: {
                is: { status: "PUBLISHED" },
              },
            },
          }),
        }),
      }),
    )
  })

  it("keeps list discovery independent from document URL signing", async () => {
    const { prisma, repository, storage } = createRepository(
      [publicTournamentRow],
      { signedUrlError: new Error("SIGNING_FAILED") },
    )

    await expect(repository.list({})).resolves.toEqual([
      expect.objectContaining({
        id: "tournament-published",
        documents: [],
        matches: [],
        posterUrl:
          "https://storage.test/public/tournaments/tournament-published/poster/poster.webp",
        teams: [],
      }),
    ])
    expect(storage.createSignedUrl).not.toHaveBeenCalled()
    expect(prisma.tournament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          province: true,
          mediaAssets: expect.objectContaining({
            where: { deletedAt: null, kind: "POSTER" },
          }),
        },
      }),
    )
  })

  it("signs active documents only for tournament detail", async () => {
    const { repository, storage } = createRepository()

    const tournament = await repository.findBySlug("published-bangkok-open")

    expect(tournament?.documents).toEqual([
      expect.objectContaining({
        id: "document-1",
        url: expect.stringContaining("token=public"),
      }),
    ])
    expect(storage.createSignedUrl).toHaveBeenCalledTimes(1)
  })

  it("loads published competition data without signing documents", async () => {
    const { repository, storage } = createRepository()

    const tournament = await repository.findCompetitionBySlug(
      "published-bangkok-open",
    )

    expect(tournament).toEqual(
      expect.objectContaining({
        documents: [],
        matches: [
          expect.objectContaining({
            id: "match-1",
            homeTeam: "Bangkok Five (Locked)",
            awayTeam: "Chiang Mai Hoops (Locked)",
            roundSequence: 2,
            sequence: 1,
            purpose: "CHAMPIONSHIP",
            homeScore: 72,
            awayScore: 68,
          }),
        ],
        bracketSource: "SYSTEM_GENERATED",
        bracketEntries: [
          {
            teamName: "Bangkok Five (Locked)",
            startRoundSequence: 2,
          },
          {
            teamName: "Chiang Mai Hoops (Locked)",
            startRoundSequence: 1,
          },
        ],
        teams: ["Bangkok Ballers", "Chiang Mai Hoops"],
      }),
    )
    expect(storage.createSignedUrl).not.toHaveBeenCalled()
  })

  it("preserves an unscheduled match without inventing a date", async () => {
    const unscheduledRow = {
      ...publicTournamentRow,
      matches: [
        {
          ...publicTournamentRow.matches[0],
          scheduledAt: null,
          result: null,
        },
      ],
    }
    const { repository } = createRepository([unscheduledRow])

    const tournament = await repository.findCompetitionBySlug(
      "published-bangkok-open",
    )

    expect(tournament?.matches[0]?.scheduledAt).toBeNull()
    expect(tournament?.matches[0]?.homeScore).toBeNull()
    expect(tournament?.matches[0]?.awayScore).toBeNull()
  })

  it("pushes public text and Bangkok calendar-day filters to Prisma", async () => {
    const closedTournament = {
      ...publicTournamentRow,
      id: "tournament-closed",
      slug: "north-court-3x3",
      title: "North Court 3x3",
      provinceCode: "50",
      province: { nameTh: "เชียงใหม่", nameEn: "Chiang Mai" },
      venue: "สนามกีฬานิมมาน",
      format: "THREE_V_THREE" as const,
      ageGroup: "U18",
      status: "REGISTRATION_CLOSED" as const,
      startsAt: new Date("2026-10-03T17:30:00.000Z"),
      registrations: [],
      matches: [],
      mediaAssets: [],
    }
    const { prisma, repository } = createRepository([closedTournament])

    const tournaments = await repository.list({
      query: "north",
      provinceCode: "50",
      format: "THREE_V_THREE",
      ageGroup: "u18",
      venue: "นิมมาน",
      date: "2026-10-04",
      status: "CLOSED",
    })

    expect(tournaments.map((tournament) => tournament.id)).toEqual([
      "tournament-closed",
    ])
    expect(prisma.tournament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ["REGISTRATION_CLOSED"] },
          provinceCode: "50",
          format: "THREE_V_THREE",
          ageGroup: { equals: "u18", mode: "insensitive" },
          venue: { contains: "นิมมาน", mode: "insensitive" },
          startsAt: {
            gte: new Date("2026-10-03T17:00:00.000Z"),
            lt: new Date("2026-10-04T17:00:00.000Z"),
          },
          OR: expect.arrayContaining([
            { title: { contains: "north", mode: "insensitive" } },
            {
              registrations: {
                some: {
                  status: "APPROVED",
                  team: {
                    name: { contains: "north", mode: "insensitive" },
                  },
                },
              },
            },
          ]),
        }),
      }),
    )
  })
})
