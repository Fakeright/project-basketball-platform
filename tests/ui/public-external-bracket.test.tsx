import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { ExternalBracketView } from "@/components/external-bracket-view"

describe("ExternalBracketView", () => {
  afterEach(cleanup)

  it("identifies the organizer file and provides a fallback link", () => {
    render(
      <ExternalBracketView
        view={{
          tournamentId: "tournament-1",
          tournamentTitle: "External Cup",
          tournamentSlug: "external-cup",
          previewUrl: "https://signed.test/bracket.pdf",
          fileName: "bracket.pdf",
          contentType: "application/pdf",
          byteSize: 2048,
          revision: 2,
          publishedAt: "2026-08-19T08:00:00.000Z",
        }}
      />,
    )

    expect(screen.getByText("สายการแข่งขันจากไฟล์ผู้จัด")).toBeTruthy()
    expect(screen.getByText(/Revision 2/)).toBeTruthy()
    expect(screen.getByRole("link", { name: "เปิดไฟล์ในแท็บใหม่" }).getAttribute("href"))
      .toBe("https://signed.test/bracket.pdf")
  })
})
