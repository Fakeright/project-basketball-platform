import Link from "next/link"
import { notFound } from "next/navigation"

import { TournamentReviewPanel } from "@/components/admin/tournament-review-panel"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

export default async function AdminReviewDetailPage({
  params,
}: PageProps<"/admin/reviews/[id]">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (actor?.role !== "PLATFORM_ADMIN") notFound()

  const { id } = await params
  const repository = await getTournamentOperationsRepository()
  const tournament = await repository.findById(id)
  if (!tournament || tournament.status !== "SUBMITTED") notFound()

  const dateFormatter = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  })

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link
        className="text-sm underline underline-offset-4"
        href="/admin/reviews"
      >
        กลับไปคิวตรวจสอบ
      </Link>
      <header className="mt-6 border-b border-border pb-6">
        <p className="text-xs font-semibold text-court">TOURNAMENT REVIEW</p>
        <h1 className="mt-2 text-2xl font-semibold">{tournament.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ผู้จัด {tournament.organizerName ?? tournament.organizerId}
        </p>
      </header>
      <dl className="grid gap-x-8 gap-y-4 border-b border-border py-6 sm:grid-cols-2 lg:grid-cols-3">
        <ReviewFact label="ประเภท" value={formatTournament(tournament.format)} />
        <ReviewFact label="รุ่นอายุ" value={tournament.ageGroup} />
        <ReviewFact label="จำนวนทีมสูงสุด" value={`${tournament.capacity} ทีม`} />
        <ReviewFact
          label="วันปิดรับสมัคร"
          value={dateFormatter.format(new Date(tournament.registrationDeadline))}
        />
        <ReviewFact
          label="วันเริ่มแข่งขัน"
          value={dateFormatter.format(new Date(tournament.startsAt))}
        />
        <ReviewFact
          label="วันสิ้นสุดการแข่งขัน"
          value={dateFormatter.format(new Date(tournament.endsAt))}
        />
        <ReviewFact label="จังหวัด" value={tournament.province} />
        <ReviewFact label="สถานที่" value={tournament.venue} />
      </dl>
      <section className="grid gap-6 py-6 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">รายละเอียด</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {tournament.description}
          </p>
        </div>
        <div>
          <h2 className="font-semibold">กติกา</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {tournament.rules}
          </p>
        </div>
      </section>
      <TournamentReviewPanel
        tournament={{
          id: tournament.id,
          title: tournament.title,
          version: tournament.version,
        }}
      />
    </main>
  )
}

function ReviewFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  )
}

function formatTournament(format: "FIVE_V_FIVE" | "THREE_V_THREE") {
  return format === "FIVE_V_FIVE" ? "5v5" : "3v3"
}
