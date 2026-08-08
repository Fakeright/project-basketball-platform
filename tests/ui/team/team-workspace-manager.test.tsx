import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TeamWorkspaceManager } from "@/components/team/team-workspace-manager"
import type { TeamPlayer } from "@/features/team-management/domain/team"

const router = {
  refresh: vi.fn(),
}

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  router.refresh.mockReset()
})

describe("TeamWorkspaceManager", () => {
  it("shows a read-only Thai reconciliation notice for active legacy members", () => {
    render(
      <TeamWorkspaceManager
        adminOverride={false}
        initialPlayers={[]}
        initialTeam={{
          id: "team-legacy",
          name: "Legacy Ballers",
          provinceCode: "10",
          province: "Bangkok",
          format: "FIVE_V_FIVE",
          version: 0,
        }}
        legacyReconciliation={{
          teamId: "team-legacy",
          format: "FIVE_V_FIVE",
          activeLegacyPlayerCount: 2,
          activeLegacyCoachCount: 1,
          activeLegacyMemberCount: 3,
          activeTeamPlayerCount: 0,
          registrationHistoryCount: 1,
          registrationStatusCounts: {
            PENDING: 0,
            APPROVED: 0,
            REJECTED: 1,
            CANCELLED: 0,
            WITHDRAWN: 0,
          },
          readyForLegacyRemoval: false,
          issues: [
            "LEGACY_PLAYERS_REQUIRE_MANUAL_REENTRY",
            "LEGACY_COACHES_REQUIRE_REVIEW",
            "TEAM_FORMAT_REQUIRES_REVIEW",
          ],
        }}
      />,
    )

    expect(screen.getByText("ข้อมูลทีมเดิมต้องตรวจสอบ")).toBeTruthy()
    expect(screen.getByText("สมาชิกเดิมที่ยังใช้งาน: ผู้เล่น 2 คน, โค้ช 1 คน")).toBeTruthy()
    expect(screen.getByText(/สมาชิกเดิมไม่ถูกนับเป็นรายชื่อสำหรับสมัครแข่งขัน/)).toBeTruthy()
    expect(screen.getByText(/ตรวจสอบรูปแบบทีมว่าเป็น 5v5 หรือ 3v3/)).toBeTruthy()
    expect(
      screen.getByText(/ตรวจสอบผู้เล่นเดิม 2 คนและกรอกเป็น TeamPlayer จากข้อมูลที่ยืนยันได้/),
    ).toBeTruthy()
  })

  it("refreshes and immediately reconciles the roster minimum after a format update", async () => {
    const team = {
      id: "team-1",
      name: "Bangkok Ballers",
      provinceCode: "10",
      province: "Bangkok",
      format: "FIVE_V_FIVE" as const,
      version: 2,
    }
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ team: { ...team, format: "THREE_V_THREE", version: 3 } }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()

    render(
      <TeamWorkspaceManager
        adminOverride={false}
        initialPlayers={createPlayers(2)}
        initialTeam={team}
      />,
    )

    expect(screen.getByText("ทีม 5v5 ต้องมีผู้เล่นอย่างน้อย 5 คนก่อนสมัครแข่งขัน")).toBeTruthy()
    await user.selectOptions(screen.getByLabelText("รูปแบบทีม"), "THREE_V_THREE")
    await user.click(screen.getByRole("button", { name: "บันทึกทีม" }))

    expect(await screen.findByText("ทีม 3v3 ต้องมีผู้เล่นอย่างน้อย 3 คนก่อนสมัครแข่งขัน")).toBeTruthy()
    expect(screen.queryByText("ทีม 5v5 ต้องมีผู้เล่นอย่างน้อย 5 คนก่อนสมัครแข่งขัน")).toBeNull()
    expect(router.refresh).toHaveBeenCalledOnce()
  })
})

function createPlayers(count: number): TeamPlayer[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    teamId: "team-1",
    firstName: `ผู้เล่น${index + 1}`,
    lastName: "ทดสอบ",
    nickname: null,
    birthDate: "2010-02-03",
    jerseyNumber: index + 1,
    position: null,
    phone: null,
    isActive: true,
    deactivatedAt: null,
    createdAt: "2026-08-07T00:00:00.000Z",
    updatedAt: "2026-08-07T00:00:00.000Z",
  }))
}
