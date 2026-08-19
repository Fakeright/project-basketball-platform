import { notFound, redirect } from "next/navigation"

import { CompetitionWorkspaceNav } from "@/components/organizer/competition-workspace-nav"
import { ExternalMatchEditor } from "@/components/organizer/external-match-editor"
import {
  MatchScheduleEditor,
  type EditableMatchSchedule,
} from "@/components/organizer/match-schedule-editor"
import { utcToBangkokDateTimeLocal } from "@/features/admin/presentation/tournament-editor-time"
import { getOrganizerCompetition } from "@/features/competition/application/get-organizer-competition"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export default async function OrganizerSchedulePage({
  params,
}: PageProps<"/organizer/tournaments/[id]/schedule">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) redirect("/login")
  const { id } = await params

  let workspace
  try {
    workspace = await getOrganizerCompetition(id, actor, {
      competitions: getCompetitionRepository(),
    })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "NOT_FOUND" || error.message === "FORBIDDEN")
    ) {
      notFound()
    }
    throw error
  }

  const teamNames = new Map(
    workspace.bracket?.entries.map((entry) => [
      entry.teamId,
      entry.teamNameSnapshot,
    ]) ?? [],
  )
  const matches: EditableMatchSchedule[] =
    workspace.bracket?.rounds.flatMap((round) =>
      round.matches.map((match) => ({
        id: match.id,
        roundName: round.name,
        sequence: match.sequence,
        homeTeam: match.homeTeamId
          ? teamNames.get(match.homeTeamId) ?? "รอผลการแข่งขัน"
          : "รอผลการแข่งขัน",
        awayTeam: match.awayTeamId
          ? teamNames.get(match.awayTeamId) ?? "รอผลการแข่งขัน"
          : "รอผลการแข่งขัน",
        scheduledAt: match.scheduledAt
          ? utcToBangkokDateTimeLocal(match.scheduledAt)
          : "",
        court: match.court ?? "",
        status: match.status,
        version: match.version,
      })),
    ) ?? []

  return (
    <section className="mx-auto w-full max-w-7xl">
      <header className="pb-6">
        <p className="text-xs font-semibold text-court">MATCH OPERATIONS</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">จัดตารางแข่งขัน</h1>
        <p className="mt-2 break-words text-sm text-muted-foreground">
          {workspace.tournament.title}
        </p>
      </header>
      <CompetitionWorkspaceNav tournamentId={workspace.tournament.id} />
      <div className="pt-7">
        {workspace.bracket?.mode === "EXTERNAL_DOCUMENT" ? (
          <ExternalMatchEditor
            bracketVersion={workspace.bracket.version}
            teams={workspace.bracket.entries.map((entry) => ({
              id: entry.teamId,
              name: entry.teamNameSnapshot,
            }))}
            tournamentId={workspace.tournament.id}
          />
        ) : null}
        <div
          className={
            workspace.bracket?.mode === "EXTERNAL_DOCUMENT" ? "mt-7" : undefined
          }
        >
          <MatchScheduleEditor
            matches={matches}
            tournamentId={workspace.tournament.id}
          />
        </div>
      </div>
    </section>
  )
}
