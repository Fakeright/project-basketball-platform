import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { TournamentRegistration } from "@/features/registrations/domain/registration"
import { transitionRegistration } from "@/features/registrations/domain/registration-policy"

import type { RegistrationRepository } from "./ports/registration-repository"

export interface DecideRegistrationInput {
  tournamentId: string
  registrationId: string
  decision: "APPROVE" | "REJECT"
  note: string
  version: number
}

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

    return input.decision === "APPROVE"
      ? registrations.approveWithCapacity({ ...auditInput, note })
      : registrations.rejectWithVersion({ ...auditInput, note })
  })
}
