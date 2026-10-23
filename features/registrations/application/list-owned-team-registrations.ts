/**
 * COURTSIDE: คำอธิบายไฟล์
 * อ่านประวัติการสมัครของทีมหลังตรวจว่าผู้ใช้เข้าถึงทีมนั้นได้
 * เรียกใช้จาก: app/(admin)/team/[id]/page.tsx, app/(admin)/team/page.tsx
 * ตามการทำงานต่อ: features/team-management/application/team-access.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import { authorizeTeamAccess } from "@/features/team-management/application/team-access"

import type { RegistrationRepository, TeamRegistrationListItem } from "./ports/registration-repository"

// ตรวจสิทธิ์ทีมก่อนอ่านประวัติการสมัครของทีม เพื่อไม่ให้เปิดของบัญชีอื่นด้วยการเปลี่ยน ID
export async function listOwnedTeamRegistrations(
  teamId: string,
  actor: Actor,
  dependencies: { registrations: RegistrationRepository },
): Promise<TeamRegistrationListItem[]> {
  const team = await dependencies.registrations.findTeam(teamId)
  if (!team) throw new Error("NOT_FOUND")

  authorizeTeamAccess(actor, "registration.read", team)
  return dependencies.registrations.listByTeam(teamId)
}
