import { deactivateTeamMember } from "@/features/team-management/application/deactivate-team-member"
import { PrismaTeamRepository } from "@/features/team-management/infrastructure/prisma-team-repository"
import { handleDeactivateTeamMember } from "@/features/team-management/presentation/team-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getPrismaClient } from "@/lib/server/prisma"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const { id, memberId } = await params
  const repository = new PrismaTeamRepository(getPrismaClient())
  return handleDeactivateTeamMember(id, memberId, {
    actorProvider: createNextCookieCurrentActorProvider(),
    deactivateMember: (input, actor) =>
      deactivateTeamMember(input, actor, { teams: repository }),
  })
}
