/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ app/(admin)/admin/teams/page.tsx, app/(admin)/admin/teams/[id]/page.tsx, features/team-management/application/ports/admin-team-read-repository.ts โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import AdminTeamListPage from "@/app/(admin)/admin/teams/page"
import AdminTeamDetailPage from "@/app/(admin)/admin/teams/[id]/page"
import type { AdminTeamDetail } from "@/features/team-management/application/ports/admin-team-read-repository"

const mocks = vi.hoisted(() => ({
  actorRole: "PLATFORM_ADMIN",
  listAll: vi.fn(async () => [{
    id: "team-1",
    name: "Bangkok Ballers",
    ownerName: "Coach May",
    province: "กรุงเทพมหานคร",
    format: "FIVE_V_FIVE" as const,
    isActive: true,
    activePlayerCount: 1,
  }]),
  findById: vi.fn(async (): Promise<AdminTeamDetail | null> => ({
    id: "team-1",
    name: "Bangkok Ballers",
    ownerName: "Coach May",
    province: "กรุงเทพมหานคร",
    format: "FIVE_V_FIVE" as const,
    isActive: true,
    activePlayerCount: 1,
    players: [{
      id: "player-1",
      firstName: "Anan",
      lastName: "Suk",
      nickname: "Nan",
      jerseyNumber: 7,
      position: "PG" as const,
      birthDate: "2010-05-12",
    }],
  })),
}))

vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NEXT_NOT_FOUND") },
}))
vi.mock(
  "@/features/identity/infrastructure/next-cookie-current-actor-provider",
  () => ({
    createNextCookieCurrentActorProvider: () => ({
      getCurrentActor: async () => ({
        id: "admin-1",
        role: mocks.actorRole,
        email: "admin@example.com",
        displayName: "Admin",
      }),
    }),
  }),
)
vi.mock(
  "@/features/team-management/infrastructure/get-admin-team-read-repository",
  () => ({
    getAdminTeamReadRepository: () => ({
      listAll: mocks.listAll,
      findById: mocks.findById,
    }),
  }),
)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  mocks.actorRole = "PLATFORM_ADMIN"
})

describe("admin team pages", () => {
  it("links every team to its read-only detail and names the creator", async () => {
    render(await AdminTeamListPage())

    expect(screen.getByRole("heading", { name: "ทีมทั้งหมด" })).toBeTruthy()
    expect(screen.getByText("Coach May")).toBeTruthy()
    expect(screen.getByRole("link", { name: "ดูสมาชิกทีม Bangkok Ballers" }).getAttribute("href"))
      .toBe("/admin/teams/team-1")
  })

  it("shows the current player roster without contact information or edit controls", async () => {
    render(await AdminTeamDetailPage({ params: Promise.resolve({ id: "team-1" }) }))

    expect(screen.getByRole("heading", { name: "Bangkok Ballers" })).toBeTruthy()
    expect(screen.getByText("Coach May")).toBeTruthy()
    expect(screen.getByText("Anan Suk")).toBeTruthy()
    expect(screen.getByText("Nan")).toBeTruthy()
    expect(screen.getByText("2010-05-12")).toBeTruthy()
    expect(screen.queryByText(/โทรศัพท์|อีเมล/)).toBeNull()
    expect(screen.queryByRole("button", { name: /แก้ไข|ลบทีม/ })).toBeNull()
  })

  it("does not read team records for other roles", async () => {
    mocks.actorRole = "TOURNAMENT_ORGANIZER"

    await expect(AdminTeamListPage()).rejects.toThrow("NEXT_NOT_FOUND")
    await expect(
      AdminTeamDetailPage({ params: Promise.resolve({ id: "team-1" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(mocks.listAll).not.toHaveBeenCalled()
    expect(mocks.findById).not.toHaveBeenCalled()
  })

  it("shows empty states for a new directory and an empty roster", async () => {
    mocks.listAll.mockResolvedValueOnce([])
    render(await AdminTeamListPage())
    expect(screen.getByText("ยังไม่มีทีมในระบบ")).toBeTruthy()

    cleanup()
    const detail = await mocks.findById()
    if (!detail) throw new Error("Expected team fixture")
    mocks.findById.mockResolvedValueOnce({
      ...detail,
      activePlayerCount: 0,
      players: [],
    })
    render(await AdminTeamDetailPage({ params: Promise.resolve({ id: "team-1" }) }))
    expect(screen.getByText("ทีมนี้ยังไม่มีผู้เล่นที่ใช้งานอยู่")).toBeTruthy()
  })

  it("uses not-found for an unknown team", async () => {
    mocks.findById.mockResolvedValueOnce(null)

    await expect(
      AdminTeamDetailPage({ params: Promise.resolve({ id: "missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND")
  })
})
