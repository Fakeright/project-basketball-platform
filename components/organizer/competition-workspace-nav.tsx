import Link from "next/link"

export function CompetitionWorkspaceNav({ tournamentId }: { tournamentId: string }) {
  const links = [
    { href: `/organizer/tournaments/${tournamentId}`, label: "ข้อมูลรายการ" },
    {
      href: `/organizer/tournaments/${tournamentId}/registrations`,
      label: "ทีมสมัคร",
    },
    {
      href: `/organizer/tournaments/${tournamentId}/bracket`,
      label: "สายการแข่งขัน",
    },
    {
      href: `/organizer/tournaments/${tournamentId}/schedule`,
      label: "ตารางแข่งขัน",
    },
  ]

  return (
    <nav aria-label="จัดการรายการแข่งขัน" className="overflow-x-auto border-b border-border">
      <div className="flex min-w-max gap-6">
        {links.map((link) => (
          <Link
            className="border-b-2 border-transparent py-3 text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
