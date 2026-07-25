import Link from "next/link"

export interface AdminDashboardMetrics {
  pendingReviews: number
  publishedTournaments: number
  activeTournaments: number
  registrations: number
}

export function AdminDashboard({ metrics }: { metrics: AdminDashboardMetrics }) {
  const items = [
    ["รายการเผยแพร่แล้ว", metrics.publishedTournaments],
    ["รายการที่กำลังแข่ง", metrics.activeTournaments],
    ["การสมัครทั้งหมด", metrics.registrations],
  ] as const

  return (
    <section aria-labelledby="admin-dashboard-heading">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-court">ADMIN OPERATIONS</p>
          <h1 className="mt-2 text-3xl font-semibold" id="admin-dashboard-heading">ภาพรวมการจัดการแข่งขัน</h1>
          <p className="mt-2 text-muted-foreground">ติดตามรายการแข่งขันและงานที่ต้องตรวจสอบจากจุดเดียว</p>
        </div>
        <Link className="inline-flex min-h-10 items-center border border-foreground px-4 text-sm font-medium hover:bg-foreground hover:text-background" href="/admin/reviews">
          เปิดคิวตรวจสอบ
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-l-4 border-court bg-muted/40 px-4 py-5"><p className="text-sm text-muted-foreground">รายการรอตรวจ</p><p className="mt-2 text-3xl font-semibold">{metrics.pendingReviews}</p><p className="mt-1 text-sm">{metrics.pendingReviews} รายการรอตรวจ</p></div>
        {items.map(([label, value]) => <div className="border border-border px-4 py-5" key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p></div>)}
      </div>
    </section>
  )
}
