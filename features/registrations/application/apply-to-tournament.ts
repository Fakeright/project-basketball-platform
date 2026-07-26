import type { Actor } from "@/features/identity/domain/actor"
import { authorizeTeamAccess } from "@/features/team-management/application/team-access"
import { assertCanApply } from "@/features/registrations/domain/registration-policy"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"

import type { RegistrationRepositoryTransaction, RegistrationRepository } from "./ports/registration-repository"

export interface ApplyToTournamentInput {
  tournamentId: string
  teamId: string
}

export async function applyToTournament(
  input: ApplyToTournamentInput,
  actor: Actor,
  dependencies: { registrations: RegistrationRepository; now: () => Date },
): Promise<TournamentRegistration> {
  return dependencies.registrations.inTransaction(async (registrations) => {
    await loadEligibleApplicationContext(input, actor, registrations, dependencies.now())
    return registrations.createPending({ ...input, actorId: actor.id })
  })
}

async function loadEligibleApplicationContext(
  input: ApplyToTournamentInput,
  actor: Actor,
  registrations: RegistrationRepositoryTransaction,
  now: Date,
) {
  const context = await registrations.getApplicationContext(input.tournamentId, input.teamId)
  if (!context) throw new Error("NOT_FOUND")

  authorizeTeamAccess(actor, "registration.create", context.team)
  const activeRegistration = await registrations.findActive(input.tournamentId, input.teamId)
  assertCanApply({
    actorId: actor.role === "PLATFORM_ADMIN" ? context.team.ownerId : actor.id,
    team: context.team,
    roster: context.roster,
    tournament: context.tournament,
    hasActiveRegistration: activeRegistration !== null,
    now,
  })
  return context
}
