import Link from "next/link"

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
        <ul className="divide-y divide-border border-b border-border">
          {workspaces.map(({ team, players }) => {
            const formatLabel = team.format === "FIVE_V_FIVE" ? "5v5" : "3v3"
            return (
              <li className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center" key={team.id}>
                <div className="min-w-0">
                  <Link className="font-medium hover:text-court" href={`/team/${team.id}`}>
                    {team.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{team.province}</p>
                </div>
                <span className="text-sm font-medium">{formatLabel}</span>
                <span className="text-sm">ผู้เล่น {players.length} คน</span>
                <span className="text-sm text-muted-foreground">ยังไม่มีรายการสมัคร</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
