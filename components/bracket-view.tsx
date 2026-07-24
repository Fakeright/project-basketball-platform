import type { Match } from "@/features/tournaments/domain/tournament"

function formatScore(score: number | null) {
  return score ?? "-"
}

export function BracketView({ matches }: { matches: Match[] }) {
  const rounds = matches.reduce<Record<string, Match[]>>((matchesByRound, match) => {
    const matchesInRound = (matchesByRound[match.round] ??= [])
    matchesInRound.push(match)
    return matchesByRound
  }, {})

  return (
    <div className="overflow-x-auto border-y border-border">
      <div className="grid min-w-max grid-flow-col auto-cols-[16rem] divide-x divide-border">
        {Object.entries(rounds).map(([round, roundMatches]) => (
          <section className="w-64 px-4 py-6" key={round}>
            <h2 className="min-h-12 text-base font-semibold">{round}</h2>
            <div className="mt-4 space-y-4">
              {roundMatches.map((match) => (
                <article className="border border-border bg-card" key={match.id}>
                  <p className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
                    {match.court}
                  </p>
                  <div className="divide-y divide-border text-sm">
                    <p className="grid grid-cols-[minmax(0,1fr)_2rem] gap-2 px-3 py-2">
                      <span className="truncate font-medium">{match.homeTeam}</span>
                      <span className="text-right tabular-nums">{formatScore(match.homeScore)}</span>
                    </p>
                    <p className="grid grid-cols-[minmax(0,1fr)_2rem] gap-2 px-3 py-2">
                      <span className="truncate font-medium">{match.awayTeam}</span>
                      <span className="text-right tabular-nums">{formatScore(match.awayScore)}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
