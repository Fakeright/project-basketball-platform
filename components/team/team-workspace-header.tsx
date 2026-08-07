import Link from "next/link"

import type { Role } from "@/features/identity/domain/actor"

export function TeamWorkspaceHeader({ actorRole }: { actorRole: Role }) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold text-court">TEAM WORKSPACE</p>
        <h1 className="mt-2 text-2xl font-semibold">ทีมของฉัน</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          จัดการข้อมูลทีม รายชื่อสมาชิก และการสมัครแข่งขัน
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {actorRole === "TEAM_MANAGER_COACH" ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center border border-court px-5 text-sm font-medium text-court hover:bg-court hover:text-white"
            href="/tournaments"
          >
            ค้นหารายการแข่งขัน
          </Link>
        ) : null}
        <Link
          className="inline-flex min-h-11 items-center justify-center border border-foreground px-5 text-sm font-medium"
          href="/team/new"
        >
          สร้างทีม
        </Link>
      </div>
    </header>
  )
}
