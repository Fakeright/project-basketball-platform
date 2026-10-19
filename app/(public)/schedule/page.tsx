import Link from "next/link"

import { ScheduleTable } from "@/components/schedule-table"
import { CompetitionResultSummary } from "@/components/tournaments/competition-result-summary"
import { StatePanel } from "@/components/state-panel"
import { getTournamentCompetitionBySlug } from "@/features/tournaments/application/get-tournament-competition-by-slug"
import { getTournamentRepository } from "@/features/tournaments/infrastructure/get-tournament-repository"
import { getCompetitionSummary } from "@/features/competition/application/get-competition-summary"

export default async function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  const repository = getTournamentRepository()
  const { tournament: requestedTournament } = await searchParams
  const slug = typeof requestedTournament === "string" ? requestedTournament : undefined
  // ใช้ slug จาก URL ก่อน; ค่าเริ่มต้นอ่านรายการ OPEN พร้อมข้อมูลการแข่งขันในคำขอเดียว
  const selectedTournament = slug
    ? await getTournamentCompetitionBySlug(repository, slug)
    : await repository.findFirstCompetitionByStatus("OPEN")
  const scheduledMatches =
    selectedTournament?.matches.filter((match) => match.scheduledAt) ?? []

  return (
    <div className="py-8 sm:py-12">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-court">GAME SCHEDULE</p>
        <h1 className="mt-2 text-3xl font-semibold">ตารางแข่งขัน</h1>
        {selectedTournament ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{selectedTournament.title}</p>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <Link className="font-medium underline underline-offset-4" href={`/bracket?tournament=${selectedTournament.slug}`} prefetch={false}>
                ดูสายการแข่งขัน
              </Link>
              <Link className="font-medium underline underline-offset-4" href={`/results?tournament=${selectedTournament.slug}`} prefetch={false}>
                ดูผลการแข่งขัน
              </Link>
            </div>
          </>
        ) : null}
      </header>
      <section className="mt-8">
        {scheduledMatches.length ? (
          <ScheduleTable matches={scheduledMatches} />
        ) : (
          <StatePanel
            action={{ href: "/tournaments", label: "ดูทัวร์นาเมนต์ทั้งหมด" }}
            kind="empty"
            message="ยังไม่มีตารางแข่งขันสำหรับทัวร์นาเมนต์ที่เลือก"
            title="ยังไม่มีข้อมูลการแข่งขัน"
          />
        )}
        {selectedTournament ? (
          <div className="mt-10">
            <CompetitionResultSummary
              summary={getCompetitionSummary(selectedTournament.matches)}
            />
          </div>
        ) : null}
      </section>
    </div>
  )
}
