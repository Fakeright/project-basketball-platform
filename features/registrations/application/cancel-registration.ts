import type { Actor } from "@/features/identity/domain/actor"
import { authorizeTeamAccess } from "@/features/team-management/application/team-access"
import { transitionRegistration } from "@/features/registrations/domain/registration-policy"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"
import { assertTournamentGovernanceAllowsOperation } from "@/features/tournament-operations/domain/tournament-governance-policy"

import type { RegistrationRepository } from "./ports/registration-repository"

export interface CancelRegistrationInput {
  registrationId: string
  version: number
}

export async function cancelRegistration(
  input: CancelRegistrationInput,
  actor: Actor,
  dependencies: { registrations: RegistrationRepository; now: () => Date },
): Promise<TournamentRegistration> {
  return dependencies.registrations.inTransaction(async (registrations) => {
    const registration = await registrations.findById(input.registrationId)
    if (!registration) throw new Error("NOT_FOUND")

    authorizeTeamAccess(actor, "registration.cancel", registration.team)
    assertTournamentGovernanceAllowsOperation(
      registration.tournament.governanceStatus,
    )
    transitionRegistration(registration.status, "CANCEL", {
      tournamentStatus: "PUBLISHED",
      reason: "",
    })

    return registrations.cancelWithVersion(
      registration.id,
      input.version,
      actor.id,
      dependencies.now().toISOString(),
      actor.role === "PLATFORM_ADMIN",
    )
  })
}
