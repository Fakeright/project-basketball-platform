import { notFound } from "next/navigation"

import { TeamEditor } from "@/components/team/team-editor"
import { TeamPlayerRoster } from "@/components/team/team-player-roster"
import { TeamRegistrationList } from "@/components/team/team-registration-list"
import type { Actor } from "@/features/identity/domain/actor"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getOwnedTeamWorkspace } from "@/features/team-management/application/get-owned-team-workspace"
import { getTeamRepository } from "@/features/team-management/infrastructure/get-team-repository"
import { listOwnedTeamRegistrations } from "@/features/registrations/application/list-owned-team-registrations"
import { getRegistrationRepository } from "@/features/registrations/infrastructure/get-registration-repository"

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) notFound()

  const { id } = await params
  const [workspace, registrations] = await loadTeamDetail(id, actor)

  return (
    <section>
      <header className="border-b border-border pb-5">
        <p className="text-xs font-semibold text-court">TEAM WORKSPACE</p>
        <h1 className="mt-2 text-2xl font-semibold">{workspace.team.name}</h1>
      </header>
      <div className="pt-8">
        <TeamEditor
          adminOverride={actor.role === "PLATFORM_ADMIN"}
          initialTeam={workspace.team}
        />
        <TeamPlayerRoster
          format={workspace.team.format}
          initialPlayers={workspace.players}
          teamId={workspace.team.id}
        />
        <TeamRegistrationList registrations={registrations} />
      </div>
    </section>
  )
}

async function loadTeamDetail(
  id: string,
  actor: Actor,
) {
  try {
    const repository = getTeamRepository()
    return await Promise.all([
      getOwnedTeamWorkspace(id, actor, { teams: repository }),
      listOwnedTeamRegistrations(id, actor, { registrations: getRegistrationRepository() }),
    ])
  } catch (error) {
    if (error instanceof Error && ["NOT_FOUND", "FORBIDDEN"].includes(error.message)) {
      notFound()
    }
    throw error
  }
}
