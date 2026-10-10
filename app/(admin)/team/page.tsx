import { TeamList } from "@/components/team/team-list"
import { TeamWorkspaceHeader } from "@/components/team/team-workspace-header"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { listOwnedTeamRegistrations } from "@/features/registrations/application/list-owned-team-registrations"
import { getRegistrationRepository } from "@/features/registrations/infrastructure/get-registration-repository"
import { getOwnedTeamWorkspace } from "@/features/team-management/application/get-owned-team-workspace"
import { listOwnedTeams } from "@/features/team-management/application/list-owned-teams"
import { getTeamRepository } from "@/features/team-management/infrastructure/get-team-repository"
import { createTeamWorkflowGuidance } from "@/features/team-management/presentation/team-workflow-guidance"

export default async function TeamPage() {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) return null

  const teamRepository = getTeamRepository()
  const registrationRepository = getRegistrationRepository()
  const teams = await listOwnedTeams(actor, { teams: teamRepository })
  const workspaces = await Promise.all(
    teams.map(async (team) => {
      const [workspace, registrations] = await Promise.all([
        getOwnedTeamWorkspace(team.id, actor, { teams: teamRepository }),
        listOwnedTeamRegistrations(team.id, actor, {
          registrations: registrationRepository,
        }),
      ])

      return {
        ...workspace,
        guidance: createTeamWorkflowGuidance({
          team: workspace.team,
          activePlayerCount: workspace.players.length,
          registrations,
        }),
      }
    }),
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
