import type { Actor } from "@/features/identity/domain/actor"
import { authorizeTeamAccess } from "@/features/team-management/application/team-access"

import type { RegistrationRepository, TeamRegistrationListItem } from "./ports/registration-repository"

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
