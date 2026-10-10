import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { addTeamPlayers } from "@/features/team-management/application/add-team-players"
import { getTeamRepository } from "@/features/team-management/infrastructure/get-team-repository"
import { handleAddTeamPlayers } from "@/features/team-management/presentation/team-handler"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withSafeRouteBoundary("team.players.add", async () => {
    const { id } = await params
    const repository = getTeamRepository()
    return handleAddTeamPlayers(id, request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      addPlayers: (input, actor) => addTeamPlayers(input, actor, { teams: repository }),
    })
  })
}
