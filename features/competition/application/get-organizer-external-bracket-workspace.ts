import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { ObjectStorage } from "@/features/tournament-media/application/ports/object-storage"
import { isExternalBracketStale } from "@/features/competition/domain/external-bracket-policy"

import type {
  BracketModeSelectionContext,
  ExternalBracketRepository,
  ExternalBracketWorkspaceContext,
} from "./ports/external-bracket-repository"

interface Dependencies {
  externalBrackets: ExternalBracketRepository
  storage: Pick<ObjectStorage, "createSignedUrl">
}

export interface OrganizerExternalBracketWorkspace {
  modeContext: BracketModeSelectionContext
  workspace: ExternalBracketWorkspaceContext | null
  publishedPreviewUrl: string | null
  isPublishedRevisionStale: boolean
}

export async function getOrganizerExternalBracketWorkspace(
  tournamentId: string,
  actor: Actor,
  dependencies: Dependencies,
): Promise<OrganizerExternalBracketWorkspace> {
  const modeContext =
    await dependencies.externalBrackets.findModeSelectionContext(tournamentId)

  if (
    !modeContext ||
    (actor.role !== "PLATFORM_ADMIN" && modeContext.organizerId !== actor.id)
  ) {
    throw new Error("NOT_FOUND")
  }

  authorize(actor, "bracket.generate", {
    organizerId: modeContext.organizerId,
  })

  if (modeContext.bracketMode === "SYSTEM_GENERATED") {
    return {
      modeContext,
      workspace: null,
      publishedPreviewUrl: null,
      isPublishedRevisionStale: false,
    }
  }

  const workspace =
    await dependencies.externalBrackets.findWorkspace(tournamentId)
  if (!workspace) throw new Error("NOT_FOUND")

  const publishedPreviewUrl = workspace.publishedRevision
    ? await dependencies.storage.createSignedUrl(
        workspace.publishedRevision.mediaAsset.bucket,
        workspace.publishedRevision.mediaAsset.objectPath,
        600,
      )
    : null

  return {
    modeContext,
    workspace,
    publishedPreviewUrl,
    isPublishedRevisionStale: Boolean(
      workspace.publishedRevision?.publishedAt &&
        isExternalBracketStale({
          publishedAt: workspace.publishedRevision.publishedAt,
          latestConfirmedResultAt: workspace.latestConfirmedResultAt,
        }),
    ),
  }
}
