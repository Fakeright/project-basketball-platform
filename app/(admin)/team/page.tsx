import { TeamList } from "@/components/team/team-list"
import { TeamWorkspaceHeader } from "@/components/team/team-workspace-header"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getOwnedTeamWorkspace } from "@/features/team-management/application/get-owned-team-workspace"
import { listOwnedTeams } from "@/features/team-management/application/list-owned-teams"
import { getTeamRepository } from "@/features/team-management/infrastructure/get-team-repository"

export default async function TeamPage() {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) return null

  const teams = await listOwnedTeams(actor, { teams: getTeamRepository() })
  const workspaces = await Promise.all(
    teams.map((team) =>
      getOwnedTeamWorkspace(team.id, actor, { teams: getTeamRepository() }),
    ),
  )

  return (
    <section>
      <TeamWorkspaceHeader actorRole={actor.role} />

      {workspaces.length === 0 ? (
        <p className="py-8 text-sm text-muted-foreground">ยังไม่มีทีมที่ดูแล</p>
      ) : (
        <TeamList workspaces={workspaces} />
      )}
    </section>
  )
}
