"use client"

import { useState } from "react"

import { TeamEditor, type EditableTeam } from "@/components/team/team-editor"
import { TeamPlayerRoster } from "@/components/team/team-player-roster"
import type { TeamPlayer } from "@/features/team-management/domain/team"

export function TeamWorkspaceManager({
  adminOverride,
  initialPlayers,
  initialTeam,
  readOnly = false,
}: {
  adminOverride: boolean
  initialPlayers: TeamPlayer[]
  initialTeam: EditableTeam
  readOnly?: boolean
}) {
  const [team, setTeam] = useState(initialTeam)

  return (
    <>
      <TeamEditor
        adminOverride={adminOverride}
        initialTeam={team}
        onTeamUpdated={setTeam}
        readOnly={readOnly}
      />
      <TeamPlayerRoster
        format={team.format}
        initialPlayers={initialPlayers}
        teamId={team.id}
        readOnly={readOnly}
      />
    </>
  )
}
