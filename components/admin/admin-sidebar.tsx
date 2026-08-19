import Link from "next/link"

import type { Actor } from "@/features/identity/domain/actor"

const navigationClassName =
  "block min-h-9 whitespace-nowrap py-2 text-sm hover:text-court"

export function AdminSidebar({ actor }: { actor: Actor }) {
  const isPlatformAdmin = actor.role === "PLATFORM_ADMIN"
  const isTeamManager = actor.role === "TEAM_MANAGER_COACH"
  const isOrganizer = actor.role === "TOURNAMENT_ORGANIZER"

  return (
    <aside className="border-b border-border pb-4 lg:w-56 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
      <p className="text-sm font-semibold tracking-[0.08em]">
        COURTSIDE ADMIN
      </p>
      <nav
        aria-label="เมนูผู้ดูแล"
        className="mt-4 flex gap-4 overflow-x-auto lg:block lg:space-y-2"
      >
        {isPlatformAdmin ? (
          <>
            <Link className={navigationClassName} href="/admin">
              ภาพรวม
            </Link>
            <Link className={navigationClassName} href="/admin/reviews">
              คิวตรวจสอบ
            </Link>
            <Link className={navigationClassName} href="/admin/tournaments">
              รายการแข่งขันทั้งหมด
            </Link>
          </>
        ) : null}
        {isTeamManager || isPlatformAdmin ? (
          <Link className={navigationClassName} href="/team">
            ทีมของฉัน
          </Link>
        ) : null}
        {isOrganizer || isPlatformAdmin ? (
          <Link className={navigationClassName} href="/organizer">
          รายการของฉัน
          </Link>
        ) : null}
      </nav>
    </aside>
  )
}
