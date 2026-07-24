import { ScheduleTable } from "@/components/schedule-table"
import { StatePanel } from "@/components/state-panel"
import { getTournamentBySlug } from "@/features/tournaments/application/get-tournament-by-slug"
import { searchTournaments } from "@/features/tournaments/application/search-tournaments"
import { MockTournamentRepository } from "@/features/tournaments/infrastructure/mock-tournament-repository"

const repository = new MockTournamentRepository()

export default async function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  const { tournament: requestedTournament } = await searchParams
  const slug = typeof requestedTournament === "string" ? requestedTournament : undefined
  const selectedTournament = slug
    ? await getTournamentBySlug(repository, slug)
    : (await searchTournaments(repository, { status: "OPEN" }))[0] ?? null

  return (
    <div className="py-8 sm:py-12">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-court">GAME SCHEDULE</p>
        <h1 className="mt-2 text-3xl font-semibold">ตารางแข่งขัน</h1>
        {selectedTournament ? <p className="mt-3 text-sm text-muted-foreground sm:text-base">{selectedTournament.title}</p> : null}
      </header>
      <section className="mt-8">
        {selectedTournament?.matches.length ? (
          <ScheduleTable matches={selectedTournament.matches} />
        ) : (
          <StatePanel
            action={{ href: "/tournaments", label: "ดูทัวร์นาเมนต์ทั้งหมด" }}
            kind="empty"
            message="ยังไม่มีตารางแข่งขันสำหรับทัวร์นาเมนต์ที่เลือก"
            title="ยังไม่มีข้อมูลการแข่งขัน"
          />
        )}
      </section>
    </div>
  )
}
