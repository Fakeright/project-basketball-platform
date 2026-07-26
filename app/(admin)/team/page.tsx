import Link from "next/link"

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
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-court">TEAM WORKSPACE</p>
          <h1 className="mt-2 text-2xl font-semibold">ทีมของฉัน</h1>
          <p className="mt-2 text-sm text-muted-foreground">จัดการข้อมูลทีมและรายชื่อสมาชิก</p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center border border-foreground px-5 text-sm font-medium"
          href="/team/new"
        >
          สร้างทีม
        </Link>
      </header>

      {workspaces.length === 0 ? (
        <p className="py-8 text-sm text-muted-foreground">ยังไม่มีทีมที่ดูแล</p>
      ) : (
        <ul className="divide-y divide-border border-b border-border">
          {workspaces.map(({ team, members }) => {
            const players = members.filter((member) => member.role === "PLAYER").length
            const coaches = members.filter((member) => member.role === "COACH").length
            return (
              <li className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center" key={team.id}>
                <div className="min-w-0">
                  <Link className="font-medium hover:text-court" href={`/team/${team.id}`}>
                    {team.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{team.province}</p>
                </div>
                <span className="text-sm">ผู้เล่น {players}</span>
                <span className="text-sm">โค้ช {coaches}</span>
                <span className="text-sm text-muted-foreground">ยังไม่มีรายการสมัคร</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
