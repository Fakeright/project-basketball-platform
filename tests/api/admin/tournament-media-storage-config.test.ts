import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  createActorProvider: vi.fn(),
  getTournamentRepository: vi.fn(),
  getMediaRepository: vi.fn(),
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

import { POST as uploadTournamentMediaRoute } from "@/app/api/admin/tournaments/[id]/media/route"

const actor = { id: "admin-1", role: "PLATFORM_ADMIN" } as const

beforeEach(() => {
  mocks.createActorProvider.mockReturnValue({
    getCurrentActor: vi.fn(async () => actor),
  })
  mocks.getTournamentRepository.mockResolvedValue({
    findById: vi.fn(async () => ({ organizerId: "organizer-1" })),
  })
  mocks.getMediaRepository.mockResolvedValue({})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("tournament media storage configuration", () => {
  it.each([
    ["missing URL", ""],
    ["invalid URL", "not-a-url"],
  ])(
    "returns a correlated 503 for %s from the real storage constructor",
    async (_caseName, url) => {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url)
      vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role")
      const diagnosticLogger = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)

      const response = await uploadTournamentMediaRoute(
        validUploadRequest(),
        { params: Promise.resolve({ id: "tournament-1" }) } as never,
      )

      expect(response.status).toBe(503)
      const body = (await response.json()) as {
        message: string
        correlationId: string
      }
      expect(body).toEqual({
        message: "ไม่สามารถดำเนินการได้ในขณะนี้",
        correlationId: expect.any(String),
      })
      expect(diagnosticLogger).toHaveBeenCalledWith({
        operation: "tournament.media.upload",
        correlationId: body.correlationId,
        errorType: "ObjectStorageError",
      })
      const serializedOutput = JSON.stringify({
        diagnostics: diagnosticLogger.mock.calls,
        body,
      })
      expect(serializedOutput).not.toContain("NEXT_PUBLIC_SUPABASE_URL")
      expect(serializedOutput).not.toContain("SUPABASE_SERVICE_ROLE_KEY")
      if (url) expect(serializedOutput).not.toContain(url)
    },
  )
})

function validUploadRequest() {
  const formData = new FormData()
  formData.set("kind", "POSTER")
  formData.set(
    "file",
    new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], {
      type: "image/png",
    }),
    "poster.png",
  )
  return new Request("http://localhost/api/admin/tournaments/tournament-1/media", {
    method: "POST",
    body: formData,
  })
}
