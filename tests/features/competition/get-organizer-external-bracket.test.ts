import { describe, expect, it, vi } from "vitest"

import { getOrganizerExternalBracketWorkspace } from "@/features/competition/application/get-organizer-external-bracket-workspace"
import type { ExternalBracketRepository } from "@/features/competition/application/ports/external-bracket-repository"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"

const organizer = {
  id: "organizer-1",
  role: "TOURNAMENT_ORGANIZER" as const,
  email: "organizer@example.test",
  displayName: "Organizer One",
}

describe("getOrganizerExternalBracketWorkspace", () => {
  it("returns mode context without an external workspace in generated mode", async () => {
    const { externalBrackets, storage } = dependencies()
    externalBrackets.findModeSelectionContext = vi.fn().mockResolvedValue({
      tournamentId: "tournament-1",
      organizerId: organizer.id,
      tournamentGovernanceStatus: "ACTIVE",
      bracketId: "bracket-1",
      bracketVersion: 2,
      bracketStatus: "DRAFT",
      bracketMode: "SYSTEM_GENERATED",
      hasStartedMatch: false,
    })

    const result = await getOrganizerExternalBracketWorkspace(
      "tournament-1",
      organizer,
      { externalBrackets, storage },
    )

    expect(result).toMatchObject({
      modeContext: { bracketMode: "SYSTEM_GENERATED" },
      workspace: null,
      publishedPreviewUrl: null,
    })
    expect(externalBrackets.findWorkspace).not.toHaveBeenCalled()
  })

  it("hides another organizer's bracket before signing any file", async () => {
    const { externalBrackets, storage } = dependencies()
    externalBrackets.findModeSelectionContext = vi.fn().mockResolvedValue({
      tournamentId: "tournament-1",
      organizerId: "organizer-2",
      tournamentGovernanceStatus: "ACTIVE",
      bracketId: "bracket-1",
      bracketVersion: 2,
      bracketStatus: "DRAFT",
      bracketMode: "EXTERNAL_DOCUMENT",
      hasStartedMatch: false,
    })

    await expect(
      getOrganizerExternalBracketWorkspace("tournament-1", organizer, {
        externalBrackets,
        storage,
      }),
    ).rejects.toThrow("NOT_FOUND")
    expect(storage.createSignedUrl).not.toHaveBeenCalled()
  })

  it("signs only the currently published external revision for ten minutes", async () => {
    const { externalBrackets, storage } = dependencies()
    const modeContext = {
      tournamentId: "tournament-1",
      organizerId: organizer.id,
      tournamentGovernanceStatus: "ACTIVE" as const,
      bracketId: "bracket-1",
      bracketVersion: 3,
      bracketStatus: "PUBLISHED",
      bracketMode: "EXTERNAL_DOCUMENT" as const,
      hasStartedMatch: false,
      latestConfirmedResultAt: "2026-08-19T09:00:00.000Z",
    }
    externalBrackets.findModeSelectionContext = vi
      .fn()
      .mockResolvedValue(modeContext)
    externalBrackets.findWorkspace = vi.fn().mockResolvedValue({
      ...modeContext,
      tournamentTitle: "External Cup",
      revisions: [publishedRevision],
      publishedRevision,
    })
    storage.createSignedUrl = vi
      .fn()
      .mockResolvedValue("https://signed.example.test/bracket.pdf")

    const result = await getOrganizerExternalBracketWorkspace(
      "tournament-1",
      organizer,
      { externalBrackets, storage },
    )

    expect(storage.createSignedUrl).toHaveBeenCalledWith(
      "tournament-brackets",
      "tournaments/tournament-1/bracket/revisions/bracket.pdf",
      600,
    )
    expect(result.publishedPreviewUrl).toBe(
      "https://signed.example.test/bracket.pdf",
    )
    expect(result.isPublishedRevisionStale).toBe(true)
  })
})

const publishedRevision = {
  id: "revision-1",
  bracketId: "bracket-1",
  revision: 1,
  status: "PUBLISHED" as const,
  publishedAt: "2026-08-19T08:00:00.000Z",
  retiredAt: null,
  createdById: organizer.id,
  createdByName: organizer.displayName,
  createdAt: "2026-08-19T07:00:00.000Z",
  mediaAsset: {
    id: "asset-1",
    tournamentId: "tournament-1",
    kind: "BRACKET_DOCUMENT" as const,
    bucket: "tournament-brackets",
    objectPath: "tournaments/tournament-1/bracket/revisions/bracket.pdf",
    fileName: "bracket.pdf",
    contentType: "application/pdf",
    byteSize: 1_024,
    createdById: organizer.id,
    createdAt: "2026-08-19T07:00:00.000Z",
    deletedAt: null,
  },
}

function dependencies() {
  const externalBrackets = {
    findModeSelectionContext: vi.fn(),
    selectMode: vi.fn(),
    commitUploadedRevision: vi.fn(),
    publishRevision: vi.fn(),
    retireRevision: vi.fn(),
    findWorkspace: vi.fn(),
    findPublicByTournamentSlug: vi.fn(),
  } satisfies ExternalBracketRepository
  const storage = {
    upload: vi.fn(),
    move: vi.fn(),
    remove: vi.fn(),
    getPublicUrl: vi.fn(),
    createSignedUrl: vi.fn(),
  } satisfies ObjectStorage
  return { externalBrackets, storage }
}
