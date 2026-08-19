import { describe, expect, it, vi } from "vitest"

import { handleCreateExternalMatch } from "@/features/competition/presentation/competition-handler"
import { createTestActor } from "@/tests/fixtures/actor"

const validBody = {
  roundName: "Final",
  sequence: 1,
  homeTeamId: "team-1",
  awayTeamId: "team-2",
  scheduledAt: "2026-08-20T06:00:00.000Z",
  court: "สนาม A",
  expectedVersion: 3,
}

describe("external match route", () => {
  it("requires an authenticated actor", async () => {
    const response = await handleCreateExternalMatch(
      "tournament-1",
      request(validBody),
      dependencies(null),
    )

    expect(response.status).toBe(401)
  })

  it("rejects malformed match data", async () => {
    const deps = dependencies(createTestActor("organizer-1", "TOURNAMENT_ORGANIZER"))
    const response = await handleCreateExternalMatch(
      "tournament-1",
      request({ ...validBody, homeTeamId: "" }),
      deps,
    )

    expect(response.status).toBe(422)
    expect(deps.create).not.toHaveBeenCalled()
  })

  it("creates a match and returns 201", async () => {
    const deps = dependencies(createTestActor("organizer-1", "TOURNAMENT_ORGANIZER"))
    const response = await handleCreateExternalMatch(
      "tournament-1",
      request(validBody),
      deps,
    )

    expect(response.status).toBe(201)
    expect(deps.create).toHaveBeenCalledWith(
      { tournamentId: "tournament-1", ...validBody },
      expect.objectContaining({ id: "organizer-1" }),
    )
  })
})

function dependencies(actor: ReturnType<typeof createTestActor> | null) {
  return {
    actorProvider: { getCurrentActor: vi.fn().mockResolvedValue(actor) },
    create: vi.fn().mockResolvedValue({
      id: "match-1",
      version: 0,
      bracketVersion: 4,
    }),
  }
}

function request(body: unknown) {
  return new Request("http://localhost/api/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
