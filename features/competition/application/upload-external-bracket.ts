import type { Actor } from "@/features/identity/domain/actor"
import {
  assertExternalBracketFile,
  type ExternalBracketContentType,
} from "@/features/competition/domain/external-bracket-policy"
import type { BracketFileProbeResult } from "@/features/competition/infrastructure/bracket-file-probe"
import {
  ObjectStorageError,
  type ObjectStorage,
} from "@/features/tournament-media/application/ports/object-storage"

import { assertExternalBracketAccess } from "./external-bracket-access"
import type { ExternalBracketRepository } from "./ports/external-bracket-repository"

export interface UploadExternalBracketInput {
  tournamentId: string
  expectedVersion: number
  reason?: string
  file: {
    fileName: string
    contentType: string
    byteSize: number
    data: Uint8Array
  }
}

interface Dependencies {
  externalBrackets: ExternalBracketRepository
  storage: ObjectStorage
  probe(input: {
    contentType: ExternalBracketContentType
    data: Uint8Array
  }): Promise<BracketFileProbeResult>
  createId(): string
  cleanupLogger?: {
    error(event: { operation: string; assetId: string; errorType: string }): void
  }
}

const bucket = "tournament-brackets"

export async function uploadExternalBracket(
  input: UploadExternalBracketInput,
  actor: Actor,
  dependencies: Dependencies,
) {
  assertExternalBracketFile(input.file)
  if (input.file.byteSize !== input.file.data.byteLength) {
    throw new Error("BRACKET_FILE_SIZE_MISMATCH")
  }

  const context = await dependencies.externalBrackets.findWorkspace(
    input.tournamentId,
  )
  const access = assertExternalBracketAccess(
    context,
    actor,
    input.expectedVersion,
    input.reason,
  )
  if (!context) throw new Error("NOT_FOUND")

  const assetId = dependencies.createId()
  const extension = extensionFor(input.file.contentType)
  const stagingPath = `tournaments/${input.tournamentId}/bracket/staging/${assetId}.${extension}`
  const finalPath = `tournaments/${input.tournamentId}/bracket/revisions/${assetId}.${extension}`

  try {
    await dependencies.storage.upload({
      bucket,
      objectPath: stagingPath,
      contentType: input.file.contentType,
      data: input.file.data,
    })
  } catch (error) {
    await compensate(stagingPath, assetId, dependencies)
    throw error
  }

  try {
    await dependencies.probe({
      contentType: input.file.contentType as ExternalBracketContentType,
      data: input.file.data,
    })
  } catch (error) {
    await compensate(stagingPath, assetId, dependencies)
    throw error
  }

  try {
    await dependencies.storage.move(bucket, stagingPath, finalPath)
  } catch (error) {
    await compensate(stagingPath, assetId, dependencies)
    await compensate(finalPath, assetId, dependencies)
    throw error
  }

  try {
    return await dependencies.externalBrackets.commitUploadedRevision({
      tournamentId: input.tournamentId,
      bracketId: context.bracketId,
      expectedVersion: input.expectedVersion,
      actorId: actor.id,
      adminOverride: access.adminOverride,
      reason: access.reason,
      asset: {
        id: assetId,
        tournamentId: input.tournamentId,
        kind: "BRACKET_DOCUMENT",
        bucket,
        objectPath: finalPath,
        fileName: input.file.fileName,
        contentType: input.file.contentType,
        byteSize: input.file.byteSize,
        createdById: actor.id,
      },
    })
  } catch (error) {
    await compensate(finalPath, assetId, dependencies)
    throw error
  }
}

async function compensate(
  objectPath: string,
  assetId: string,
  dependencies: Dependencies,
) {
  try {
    await dependencies.storage.remove(bucket, objectPath)
  } catch (error) {
    if (error instanceof ObjectStorageError && error.code === "NOT_FOUND") return
    try {
      dependencies.cleanupLogger?.error({
        operation: "external_bracket.upload.compensate",
        assetId,
        errorType: error instanceof Error ? error.name : "NonError",
      })
    } catch {}
  }
}

function extensionFor(contentType: string) {
  return {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[contentType] ?? "bin"
}
