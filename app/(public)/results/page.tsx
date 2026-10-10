import Link from "next/link"

import { StatePanel } from "@/components/state-panel"
import { CompetitionResultSummary } from "@/components/tournaments/competition-result-summary"
import { getCompetitionSummary } from "@/features/competition/application/get-competition-summary"
import { getTournamentCompetitionBySlug } from "@/features/tournaments/application/get-tournament-competition-by-slug"
import { searchTournaments } from "@/features/tournaments/application/search-tournaments"
import { getTournamentRepository } from "@/features/tournaments/infrastructure/get-tournament-repository"

const statusLabels = {
  OPEN: "เปิดรับสมัคร",
  CLOSED: "ปิดรับสมัคร",
  ONGOING: "กำลังแข่งขัน",
  COMPLETED: "แข่งขันจบแล้ว",
} as const

export default async function ResultsPage({
  searchParams,
}: PageProps<"/results">) {
  const repository = getTournamentRepository()
  const { tournament: requestedTournament } = await searchParams
  const requestedSlug =
    typeof requestedTournament === "string" ? requestedTournament : undefined
  const selectedSlug = requestedSlug ?? (await findLatestResultSlug(repository))
  const tournament = selectedSlug
    ? await getTournamentCompetitionBySlug(repository, selectedSlug)
    : null

  if (!tournament) {
    return (
      <div className="py-8 sm:py-12">
        <header className="border-b border-border pb-6">
          <p className="text-sm font-medium text-court">TOURNAMENT RESULTS</p>
          <h1 className="mt-2 text-3xl font-semibold">ผลการแข่งขัน</h1>
        </header>
        <div className="mt-8">
          <StatePanel
            action={{ href: "/tournaments", label: "ดูรายการแข่งขันทั้งหมด" }}
            kind="empty"
            message="ยังไม่มีรายการที่กำลังแข่งขันหรือสรุปผลแล้ว"
            title="ยังไม่มีผลการแข่งขัน"
          />
        </div>
      </div>
    )
  }

  const summary = getCompetitionSummary(tournament.matches)
  const hasProjectedResult =
    Boolean(summary.winner) || summary.eliminatedByRound.length > 0

  return (
    <div className="py-8 sm:py-12">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-court">TOURNAMENT RESULTS</p>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl font-semibold">ผลการแข่งขัน</h1>
          <span className="text-sm font-medium text-muted-foreground">
            {statusLabels[tournament.status]}
          </span>
        </div>
        <p className="mt-3 text-base font-medium sm:text-lg">
          {tournament.title}
        </p>
        {tournament.status !== "COMPLETED" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {tournament.status === "ONGOING"
              ? "การแข่งขันยังไม่จบ ผลที่แสดงเป็นผลที่ยืนยันแล้ว"
              : "การแข่งขันยังไม่เริ่ม"}
          </p>
        ) : null}
        <nav
          aria-label="ดูข้อมูลรายการที่เลือก"
          className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm"
        >
          <Link
            className="font-medium underline underline-offset-4"
            href={`/schedule?tournament=${tournament.slug}`}
          >
            ตารางแข่งขัน
          </Link>
          <Link
            className="font-medium underline underline-offset-4"
            href={`/bracket?tournament=${tournament.slug}`}
          >
            สายการแข่งขัน
          </Link>
          <Link
            className="font-medium underline underline-offset-4"
            href={`/tournaments/${tournament.slug}`}
          >
            รายละเอียดรายการ
          </Link>
        </nav>
      </header>

      <div className="mt-8">
        {hasProjectedResult ? (
          <CompetitionResultSummary summary={summary} />
        ) : (
          <StatePanel
            action={{
              href: `/schedule?tournament=${tournament.slug}`,
              label: "ดูตารางแข่งขัน",
            }}
            kind="empty"
            message="ยังไม่มีผลที่ยืนยันสำหรับรายการนี้"
            title="รอผลการแข่งขัน"
          />
        )}
      </div>
    </div>
  )
}

async function findLatestResultSlug(
  repository: ReturnType<typeof getTournamentRepository>,
) {
  const ongoing = await searchTournaments(repository, { status: "ONGOING" })
  if (ongoing[0]) return ongoing[0].slug

  const completed = await searchTournaments(repository, { status: "COMPLETED" })
  return completed[0]?.slug
}
