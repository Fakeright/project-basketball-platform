import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createTestActor } from "@/tests/fixtures/actor"

afterEach(cleanup)

describe("AdminSidebar", () => {
  it("shows the review queue to platform admins", () => {
    render(
      <AdminSidebar actor={createTestActor("admin-1", "PLATFORM_ADMIN")} />,
    )

    expect(
      screen.getByRole("link", { name: "คิวตรวจสอบ" }).getAttribute("href"),
    ).toBe("/admin/reviews")
  })

  it("hides the review queue from tournament organizers", () => {
    render(
      <AdminSidebar
        actor={createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")}
      />,
    )

    expect(screen.queryByRole("link", { name: "คิวตรวจสอบ" })).toBeNull()
  })
})
