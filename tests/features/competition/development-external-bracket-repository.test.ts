import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { DevelopmentExternalBracketRepository } from "@/features/competition/infrastructure/development-external-bracket-repository"

const temporaryDirectories: string[] = []
const now = new Date("2026-08-19T13:00:00.000Z")

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

async function createStatePath() {
  const directory = await mkdtemp(path.join(tmpdir(), "courtside-bracket-"))
  temporaryDirectories.push(directory)
  const statePath = path.join(directory, "development-tournaments.json")
  await writeFile(
    statePath,
    JSON.stringify({
      preserved: { value: true },
      externalBracketWorkspaces: [{
        tournamentId: "tournament-1",
        tournamentTitle: "External Cup",
        tournamentSlug: "external-cup",
        organizerId: "organizer-1",
        bracketId: "bracket-1",
        bracketVersion: 3,
        bracketStatus: "DRAFT",
        bracketMode: "EXTERNAL_DOCUMENT",
        hasStartedMatch: false,
      }],
      externalBracketRevisions: [],
      mediaAssets: [],
      auditEvents: [],
    }),
    "utf8",
  )
  return statePath
}

describe("DevelopmentExternalBracketRepository", () => {
  it("persists an uploaded revision atomically without discarding shared development state", async () => {
    const statePath = await createStatePath()
    const repository = new DevelopmentExternalBracketRepository(
      statePath,
      () => "revision-1",
      () => now,
    )

    const revision = await repository.commitUploadedRevision({
      tournamentId: "tournament-1",
      bracketId: "bracket-1",
      expectedVersion: 3,
      asset: {
        id: "asset-1",
        tournamentId: "tournament-1",
        kind: "BRACKET_DOCUMENT",
        bucket: "tournament-brackets",
        objectPath: "tournaments/tournament-1/bracket/revisions/asset-1.pdf",
        fileName: "bracket.pdf",
        contentType: "application/pdf",
        byteSize: 2_048,
        createdById: "organizer-1",
      },
      actorId: "organizer-1",
      adminOverride: false,
    })

    const state = JSON.parse(await readFile(statePath, "utf8"))
    expect(revision).toMatchObject({ id: "revision-1", revision: 1 })
    expect(state.preserved).toEqual({ value: true })
    expect(state.externalBracketWorkspaces[0].bracketVersion).toBe(4)
    expect(state.mediaAssets).toHaveLength(1)
    expect(state.auditEvents.at(-1).action).toBe(
      "EXTERNAL_BRACKET_REVISION_UPLOADED",
    )
  })

  it("rejects a second mutation that holds a stale version", async () => {
    const statePath = await createStatePath()
    const repository = new DevelopmentExternalBracketRepository(
      statePath,
      () => "revision-1",
      () => now,
    )
    const input = {
      tournamentId: "tournament-1",
      bracketId: "bracket-1",
      expectedVersion: 3,
      asset: {
        id: "asset-1",
        tournamentId: "tournament-1",
        kind: "BRACKET_DOCUMENT" as const,
        bucket: "tournament-brackets",
        objectPath: "tournaments/tournament-1/bracket/revisions/asset-1.pdf",
        fileName: "bracket.pdf",
        contentType: "application/pdf",
        byteSize: 2_048,
        createdById: "organizer-1",
      },
      actorId: "organizer-1",
      adminOverride: false,
    }

    await repository.commitUploadedRevision(input)

    await expect(repository.commitUploadedRevision(input)).rejects.toThrow(
      "CONFLICT",
    )
  })
})
