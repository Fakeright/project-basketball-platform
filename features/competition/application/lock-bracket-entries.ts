/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรึงทีมที่อนุมัติแล้วเป็นรายชื่อในสาย โดยตรวจสถานะรายการ จำนวนทีม และเวอร์ชันก่อนบันทึก
 * เรียกใช้จาก: app/api/organizer/tournaments/[id]/bracket/entries/route.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"
import {
  assertBracketStructureMutable,
  assertEntriesCanBeLocked,
} from "@/features/competition/domain/bracket-policy"

import type {
  CompetitionRepository,
  LockedCompetitionWorkspace,
} from "./ports/competition-repository"

/** ตรึงทีมที่อนุมัติแล้วเป็นผู้เข้าร่วมสาย ก่อนเลือกวิธีจัดคู่ */
export async function lockBracketEntries(
  input: { tournamentId: string; expectedVersion: number },
  actor: Actor,
  dependencies: {
    competitions: CompetitionRepository
    now: () => Date
  },
): Promise<LockedCompetitionWorkspace> {
  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await competitions.findLockContext(input.tournamentId)
    if (
      !context ||
      (actor.role !== "PLATFORM_ADMIN" && context.organizerId !== actor.id)
    ) {
      throw new Error("NOT_FOUND")
    }

    authorize(actor, "bracket.generate", { organizerId: context.organizerId })
    assertTournamentGovernanceAllowsOperation(
      context.tournamentGovernanceStatus,
    )
    assertEntriesCanBeLocked({
      tournamentStatus: context.tournamentStatus,
      approvedTeamIds: context.approvedEntries.map((entry) => entry.teamId),
      capacity: context.capacity,
    })
    assertBracketStructureMutable({ hasStartedMatch: context.hasStartedMatch })

    return competitions.lockEntries({
      tournamentId: input.tournamentId,
      expectedVersion: input.expectedVersion,
      actorId: actor.id,
      at: dependencies.now().toISOString(),
      adminOverride: actor.role === "PLATFORM_ADMIN",
    })
  })
}
