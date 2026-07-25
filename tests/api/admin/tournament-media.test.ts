import { describe, expect, it, vi } from "vitest"

import { handleTournamentMediaUpload } from "@/features/admin/presentation/tournament-media-handler"

function requestWithPoster() {
  return requestWithFile({
    name: "poster.webp",
    type: "image/webp",
    size: 3,
  })
}

function requestWithFile(file: { name: string; type: string; size: number }) {
  return {
    formData: async () => ({
      get: (name: string) =>
        name === "kind"
          ? "POSTER"
          : {
              ...file,
              arrayBuffer: async () => new Uint8Array(file.size).buffer,
            },
    }),
  } as unknown as Request
}

describe("handleTournamentMediaUpload", () => {
  it("returns 403 when another organizer uploads media", async () => {
    const response = await handleTournamentMediaUpload(requestWithPoster(), "tournament-2", {
      actorProvider: {
        getCurrentActor: vi.fn(async () => ({
          id: "organizer-1",
          role: "TOURNAMENT_ORGANIZER",
        })),
      },
      upload: vi.fn(async () => {
        throw new Error("FORBIDDEN")
      }),
    })

    expect(response.status).toBe(403)
  })

  it("returns 413 when a poster is too large", async () => {
    const request = requestWithFile({
      name: "poster.webp",
      type: "image/webp",
      size: 5_000_001,
    })

    const response = await handleTournamentMediaUpload(request, "tournament-1", {
      actorProvider: { getCurrentActor: vi.fn(async () => ({ id: "organizer-1", role: "TOURNAMENT_ORGANIZER" })) },
      upload: vi.fn(async () => {
        throw new Error("MEDIA_FILE_TOO_LARGE")
      }),
    })

    expect(response.status).toBe(413)
  })
})
