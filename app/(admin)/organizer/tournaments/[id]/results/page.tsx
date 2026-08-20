import { notFound, redirect } from "next/navigation"

import { CompetitionWorkspaceNav } from "@/components/organizer/competition-workspace-nav"
import {
  MatchResultEditor,
  type EditableMatchResult,
} from "@/components/organizer/match-result-editor"
import { getOrganizerCompetition } from "@/features/competition/application/get-organizer-competition"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export default async function OrganizerResultsPage({
  params,
}: PageProps<"/organizer/tournaments/[id]/results">) {
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
  const matches: EditableMatchResult[] =
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
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        winnerTeam: match.winnerTeamId
          ? teamNames.get(match.winnerTeamId) ?? "ทีมชนะ"
          : null,
        status: match.status,
        version: match.version,
        teamsComplete: Boolean(match.homeTeamId && match.awayTeamId),
        purpose: match.purpose,
        purposeEditable:
          workspace.bracket?.mode === "EXTERNAL_DOCUMENT" &&
          match.status === "SCHEDULED" &&
          match.homeScore === null &&
          match.awayScore === null,
      })),
    ) ?? []

  return (
    <section className="mx-auto w-full max-w-7xl">
      <header className="pb-6">
        <p className="text-xs font-semibold text-court">RESULT OPERATIONS</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">บันทึกผลการแข่งขัน</h1>
        <p className="mt-2 break-words text-sm text-muted-foreground">
          {workspace.tournament.title}
        </p>
      </header>
      <CompetitionWorkspaceNav tournamentId={workspace.tournament.id} />
      <div className="pt-7">
        <MatchResultEditor matches={matches} tournamentId={workspace.tournament.id} />
      </div>
    </section>
  )
}
