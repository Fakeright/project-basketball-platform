import { updateTeam } from "@/features/team-management/application/update-team"
import { removeOrDeactivateTeam } from "@/features/team-management/application/remove-or-deactivate-team"
import { getTeamRepository } from "@/features/team-management/infrastructure/get-team-repository"
import {
  handleRemoveOrDeactivateTeam,
  handleUpdateTeam,
} from "@/features/team-management/presentation/team-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withSafeRouteBoundary("team.update", async () => {
    const { id } = await params
    const repository = getTeamRepository()
    return handleUpdateTeam(id, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      update: (input, actor) =>
        updateTeam(input, actor, { teams: repository }),
    })
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withSafeRouteBoundary("team.remove", async () => {
    const { id } = await params
    const repository = getTeamRepository()
    return handleRemoveOrDeactivateTeam(id, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      remove: (input, actor) =>
        removeOrDeactivateTeam(input, actor, { teams: repository }),
    })
  })
}
