export default function AdminDashboardLoading() {
  return (
    <div
      aria-label="กำลังโหลดภาพรวมระบบ"
      className="animate-pulse space-y-10"
      role="status"
    >
      <div className="space-y-3 border-b border-border pb-6">
        <div className="h-4 w-32 bg-muted" />
        <div className="h-9 w-full max-w-md bg-muted" />
        <div className="h-5 w-full max-w-xl bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }, (_, index) => (
          <div className="h-28 border border-border bg-muted/40" key={index} />
        ))}
      </div>
      <div className="space-y-3 border-t border-border pt-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="h-16 border-b border-border bg-muted/30" key={index} />
        ))}
      </div>
      <span className="sr-only">กำลังโหลด</span>
    </div>
  )
}
