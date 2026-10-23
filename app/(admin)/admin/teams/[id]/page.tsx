/**
 * COURTSIDE: คำอธิบายไฟล์
 * หน้า /admin/teams/[id]: แสดงข้อมูลทีมและสมาชิกปัจจุบันให้แอดมินดูแบบอ่านอย่างเดียว
 * ตามการทำงานต่อ: features/identity/infrastructure/next-cookie-current-actor-provider.ts, features/team-management/application/read-admin-teams.ts, features/team-management/infrastructure/get-admin-team-read-repository.ts
 */

import Link from "next/link"
import { notFound } from "next/navigation"

import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { getAdminTeamDetail } from "@/features/team-management/application/read-admin-teams"
import { getAdminTeamReadRepository } from "@/features/team-management/infrastructure/get-admin-team-read-repository"

export default async function AdminTeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const actor = await createNextCookieCurrentActorProvider().getCurrentActor()
  if (!actor) notFound()

  const { id } = await params
  let team
  try {
    team = await getAdminTeamDetail(id, actor, {
      teams: getAdminTeamReadRepository(),
    })
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") notFound()
    throw error
  }

  return (
    <section aria-labelledby="admin-team-detail-heading">
      <header className="border-b border-border pb-6">
        <Link className="text-sm text-court hover:underline" href="/admin/teams">
          กลับไปทีมทั้งหมด
        </Link>
        <p className="mt-6 text-xs font-semibold text-court">TEAM DIRECTORY</p>
        <h1 className="mt-2 break-words text-2xl font-semibold" id="admin-team-detail-heading">
          {team.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {team.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"} · {team.format === "FIVE_V_FIVE" ? "5v5" : "3v3"} · {team.province}
        </p>
      </header>

      <dl className="grid gap-x-8 gap-y-4 border-b border-border py-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">ผู้สร้างทีม / ผู้จัดการ-โค้ช</dt>
          <dd className="mt-1 break-words font-medium">{team.ownerName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">ผู้เล่นที่ใช้งานอยู่</dt>
          <dd className="mt-1 font-medium">{team.activePlayerCount} คน</dd>
        </div>
      </dl>

      <div className="pt-8">
        <h2 className="text-lg font-semibold">รายชื่อผู้เล่น</h2>
        {team.players.length === 0 ? (
          <p className="border-b border-border py-8 text-sm text-muted-foreground">
            ทีมนี้ยังไม่มีผู้เล่นที่ใช้งานอยู่
          </p>
        ) : (
          <ol className="mt-4 divide-y divide-border border-y border-border">
            {team.players.map((player, index) => (
              <li className="grid min-w-0 gap-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]" key={player.id}>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">ผู้เล่น {index + 1}</p>
                  <p className="mt-1 break-words font-medium">
                    {player.firstName} {player.lastName}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">ชื่อเล่น</dt>
                    <dd className="mt-1 break-words">{player.nickname ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">เบอร์เสื้อ</dt>
                    <dd className="mt-1">{player.jerseyNumber ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">ตำแหน่ง</dt>
                    <dd className="mt-1">{player.position ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">วันเกิด</dt>
                    <dd className="mt-1">{player.birthDate}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
