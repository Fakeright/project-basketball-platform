export interface TeamRegistrationListItem {
  id: string
  tournamentName: string
  submittedAt: string
  status: string
  organizerNote: string | null
}

export function TeamRegistrationList({
  registrations,
}: {
  registrations: TeamRegistrationListItem[]
}) {
  return (
    <section className="border-t border-border pt-8">
      <p className="text-xs font-semibold text-court">REGISTRATIONS</p>
      <h2 className="mt-2 text-xl font-semibold">รายการสมัครแข่งขัน</h2>
      {registrations.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">ยังไม่มีรายการสมัครแข่งขัน</p>
      ) : (
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {registrations.map((registration) => (
            <li className="grid gap-1 py-4 text-sm sm:grid-cols-4" key={registration.id}>
              <span className="font-medium">{registration.tournamentName}</span>
              <span>{registration.submittedAt}</span>
              <span>{registration.status}</span>
              <span>{registration.organizerNote ?? "-"}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
