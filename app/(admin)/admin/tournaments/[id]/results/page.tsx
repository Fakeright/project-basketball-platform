import Link from "next/link"
import { notFound } from "next/navigation"

import {
  MatchResultCorrectionDialog,
  type AdminCorrectableMatch,
} from "@/components/admin/match-result-correction-dialog"
import { getOrganizerCompetition } from "@/features/competition/application/get-organizer-competition"
import { getCompetitionRepository } from "@/features/competition/infrastructure/get-competition-repository"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export default async function AdminTournamentResultsPage({
  params,
}: PageProps<"/admin/tournaments/[id]/results">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (actor?.role !== "PLATFORM_ADMIN") notFound()
  const { id } = await params

  let workspace
  try {
    workspace = await getOrganizerCompetition(id, actor, {
      competitions: getCompetitionRepository(),
    })
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") notFound()
    throw error
  }

  const teamNames = new Map(
    workspace.bracket?.entries.map((entry) => [
      entry.teamId,
      entry.teamNameSnapshot,
    ]) ?? [],
  )
  const matches: AdminCorrectableMatch[] =
    workspace.bracket?.rounds.flatMap((round) =>
      round.matches.flatMap((match) => {
        if (
          match.status !== "COMPLETED" ||
          match.homeScore === null ||
          match.awayScore === null ||
          !match.homeTeamId ||
          !match.awayTeamId ||
          !match.winnerTeamId
        ) {
          return []
        }
        return [{
          id: match.id,
          roundName: round.name,
          sequence: match.sequence,
          homeTeam: teamNames.get(match.homeTeamId) ?? "ทีมแรก",
          awayTeam: teamNames.get(match.awayTeamId) ?? "ทีมสอง",
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          winnerTeam: teamNames.get(match.winnerTeamId) ?? "ทีมชนะ",
          version: match.version,
        }]
      }),
    ) ?? []

  return (
    <section className="mx-auto w-full max-w-7xl">
      <Link
        className="text-sm underline underline-offset-4"
        href="/admin"
      >
        กลับไปภาพรวม
      </Link>
      <header className="border-b border-border pb-6 pt-6">
        <p className="text-xs font-semibold text-court">RESULT GOVERNANCE</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          ตรวจสอบและแก้ผลการแข่งขัน
        </h1>
        <p className="mt-2 break-words text-sm text-muted-foreground">
          {workspace.tournament.title}
        </p>
      </header>

      {matches.length ? (
        <div className="divide-y divide-border border-b border-border">
          {matches.map((match) => (
            <MatchResultCorrectionDialog
              key={match.id}
              match={match}
              tournamentId={workspace.tournament.id}
            />
          ))}
        </div>
      ) : (
        <p className="py-10 text-sm text-muted-foreground">
          ยังไม่มีผลการแข่งขันที่ยืนยันแล้วสำหรับแก้ไข
        </p>
      )}
    </section>
  )
}
