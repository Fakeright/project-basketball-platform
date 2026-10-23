/**
 * COURTSIDE: คำอธิบายไฟล์
 * ตรวจทีม เจ้าของ อายุ จำนวนผู้เล่น สถานะรับสมัคร และชื่อทีมซ้ำ ก่อนสร้างใบสมัครรอพิจารณา
 * เรียกใช้จาก: app/api/tournaments/[id]/registrations/route.ts, features/registrations/presentation/registration-handler.ts
 * ตามการทำงานต่อ: features/team-management/application/team-access.ts
 */

import type { Actor } from "@/features/identity/domain/actor"
import { authorizeTeamAccess } from "@/features/team-management/application/team-access"
import { assertCanApply } from "@/features/registrations/domain/registration-policy"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"

import type { RegistrationRepositoryTransaction, RegistrationRepository } from "./ports/registration-repository"

export interface ApplyToTournamentInput {
  tournamentId: string
  teamId: string
}

// ตรวจทีม รายชื่อผู้เล่น และสถานะรายการใน transaction เดียวก่อนสร้างใบสมัคร PENDING
export async function applyToTournament(
  input: ApplyToTournamentInput,
  actor: Actor,
  dependencies: { registrations: RegistrationRepository; now: () => Date },
): Promise<TournamentRegistration> {
  return dependencies.registrations.inTransaction(async (registrations) => {
    await loadEligibleApplicationContext(input, actor, registrations, dependencies.now())
    return registrations.createPending({
      ...input,
      actorId: actor.id,
      adminOverride: actor.role === "PLATFORM_ADMIN",
    })
  })
}

// อ่านทีมและรายการภายใน transaction แล้วตรวจสิทธิ์และเงื่อนไขสมัครก่อนสร้างใบสมัคร
async function loadEligibleApplicationContext(
  input: ApplyToTournamentInput,
  actor: Actor,
  registrations: RegistrationRepositoryTransaction,
  now: Date,
) {
  const context = await registrations.getApplicationContext(input.tournamentId, input.teamId)
  if (!context) throw new Error("NOT_FOUND")

  authorizeTeamAccess(actor, "registration.create", context.team)
  assertTournamentGovernanceAllowsOperation(context.tournament.governanceStatus)
  const activeRegistration = await registrations.findActive(input.tournamentId, input.teamId)
  assertCanApply({
    actorId: actor.role === "PLATFORM_ADMIN" ? context.team.ownerId : actor.id,
    team: context.team,
    roster: context.roster,
    tournament: context.tournament,
    hasActiveRegistration: activeRegistration !== null,
    now,
  })
  if (
    await registrations.hasActiveNameConflict(
      input.tournamentId,
      input.teamId,
      context.team.name,
    )
  ) {
    throw new Error("REGISTRATION_TEAM_NAME_TAKEN")
  }
  return context
}
