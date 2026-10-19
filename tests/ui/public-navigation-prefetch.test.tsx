import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SiteHeader } from "@/components/site-header"
import { TournamentRow } from "@/components/tournament-row"
import HomePage from "@/app/(public)/page"
import { mockTournamentData } from "@/features/tournaments/infrastructure/mock-tournament-data"

vi.mock("next/server", () => ({ connection: () => Promise.resolve() }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/features/tournaments/infrastructure/get-tournament-repository", () => ({
  getTournamentRepository: () => ({ list: () => Promise.resolve([]) }),
}))

vi.mock("next/link", () => ({
  default: ({ prefetch, ...props }: React.ComponentProps<"a"> & { prefetch?: boolean }) => (
    <a {...props} data-prefetch={prefetch === false ? "off" : "on"} />
  ),
}))

afterEach(cleanup)

describe("public navigation", () => {
  it("does not prefetch every public destination while the header is visible", () => {
    render(<SiteHeader actor={null} />)

    for (const href of ["/", "/tournaments", "/schedule", "/bracket", "/results", "/login", "/register"]) {
      for (const link of screen.getAllByRole("link", { hidden: true })) {
        if (link.getAttribute("href") === href) {
          expect(link.getAttribute("data-prefetch")).toBe("off")
        }
      }
    }
  })

  it("does not prefetch every tournament detail in a visible list", () => {
    render(<TournamentRow tournament={mockTournamentData[0]} />)

    expect(screen.getByRole("link").getAttribute("data-prefetch")).toBe("off")
  })

  it("does not prefetch the tournament list twice from the home link", async () => {
    render(await HomePage())

    expect(screen.getByRole("link", { name: "ดูทัวร์นาเมนต์ทั้งหมด" }).getAttribute("data-prefetch")).toBe("off")
  })
})
