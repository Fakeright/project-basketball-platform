import { notFound } from "next/navigation"

import { RosterManager } from "@/components/team/roster-manager"
import { TeamEditor } from "@/components/team/team-editor"
import { TeamRegistrationList } from "@/components/team/team-registration-list"
import type { Actor } from "@/features/identity/domain/actor"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getOwnedTeamWorkspace } from "@/features/team-management/application/get-owned-team-workspace"
import { listTeamMemberCandidates } from "@/features/team-management/application/list-team-member-candidates"
import { getTeamRepository } from "@/features/team-management/infrastructure/get-team-repository"

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) notFound()

  const { id } = await params
  const [workspace, candidates] = await loadTeamDetail(id, actor)

  return (
    <section>
      <header className="border-b border-border pb-5">
        <p className="text-xs font-semibold text-court">TEAM WORKSPACE</p>
        <h1 className="mt-2 text-2xl font-semibold">{workspace.team.name}</h1>
      </header>
      <div className="pt-8">
        <TeamEditor initialTeam={workspace.team} />
        <RosterManager
          candidates={candidates}
          members={workspace.members}
          teamId={workspace.team.id}
        />
        <TeamRegistrationList registrations={[]} />
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
      listTeamMemberCandidates(id, actor, { teams: repository }),
    ])
  } catch (error) {
    if (error instanceof Error && ["NOT_FOUND", "FORBIDDEN"].includes(error.message)) {
      notFound()
    }
    throw error
  }
}
