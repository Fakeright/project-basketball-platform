import type { OrganizerCompetitionWorkspace } from "@/features/competition/application/ports/competition-repository"

type Bracket = NonNullable<OrganizerCompetitionWorkspace["bracket"]>

export function BracketPreview({ bracket }: { bracket: Bracket }) {
  const teamNames = new Map(
    bracket.entries.map((entry) => [entry.teamId, entry.teamNameSnapshot]),
  )

  if (bracket.rounds.length === 0) {
    return (
      <p className="py-8 text-sm text-muted-foreground">
        ยังไม่มีตัวอย่างสายการแข่งขัน เลือกวิธีจัดสายแล้วกดสร้างตัวอย่าง
      </p>
    )
  }

  return (
    <div className="overflow-x-auto pb-4" data-testid="bracket-preview">
      <div className="grid min-w-max auto-cols-[16rem] grid-flow-col gap-6">
        {bracket.rounds.map((round) => (
          <section aria-labelledby={`round-${round.id}`} key={round.id}>
            <h3 className="border-b border-border pb-2 text-sm font-semibold" id={`round-${round.id}`}>
              {round.name}
            </h3>
            <div className="space-y-4 pt-4">
              {round.matches.map((match) => (
                <div className="border border-border bg-background" key={match.id}>
                  <p className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
                    คู่ที่ {match.sequence}
                  </p>
                  <p className="min-h-10 border-b border-border px-3 py-2 text-sm">
                    {match.homeTeamId
                      ? teamNames.get(match.homeTeamId) ?? "ทีมที่ผ่านเข้ารอบ"
                      : "รอผลการแข่งขัน"}
                  </p>
                  <p className="min-h-10 px-3 py-2 text-sm">
                    {match.awayTeamId
                      ? teamNames.get(match.awayTeamId) ?? "ทีมที่ผ่านเข้ารอบ"
                      : "รอผลการแข่งขัน"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
