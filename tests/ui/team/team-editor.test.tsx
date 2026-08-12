import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

const serverMocks = vi.hoisted(() => ({
  actorProvider: { getCurrentActor: vi.fn() },
  listReusableTeamPlayers: vi.fn(),
  repository: { kind: "team-repository" },
}))

vi.mock("@/features/identity/infrastructure/next-cookie-current-actor-provider", () => ({
  createNextCookieCurrentActorProvider: () => serverMocks.actorProvider,
}))

vi.mock("@/features/team-management/application/list-reusable-team-players", () => ({
  listReusableTeamPlayers: serverMocks.listReusableTeamPlayers,
}))

vi.mock("@/features/team-management/infrastructure/get-team-repository", () => ({
  getTeamRepository: () => serverMocks.repository,
}))

import NewTeamPage from "@/app/(admin)/team/new/page"
import { TeamEditor } from "@/components/team/team-editor"
import type { ReusableTeamPlayer } from "@/features/team-management/domain/team-player-history"

const router = {
  push: vi.fn(),
  refresh: vi.fn(),
}

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  router.push.mockReset()
  router.refresh.mockReset()
  serverMocks.actorProvider.getCurrentActor.mockReset()
  serverMocks.listReusableTeamPlayers.mockReset()
})

const reusablePlayers: readonly ReusableTeamPlayer[] = [
  {
    key: "history-player-1",
    player: {
      firstName: "สมชาย",
      lastName: "ใจดี",
      birthDate: "2010-02-03",
      nickname: "ชาย",
      jerseyNumber: 4,
      position: "PG",
      phone: "0812345678",
    },
    isActive: true,
    sourceTeams: [{ id: "team-a", name: "A Team", playerIsActive: true }],
  },
]

describe("TeamEditor", () => {
  it("shows an Admin Override notice to platform admins editing a team", () => {
    render(
      <TeamEditor
        adminOverride
        initialTeam={{
          id: "team-1",
          name: "Bangkok Ballers",
          provinceCode: "10",
          province: "Bangkok",
          format: "FIVE_V_FIVE",
          version: 2,
        }}
      />,
    )

    expect(
      screen.getByText("ผู้ดูแลระบบกำลังจัดการทีมนี้ในโหมด Admin Override"),
    ).toBeTruthy()
  })

  it("does not show an Admin Override notice to team managers", () => {
    render(
      <TeamEditor
        adminOverride={false}
        initialTeam={{
          id: "team-1",
          name: "Bangkok Ballers",
          provinceCode: "10",
          province: "Bangkok",
          format: "FIVE_V_FIVE",
          version: 2,
        }}
      />,
    )

    expect(
      screen.queryByText("ผู้ดูแลระบบกำลังจัดการทีมนี้ในโหมด Admin Override"),
    ).toBeNull()
  })

  it("creates a team without initial players and redirects to its workspace", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ team: { id: "team-1" } }), {
        status: 201,
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TeamEditor initialTeam={null} reusablePlayers={[]} />)

    fireEvent.change(screen.getByLabelText("ชื่อทีม"), {
      target: { value: "Bangkok Ballers" },
    })
    const province = screen.getByLabelText("จังหวัด")
    await user.click(province)
    await user.type(province, "Bangkok")
    await user.click(await screen.findByRole("option", { name: /กรุงเทพมหานคร.*Bangkok/i }))
    fireEvent.change(screen.getByLabelText("รูปแบบทีม"), {
      target: { value: "THREE_V_THREE" },
    })
    await user.click(screen.getByRole("button", { name: "บันทึกทีม" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Bangkok Ballers",
          provinceCode: "10",
          format: "THREE_V_THREE",
          players: [],
        }),
      }),
    )
    expect(router.push).toHaveBeenCalledWith("/team/team-1")
    expect(router.refresh).toHaveBeenCalledTimes(1)
  })

  it("submits selected historical and manual player snapshots in the same create request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ team: { id: "team-1" }, players: [] }), {
        status: 201,
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TeamEditor initialTeam={null} reusablePlayers={reusablePlayers} />)
    await fillTeamIdentity(user)

    await user.click(screen.getByRole("button", { name: "เลือกจากผู้เล่นเดิม" }))
    await user.click(screen.getByRole("checkbox", { name: "เลือก สมชาย ใจดี" }))
    const historicalJersey = screen.getByLabelText("เบอร์เสื้อ")
    fireEvent.change(historicalJersey, { target: { value: "12" } })

    await user.click(screen.getByRole("button", { name: "เพิ่มผู้เล่นใหม่" }))
    const firstNames = screen.getAllByLabelText("ชื่อ", { selector: "input" })
    const lastNames = screen.getAllByLabelText("นามสกุล", { selector: "input" })
    const birthDates = screen.getAllByLabelText("วันเกิด")
    fireEvent.change(firstNames[1], { target: { value: "มานะ" } })
    fireEvent.change(lastNames[1], { target: { value: "อดทน" } })
    fireEvent.change(birthDates[1], { target: { value: "2011-04-05" } })

    await user.click(screen.getByRole("button", { name: "บันทึกทีม" }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Bangkok Ballers",
          provinceCode: "10",
          format: "THREE_V_THREE",
          players: [
            {
              firstName: "สมชาย",
              lastName: "ใจดี",
              birthDate: "2010-02-03",
              nickname: "ชาย",
              jerseyNumber: 12,
              position: "PG",
              phone: "0812345678",
            },
            {
              firstName: "มานะ",
              lastName: "อดทน",
              birthDate: "2011-04-05",
              nickname: null,
              jerseyNumber: null,
              position: null,
              phone: null,
            },
          ],
        }),
      }),
    )
    expect(router.push).toHaveBeenCalledWith("/team/team-1")
    expect(router.refresh).toHaveBeenCalledTimes(1)
  })

  it("maps indexed server validation issues to the submitted roster row and focuses it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        {
          message: "ข้อมูลผู้เล่นไม่ถูกต้อง",
          issues: [{ row: 0, field: "firstName", message: "ชื่อผู้เล่นไม่ถูกต้อง" }],
        },
        { status: 422 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TeamEditor initialTeam={null} />)
    await fillTeamIdentity(user)
    await user.click(screen.getByRole("button", { name: "เพิ่มผู้เล่นใหม่" }))
    const firstName = screen.getByLabelText("ชื่อ", { selector: "input" })
    fireEvent.change(firstName, { target: { value: "มานะ" } })
    fireEvent.change(screen.getByLabelText("นามสกุล", { selector: "input" }), {
      target: { value: "อดทน" },
    })
    fireEvent.change(screen.getByLabelText("วันเกิด"), {
      target: { value: "2011-04-05" },
    })

    await user.click(screen.getByRole("button", { name: "บันทึกทีม" }))

    expect(await screen.findByText("ชื่อผู้เล่นไม่ถูกต้อง")).toBeTruthy()
    expect(screen.getByText("ข้อมูลผู้เล่นไม่ถูกต้อง")).toBeTruthy()
    expect(document.activeElement).toBe(firstName)
  })

  it("locks every identity and roster control while create is pending and maps deferred issues to unchanged rows", async () => {
    let resolveFetch: ((response: Response) => void) | undefined
    const fetchMock = vi.fn(
      () => new Promise<Response>((resolve) => {
        resolveFetch = resolve
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TeamEditor initialTeam={null} reusablePlayers={reusablePlayers} />)
    await fillTeamIdentity(user)
    await user.click(screen.getByRole("button", { name: "เลือกจากผู้เล่นเดิม" }))
    await user.click(screen.getByRole("checkbox", { name: "เลือก สมชาย ใจดี" }))
    const firstName = screen.getByLabelText("ชื่อ", { selector: "input" })
    await user.click(screen.getByRole("button", { name: "บันทึกทีม" }))

    await screen.findByRole("button", { name: "กำลังบันทึก" })
    const form = screen.getByRole("button", { name: "กำลังบันทึก" }).closest("form")
    const pendingControls = [...(form?.querySelectorAll("button, input, select") ?? [])]
    expect(pendingControls.length).toBeGreaterThan(8)
    expect(pendingControls.every((control) => control.matches(":disabled"))).toBe(true)

    await expect(user.clear(firstName)).rejects.toThrow("only supported on editable elements")
    expect((firstName as HTMLInputElement).value).toBe("สมชาย")

    await act(async () => {
      resolveFetch?.(
        Response.json(
          {
            message: "ข้อมูลผู้เล่นไม่ถูกต้อง",
            issues: [{ row: 0, field: "firstName", message: "ชื่อผู้เล่นไม่ถูกต้อง" }],
          },
          { status: 422 },
        ),
      )
    })

    expect(await screen.findByText("ชื่อผู้เล่นไม่ถูกต้อง")).toBeTruthy()
    expect((firstName as HTMLInputElement).value).toBe("สมชาย")
    await waitFor(() => {
      const controls = [...(form?.querySelectorAll("button, input, select") ?? [])]
      expect(controls.every((control) => !control.matches(":disabled"))).toBe(true)
    })
  })

  it("locks an uncertain create response and directs the user to verify Team Dashboard", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ players: [] }, { status: 201 }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(<TeamEditor initialTeam={null} />)
    await fillTeamIdentity(user)
    await user.click(screen.getByRole("button", { name: "บันทึกทีม" }))

    expect(
      await screen.findByText(
        "ระบบอาจบันทึกทีมแล้ว กรุณาตรวจสอบใน Team Dashboard ก่อนดำเนินการต่อ",
      ),
    ).toBeTruthy()
    expect(screen.queryByText("บันทึกทีมแล้ว")).toBeNull()
    expect(router.push).not.toHaveBeenCalled()
    expect(router.refresh).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect((screen.getByLabelText("ชื่อทีม") as HTMLInputElement).value).toBe(
      "Bangkok Ballers",
    )
    expect(screen.getByRole("button", { name: "บันทึกทีม" }).matches(":disabled")).toBe(true)
    const dashboardLink = screen.getByRole("link", { name: "ตรวจสอบ Team Dashboard" })
    expect(dashboardLink.getAttribute("href")).toBe("/team")
  })

  it("updates a team with its current version and shows actionable conflict copy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        { message: "ข้อมูลทีมมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง" },
        { status: 409 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <TeamEditor
        initialTeam={{
          id: "team-1",
          name: "Bangkok Ballers",
          provinceCode: "10",
          province: "Bangkok",
          format: "FIVE_V_FIVE",
          version: 2,
        }}
      />,
    )

    await user.selectOptions(screen.getByLabelText("รูปแบบทีม"), "THREE_V_THREE")
    await user.click(screen.getByRole("button", { name: "บันทึกทีม" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teams/team-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          name: "Bangkok Ballers",
          provinceCode: "10",
          format: "THREE_V_THREE",
          expectedVersion: 2,
        }),
      }),
    )
    expect(
      await screen.findByText(
        "ข้อมูลทีมมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง",
      ),
    ).toBeTruthy()
    expect(screen.queryByRole("region", { name: "รายชื่อที่จะเพิ่ม" })).toBeNull()
  })
})

describe("NewTeamPage", () => {
  it("loads reusable players for the current actor and passes them to the create editor", async () => {
    const actor = { id: "manager-1", role: "TEAM_MANAGER_COACH" }
    serverMocks.actorProvider.getCurrentActor.mockResolvedValue(actor)
    serverMocks.listReusableTeamPlayers.mockResolvedValue(reusablePlayers)

    render(await NewTeamPage())

    expect(serverMocks.listReusableTeamPlayers).toHaveBeenCalledWith(actor, {
      teams: serverMocks.repository,
    })
    expect(screen.getByRole("button", { name: "เลือกจากผู้เล่นเดิม" })).toBeTruthy()
  })

  it("returns no page when the parent authentication boundary has no actor", async () => {
    serverMocks.actorProvider.getCurrentActor.mockResolvedValue(null)

    expect(await NewTeamPage()).toBeNull()
    expect(serverMocks.listReusableTeamPlayers).not.toHaveBeenCalled()
  })

  it("propagates reusable-player loading errors to the route error boundary", async () => {
    const actor = { id: "manager-1", role: "TEAM_MANAGER_COACH" }
    const failure = new Error("database unavailable")
    serverMocks.actorProvider.getCurrentActor.mockResolvedValue(actor)
    serverMocks.listReusableTeamPlayers.mockRejectedValue(failure)

    await expect(NewTeamPage()).rejects.toBe(failure)
  })
})

async function fillTeamIdentity(user: ReturnType<typeof userEvent.setup>) {
  fireEvent.change(screen.getByLabelText("ชื่อทีม"), {
    target: { value: "Bangkok Ballers" },
  })
  const province = screen.getByLabelText("จังหวัด")
  await user.click(province)
  await user.type(province, "Bangkok")
  await user.click(await screen.findByRole("option", { name: /กรุงเทพมหานคร.*Bangkok/i }))
  fireEvent.change(screen.getByLabelText("รูปแบบทีม"), {
    target: { value: "THREE_V_THREE" },
  })
}
