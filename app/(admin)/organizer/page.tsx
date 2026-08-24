import Link from "next/link"
import { redirect } from "next/navigation"

import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"

const statusLabel = {
  DRAFT: "ฉบับร่าง",
  SUBMITTED: "รอตรวจสอบ",
  CHANGES_REQUESTED: "ต้องแก้ไข",
  APPROVED: "อนุมัติแล้ว",
  PUBLISHED: "เผยแพร่แล้ว",
  REGISTRATION_CLOSED: "ปิดรับสมัคร",
  IN_PROGRESS: "กำลังแข่งขัน",
  COMPLETED: "จบการแข่งขัน",
  ARCHIVED: "เก็บถาวร",
  REJECTED: "ไม่อนุมัติ",
  SUSPENDED: "ระงับ",
} as const

export default async function OrganizerPage() {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) redirect("/login")

  const repository = await getTournamentOperationsRepository()
  const tournaments = await repository.listByOrganizer(actor.id)

  return (
    <section aria-labelledby="organizer-heading">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-court">ORGANIZER WORKSPACE</p>
          <h1 className="mt-2 text-2xl font-semibold" id="organizer-heading">
            รายการของฉัน
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            จัดการฉบับร่างและติดตามสถานะการตรวจสอบ
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center bg-foreground px-4 text-sm font-medium text-background"
          href="/organizer/tournaments/new"
        >
          สร้างรายการแข่งขัน
        </Link>
      </header>

      {tournaments.length ? (
        <div className="mt-5 divide-y divide-border border-y border-border">
          {tournaments.map((tournament) => (
            <article
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              key={tournament.id}
            >
              <div>
                <h2 className="font-medium">{tournament.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {statusLabel[tournament.status]} · {tournament.province}
                </p>
              </div>
              <Link
                className="inline-flex min-h-10 items-center justify-center border border-foreground px-4 text-sm"
                href={`/organizer/tournaments/${tournament.id}`}
              >
                เปิดรายการ
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-muted-foreground">
          ยังไม่มีรายการแข่งขัน
        </p>
      )}
    </section>
  )
}
