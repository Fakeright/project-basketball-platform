/**
 * COURTSIDE: คำอธิบายไฟล์
 * ให้ผู้จัดเจ้าของรายการหรือแอดมินอนุมัติ/ปฏิเสธใบสมัคร พร้อมตรวจความจุและเหตุผล
 * เรียกใช้จาก: app/api/organizer/tournaments/[id]/registrations/[registrationId]/decision/route.ts, features/registrations/presentation/registration-handler.ts
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"
import { transitionRegistration } from "@/features/registrations/domain/registration-policy"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"

import type { RegistrationRepository } from "./ports/registration-repository"

export interface DecideRegistrationInput {
  tournamentId: string
  registrationId: string
  decision: "APPROVE" | "REJECT"
  note: string
  version: number
}

// ตรวจว่าเป็นเจ้าของรายการและใบสมัครยังตัดสินได้ ก่อนบันทึกพร้อม version/audit ใน transaction
export async function decideRegistration(
  input: DecideRegistrationInput,
  actor: Actor,
  dependencies: {
    registrations: RegistrationRepository
    now: () => Date
  },
): Promise<TournamentRegistration> {
  return dependencies.registrations.inTransaction(async (registrations) => {
    const context = await registrations.findReviewContext(input.registrationId)
    if (!context || context.tournament.id !== input.tournamentId) {
      throw new Error("NOT_FOUND")
    }
    if (
      actor.role !== "PLATFORM_ADMIN" &&
      context.tournament.organizerId !== actor.id
    ) {
      throw new Error("NOT_FOUND")
    }

    authorize(actor, "registration.decide", {
      organizerId: context.tournament.organizerId,
    })
    assertTournamentGovernanceAllowsOperation(
      context.tournament.governanceStatus,
    )

    const note = input.note.trim()
    transitionRegistration(context.registration.status, input.decision, {
      tournamentStatus: context.tournament.status,
      reason: note,
    })

    const auditInput = {
      before: context.registration,
      version: input.version,
      actorId: actor.id,
      at: dependencies.now().toISOString(),
      adminOverride: actor.role === "PLATFORM_ADMIN",
    }

    // อนุมัติตรวจความจุซ้ำตอนบันทึก; ปฏิเสธบันทึกเหตุผลและตรวจ version กันข้อมูลทับกัน
    return input.decision === "APPROVE"
      ? registrations.approveWithCapacity({ ...auditInput, note })
      : registrations.rejectWithVersion({ ...auditInput, note })
  })
}
