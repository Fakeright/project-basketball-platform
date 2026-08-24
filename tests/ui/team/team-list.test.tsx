import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TeamList } from "@/components/team/team-list"
import { TeamWorkspaceManager } from "@/components/team/team-workspace-manager"
import { TeamRegistrationList } from "@/components/team/team-registration-list"

const router = {
  refresh: vi.fn(),
}

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}))

const activeTeam = {
  id: "team-1",
  name: "Bangkok Ballers",
  provinceCode: "10",
  province: "กรุงเทพมหานคร",
  ownerId: "manager-1",
  format: "THREE_V_THREE" as const,
  isActive: true,
  deactivatedAt: null,
  version: 0,
}

const inactiveTeam = {
  ...activeTeam,
  id: "team-2",
  name: "Historic Hoops",
  isActive: false,
  deactivatedAt: "2026-08-09T12:00:00.000Z",
  version: 3,
}

afterEach(() => {
  cleanup()
  router.refresh.mockReset()
})

describe("TeamList", () => {
  it("keeps inactive teams visible with a clear Thai status", () => {
    render(
      <TeamList
        workspaces={[
          { team: activeTeam, players: [{ id: "player-1" }, { id: "player-2" }] },
          { team: inactiveTeam, players: [{ id: "player-old" }] },
        ]}
      />,
    )

    expect(screen.getByRole("link", { name: "Bangkok Ballers" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Historic Hoops" })).toBeTruthy()
    expect(screen.getByText("ปิดใช้งาน")).toBeTruthy()
    expect(screen.getAllByText("3v3")).toHaveLength(2)
    expect(screen.getByText("ผู้เล่น 2 คน")).toBeTruthy()
  })
})

describe("inactive team detail", () => {
  it("renders identity, roster, and registration history without mutation commands", () => {
    render(
      <>
        <p>ปิดใช้งาน</p>
        <TeamWorkspaceManager
          adminOverride={false}
          initialPlayers={[
            {
              id: "player-1",
              teamId: inactiveTeam.id,
              firstName: "สมชาย",
              lastName: "ใจดี",
              nickname: null,
              birthDate: "2010-02-03",
              jerseyNumber: 8,
              position: "PG",
              phone: null,
              isActive: true,
              deactivatedAt: null,
              createdAt: "2026-08-07T00:00:00.000Z",
              updatedAt: "2026-08-07T00:00:00.000Z",
            },
          ]}
          initialTeam={inactiveTeam}
          readOnly
        />
        <TeamRegistrationList
          readOnly
          registrations={[
            {
              id: "registration-1",
              tournamentName: "Bangkok Open",
              submittedAt: "1 Oct 2026",
              status: "REJECTED",
              organizerNote: "เก็บเป็นประวัติ",
              version: 1,
            },
          ]}
        />
      </>,
    )

    expect(screen.getByText("Historic Hoops")).toBeTruthy()
    expect(screen.getByText("สมชาย ใจดี")).toBeTruthy()
    expect(screen.getByText("Bangkok Open")).toBeTruthy()
    expect(screen.queryByRole("button", { name: "บันทึกทีม" })).toBeNull()
    expect(screen.queryByRole("button", { name: "เพิ่มผู้เล่น" })).toBeNull()
    expect(screen.queryByRole("button", { name: /แก้ไขผู้เล่น/ })).toBeNull()
    expect(screen.queryByRole("button", { name: /นำผู้เล่น.*ออกจากทีม/ })).toBeNull()
    expect(screen.queryByRole("button", { name: /ยกเลิกการสมัคร/ })).toBeNull()
    expect(
      screen.queryByRole("button", { name: "ลบหรือปิดใช้งานทีม" }),
    ).toBeNull()
  })
})
