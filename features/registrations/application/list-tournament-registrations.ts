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
