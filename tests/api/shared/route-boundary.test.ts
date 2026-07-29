import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  createActorProvider: vi.fn(),
  getCurrentActor: vi.fn(),
  getTournamentRepository: vi.fn(),
  getMediaRepository: vi.fn(),
  createStorage: vi.fn(),
  getPrismaClient: vi.fn(),
}))

vi.mock(
  "@/features/identity/infrastructure/next-cookie-current-actor-provider",
  () => ({
    createNextCookieCurrentActorProvider: mocks.createActorProvider,
  }),
)

vi.mock(
  "@/features/tournament-operations/infrastructure/get-tournament-operations-repository",
  () => ({
    getTournamentOperationsRepository: mocks.getTournamentRepository,
  }),
)

vi.mock(
  "@/features/tournament-media/infrastructure/get-tournament-media-repository",
  () => ({
    getTournamentMediaRepository: mocks.getMediaRepository,
  }),
)

vi.mock(
  "@/features/tournament-media/infrastructure/supabase-object-storage",
  () => ({
    SupabaseObjectStorage: class {
      constructor() {
        return mocks.createStorage()
      }
    },
  }),
)

vi.mock("@/lib/server/prisma", () => ({
  getPrismaClient: mocks.getPrismaClient,
}))

import { POST as createTournamentRoute } from "@/app/api/admin/tournaments/route"
import { POST as uploadTournamentMediaRoute } from "@/app/api/admin/tournaments/[id]/media/route"
import { POST as createTeamRoute } from "@/app/api/teams/route"
import { ObjectStorageError } from "@/features/tournament-media/application/ports/object-storage"

const actor = {
  id: "admin-1",
  role: "PLATFORM_ADMIN",
} as const

beforeEach(() => {
  mocks.getCurrentActor.mockResolvedValue(actor)
  mocks.createActorProvider.mockReturnValue({
    getCurrentActor: mocks.getCurrentActor,
  })
  mocks.getTournamentRepository.mockResolvedValue({})
  mocks.getMediaRepository.mockResolvedValue({})
  mocks.createStorage.mockReturnValue({})
  mocks.getPrismaClient.mockReturnValue({})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("actual mutation route boundaries", () => {
  it("contains an actor resolution failure in the tournament create route", async () => {
    const diagnosticLogger = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    mocks.getCurrentActor.mockRejectedValueOnce(
      namedError("ActorProviderError", "private cookie detail"),
    )

    const response = await createTournamentRoute(
      new Request("http://localhost/api/admin/tournaments", {
        method: "POST",
        body: "{}",
      }),
    )

    await expectSafeRouteFailure(
      response,
      diagnosticLogger,
      "tournament.create",
      "ActorProviderError",
      "private cookie detail",
    )
  })

  it("contains a Prisma dependency factory failure in the team route", async () => {
    const diagnosticLogger = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    mocks.getPrismaClient.mockImplementationOnce(() => {
      throw namedError("PrismaFactoryError", "private connection detail")
    })

    const response = await createTeamRoute(
      new Request("http://localhost/api/teams", {
        method: "POST",
        body: "{}",
      }),
    )

    await expectSafeRouteFailure(
      response,
      diagnosticLogger,
      "team.create",
      "PrismaFactoryError",
      "private connection detail",
    )
  })

  it("contains a storage construction failure in the media route", async () => {
    const diagnosticLogger = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    mocks.createStorage.mockImplementationOnce(() => {
      throw new ObjectStorageError("UNAVAILABLE")
    })

    const response = await uploadTournamentMediaRoute(
      new Request(
        "http://localhost/api/admin/tournaments/tournament-1/media",
        { method: "POST" },
      ),
      {
        params: Promise.resolve({ id: "tournament-1" }),
      } as never,
    )

    await expectSafeRouteFailure(
      response,
      diagnosticLogger,
      "tournament.media.upload",
      "ObjectStorageError",
      "UNAVAILABLE",
      503,
    )
  })
})

function namedError(name: string, message: string) {
  return Object.assign(new Error(message), { name })
}

async function expectSafeRouteFailure(
  response: Response,
  logger: ReturnType<typeof vi.spyOn>,
  operation: string,
  errorType: string,
  privateDetail: string,
  status = 500,
) {
  expect(response.status).toBe(status)
  const body = (await response.json()) as {
    message: string
    correlationId: string
  }
  expect(body).toEqual({
    message: "ไม่สามารถดำเนินการได้ในขณะนี้",
    correlationId: expect.any(String),
  })
  expect(logger).toHaveBeenCalledWith({
    operation,
    correlationId: body.correlationId,
    errorType,
  })
  expect(JSON.stringify(logger.mock.calls)).not.toContain(privateDetail)
}
