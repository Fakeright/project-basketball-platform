/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจสิทธิ์ เวอร์ชัน วันเวลา และสนามก่อนบันทึกตาราง; 5v5 ห้ามสนามชนเวลาเดียวกัน ส่วน 3v3 อนุญาต
 * เรียกใช้จาก: app/api/organizer/tournaments/[id]/matches/[matchId]/schedule/route.ts, features/competition/presentation/competition-handler.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"

import type {
  CompetitionRepository,
  ScheduledCompetitionMatch,
} from "./ports/competition-repository"

export interface ScheduleMatchInput {
  tournamentId: string
  matchId: string
  scheduledAt: string
  court: string
  expectedVersion: number
  overrideReason?: string
}

/** ตรวจสิทธิ์ สายที่เผยแพร่ สถานะคู่ สนามชนกัน และช่วงวันที่ก่อนบันทึกตาราง */
export async function scheduleMatch(
  input: ScheduleMatchInput,
  actor: Actor,
  dependencies: { competitions: CompetitionRepository; now: () => Date },
): Promise<ScheduledCompetitionMatch> {
  const court = input.court.trim()
  if (!court || court.length > 120) throw new Error("MATCH_SCHEDULE_INVALID")
  const scheduledAt = new Date(input.scheduledAt)
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("MATCH_SCHEDULE_INVALID")
  }

  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await competitions.findMatchScheduleContext({
      tournamentId: input.tournamentId,
      matchId: input.matchId,
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
    if (context.matchVersion !== input.expectedVersion) throw new Error("CONFLICT")
    assertTournamentGovernanceAllowsOperation(
      context.tournamentGovernanceStatus,
    )
    if (
      context.tournamentStatus !== "REGISTRATION_CLOSED" &&
      context.tournamentStatus !== "IN_PROGRESS"
    ) {
      throw new Error("MATCH_SCHEDULE_UNAVAILABLE")
    }
    if (context.bracketStatus !== "PUBLISHED") {
      throw new Error("BRACKET_NOT_PUBLISHED")
    }
    if (context.matchStatus !== "SCHEDULED") {
      throw new Error("MATCH_SCHEDULE_LOCKED")
    }
    if (context.tournamentFormat === "FIVE_V_FIVE" && context.hasCourtConflict) {
      throw new Error("MATCH_SCHEDULE_CONFLICT")
    }

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

    return competitions.scheduleMatch({
      tournamentId: input.tournamentId,
      matchId: input.matchId,
      scheduledAt: scheduledAt.toISOString(),
      court,
      expectedVersion: input.expectedVersion,
      overrideReason,
      actorId: actor.id,
      adminOverride: actor.role === "PLATFORM_ADMIN",
      at: dependencies.now().toISOString(),
    })
  })
}
