import { act, useState } from "react"
import Link from "next/link"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SiteHeader } from "@/components/site-header"
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
  afterEach(() => cleanup())

  it("associates every discovery control with its visible label", () => {
    render(<TournamentSearchForm initialFilters={{ date: "2026-11-15" }} />)

    expect(screen.getByLabelText("ค้นหาชื่อรายการ")).toBeTruthy()
    expect(screen.getByLabelText("จังหวัด")).toBeTruthy()
    expect(screen.getByLabelText("รูปแบบ")).toBeTruthy()
    expect(screen.getByLabelText("รุ่นอายุ")).toBeTruthy()
    expect(screen.getByLabelText("สนาม")).toBeTruthy()
    expect((screen.getByLabelText("วันที่แข่ง") as HTMLInputElement).value).toBe("2026-11-15")
  })

  it("clears the selected tournament format before submitting", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <TournamentSearchForm
        initialFilters={{ format: "FIVE_V_FIVE", query: "Bangkok" }}
      />,
    )

    await user.click(screen.getByLabelText("รูปแบบ"))
    await user.click(await screen.findByRole("option", { name: "ทั้งหมด" }))
    await user.click(within(container).getByRole("button", { name: "ค้นหา" }))

    expect(push).toHaveBeenCalledWith("/tournaments?q=Bangkok")
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

  it("opens the real mobile navigation and closes it after selecting a link", async () => {
    const user = userEvent.setup()
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const container = document.createElement("div")
    const header = (
      <TooltipProvider>
        <SiteHeader />
      </TooltipProvider>
    )
    container.innerHTML = renderToString(header)
    document.body.appendChild(container)

    const root = hydrateRoot(container, header)

    const trigger = within(container).getByRole("button", { name: "เปิดเมนูนำทาง" })
    expect(trigger.hasAttribute("data-base-ui-tooltip-trigger")).toBe(false)
    await user.click(trigger)

    const dialog = await screen.findByRole("dialog")
    const tournamentLink = within(dialog).getByRole("link", { name: "ทัวร์นาเมนต์" })
    expect(tournamentLink.getAttribute("type")).toBeNull()
    tournamentLink.addEventListener("click", (event) => event.preventDefault())
    await user.click(tournamentLink)

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(consoleError.mock.calls.flat().join(" ")).not.toMatch(
      /hydration|cannot be a descendant/i,
    )

    await act(async () => root.unmount())
    container.remove()
    consoleError.mockRestore()
  })
})
