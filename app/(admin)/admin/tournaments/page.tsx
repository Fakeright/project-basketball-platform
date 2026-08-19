import Link from "next/link"
import { notFound } from "next/navigation"
import { Eye, GitBranch, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"

import type { TournamentOperationStatus } from "@/features/tournament-operations/domain/tournament-operation"
import { getTournamentOperationsRepository } from "@/features/tournament-operations/infrastructure/get-tournament-operations-repository"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

const statusLabels: Record<TournamentOperationStatus, string> = {
  DRAFT: "ฉบับร่าง",
  SUBMITTED: "รอตรวจสอบ",
  CHANGES_REQUESTED: "ต้องแก้ไข",
  APPROVED: "อนุมัติแล้ว",
  PUBLISHED: "เปิดรับสมัคร",
  REGISTRATION_CLOSED: "ปิดรับสมัคร",
  IN_PROGRESS: "กำลังแข่งขัน",
  COMPLETED: "จบการแข่งขัน",
  ARCHIVED: "เก็บถาวร",
  REJECTED: "ไม่อนุมัติ",
  SUSPENDED: "ระงับ",
}

const statuses = Object.keys(statusLabels) as TournamentOperationStatus[]

export default async function AdminTournamentListPage({
  searchParams,
}: PageProps<"/admin/tournaments">) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (actor?.role !== "PLATFORM_ADMIN") notFound()
  const params = await searchParams
  const query = typeof params.q === "string" ? params.q.trim() : ""
  const requestedStatus =
    typeof params.status === "string" ? params.status : ""
  const status = statuses.includes(requestedStatus as TournamentOperationStatus)
    ? (requestedStatus as TournamentOperationStatus)
    : undefined
  const repository = await getTournamentOperationsRepository()
  const tournaments = await repository.listForAdmin({
    ...(query ? { query } : {}),
    ...(status ? { status } : {}),
  })

  return (
    <section aria-labelledby="admin-tournament-list-heading">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold text-court">TOURNAMENT GOVERNANCE</p>
        <h1 className="mt-2 text-2xl font-semibold" id="admin-tournament-list-heading">
          รายการแข่งขันทั้งหมด
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ค้นหาและเข้าสู่พื้นที่กำกับการแข่งขันของทุกผู้จัด
        </p>
      </header>

      <form className="grid gap-3 border-b border-border py-5 md:grid-cols-[minmax(14rem,1fr)_14rem_auto] md:items-end">
        <label className="text-sm font-medium">
          ค้นหารายการ ผู้จัด หรือจังหวัด
          <input
            className="mt-1 min-h-10 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            defaultValue={query}
            name="q"
            type="search"
          />
        </label>
        <label className="text-sm font-medium">
          สถานะ
          <select
            className="mt-1 min-h-10 w-full border border-input bg-background px-3 text-sm"
            defaultValue={status ?? ""}
            name="status"
          >
            <option value="">ทุกสถานะ</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {statusLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <button
          className="min-h-10 bg-foreground px-5 text-sm font-medium text-background"
          type="submit"
        >
          ค้นหา
        </button>
      </form>

      {tournaments.length ? (
        <div className="divide-y divide-border border-b border-border">
          {tournaments.map((tournament) => (
            <article
              className="grid gap-4 py-5 lg:grid-cols-[minmax(14rem,1.4fr)_minmax(10rem,0.8fr)_auto] lg:items-center"
              key={tournament.id}
            >
              <div className="min-w-0">
                <h2 className="break-words font-semibold">{tournament.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tournament.organizerName ?? tournament.organizerId} · {tournament.province}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">{statusLabels[tournament.status]}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tournament.format === "FIVE_V_FIVE" ? "5v5" : "3v3"} · {tournament.ageGroup}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <OperationLink href={`/organizer/tournaments/${tournament.id}`} label="เปิดข้อมูลรายการ">
                  <Eye aria-hidden="true" />
                </OperationLink>
                <OperationLink href={`/organizer/tournaments/${tournament.id}/bracket`} label="เปิดสายการแข่งขัน">
                  <GitBranch aria-hidden="true" />
                </OperationLink>
                <OperationLink href={`/admin/tournaments/${tournament.id}/results`} label="กำกับผล">
                  <ShieldCheck aria-hidden="true" />
                </OperationLink>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="py-12 text-sm text-muted-foreground">
          ไม่พบรายการแข่งขันตามเงื่อนไขที่เลือก
        </p>
      )}
    </section>
  )
}

function OperationLink({
  children,
  href,
  label,
}: {
  children: ReactNode
  href: string
  label: string
}) {
  return (
    <Link
      aria-label={label}
      className="inline-flex min-h-9 items-center justify-center gap-1.5 border border-border px-3 text-sm hover:border-foreground"
      href={href}
    >
      {children}
      <span>{label}</span>
    </Link>
  )
}
