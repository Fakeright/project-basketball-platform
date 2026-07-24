import Link from "next/link"
import { notFound } from "next/navigation"

import { getTournamentBySlug } from "@/features/tournaments/application/get-tournament-by-slug"
import { MockTournamentRepository } from "@/features/tournaments/infrastructure/mock-tournament-repository"
import {
  formatTournamentDateRange,
  formatTournamentFormat,
} from "@/features/tournaments/presentation/tournament-view-model"

const repository = new MockTournamentRepository()

const statusLabels = {
  OPEN: "เปิดรับสมัคร",
  CLOSED: "ปิดรับสมัคร",
  ONGOING: "กำลังแข่งขัน",
  COMPLETED: "แข่งขันจบแล้ว",
} as const

const thaiDateFormatter = new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

export default async function TournamentDetailPage({ params }: PageProps<"/tournaments/[slug]">) {
  const { slug } = await params
  const tournament = await getTournamentBySlug(repository, slug)

  if (!tournament) {
    notFound()
  }

  return (
    <div className="py-8 sm:py-12">
      <header className="border-b border-border pb-7">
        <p className="text-sm font-medium text-court">{statusLabels[tournament.status]}</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{tournament.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{tournament.description}</p>
        <dl className="mt-7 grid gap-5 border-t border-border pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">วันแข่งขัน</dt>
            <dd className="mt-1 font-medium">{formatTournamentDateRange(tournament.startsAt, tournament.endsAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">รูปแบบ</dt>
            <dd className="mt-1 font-medium">{formatTournamentFormat(tournament.format)} / {tournament.ageGroup}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">สถานที่</dt>
            <dd className="mt-1 font-medium">{tournament.venue}, {tournament.province}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">ปิดรับสมัคร</dt>
            <dd className="mt-1 font-medium">{thaiDateFormatter.format(new Date(`${tournament.registrationDeadline.slice(0, 10)}T00:00:00Z`))}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          <h2 className="text-xl font-semibold">ทีมที่เข้าร่วม</h2>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {tournament.teams.map((team) => (
              <li className="px-4 py-4 font-medium sm:px-6" key={team}>{team}</li>
            ))}
          </ul>
        </section>
        <nav aria-label="ข้อมูลการแข่งขัน" className="border-y border-border py-2 lg:border-y-0 lg:border-l lg:pl-6">
          <Link className="block border-b border-border py-4 text-sm font-medium underline underline-offset-4" href={`/schedule?tournament=${tournament.slug}`}>
            ตารางแข่งขัน
          </Link>
          <Link className="block py-4 text-sm font-medium underline underline-offset-4" href={`/bracket?tournament=${tournament.slug}`}>
            Bracket
          </Link>
        </nav>
      </div>
    </div>
  )
}
