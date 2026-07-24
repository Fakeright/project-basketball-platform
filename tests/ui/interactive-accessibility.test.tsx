import { useState } from "react"
import Link from "next/link"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TournamentSearchForm } from "@/components/tournament-search-form"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

function TestSheet() {
  const [open, setOpen] = useState(false)

  return (
    <TooltipProvider>
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger render={<button type="button">Open menu</button>} />
        <SheetContent showCloseButton>
          <Link href="/tournaments">Tournaments</Link>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}

describe("interactive accessibility", () => {
  beforeEach(() => push.mockReset())

  it("associates every discovery control with its visible label", () => {
    render(<TournamentSearchForm initialFilters={{ date: "2026-11-15" }} />)

    expect(screen.getByLabelText("ค้นหาชื่อรายการ")).toBeTruthy()
    expect(screen.getByLabelText("จังหวัด")).toBeTruthy()
    expect(screen.getByLabelText("รูปแบบ")).toBeTruthy()
    expect(screen.getByLabelText("รุ่นอายุ")).toBeTruthy()
    expect(screen.getByLabelText("สนาม")).toBeTruthy()
    expect((screen.getByLabelText("วันที่แข่ง") as HTMLInputElement).value).toBe("2026-11-15")
  })

  it("shows the sheet close tooltip and returns focus to its trigger", async () => {
    const user = userEvent.setup()
    render(<TestSheet />)

    const trigger = screen.getByRole("button", { name: "Open menu" })
    await user.click(trigger)

    const closeButton = await screen.findByRole("button", { name: "ปิดเมนู" })
    await waitFor(() => expect(document.activeElement).toBe(closeButton))
    expect(closeButton.compareDocumentPosition(screen.getByRole("link", { name: "Tournaments" }))).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    await user.hover(closeButton)
    expect(await screen.findByText("ปิดเมนู")).toBeTruthy()

    await user.click(closeButton)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })
})
