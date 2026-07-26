import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"
import { transitionRegistration } from "@/features/registrations/domain/registration-policy"

import type { RegistrationRepository } from "./ports/registration-repository"

export interface WithdrawRegistrationInput {
  tournamentId: string
  registrationId: string
  reason: string
  version: number
}

export async function withdrawRegistration(
  input: WithdrawRegistrationInput,
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

    authorize(actor, "registration.withdraw", {
      organizerId: context.tournament.organizerId,
    })

    const reason = input.reason.trim()
    transitionRegistration(context.registration.status, "WITHDRAW", {
      tournamentStatus: context.tournament.status,
      reason,
    })

    return registrations.withdrawWithVersion({
      before: context.registration,
      version: input.version,
      reason,
      actorId: actor.id,
      at: dependencies.now().toISOString(),
      adminOverride: actor.role === "PLATFORM_ADMIN",
    })
  })
}
