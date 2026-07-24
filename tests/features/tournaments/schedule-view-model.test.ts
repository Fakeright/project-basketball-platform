import { expect, test } from "vitest"

import type { Match } from "@/features/tournaments/domain/tournament"
import { groupMatchesByDateAndCourt } from "@/features/tournaments/presentation/schedule-view-model"

test("groups matches under their scheduled date and court", () => {
  const matches: Match[] = [
    {
      id: "match-1",
      tournamentSlug: "bangkok-open-2026",
      round: "Group stage",
      court: "Court A",
      scheduledAt: "2026-07-27T09:00:00+07:00",
      homeTeam: "Home",
      awayTeam: "Away",
      homeScore: null,
      awayScore: null,
    },
  ]

  expect(groupMatchesByDateAndCourt(matches)).toEqual({
    "2026-07-27": { "Court A": [matches[0]] },
  })
})
