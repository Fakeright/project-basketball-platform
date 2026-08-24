import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { deactivateTeamPlayer } from "@/features/team-management/application/deactivate-team-player"
import { updateTeamPlayer } from "@/features/team-management/application/update-team-player"
import { getTeamRepository } from "@/features/team-management/infrastructure/get-team-repository"
import {
  handleDeactivateTeamPlayer,
  handleUpdateTeamPlayer,
} from "@/features/team-management/presentation/team-handler"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; playerId: string }> },
) {
  return withSafeRouteBoundary("team.player.update", async () => {
    const { id, playerId } = await params
    const repository = getTeamRepository()
    return handleUpdateTeamPlayer(id, playerId, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      updatePlayer: (input, actor) => updateTeamPlayer(input, actor, { teams: repository }),
    })
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; playerId: string }> },
) {
  return withSafeRouteBoundary("team.player.deactivate", async () => {
    const { id, playerId } = await params
    const repository = getTeamRepository()
    return handleDeactivateTeamPlayer(id, playerId, {
      actorProvider: createNextCookieCurrentActorProvider(),
      deactivatePlayer: (input, actor) =>
        deactivateTeamPlayer(input, actor, { teams: repository }),
    })
  })
}
