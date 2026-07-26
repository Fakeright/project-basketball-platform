import { addTeamMember } from "@/features/team-management/application/add-team-member"
import { PrismaTeamRepository } from "@/features/team-management/infrastructure/prisma-team-repository"
import { handleAddTeamMember } from "@/features/team-management/presentation/team-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getPrismaClient } from "@/lib/server/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const repository = new PrismaTeamRepository(getPrismaClient())
  return handleAddTeamMember(id, request, {
    actorProvider: createNextCookieCurrentActorProvider(),
    addMember: (input, actor) => addTeamMember(input, actor, { teams: repository }),
  })
}
