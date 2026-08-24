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

test("groups UTC instants by the Bangkok calendar day", () => {
  const beforeBangkokMidnight: Match = {
    id: "match-before-midnight",
    tournamentSlug: "bangkok-open-2026",
    round: "Group stage",
    court: "Court A",
    scheduledAt: "2026-10-03T16:59:59.000Z",
    homeTeam: "Home",
    awayTeam: "Away",
    homeScore: null,
    awayScore: null,
  }
  const afterBangkokMidnight: Match = {
    ...beforeBangkokMidnight,
    id: "match-after-midnight",
    scheduledAt: "2026-10-03T17:30:00.000Z",
  }
  const beforeBangkokSeven: Match = {
    ...beforeBangkokMidnight,
    id: "match-before-seven",
    scheduledAt: "2026-10-03T23:59:59.000Z",
  }

  const matchesByDate = groupMatchesByDateAndCourt([
    beforeBangkokMidnight,
    afterBangkokMidnight,
    beforeBangkokSeven,
  ])

  expect(Object.keys(matchesByDate)).toEqual(["2026-10-03", "2026-10-04"])
  expect(
    matchesByDate["2026-10-04"]?.["Court A"]?.map((match) => match.id),
  ).toEqual(["match-after-midnight", "match-before-seven"])
})
