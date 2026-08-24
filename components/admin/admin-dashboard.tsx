import { ClipboardCheck, History } from "lucide-react"
import Link from "next/link"

import type { AdminDashboardViewModel } from "@/features/admin/presentation/admin-dashboard-view-model"

export function AdminDashboard({
  dashboard,
}: {
  dashboard: AdminDashboardViewModel
}) {
  return (
    <div className="space-y-10">
      <section aria-labelledby="admin-dashboard-heading">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-court">ADMIN OPERATIONS</p>
            <h1
              className="mt-2 text-3xl font-semibold"
              id="admin-dashboard-heading"
            >
              ภาพรวมการจัดการแข่งขัน
            </h1>
            <p className="mt-2 text-muted-foreground">
              ติดตามรายการแข่งขันและงานที่ต้องตรวจสอบจากจุดเดียว
            </p>
          </div>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-foreground px-4 text-sm font-medium hover:bg-foreground hover:text-background"
            href="/admin/reviews"
          >
            <ClipboardCheck aria-hidden="true" size={17} />
            เปิดคิวตรวจสอบ
          </Link>
        </div>

        <div
          aria-label="สถิติการดำเนินงาน"
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {dashboard.metrics.map((metric) => (
            <div
              className={
                metric.emphasized
                  ? "border-l-4 border-court bg-muted/40 px-4 py-5"
                  : "border border-border px-4 py-5"
              }
              key={metric.key}
            >
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {metric.value}
              </p>
              {metric.summary ? (
                <p className="mt-1 text-sm">{metric.summary}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-audits-heading">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <History aria-hidden="true" className="text-court" size={19} />
          <h2 className="text-xl font-semibold" id="recent-audits-heading">
            กิจกรรมล่าสุด
          </h2>
        </div>

        {dashboard.recentAudits.length ? (
          <ul className="divide-y divide-border">
            {dashboard.recentAudits.map((audit) => (
              <li
                className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-5"
                key={audit.id}
              >
                <div className="min-w-0">
                  <p className="font-medium">{audit.actionLabel}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {audit.subject}
                  </p>
                </div>
                <p className="text-sm">{audit.actorName}</p>
                <time
                  className="text-sm text-muted-foreground sm:text-right"
                  dateTime={audit.occurredAtValue}
                >
                  {audit.occurredAt}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-sm text-muted-foreground">
            ยังไม่มีกิจกรรมในระบบ
          </p>
        )}
      </section>
    </div>
  )
}
