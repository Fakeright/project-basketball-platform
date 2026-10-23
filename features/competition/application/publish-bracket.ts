/**
 * COURTSIDE: คำอธิบายไฟล์
 * เผยแพร่หรือยกเลิกเผยแพร่สายของระบบ หลังตรวจสิทธิ์ ความพร้อม และเงื่อนไขการแก้โครงสร้าง
 * เรียกใช้จาก: app/api/organizer/tournaments/[id]/bracket/publication/route.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"

import type {
  BracketPublicationContext,
  CompetitionRepository,
  PersistedCompetitionBracket,
} from "./ports/competition-repository"

interface PublicationDependencies {
  competitions: CompetitionRepository
  now: () => Date
}

/** เผยแพร่สายฉบับร่างให้หน้าสาธารณะเห็น หลังตรวจว่าคู่ครบ */
export async function publishBracket(
  input: { tournamentId: string; expectedVersion: number },
  actor: Actor,
  dependencies: PublicationDependencies,
): Promise<PersistedCompetitionBracket> {
  return changePublication(input, actor, dependencies, true, null)
}

/** ถอนการเผยแพร่ได้ก่อนมีคู่เริ่มแข่ง และต้องระบุเหตุผล */
export async function unpublishBracket(
  input: { tournamentId: string; expectedVersion: number; reason: string },
  actor: Actor,
  dependencies: PublicationDependencies,
): Promise<PersistedCompetitionBracket> {
  const reason = input.reason.trim()
  if (!reason) throw new Error("REASON_REQUIRED")
  return changePublication(input, actor, dependencies, false, reason)
}

async function changePublication(
  input: { tournamentId: string; expectedVersion: number },
  actor: Actor,
  dependencies: PublicationDependencies,
  published: boolean,
  reason: string | null,
) {
  return dependencies.competitions.inTransaction(async (competitions) => {
    const context = await competitions.findPublicationContext(input.tournamentId)
    assertPublicationAccess(context, actor)
    if (!context) throw new Error("NOT_FOUND")
    if (context.bracketVersion !== input.expectedVersion) {
      throw new Error("CONFLICT")
    }
    assertTournamentGovernanceAllowsOperation(
      context.tournamentGovernanceStatus,
    )

    if (published) {
      if (context.bracketStatus !== "DRAFT") {
        throw new Error("BRACKET_PUBLICATION_UNAVAILABLE")
      }
      if (
        context.entryCount < 2 ||
        context.entryCount > 32 ||
        context.roundCount < 1 ||
        context.matchCount !== context.entryCount - 1
      ) {
        throw new Error("BRACKET_DRAFT_INCOMPLETE")
      }
    } else {
      if (context.bracketStatus !== "PUBLISHED") {
        throw new Error("BRACKET_PUBLICATION_UNAVAILABLE")
      }
      if (context.hasStartedMatch) throw new Error("BRACKET_STRUCTURE_LOCKED")
    }

    return competitions.setPublication({
      tournamentId: input.tournamentId,
      bracketId: context.bracketId,
      expectedVersion: input.expectedVersion,
      published,
      reason,
      actorId: actor.id,
      adminOverride: actor.role === "PLATFORM_ADMIN",
      at: dependencies.now().toISOString(),
    })
  })
}

function assertPublicationAccess(
  context: BracketPublicationContext | null,
  actor: Actor,
) {
  if (
    !context ||
    (actor.role !== "PLATFORM_ADMIN" && context.organizerId !== actor.id)
  ) {
    throw new Error("NOT_FOUND")
  }
  authorize(actor, "bracket.generate", { organizerId: context.organizerId })
}
