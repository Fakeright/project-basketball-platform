import { TournamentSearchForm } from "@/components/tournament-search-form"
import { TournamentRow } from "@/components/tournament-row"
import { StatePanel } from "@/components/state-panel"
import { searchTournaments } from "@/features/tournaments/application/search-tournaments"
import { getTournamentRepository } from "@/features/tournaments/infrastructure/get-tournament-repository"
import { parseTournamentSearchParams } from "@/features/tournaments/presentation/tournament-search-params"

export default async function TournamentListPage({ searchParams }: PageProps<"/tournaments">) {
  const repository = getTournamentRepository()
  const filters = parseTournamentSearchParams(await searchParams)
  const tournaments = await searchTournaments(repository, filters)

  return (
    <div className="py-8 sm:py-12">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-court">TOURNAMENT ATLAS</p>
        <h1 className="mt-2 text-3xl font-semibold">ค้นหาทัวร์นาเมนต์</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          กรองรายการตามชื่อ จังหวัด รูปแบบ รุ่นอายุ สนาม และวันที่แข่งขัน
        </p>
        <div className="mt-6">
          <TournamentSearchForm initialFilters={filters} />
        </div>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">รายการแข่งขัน {tournaments.length} รายการ</h2>
        <div className="mt-3">
          {tournaments.length > 0 ? (
            tournaments.map((tournament) => <TournamentRow key={tournament.slug} tournament={tournament} />)
          ) : (
            <StatePanel
              action={{ href: "/tournaments", label: "ล้างตัวกรอง" }}
              kind="empty"
              message="ไม่พบรายการที่ตรงกับเงื่อนไขที่เลือก ลองปรับการค้นหาอีกครั้ง"
              title="ไม่พบทัวร์นาเมนต์"
            />
          )}
        </div>
      </section>
    </div>
  )
}
