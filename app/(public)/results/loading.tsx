export default function ResultsLoading() {
  return (
    <div aria-live="polite" className="py-8 sm:py-12" role="status">
      <div className="border-b border-border pb-6">
        <div className="h-4 w-36 animate-pulse bg-muted" />
        <div className="mt-3 h-9 w-full max-w-sm animate-pulse bg-muted" />
        <div className="mt-3 h-5 w-full max-w-lg animate-pulse bg-muted" />
      </div>
      <p className="sr-only">กำลังโหลดผลการแข่งขัน</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="border-l border-border py-3 pl-4" key={item}>
            <div className="h-3 w-20 animate-pulse bg-muted" />
            <div className="mt-3 h-6 w-36 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
