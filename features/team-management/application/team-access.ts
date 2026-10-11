import { authorize } from "@/features/identity/application/authorize"
import type { Actor } from "@/features/identity/domain/actor"
import type { Permission } from "@/features/identity/domain/permission"
import type { TeamSummary } from "@/features/team-management/domain/team"

export function authorizeTeamAccess(
  actor: Actor,
  action: Permission,
  team: TeamSummary,
): boolean {
  if (actor.role !== "PLATFORM_ADMIN" && team.ownerId !== actor.id) {
    throw new Error("NOT_FOUND")
  }

  authorize(actor, action, { organizerId: team.ownerId })
  return actor.role === "PLATFORM_ADMIN" && team.ownerId !== actor.id
}
