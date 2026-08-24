import type { CompetitionSummary } from "@/features/competition/application/get-competition-summary"

export function CompetitionResultSummary({
  summary,
}: {
  summary: CompetitionSummary
}) {
  if (!summary.winner && summary.eliminatedByRound.length === 0) return null

  return (
    <section aria-labelledby="competition-result-heading" className="border-y border-border py-7">
      <p className="text-xs font-semibold text-court">TOURNAMENT RESULT</p>
      <h2 className="mt-2 text-xl font-semibold" id="competition-result-heading">
        สรุปผลการแข่งขัน
      </h2>

      {summary.winner && summary.runnerUp ? (
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border-l-4 border-court pl-4">
            <dt className="text-xs text-muted-foreground">ชนะเลิศ</dt>
            <dd className="mt-1 text-lg font-semibold">{summary.winner.teamName}</dd>
          </div>
          <div className="border-l border-border pl-4">
            <dt className="text-xs text-muted-foreground">รองชนะเลิศ</dt>
            <dd className="mt-1 text-lg font-medium">{summary.runnerUp.teamName}</dd>
          </div>
          {summary.thirdPlace ? (
            <div className="border-l border-border pl-4">
              <dt className="text-xs text-muted-foreground">อันดับ 3</dt>
              <dd className="mt-1 text-lg font-medium">
                {summary.thirdPlace.teamName}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          ยังไม่ยืนยันผลรอบชิงชนะเลิศ
        </p>
      )}

      {summary.eliminatedByRound.length ? (
        <div className="mt-7 divide-y divide-border border-t border-border">
          {summary.eliminatedByRound.map((round) => (
            <div
              className="grid gap-2 py-4 sm:grid-cols-[12rem_minmax(0,1fr)]"
              key={round.roundSequence}
            >
              <h3 className="text-sm font-medium">ตกรอบ {round.roundName}</h3>
              <p className="text-sm text-muted-foreground">
                {round.teams.map((team) => team.teamName).join(", ")}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
