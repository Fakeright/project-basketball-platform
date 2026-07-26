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

test("omits matches that do not have a confirmed schedule yet", () => {
  const unscheduled: Match = {
    id: "match-unscheduled",
    tournamentSlug: "bangkok-open-2026",
    round: "Semi Final",
    court: "Court A",
    scheduledAt: null,
    homeTeam: "Home",
    awayTeam: "Away",
    homeScore: null,
    awayScore: null,
  }

  expect(groupMatchesByDateAndCourt([unscheduled])).toEqual({})
})
