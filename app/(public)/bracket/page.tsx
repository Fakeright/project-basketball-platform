import Link from "next/link"

import { BracketView } from "@/components/bracket-view"
import { ExternalBracketView } from "@/components/external-bracket-view"
import { CompetitionResultSummary } from "@/components/tournaments/competition-result-summary"
import { StatePanel } from "@/components/state-panel"
import { getTournamentCompetitionBySlug } from "@/features/tournaments/application/get-tournament-competition-by-slug"
import { searchTournaments } from "@/features/tournaments/application/search-tournaments"
import { getTournamentRepository } from "@/features/tournaments/infrastructure/get-tournament-repository"
import { getCompetitionSummary } from "@/features/competition/application/get-competition-summary"
import { getExternalBracketView } from "@/features/competition/application/get-external-bracket-view"
import { getExternalBracketRepository } from "@/features/competition/infrastructure/get-external-bracket-repository"
import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"

export default async function BracketPage({ searchParams }: PageProps<"/bracket">) {
  const repository = getTournamentRepository()
  const { tournament: requestedTournament } = await searchParams
  const slug = typeof requestedTournament === "string" ? requestedTournament : undefined
  const selectedSlug =
    slug ??
    (await searchTournaments(repository, { status: "OPEN" }))[0]?.slug
  const selectedTournament = selectedSlug
    ? await getTournamentCompetitionBySlug(repository, selectedSlug)
    : null
  const externalBracket = selectedSlug
    ? await getExternalBracketView(selectedSlug, {
        externalBrackets: getExternalBracketRepository(),
        storage: new SupabaseObjectStorage(),
      })
    : null

  return (
    <div className="py-8 sm:py-12">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-court">TOURNAMENT BRACKET</p>
        <h1 className="mt-2 text-3xl font-semibold">สายการแข่งขัน</h1>
        {selectedTournament ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{selectedTournament.title}</p>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <Link className="font-medium underline underline-offset-4" href={`/schedule?tournament=${selectedTournament.slug}`}>
                ดูตารางแข่งขัน
              </Link>
              <Link className="font-medium underline underline-offset-4" href={`/results?tournament=${selectedTournament.slug}`}>
                ดูผลการแข่งขัน
              </Link>
            </div>
          </>
        ) : null}
      </header>
      <section className="mt-8">
        {externalBracket ? (
          <div className="space-y-10">
            <ExternalBracketView view={externalBracket} />
            {selectedTournament?.matches.length ? (
              <CompetitionResultSummary
                summary={getCompetitionSummary(selectedTournament.matches)}
              />
            ) : null}
          </div>
        ) : selectedTournament?.matches.length ? (
          <div className="space-y-10">
            <BracketView
              entries={selectedTournament.bracketEntries}
              matches={selectedTournament.matches}
              source={selectedTournament.bracketSource}
            />
            <CompetitionResultSummary
              summary={getCompetitionSummary(selectedTournament.matches)}
            />
          </div>
        ) : (
          <StatePanel
            action={{ href: "/tournaments", label: "ดูทัวร์นาเมนต์ทั้งหมด" }}
            kind="empty"
            message="ยังไม่มีสายการแข่งขันสำหรับทัวร์นาเมนต์ที่เลือก"
            title="ยังไม่มีข้อมูลการแข่งขัน"
          />
        )}
      </section>
    </div>
  )
}
