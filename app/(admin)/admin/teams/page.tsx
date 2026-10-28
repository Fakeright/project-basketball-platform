/**
 * COURTSIDE: คำอธิบายไฟล์
 * หน้า /admin/teams: ตรวจสิทธิ์แอดมินแล้วแสดงทีมทั้งหมดพร้อมชื่อผู้สร้าง
 * ตามการทำงานต่อ: features/identity/infrastructure/next-cookie-current-actor-provider.ts, features/team-management/application/read-admin-teams.ts, features/team-management/infrastructure/get-admin-team-read-repository.ts
 */

import Link from "next/link"
import { notFound } from "next/navigation"

import { getCurrentActor } from "@/features/identity/infrastructure/get-current-actor"
import { listAdminTeams } from "@/features/team-management/application/read-admin-teams"
import { getAdminTeamReadRepository } from "@/features/team-management/infrastructure/get-admin-team-read-repository"

export default async function AdminTeamListPage() {
  const actor = await getCurrentActor()
  if (!actor) notFound()

  let teams
  try {
    teams = await listAdminTeams(actor, {
      teams: getAdminTeamReadRepository(),
    })
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") notFound()
    throw error
  }

  return (
    <section aria-labelledby="admin-teams-heading">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold text-court">TEAM DIRECTORY</p>
        <h1 className="mt-2 text-2xl font-semibold" id="admin-teams-heading">
          ทีมทั้งหมด
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ตรวจสอบทีม ผู้สร้าง และสมาชิกที่ใช้งานอยู่
        </p>
      </header>

      {teams.length === 0 ? (
        <p className="border-b border-border py-10 text-sm text-muted-foreground">
          ยังไม่มีทีมในระบบ
        </p>
      ) : (
        <div className="divide-y divide-border border-b border-border">
          {teams.map((team) => (
            <Link
              aria-label={`ดูสมาชิกทีม ${team.name}`}
              className="grid min-w-0 gap-3 py-5 hover:text-court focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
              href={`/admin/teams/${team.id}`}
              key={team.id}
            >
              <span className="min-w-0 break-words font-semibold">{team.name}</span>
              <span className="min-w-0 text-sm">
                <span className="block text-xs text-muted-foreground">ผู้สร้างทีม</span>
                <span className="break-words">{team.ownerName}</span>
              </span>
              <span className="text-sm text-muted-foreground sm:text-right">
                {team.province} · {team.format === "FIVE_V_FIVE" ? "5v5" : "3v3"}
                <span className="block">
                  ผู้เล่น {team.activePlayerCount} คน · {team.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
