import { describe, expect, it, vi } from "vitest"

import { getExternalBracketView } from "@/features/competition/application/get-external-bracket-view"
import type { ExternalBracketRepository } from "@/features/competition/application/ports/external-bracket-repository"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"

describe("getExternalBracketView", () => {
  it("returns null when no published external revision exists", async () => {
    const { externalBrackets, storage } = dependencies()

    await expect(
      getExternalBracketView("missing", { externalBrackets, storage }),
    ).resolves.toBeNull()
    expect(storage.createSignedUrl).not.toHaveBeenCalled()
  })

  it("creates a ten-minute signed view for the published revision", async () => {
    const { externalBrackets, storage } = dependencies()
    externalBrackets.findPublicByTournamentSlug = vi.fn().mockResolvedValue({
      tournamentId: "tournament-1",
      tournamentTitle: "External Cup",
      tournamentSlug: "external-cup",
      bracketId: "bracket-1",
      revision: publishedRevision,
      latestConfirmedResultAt: "2026-08-19T09:00:00.000Z",
    })
    storage.createSignedUrl = vi.fn().mockResolvedValue("https://signed.test/bracket.pdf")

    const result = await getExternalBracketView("external-cup", {
      externalBrackets,
      storage,
    })

    expect(storage.createSignedUrl).toHaveBeenCalledWith(
      "tournament-brackets",
      "tournaments/tournament-1/bracket.pdf",
      600,
    )
    expect(result).toMatchObject({
      tournamentTitle: "External Cup",
      previewUrl: "https://signed.test/bracket.pdf",
      fileName: "bracket.pdf",
      revision: 2,
    })
  })
})

const publishedRevision = {
  id: "revision-2",
  bracketId: "bracket-1",
  revision: 2,
  status: "PUBLISHED" as const,
  publishedAt: "2026-08-19T08:00:00.000Z",
  retiredAt: null,
  createdById: "organizer-1",
  createdByName: "Organizer",
  createdAt: "2026-08-19T07:00:00.000Z",
  mediaAsset: {
    id: "asset-1",
    tournamentId: "tournament-1",
    kind: "BRACKET_DOCUMENT" as const,
    bucket: "tournament-brackets",
    objectPath: "tournaments/tournament-1/bracket.pdf",
    fileName: "bracket.pdf",
    contentType: "application/pdf",
    byteSize: 2048,
    createdById: "organizer-1",
    createdAt: "2026-08-19T07:00:00.000Z",
    deletedAt: null,
  },
}

function dependencies() {
  const externalBrackets = {
    findPublicByTournamentSlug: vi.fn().mockResolvedValue(null),
  } as unknown as ExternalBracketRepository
  const storage = {
    createSignedUrl: vi.fn(),
  } as unknown as ObjectStorage
  return { externalBrackets, storage }
}
