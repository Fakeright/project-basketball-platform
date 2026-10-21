import type { RegistrationReviewPlayer } from "@/features/registrations/application/ports/registration-repository"

export function RegistrationTeamRoster({
  teamName,
  managerCoachName,
  players,
}: {
  teamName: string
  managerCoachName: string
  players: RegistrationReviewPlayer[]
}) {
  return (
    <details className="mt-4 border-t border-border pt-2">
      <summary
        aria-label={`ดูสมาชิกทีม ${teamName}`}
        className="min-h-9 cursor-pointer py-2 text-sm font-medium marker:text-court hover:text-court"
      >
        ดูสมาชิกทีม
      </summary>
      <div className="mt-2 space-y-3 pb-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">ผู้จัดการ/โค้ช</p>
          <p className="mt-1 break-words font-medium">{managerCoachName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">ผู้เล่น {players.length} คน</p>
          {players.length > 0 ? (
            <ul className="mt-2 divide-y divide-border border-t border-border">
              {players.map((player) => (
                <li
                  className="flex min-w-0 items-baseline justify-between gap-3 py-2"
                  key={player.id}
                >
                  <span className="min-w-0 break-words">
                    {player.firstName} {player.lastName}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {player.jerseyNumber === null
                      ? "ไม่มีเบอร์เสื้อ"
                      : `#${player.jerseyNumber}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-muted-foreground">ยังไม่มีผู้เล่นที่ใช้งานอยู่</p>
          )}
        </div>
      </div>
    </details>
  )
}
