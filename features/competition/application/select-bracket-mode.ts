import type { Actor } from "@/features/identity/domain/actor"
import { assertCanSelectBracketMode } from "@/features/competition/domain/external-bracket-policy"
import type { BracketMode } from "@/features/competition/domain/competition"

import { assertExternalBracketAccess } from "./external-bracket-access"
import type { ExternalBracketRepository } from "./ports/external-bracket-repository"

export interface SelectBracketModeRequest {
  tournamentId: string
  targetMode: BracketMode
  expectedVersion: number
  reason?: string
}

interface Dependencies {
  externalBrackets: ExternalBracketRepository
  now?: () => Date
}

export async function selectBracketMode(
  input: SelectBracketModeRequest,
  actor: Actor,
  dependencies: Dependencies,
) {
  const context = await dependencies.externalBrackets.findModeSelectionContext(
    input.tournamentId,
  )
  const access = assertExternalBracketAccess(
    context,
    actor,
    input.expectedVersion,
    input.reason,
  )
  if (!context) throw new Error("NOT_FOUND")
  if (context.bracketStatus !== "DRAFT") throw new Error("BRACKET_MODE_LOCKED")

  assertCanSelectBracketMode({
    currentMode: context.bracketMode,
    targetMode: input.targetMode,
    matches: context.hasStartedMatch
      ? [{ status: "IN_PROGRESS", hasConfirmedResult: false }]
      : [],
  })

  if (context.bracketMode === input.targetMode) {
    return {
      bracketId: context.bracketId,
      bracketVersion: context.bracketVersion,
      bracketMode: context.bracketMode,
    }
  }

  return dependencies.externalBrackets.selectMode({
    tournamentId: input.tournamentId,
    bracketId: context.bracketId,
    targetMode: input.targetMode,
    expectedVersion: input.expectedVersion,
    actorId: actor.id,
    adminOverride: access.adminOverride,
    reason: access.reason,
    at: (dependencies.now ?? (() => new Date()))().toISOString(),
  })
}
