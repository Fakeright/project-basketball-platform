import Link from "next/link"

import type { TeamSummary } from "@/features/team-management/domain/team"

interface TeamListWorkspace {
  team: TeamSummary
  players: readonly { id: string }[]
}

export function TeamList({ workspaces }: { workspaces: TeamListWorkspace[] }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {workspaces.map(({ team, players }) => (
        <li
          className="grid min-w-0 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center"
          key={team.id}
        >
          <div className="min-w-0">
            <Link className="font-medium hover:text-court" href={`/team/${team.id}`}>
              {team.name}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{team.province}</p>
          </div>
          <span className="text-sm font-medium">
            {team.format === "FIVE_V_FIVE" ? "5v5" : "3v3"}
          </span>
          <span className="text-sm">ผู้เล่น {players.length} คน</span>
          <span
            className={
              team.isActive
                ? "text-sm text-muted-foreground"
                : "w-fit border border-border px-2 py-1 text-xs font-semibold"
            }
          >
            {team.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
          </span>
        </li>
      ))}
    </ul>
  )
}
