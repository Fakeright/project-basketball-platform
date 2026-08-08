"use client"

import { useState } from "react"

import { TeamEditor, type EditableTeam } from "@/components/team/team-editor"
import { TeamPlayerRoster } from "@/components/team/team-player-roster"
import type { TeamPlayer } from "@/features/team-management/domain/team"

export function TeamWorkspaceManager({
  adminOverride,
  initialPlayers,
  initialTeam,
}: {
  adminOverride: boolean
  initialPlayers: TeamPlayer[]
  initialTeam: EditableTeam
}) {
  const [team, setTeam] = useState(initialTeam)

  return (
    <>
      <TeamEditor
        adminOverride={adminOverride}
        initialTeam={team}
        onTeamUpdated={setTeam}
      />
      <TeamPlayerRoster
        format={team.format}
        initialPlayers={initialPlayers}
        teamId={team.id}
      />
    </>
  )
}
