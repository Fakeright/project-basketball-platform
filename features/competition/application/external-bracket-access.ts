/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจเจ้าของรายการ สิทธิ์ และสถานะการกำกับดูแล ก่อนจัดการไฟล์สายการแข่งขัน
 * เรียกใช้จาก: features/competition/application/publish-external-bracket.ts, features/competition/application/retire-external-bracket.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import {
  assertTournamentGovernanceAllowsOperation,
  type TournamentGovernanceStatus,
} from "@/features/tournament-operations/domain/tournament-governance-policy"

export function assertExternalBracketAccess(
  context: {
    organizerId: string
    bracketVersion: number
    tournamentGovernanceStatus: TournamentGovernanceStatus
  } | null,
  actor: Actor,
  expectedVersion: number,
  reason?: string,
) {
  if (
    !context ||
    (actor.role !== "PLATFORM_ADMIN" && context.organizerId !== actor.id)
  ) {
    throw new Error("NOT_FOUND")
  }

  authorize(actor, "bracket.generate", { organizerId: context.organizerId })
  if (context.bracketVersion !== expectedVersion) throw new Error("CONFLICT")
  assertTournamentGovernanceAllowsOperation(
    context.tournamentGovernanceStatus,
  )

  const adminOverride =
    actor.role === "PLATFORM_ADMIN" && actor.id !== context.organizerId
  const normalizedReason = reason?.trim() || null
  if (adminOverride && !normalizedReason) throw new Error("REASON_REQUIRED")

  return { adminOverride, reason: normalizedReason }
}
