import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TournamentSearchForm } from "@/components/tournament-search-form"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe("TournamentSearchForm responsive layout", () => {
  afterEach(() => cleanup())

  it("uses one mobile column, two tablet columns, and shrinkable filter fields", () => {
    const { container } = render(<TournamentSearchForm initialFilters={{}} />)
    const form = container.querySelector("form")
    const queryField = screen.getByLabelText("ค้นหาชื่อรายการ").parentElement
    const provinceField = screen.getByLabelText("จังหวัด").closest(".grid")
    const formatControl = screen.getByLabelText("รูปแบบ")

    expect(form?.className).toContain("grid-cols-1")
    expect(form?.className).toContain("sm:grid-cols-2")
    expect(form?.className).toContain("lg:grid-cols-6")
    expect(queryField?.className).toContain("sm:col-span-2")
    expect(queryField?.className).toContain("min-w-0")
    expect(provinceField?.className).toContain("min-w-0")
    expect(formatControl.className).toContain("h-10!")
  })
})
