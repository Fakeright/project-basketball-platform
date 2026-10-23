/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจผู้ใช้และความพร้อมของทีม/รายการ เพื่อสร้างตัวเลือกทีมที่นำไปสมัครได้
 * เรียกใช้จาก: app/(public)/tournaments/[slug]/page.tsx, components/tournaments/tournament-registration-action.tsx
 * ตามการทำงานต่อ: features/team-management/application/list-owned-teams.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import { listOwnedTeams } from "@/features/team-management/application/list-owned-teams"
import type { TeamRepository } from "@/features/team-management/application/ports/team-repository"
import type { RegistrationRepository } from "@/features/registrations/application/ports/registration-repository"
import type { Tournament } from "@/features/tournaments/domain/tournament"

export type TournamentRegistrationAvailability =
  | "AVAILABLE"
  | "NO_TEAMS"
  | "ALREADY_APPLIED"
  | "CLOSED"
  | "ERROR"
  | "HIDDEN"

interface RegistrationOption {
  id: string
  name: string
}

interface RegistrationAvailability {
  state: TournamentRegistrationAvailability
  teams: RegistrationOption[]
}

// ประกอบทีมที่ผู้ใช้ส่งสมัครได้และเหตุผลที่บางทีมยังไม่พร้อม
export async function getTournamentRegistrationOptions(
  tournament: Pick<Tournament, "id" | "status" | "format">,
  actor: Actor | null,
  dependencies: {
    teams: TeamRepository
    registrations: Pick<RegistrationRepository, "findActive">
  },
) {
  const availability = await getTournamentRegistrationAvailability(
    tournament,
    actor,
    dependencies,
  )
  return availability.teams
}

// ตัดสินสถานะปุ่มสมัครจากบัญชีและสถานะการรับสมัครของรายการ
export async function getTournamentRegistrationAvailability(
  tournament: Pick<Tournament, "id" | "status" | "format">,
  actor: Actor | null,
  dependencies: {
    teams: TeamRepository
    registrations: Pick<RegistrationRepository, "findActive">
  },
): Promise<RegistrationAvailability> {
  if (actor?.role !== "TEAM_MANAGER_COACH") {
    return { state: "HIDDEN", teams: [] }
  }
  if (tournament.status !== "OPEN") {
    return { state: "CLOSED", teams: [] }
  }
  const ownedTeams = await listOwnedTeams(actor, dependencies)
  const teams = ownedTeams.filter(
    (team) => team.isActive && team.format === tournament.format,
  )
  if (teams.length === 0) {
    return { state: "NO_TEAMS", teams: [] }
  }

  const activeRegistrations = await Promise.all(
    teams.map((team) =>
      dependencies.registrations.findActive(tournament.id, team.id),
    ),
  )
  const availableTeams = teams
    .filter((_, index) => activeRegistrations[index] === null)
    .map((team) => ({ id: team.id, name: team.name }))

  return {
    state: availableTeams.length > 0 ? "AVAILABLE" : "ALREADY_APPLIED",
    teams: availableTeams,
  }
}
