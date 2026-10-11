import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import { generateSingleEliminationBracket } from "@/features/competition/domain/bracket-generator"
import { assertBracketStructureMutable } from "@/features/competition/domain/bracket-policy"
import type { LockedBracketEntry } from "@/features/competition/domain/competition"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"

import type {
  CompetitionRepository,
  PersistedCompetitionBracket,
} from "./ports/competition-repository"

export type GenerateBracketDraftInput =
  | {
      tournamentId: string
      expectedVersion: number
      method: "SEEDED"
      seeds: Array<{ entryId: string; seed: number }>
    }
  | {
      tournamentId: string
      expectedVersion: number
      method: "RANDOM"
      redraw: boolean
    }

interface GenerateBracketDependencies {
  competitions: CompetitionRepository
  now: () => Date
  createDrawToken: () => string
  shuffle: (
    items: readonly LockedBracketEntry[],
    token: string,
  ) => LockedBracketEntry[]
}

export async function generateBracketDraft(
  input: GenerateBracketDraftInput,
  actor: Actor,
  dependencies: GenerateBracketDependencies,
): Promise<PersistedCompetitionBracket> {
  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await competitions.findGenerationContext(input.tournamentId)
    if (
      !context ||
      (actor.role !== "PLATFORM_ADMIN" && context.organizerId !== actor.id)
    ) {
      throw new Error("NOT_FOUND")
    }

    authorize(actor, "bracket.generate", { organizerId: context.organizerId })
    if (context.bracketVersion !== input.expectedVersion) {
      throw new Error("CONFLICT")
    }
    assertTournamentGovernanceAllowsOperation(
      context.tournamentGovernanceStatus,
    )
    assertBracketStructureMutable({ hasStartedMatch: context.hasStartedMatch })

    const { entries, drawToken } = prepareEntries(input, context.entries, context)
    const plan = generateSingleEliminationBracket({
      entries: entries.map((entry) => ({
        entryId: entry.id,
        teamId: entry.teamId,
        seed: entry.seed,
      })),
    })
    const startRounds = new Map(
      plan.entryStarts.map((entry) => [entry.entryId, entry.roundSequence]),
    )

    return competitions.persistGeneratedPlan({
      tournamentId: input.tournamentId,
      bracketId: context.bracketId,
      expectedVersion: input.expectedVersion,
      generationMethod: input.method,
      drawToken,
      entries: entries.map((entry) => ({
        ...entry,
        startRoundSequence: startRounds.get(entry.id) ?? 1,
      })),
      plan,
      actorId: actor.id,
      adminOverride: actor.role === "PLATFORM_ADMIN",
      at: dependencies.now().toISOString(),
    })
  })

  function prepareEntries(
    generationInput: GenerateBracketDraftInput,
    lockedEntries: readonly LockedBracketEntry[],
    context: { generationMethod: string | null; drawToken: string | null },
  ): { entries: LockedBracketEntry[]; drawToken: string | null } {
    if (generationInput.method === "SEEDED") {
      const seedsByEntry = new Map(
        generationInput.seeds.map(({ entryId, seed }) => [entryId, seed]),
      )
      if (
        generationInput.seeds.length !== lockedEntries.length ||
        seedsByEntry.size !== lockedEntries.length ||
        lockedEntries.some((entry) => !seedsByEntry.has(entry.id))
      ) {
        throw new Error("BRACKET_SEED_INVALID")
      }

      return {
        drawToken: null,
        entries: lockedEntries.map((entry) => ({
          ...entry,
          seed: seedsByEntry.get(entry.id) ?? 0,
          drawPosition: seedsByEntry.get(entry.id) ?? 0,
        })),
      }
    }

    if (
      !generationInput.redraw &&
      context.generationMethod === "RANDOM" &&
      context.drawToken
    ) {
      return { entries: [...lockedEntries], drawToken: context.drawToken }
    }

    const drawToken = dependencies.createDrawToken()
    const shuffled = dependencies.shuffle(lockedEntries, drawToken)
    if (
      shuffled.length !== lockedEntries.length ||
      new Set(shuffled.map((entry) => entry.id)).size !== lockedEntries.length
    ) {
      throw new Error("BRACKET_RANDOM_INVALID")
    }

    const seedsByEntry = new Map(
      shuffled.map((entry, index) => [entry.id, index + 1]),
    )
    return {
      drawToken,
      entries: lockedEntries.map((entry) => ({
        ...entry,
        seed: seedsByEntry.get(entry.id) ?? 0,
        drawPosition: seedsByEntry.get(entry.id) ?? 0,
      })),
    }
  }
}
