"use client"

import { useState } from "react"

import { TeamEditor, type EditableTeam } from "@/components/team/team-editor"
import { LegacyTeamReconciliationNotice } from "@/components/team/legacy-team-reconciliation-notice"
import { TeamPlayerRoster } from "@/components/team/team-player-roster"
import type { LegacyTeamReconciliationSummary } from "@/features/team-management/application/legacy-team-reconciliation"
import type { TeamPlayer } from "@/features/team-management/domain/team"

export function TeamWorkspaceManager({
  adminOverride,
  initialPlayers,
  initialTeam,
  legacyReconciliation = null,
  readOnly = false,
}: {
  adminOverride: boolean
  initialPlayers: TeamPlayer[]
  initialTeam: EditableTeam
  legacyReconciliation?: LegacyTeamReconciliationSummary | null
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
      {legacyReconciliation ? (
        <LegacyTeamReconciliationNotice reconciliation={legacyReconciliation} />
      ) : null}
      <TeamPlayerRoster
        format={team.format}
        initialPlayers={initialPlayers}
        teamId={team.id}
        readOnly={readOnly}
      />
    </>
  )
}
