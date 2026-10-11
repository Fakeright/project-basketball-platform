import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TournamentDocumentList } from "@/components/tournaments/tournament-document-list"
import { TournamentPoster } from "@/components/tournaments/tournament-poster"

describe("tournament detail media", () => {
  it("renders a 4:5 tournament poster and document rows", () => {
    render(
      <div>
        <TournamentPoster posterUrl="/images/courtside-hero.jpg" tournamentTitle="Chiang Rai Cup" />
        <TournamentDocumentList
          documents={[{
            id: "document-1",
            fileName: "competition-rules.pdf",
            contentType: "application/pdf",
            byteSize: 20_000,
            url: "https://example.test/document.pdf?token=signed",
          }]}
        />
      </div>,
    )

    expect(
      screen.getByRole("img", { name: "โปสเตอร์การแข่งขัน Chiang Rai Cup" }).className,
    ).toContain("object-cover")
    expect(screen.getByRole("link", { name: "ดาวน์โหลด competition-rules.pdf" })).toBeTruthy()
  })
})
