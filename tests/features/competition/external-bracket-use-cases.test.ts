import { describe, expect, it, vi } from "vitest"

import { publishExternalBracket } from "@/features/competition/application/publish-external-bracket"
import { retireExternalBracket } from "@/features/competition/application/retire-external-bracket"
import { selectBracketMode } from "@/features/competition/application/select-bracket-mode"
import { uploadExternalBracket } from "@/features/competition/application/upload-external-bracket"
import type { ExternalBracketRepository } from "@/features/competition/application/ports/external-bracket-repository"
import { ObjectStorageError } from "@/features/tournament-media/application/ports/object-storage"
import type { Actor } from "@/features/identity/domain/actor"
import { TournamentGovernancePolicyError } from "@/features/tournament-operations/domain/tournament-governance-policy"

const organizer: Actor = {
  id: "organizer-1",
  role: "TOURNAMENT_ORGANIZER",
  email: "owner@example.com",
  displayName: "Owner",
}
const otherOrganizer: Actor = { ...organizer, id: "organizer-2" }
const admin: Actor = {
  id: "admin-1",
  role: "PLATFORM_ADMIN",
  email: "admin@example.com",
  displayName: "Admin",
}

function workspace(overrides: Record<string, unknown> = {}) {
  return {
    tournamentId: "t-1",
    tournamentTitle: "Bangkok Cup",
    organizerId: organizer.id,
    tournamentGovernanceStatus: "ACTIVE",
    bracketId: "b-1",
    bracketVersion: 3,
    bracketStatus: "DRAFT",
    bracketMode: "EXTERNAL_DOCUMENT" as const,
    hasStartedMatch: false,
    latestConfirmedResultAt: null,
    revisions: [],
    publishedRevision: null,
    ...overrides,
  }
}

function createDependencies(overrides: Record<string, unknown> = {}) {
  const externalBrackets = {
    findWorkspace: vi.fn(async () => workspace()),
    findModeSelectionContext: vi.fn(async () => ({
      ...workspace(),
      bracketMode: "SYSTEM_GENERATED" as const,
    })),
    selectMode: vi.fn(async (input) => ({
      bracketId: input.bracketId,
      bracketVersion: input.expectedVersion + 1,
      bracketMode: input.targetMode,
    })),
    commitUploadedRevision: vi.fn(async (input) => ({
      id: "revision-1",
      bracketId: input.bracketId,
      revision: 1,
      status: "DRAFT" as const,
      publishedAt: null,
      retiredAt: null,
      createdById: input.actorId,
      createdByName: "Owner",
      createdAt: "2026-08-19T03:00:00.000Z",
      mediaAsset: { ...input.asset, createdAt: "2026-08-19T03:00:00.000Z", deletedAt: null },
    })),
    publishRevision: vi.fn(async () => ({
      bracketId: "b-1",
      bracketVersion: 4,
      revisions: [],
      publishedRevision: null,
    })),
    retireRevision: vi.fn(async () => ({ id: "revision-1" })),
  }
  const storage = {
    upload: vi.fn(async () => undefined),
    move: vi.fn(async () => undefined),
    remove: vi.fn(async () => undefined),
    getPublicUrl: vi.fn(),
    createSignedUrl: vi.fn(),
  }
  const dependencies = {
    externalBrackets,
    storage,
    probe: vi.fn(async () => ({ kind: "PDF" as const, pageCount: 1 })),
    createId: vi.fn(() => "asset-1"),
    cleanupLogger: { error: vi.fn() },
    ...overrides,
  }
  return dependencies as typeof dependencies & {
    externalBrackets: ExternalBracketRepository & typeof externalBrackets
  }
}

const pdfFile = {
  fileName: "bracket.pdf",
  contentType: "application/pdf",
  byteSize: 4,
  data: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
}

describe("selectBracketMode", () => {
  it("lets the owner switch a draft bracket with optimistic concurrency", async () => {
    const dependencies = createDependencies()

    const result = await selectBracketMode(
      { tournamentId: "t-1", targetMode: "EXTERNAL_DOCUMENT", expectedVersion: 3 },
      organizer,
      dependencies,
    )

    expect(result.bracketMode).toBe("EXTERNAL_DOCUMENT")
    expect(dependencies.externalBrackets.selectMode).toHaveBeenCalledWith(
      expect.objectContaining({ actorId: organizer.id, adminOverride: false, expectedVersion: 3 }),
    )
  })

  it("hides another organizer's bracket", async () => {
    const dependencies = createDependencies()
    await expect(
      selectBracketMode(
        { tournamentId: "t-1", targetMode: "EXTERNAL_DOCUMENT", expectedVersion: 3 },
        otherOrganizer,
        dependencies,
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("requires an override reason from an admin and records it", async () => {
    const dependencies = createDependencies()
    await expect(
      selectBracketMode(
        { tournamentId: "t-1", targetMode: "EXTERNAL_DOCUMENT", expectedVersion: 3 },
        admin,
        dependencies,
      ),
    ).rejects.toThrow("REASON_REQUIRED")

    await selectBracketMode(
      {
        tournamentId: "t-1",
        targetMode: "EXTERNAL_DOCUMENT",
        expectedVersion: 3,
        reason: "ช่วยผู้จัดแก้ไขโหมด",
      },
      admin,
      dependencies,
    )
    expect(dependencies.externalBrackets.selectMode).toHaveBeenLastCalledWith(
      expect.objectContaining({ adminOverride: true, reason: "ช่วยผู้จัดแก้ไขโหมด" }),
    )
  })

  it.each([
    [{ bracketStatus: "PUBLISHED" }, "BRACKET_MODE_LOCKED"],
    [{ hasStartedMatch: true }, "BRACKET_MODE_LOCKED"],
    [{ bracketVersion: 4 }, "CONFLICT"],
  ])("rejects invalid lifecycle or version %#", async (contextOverride, code) => {
    const dependencies = createDependencies()
    dependencies.externalBrackets.findModeSelectionContext.mockResolvedValue({
      ...workspace(contextOverride),
      bracketMode: "SYSTEM_GENERATED",
    })
    await expect(
      selectBracketMode(
        { tournamentId: "t-1", targetMode: "EXTERNAL_DOCUMENT", expectedVersion: 3 },
        organizer,
        dependencies,
      ),
    ).rejects.toThrow(code)
  })

  it("blocks mode selection for a suspended tournament before persistence", async () => {
    const dependencies = createDependencies()
    dependencies.externalBrackets.findModeSelectionContext.mockResolvedValue({
      ...workspace({ tournamentGovernanceStatus: "SUSPENDED" }),
      bracketMode: "SYSTEM_GENERATED",
    })

    await expect(
      selectBracketMode(
        { tournamentId: "t-1", targetMode: "EXTERNAL_DOCUMENT", expectedVersion: 3 },
        organizer,
        dependencies,
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(dependencies.externalBrackets.selectMode).not.toHaveBeenCalled()
  })
})

describe("uploadExternalBracket", () => {
  it("compensates a possibly partial staging object when upload fails", async () => {
    const dependencies = createDependencies()
    dependencies.storage.upload.mockRejectedValue(new ObjectStorageError("UNAVAILABLE"))

    await expect(
      uploadExternalBracket(
        { tournamentId: "t-1", expectedVersion: 3, file: pdfFile },
        organizer,
        dependencies,
      ),
    ).rejects.toMatchObject({ name: "ObjectStorageError", code: "UNAVAILABLE" })
    expect(dependencies.storage.remove).toHaveBeenCalledWith(
      "tournament-brackets",
      "tournaments/t-1/bracket/staging/asset-1.pdf",
    )
  })

  it("stages, probes, moves and commits a valid file in order", async () => {
    const dependencies = createDependencies()
    const order: string[] = []
    dependencies.storage.upload.mockImplementation(async () => { order.push("upload") })
    dependencies.probe.mockImplementation(async () => { order.push("probe"); return { kind: "PDF", pageCount: 1 } })
    dependencies.storage.move.mockImplementation(async () => { order.push("move") })
    dependencies.externalBrackets.commitUploadedRevision.mockImplementation(async (input) => {
      order.push("commit")
      return createDependencies().externalBrackets.commitUploadedRevision(input)
    })

    await uploadExternalBracket(
      { tournamentId: "t-1", expectedVersion: 3, file: pdfFile },
      organizer,
      dependencies,
    )

    expect(order).toEqual(["upload", "probe", "move", "commit"])
    expect(dependencies.storage.upload).toHaveBeenCalledWith(expect.objectContaining({
      bucket: "tournament-brackets",
      objectPath: "tournaments/t-1/bracket/staging/asset-1.pdf",
    }))
    expect(dependencies.externalBrackets.commitUploadedRevision).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedVersion: 3,
        reason: null,
        asset: expect.objectContaining({
          objectPath: "tournaments/t-1/bracket/revisions/asset-1.pdf",
          kind: "BRACKET_DOCUMENT",
        }),
      }),
    )
  })

  it("removes the staged object when probing fails", async () => {
    const dependencies = createDependencies()
    dependencies.probe.mockRejectedValue(new Error("BRACKET_FILE_UNREADABLE"))
    await expect(
      uploadExternalBracket(
        { tournamentId: "t-1", expectedVersion: 3, file: pdfFile },
        organizer,
        dependencies,
      ),
    ).rejects.toThrow("BRACKET_FILE_UNREADABLE")
    expect(dependencies.storage.remove).toHaveBeenCalledWith(
      "tournament-brackets",
      "tournaments/t-1/bracket/staging/asset-1.pdf",
    )
  })

  it("removes the final object when database commit fails", async () => {
    const dependencies = createDependencies()
    dependencies.externalBrackets.commitUploadedRevision.mockRejectedValue(new Error("CONFLICT"))
    await expect(
      uploadExternalBracket(
        { tournamentId: "t-1", expectedVersion: 3, file: pdfFile },
        organizer,
        dependencies,
      ),
    ).rejects.toThrow("CONFLICT")
    expect(dependencies.storage.remove).toHaveBeenCalledWith(
      "tournament-brackets",
      "tournaments/t-1/bracket/revisions/asset-1.pdf",
    )
  })

  it("removes the final object when a transactional governance recheck rejects persistence", async () => {
    const dependencies = createDependencies()
    dependencies.externalBrackets.commitUploadedRevision.mockRejectedValue(
      new TournamentGovernancePolicyError(["TOURNAMENT_SUSPENDED"]),
    )

    await expect(
      uploadExternalBracket(
        { tournamentId: "t-1", expectedVersion: 3, file: pdfFile },
        organizer,
        dependencies,
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(dependencies.storage.remove).toHaveBeenCalledWith(
      "tournament-brackets",
      "tournaments/t-1/bracket/revisions/asset-1.pdf",
    )
  })

  it("reports cleanup failure without replacing the domain failure", async () => {
    const dependencies = createDependencies()
    dependencies.probe.mockRejectedValue(new Error("BRACKET_FILE_UNREADABLE"))
    dependencies.storage.remove.mockRejectedValue(new ObjectStorageError("UNAVAILABLE"))
    await expect(
      uploadExternalBracket(
        { tournamentId: "t-1", expectedVersion: 3, file: pdfFile },
        organizer,
        dependencies,
      ),
    ).rejects.toThrow("BRACKET_FILE_UNREADABLE")
    expect(dependencies.cleanupLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "external_bracket.upload.compensate" }),
    )
  })

  it("blocks suspended uploads before creating an asset or touching storage", async () => {
    const dependencies = createDependencies()
    dependencies.externalBrackets.findWorkspace.mockResolvedValue(
      workspace({ tournamentGovernanceStatus: "SUSPENDED" }),
    )

    await expect(
      uploadExternalBracket(
        { tournamentId: "t-1", expectedVersion: 3, file: pdfFile },
        organizer,
        dependencies,
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(dependencies.createId).not.toHaveBeenCalled()
    expect(dependencies.storage.upload).not.toHaveBeenCalled()
    expect(dependencies.probe).not.toHaveBeenCalled()
    expect(dependencies.externalBrackets.commitUploadedRevision).not.toHaveBeenCalled()
  })
})

describe("external revision publication", () => {
  it("publishes a draft revision for the owner", async () => {
    const dependencies = createDependencies()
    await publishExternalBracket(
      { tournamentId: "t-1", revisionId: "revision-1", expectedVersion: 3 },
      organizer,
      dependencies,
    )
    expect(dependencies.externalBrackets.publishRevision).toHaveBeenCalledWith(
      expect.objectContaining({ revisionId: "revision-1", reason: null, adminOverride: false }),
    )
  })

  it("rejects publication outside external mode", async () => {
    const dependencies = createDependencies()
    dependencies.externalBrackets.findWorkspace.mockResolvedValue(null)
    await expect(
      publishExternalBracket(
        { tournamentId: "t-1", revisionId: "revision-1", expectedVersion: 3 },
        organizer,
        dependencies,
      ),
    ).rejects.toThrow("NOT_FOUND")
  })

  it("retains storage and delegates the draft-only retire guard", async () => {
    const dependencies = createDependencies()
    await retireExternalBracket(
      { tournamentId: "t-1", revisionId: "revision-1", expectedVersion: 3 },
      organizer,
      dependencies,
    )
    expect(dependencies.externalBrackets.retireRevision).toHaveBeenCalled()
    expect(dependencies.storage.remove).not.toHaveBeenCalled()
  })

  it("blocks suspended external publication before persistence", async () => {
    const dependencies = createDependencies()
    dependencies.externalBrackets.findWorkspace.mockResolvedValue(
      workspace({ tournamentGovernanceStatus: "SUSPENDED" }),
    )

    await expect(
      publishExternalBracket(
        { tournamentId: "t-1", revisionId: "revision-1", expectedVersion: 3 },
        organizer,
        dependencies,
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(dependencies.externalBrackets.publishRevision).not.toHaveBeenCalled()
  })

  it("blocks suspended external retirement before persistence", async () => {
    const dependencies = createDependencies()
    dependencies.externalBrackets.findWorkspace.mockResolvedValue(
      workspace({ tournamentGovernanceStatus: "SUSPENDED" }),
    )

    await expect(
      retireExternalBracket(
        { tournamentId: "t-1", revisionId: "revision-1", expectedVersion: 3 },
        organizer,
        dependencies,
      ),
    ).rejects.toMatchObject({ issues: ["TOURNAMENT_SUSPENDED"] })
    expect(dependencies.externalBrackets.retireRevision).not.toHaveBeenCalled()
  })
})
