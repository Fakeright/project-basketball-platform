import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { MatchPurpose } from "@/features/competition/domain/competition"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"

import type {
  CompetitionRepository,
  UpdatedExternalMatchPurpose,
} from "./ports/competition-repository"

export interface UpdateExternalMatchPurposeInput {
  tournamentId: string
  matchId: string
  purpose: MatchPurpose
  expectedVersion: number
  overrideReason?: string
}

export async function updateExternalMatchPurpose(
  input: UpdateExternalMatchPurposeInput,
  actor: Actor,
  dependencies: { competitions: CompetitionRepository; now: () => Date },
): Promise<UpdatedExternalMatchPurpose> {
  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await competitions.findExternalMatchPurposeContext({
      tournamentId: input.tournamentId,
      matchId: input.matchId,
    })
    if (
      !context ||
      (actor.role !== "PLATFORM_ADMIN" && context.organizerId !== actor.id)
    ) {
      throw new Error("NOT_FOUND")
    }

    authorize(actor, "match.schedule", { organizerId: context.organizerId })
    if (context.matchVersion !== input.expectedVersion) throw new Error("CONFLICT")
    assertTournamentGovernanceAllowsOperation(
      context.tournamentGovernanceStatus,
    )
    if (context.bracketMode !== "EXTERNAL_DOCUMENT") {
      throw new Error("EXTERNAL_BRACKET_REQUIRED")
    }
    if (
      context.matchStatus !== "SCHEDULED" ||
      context.hasScore ||
      context.resultConfirmed
    ) {
      throw new Error("MATCH_PURPOSE_LOCKED")
    }

    const overrideReason = input.overrideReason?.trim() || null
    if (
      actor.role === "PLATFORM_ADMIN" &&
      context.organizerId !== actor.id &&
      !overrideReason
    ) {
      throw new Error("REASON_REQUIRED")
    }

    return competitions.updateExternalMatchPurpose({
      tournamentId: input.tournamentId,
      matchId: input.matchId,
      purpose: input.purpose,
      previousPurpose: context.matchPurpose,
      expectedVersion: input.expectedVersion,
      actorId: actor.id,
      adminOverride: actor.role === "PLATFORM_ADMIN",
      overrideReason,
      at: dependencies.now().toISOString(),
    })
  })
}
