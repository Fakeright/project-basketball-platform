import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ExternalMatchPurposeControl } from "@/components/organizer/external-match-purpose-control"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }))

describe("ExternalMatchPurposeControl", () => {
  afterEach(cleanup)
  beforeEach(() => {
    vi.restoreAllMocks()
    refresh.mockReset()
  })

  it("updates the purpose of an unstarted external match", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          match: { id: "match-1", purpose: "THIRD_PLACE", version: 3 },
        }),
      ),
    )
    render(
      <ExternalMatchPurposeControl
        matchId="match-1"
        purpose="STANDARD"
        tournamentId="tournament-1"
        version={2}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText("ประเภทคู่แข่งขัน คู่ที่ match-1"))
    await user.keyboard("{ArrowDown}{Enter}")
    await user.click(screen.getByRole("button", { name: "บันทึกประเภทคู่" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    const [url, request] = fetchMock.mock.calls[0]
    expect(url).toBe(
      "/api/organizer/tournaments/tournament-1/matches/match-1/purpose",
    )
    expect(request?.method).toBe("PATCH")
    expect(JSON.parse(String(request?.body))).toEqual({
      purpose: "THIRD_PLACE",
      expectedVersion: 2,
    })
    expect(refresh).toHaveBeenCalled()
  })
})
