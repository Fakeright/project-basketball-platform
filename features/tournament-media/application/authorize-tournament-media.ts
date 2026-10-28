/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจผู้ใช้ เจ้าของรายการ และคำสั่งเกี่ยวกับสื่อก่อนอัปโหลดหรือลบ
 * เรียกใช้จาก: app/api/admin/tournaments/[id]/media/route.ts, features/tournament-media/application/delete-tournament-media.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/tournament-operations-repository"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"

export async function authorizeTournamentMediaMutation(
  tournamentId: string,
  actor: Actor,
  dependencies: {
    tournaments: Pick<TournamentOperationsRepository, "findById">
  },
) {
  const tournament = await dependencies.tournaments.findById(tournamentId)
  if (!tournament) throw new Error("NOT_FOUND")
  authorize(actor, "tournament.update", {
    organizerId: tournament.organizerId,
  })
  assertTournamentGovernanceAllowsOperation(tournament.governanceStatus)
  return tournament
}
