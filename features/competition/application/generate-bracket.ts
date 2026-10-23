/**
 * COURTSIDE: คำอธิบายไฟล์
 * รับลำดับทีมที่จัดเองหรือสุ่ม แล้วสร้างสายฉบับร่างแบบจับคู่ติดกันและบันทึกรอบ/คู่พร้อมกัน
 * เรียกใช้จาก: app/api/organizer/tournaments/[id]/bracket/generate/route.ts, features/competition/presentation/competition-handler.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import { generateOrderedSingleEliminationBracket } from "@/features/competition/domain/bracket-generator"
import {
  assertBracketStructureMutable,
  assertSystemBracketEntryCount,
  validateOrderedPositions,
} from "@/features/competition/domain/bracket-policy"
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
      method: "ORDERED"
      positions: Array<{ entryId: string; position: number }>
    }
  | {
      tournamentId: string
      expectedVersion: number
      method: "RANDOM_ORDERED"
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

/** ตรวจเจ้าของ/สิทธิ์ เวอร์ชัน สถานะ และจำนวนทีม ก่อนสร้างสายฉบับร่างใน transaction */
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
    if (context.bracketStatus !== "DRAFT" || context.bracketMode !== "SYSTEM_GENERATED") {
      throw new Error("BRACKET_GENERATION_UNAVAILABLE")
    }
    if (context.hasScheduledMatch) throw new Error("BRACKET_STRUCTURE_LOCKED")
    assertSystemBracketEntryCount(context.entries.length)

    const { entries, drawToken } = prepareEntries(input, context.entries, context)
    const plan = generateOrderedSingleEliminationBracket({
      entries: entries.map((entry) => ({
        entryId: entry.id,
        teamId: entry.teamId,
        position: entry.drawPosition,
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

  // เรียงเองต้องส่งครบทุกทีมและไม่ซ้ำ; สุ่มเดิมใช้ token เดิมจนกว่าจะสั่ง redraw
  function prepareEntries(
    generationInput: GenerateBracketDraftInput,
    lockedEntries: readonly LockedBracketEntry[],
    context: { generationMethod: string | null; drawToken: string | null },
  ): { entries: LockedBracketEntry[]; drawToken: string | null } {
    if (generationInput.method === "ORDERED") {
      const positionsByEntry = new Map(
        generationInput.positions.map(({ entryId, position }) => [entryId, position]),
      )
      if (
        generationInput.positions.length !== lockedEntries.length ||
        positionsByEntry.size !== lockedEntries.length ||
        lockedEntries.some((entry) => !positionsByEntry.has(entry.id))
      ) {
        throw new Error("BRACKET_ORDER_INVALID")
      }
      validateOrderedPositions(generationInput.positions)

      return {
        drawToken: null,
        entries: lockedEntries.map((entry) => ({
          ...entry,
          seed: positionsByEntry.get(entry.id) ?? 0,
          drawPosition: positionsByEntry.get(entry.id) ?? 0,
        })),
      }
    }

    if (
      !generationInput.redraw &&
      context.generationMethod === "RANDOM_ORDERED" &&
      context.drawToken
    ) {
      return { entries: [...lockedEntries], drawToken: context.drawToken }
    }

    const drawToken = dependencies.createDrawToken()
    const shuffled = dependencies.shuffle(lockedEntries, drawToken)
    if (
      shuffled.length !== lockedEntries.length ||
      new Set(shuffled.map((entry) => entry.id)).size !== lockedEntries.length ||
      shuffled.some((entry) => !lockedEntries.some((locked) => locked.id === entry.id))
    ) {
      throw new Error("BRACKET_RANDOM_INVALID")
    }

    const positionsByEntry = new Map(
      shuffled.map((entry, index) => [entry.id, index + 1]),
    )
    return {
      drawToken,
      entries: lockedEntries.map((entry) => ({
        ...entry,
        seed: positionsByEntry.get(entry.id) ?? 0,
        drawPosition: positionsByEntry.get(entry.id) ?? 0,
      })),
    }
  }
}
