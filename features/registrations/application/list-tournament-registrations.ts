/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจผู้จัดเจ้าของรายการก่อนอ่านใบสมัคร ชื่อผู้จัดการ และรายชื่อผู้เล่นให้หน้าตรวจทีม
 * เรียกใช้จาก: app/(admin)/organizer/tournaments/[id]/registrations/page.tsx
 * ตามการทำงานต่อ: features/identity/application/authorize.ts
 */

import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"

import type {
  RegistrationRepository,
  RegistrationReviewTournament,
  TournamentRegistrationReviewItem,
} from "./ports/registration-repository"

export interface TournamentRegistrationReview {
  tournament: RegistrationReviewTournament
  registrations: TournamentRegistrationReviewItem[]
}

// ตรวจเจ้าของรายการก่อนคืนใบสมัครพร้อมข้อมูลผู้จัดการและผู้เล่นสำหรับตรวจทีม
export async function listTournamentRegistrations(
  tournamentId: string,
  actor: Actor,
  dependencies: { registrations: RegistrationRepository },
): Promise<TournamentRegistrationReview> {
  const tournament =
    await dependencies.registrations.findTournamentForReview(tournamentId)
  if (!tournament) throw new Error("NOT_FOUND")
  if (
    actor.role !== "PLATFORM_ADMIN" &&
    tournament.organizerId !== actor.id
  ) {
    throw new Error("NOT_FOUND")
  }

  authorize(actor, "registration.decide", {
    organizerId: tournament.organizerId,
  })

  return {
    tournament,
    registrations:
      await dependencies.registrations.listByTournament(tournamentId),
  }
}
