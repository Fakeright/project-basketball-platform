export default function TournamentLoading() {
  return (
    <div
      aria-live="polite"
      className="py-8 sm:py-12"
      role="status"
    >
      <div className="border-b border-border pb-6">
        <div className="h-4 w-36 animate-pulse bg-muted" />
        <div className="mt-3 h-9 w-full max-w-md animate-pulse bg-muted" />
      </div>
      <p className="sr-only">กำลังโหลดรายการแข่งขัน</p>
      <div className="mt-8 divide-y divide-border border-y border-border">
        {[0, 1, 2].map((row) => (
          <div
            className="grid min-h-24 gap-3 px-4 py-5 sm:grid-cols-[9rem_minmax(0,1fr)_12rem] sm:items-center sm:px-6"
            key={row}
          >
            <div className="h-4 w-28 animate-pulse bg-muted" />
            <div className="h-5 w-full animate-pulse bg-muted" />
            <div className="h-4 w-24 animate-pulse bg-muted sm:justify-self-end" />
          </div>
        ))}
      </div>
    </div>
  )
}
