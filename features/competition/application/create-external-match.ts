import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"

import type {
  CompetitionRepository,
  CreatedExternalMatch,
} from "./ports/competition-repository"

export interface CreateExternalMatchInput {
  tournamentId: string
  roundName: string
  sequence: number
  homeTeamId: string
  awayTeamId: string
  scheduledAt: string
  court: string
  expectedVersion: number
  overrideReason?: string
}

export async function createExternalMatch(
  input: CreateExternalMatchInput,
  actor: Actor,
  dependencies: { competitions: CompetitionRepository; now: () => Date },
): Promise<CreatedExternalMatch> {
  const roundName = input.roundName.trim().replace(/\s+/g, " ")
  const court = input.court.trim()
  const scheduledAt = new Date(input.scheduledAt)
  if (
    !roundName ||
    roundName.length > 80 ||
    !court ||
    court.length > 120 ||
    !Number.isInteger(input.sequence) ||
    input.sequence < 1 ||
    input.sequence > 99 ||
    Number.isNaN(scheduledAt.getTime())
  ) {
    throw new Error("EXTERNAL_MATCH_INVALID")
  }
  if (input.homeTeamId === input.awayTeamId) {
    throw new Error("MATCH_TEAMS_DUPLICATE")
  }

  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await competitions.findExternalMatchCreationContext({
      tournamentId: input.tournamentId,
      roundName,
      sequence: input.sequence,
      scheduledAt: scheduledAt.toISOString(),
      court,
    })
    if (
      !context ||
      (actor.role !== "PLATFORM_ADMIN" && context.organizerId !== actor.id)
    ) {
      throw new Error("NOT_FOUND")
    }
    authorize(actor, "match.schedule", { organizerId: context.organizerId })
    if (context.bracketVersion !== input.expectedVersion) {
      throw new Error("CONFLICT")
    }
    if (
      context.bracketMode !== "EXTERNAL_DOCUMENT" ||
      context.bracketStatus !== "PUBLISHED"
    ) {
      throw new Error("EXTERNAL_BRACKET_REQUIRED")
    }
    if (
      !context.lockedTeamIds.includes(input.homeTeamId) ||
      !context.lockedTeamIds.includes(input.awayTeamId)
    ) {
      throw new Error("MATCH_TEAM_NOT_LOCKED")
    }
    if (context.sequenceTaken) throw new Error("MATCH_SEQUENCE_CONFLICT")
    if (context.hasCourtConflict) throw new Error("MATCH_SCHEDULE_CONFLICT")

    const outsideTournament =
      scheduledAt < new Date(context.tournamentStartsAt) ||
      scheduledAt > new Date(context.tournamentEndsAt)
    const overrideReason = input.overrideReason?.trim() || null
    if (outsideTournament) {
      if (actor.role !== "PLATFORM_ADMIN") {
        throw new Error("MATCH_SCHEDULE_OUTSIDE_TOURNAMENT")
      }
      if (!overrideReason) throw new Error("REASON_REQUIRED")
    }

    return competitions.createExternalMatch({
      tournamentId: input.tournamentId,
      bracketId: context.bracketId,
      roundName,
      sequence: input.sequence,
      homeTeamId: input.homeTeamId,
      awayTeamId: input.awayTeamId,
      scheduledAt: scheduledAt.toISOString(),
      court,
      expectedVersion: input.expectedVersion,
      actorId: actor.id,
      adminOverride: actor.role === "PLATFORM_ADMIN",
      overrideReason,
      at: dependencies.now().toISOString(),
    })
  })
}
