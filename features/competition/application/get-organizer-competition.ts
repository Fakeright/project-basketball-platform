import type { Actor } from "@/features/identity/domain/actor"

import type {
  CompetitionRepository,
  OrganizerCompetitionWorkspace,
} from "./ports/competition-repository"

export async function getOrganizerCompetition(
  tournamentId: string,
  actor: Actor,
  dependencies: { competitions: CompetitionRepository },
): Promise<OrganizerCompetitionWorkspace> {
  const workspace = await dependencies.competitions.findOrganizerWorkspace(
    tournamentId,
  )
  if (
    !workspace ||
    (actor.role !== "PLATFORM_ADMIN" &&
      workspace.tournament.organizerId !== actor.id)
  ) {
    throw new Error("NOT_FOUND")
  }
  if (
    actor.role !== "PLATFORM_ADMIN" &&
    actor.role !== "TOURNAMENT_ORGANIZER"
  ) {
    throw new Error("FORBIDDEN")
  }
  return workspace
}
