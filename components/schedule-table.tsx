import type { Match } from "@/features/tournaments/domain/tournament"
import { groupMatchesByDateAndCourt } from "@/features/tournaments/presentation/schedule-view-model"

const thaiDateFormatter = new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

const thaiTimeFormatter = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Bangkok",
})

function formatDate(date: string) {
  return thaiDateFormatter.format(new Date(`${date}T00:00:00Z`))
}

function formatTime(scheduledAt: string) {
  return thaiTimeFormatter.format(new Date(scheduledAt))
}

function formatScore(homeScore: number | null, awayScore: number | null) {
  return homeScore === null || awayScore === null ? "-" : `${homeScore} - ${awayScore}`
}

export function ScheduleTable({ matches }: { matches: Match[] }) {
  const matchesByDateAndCourt = groupMatchesByDateAndCourt(matches)

  return (
    <div className="divide-y divide-border border-y border-border">
      {Object.entries(matchesByDateAndCourt).map(([date, courts]) => (
        <section className="py-6" key={date}>
          <h2 className="px-4 text-lg font-semibold sm:px-6">{formatDate(date)}</h2>
          {Object.entries(courts).map(([court, courtMatches]) => (
            <div className="mt-5" key={court}>
              <h3 className="border-y border-border bg-muted px-4 py-2 text-sm font-medium sm:px-6">{court}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-[40rem] w-full text-left text-sm">
                  <thead className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="w-24 px-4 py-3 font-medium sm:px-6">เวลา</th>
                      <th className="px-4 py-3 font-medium">รอบ</th>
                      <th className="px-4 py-3 font-medium">ทีมเหย้า</th>
                      <th className="w-16 px-4 py-3 text-center font-medium">ผล</th>
                      <th className="px-4 py-3 font-medium sm:pr-6">ทีมเยือน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courtMatches.map((match) => (
                      <tr className="border-b border-border last:border-b-0" key={match.id}>
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-court sm:px-6">
                          {formatTime(match.scheduledAt)}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{match.round}</td>
                        <td className="px-4 py-4 font-medium">
                          {match.homeTeam}
                          {match.winnerTeamId && match.winnerTeamId === match.homeTeamId ? (
                            <span className="ml-2 text-xs font-medium text-court">ผู้ชนะ</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 text-center tabular-nums">
                          {formatScore(match.homeScore, match.awayScore)}
                        </td>
                        <td className="px-4 py-4 font-medium sm:pr-6">
                          {match.awayTeam}
                          {match.winnerTeamId && match.winnerTeamId === match.awayTeamId ? (
                            <span className="ml-2 text-xs font-medium text-court">ผู้ชนะ</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
