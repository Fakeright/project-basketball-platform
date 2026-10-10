import type { Actor } from "@/features/identity/domain/actor"

import { assertExternalBracketAccess } from "./external-bracket-access"
import type { ExternalBracketRepository } from "./ports/external-bracket-repository"

interface Input {
  tournamentId: string
  revisionId: string
  expectedVersion: number
  reason?: string
}

export async function retireExternalBracket(
  input: Input,
  actor: Actor,
  dependencies: { externalBrackets: ExternalBracketRepository },
) {
  const context = await dependencies.externalBrackets.findWorkspace(input.tournamentId)
  const access = assertExternalBracketAccess(
    context,
    actor,
    input.expectedVersion,
    input.reason,
  )
  if (!context) throw new Error("NOT_FOUND")

  return dependencies.externalBrackets.retireRevision({
    tournamentId: input.tournamentId,
    bracketId: context.bracketId,
    revisionId: input.revisionId,
    expectedVersion: input.expectedVersion,
    actorId: actor.id,
    adminOverride: access.adminOverride,
    reason: access.reason,
  })
}
