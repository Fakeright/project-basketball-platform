import Link from "next/link"

import type { Tournament, TournamentStatus } from "@/features/tournaments/domain/tournament"
import {
  formatTournamentDateRange,
  formatTournamentFormat,
} from "@/features/tournaments/presentation/tournament-view-model"

const statusLabels: Record<TournamentStatus, string> = {
  OPEN: "เปิดรับสมัคร",
  CLOSED: "ปิดรับสมัคร",
  ONGOING: "กำลังแข่งขัน",
  COMPLETED: "แข่งขันจบแล้ว",
}

export function TournamentRow({ tournament }: { tournament: Tournament }) {
  return (
    <Link
      className="group grid gap-3 border-b border-border px-4 py-5 transition-colors hover:bg-muted/60 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-6"
      href={`/tournaments/${tournament.slug}`}
    >
      <p className="text-sm font-medium text-court">
        {formatTournamentDateRange(tournament.startsAt, tournament.endsAt)}
      </p>
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold group-hover:underline group-hover:underline-offset-4">
          {tournament.title}
        </h2>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {tournament.province} / {tournament.venue}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground sm:justify-end">
        <span>{formatTournamentFormat(tournament.format)}</span>
        <span>{tournament.ageGroup}</span>
        <span className="font-medium text-foreground">{statusLabels[tournament.status]}</span>
      </div>
    </Link>
  )
}
