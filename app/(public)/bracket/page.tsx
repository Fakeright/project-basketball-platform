import { BracketView } from "@/components/bracket-view"
import { StatePanel } from "@/components/state-panel"
import { getTournamentCompetitionBySlug } from "@/features/tournaments/application/get-tournament-competition-by-slug"
import { searchTournaments } from "@/features/tournaments/application/search-tournaments"
import { getTournamentRepository } from "@/features/tournaments/infrastructure/get-tournament-repository"

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

  return (
    <div className="py-8 sm:py-12">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-court">TOURNAMENT BRACKET</p>
        <h1 className="mt-2 text-3xl font-semibold">สายการแข่งขัน</h1>
        {selectedTournament ? <p className="mt-3 text-sm text-muted-foreground sm:text-base">{selectedTournament.title}</p> : null}
      </header>
      <section className="mt-8">
        {selectedTournament?.matches.length ? (
          <BracketView
            entries={selectedTournament.bracketEntries}
            matches={selectedTournament.matches}
            source={selectedTournament.bracketSource}
          />
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
