import { updateTeam } from "@/features/team-management/application/update-team"
import { PrismaTeamRepository } from "@/features/team-management/infrastructure/prisma-team-repository"
import { handleUpdateTeam } from "@/features/team-management/presentation/team-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getPrismaClient } from "@/lib/server/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const repository = new PrismaTeamRepository(getPrismaClient())
  return handleUpdateTeam(id, request, {
    actorProvider: createNextCookieCurrentActorProvider(),
    update: (input, actor) => updateTeam(input, actor, { teams: repository }),
  })
}
