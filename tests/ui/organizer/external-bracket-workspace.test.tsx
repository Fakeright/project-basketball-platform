import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BracketModeControl } from "@/components/organizer/bracket-mode-control"
import { ExternalBracketPreview } from "@/components/organizer/external-bracket-preview"
import { ExternalBracketRevisionList } from "@/components/organizer/external-bracket-revision-list"
import { ExternalBracketUploader } from "@/components/organizer/external-bracket-uploader"
import type { ExternalBracketRevision } from "@/features/competition/application/ports/external-bracket-repository"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}))

const publishedRevision = revision({
  id: "revision-1",
  revision: 1,
  status: "PUBLISHED",
  fileName: "bracket-v1.pdf",
  contentType: "application/pdf",
  publishedAt: "2026-08-19T08:00:00.000Z",
})
const draftRevision = revision({
  id: "revision-2",
  revision: 2,
  status: "DRAFT",
  fileName: "bracket-v2.png",
  contentType: "image/png",
  publishedAt: null,
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("BracketModeControl", () => {
  it("switches to external mode with the current bracket version", async () => {
    const fetchMock = vi.fn(async () => Response.json({ bracket: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(
      <BracketModeControl
        currentMode="SYSTEM_GENERATED"
        expectedVersion={3}
        locked={false}
        tournamentId="tournament-1"
      />,
    )

    expect(
      screen
        .getByRole("radio", { name: "สร้างอัตโนมัติ" })
        .getAttribute("aria-checked"),
    ).toBe("true")
    await user.click(screen.getByRole("radio", { name: "ใช้ไฟล์ภายนอก" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/bracket/mode",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          targetMode: "EXTERNAL_DOCUMENT",
          expectedVersion: 3,
        }),
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it("locks both mode choices after a match starts", () => {
    render(
      <BracketModeControl
        currentMode="EXTERNAL_DOCUMENT"
        expectedVersion={3}
        locked
        tournamentId="tournament-1"
      />,
    )

    expect(
      (screen.getByRole("radio", { name: "สร้างอัตโนมัติ" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
    expect(
      (screen.getByRole("radio", { name: "ใช้ไฟล์ภายนอก" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })
})

describe("ExternalBracketUploader", () => {
  it("offers only the supported file types and rejects DOCX locally", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    render(
      <ExternalBracketUploader
        expectedVersion={3}
        tournamentId="tournament-1"
      />,
    )

    const input = screen.getByLabelText("ไฟล์สายการแข่งขัน")
    expect(input.getAttribute("accept")).toBe(
      "application/pdf,image/jpeg,image/png,image/webp",
    )
    fireEvent.change(input, {
      target: {
        files: [new File(["docx"], "bracket.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })],
      },
    })

    expect(screen.getByText("รองรับเฉพาะ PDF, JPG, PNG หรือ WebP")).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("uploads a valid file with its expected version", async () => {
    const fetchMock = vi.fn(async () => Response.json({ revision: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(
      <ExternalBracketUploader
        expectedVersion={3}
        tournamentId="tournament-1"
      />,
    )

    await user.upload(
      screen.getByLabelText("ไฟล์สายการแข่งขัน"),
      new File([new Uint8Array([1, 2, 3])], "bracket.png", {
        type: "image/png",
      }),
    )
    await user.click(screen.getByRole("button", { name: "อัปโหลดไฟล์" }))

    const [, request] = fetchMock.mock.calls[0]
    expect(request).toMatchObject({ method: "POST" })
    expect(request.body).toBeInstanceOf(FormData)
    expect((request.body as FormData).get("expectedVersion")).toBe("3")
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })
})

describe("external bracket revisions", () => {
  it("shows the published preview and revision history", () => {
    render(
      <>
        <ExternalBracketPreview
          previewUrl="https://example.test/bracket-v1.pdf"
          revision={publishedRevision}
        />
        <ExternalBracketRevisionList
          bracketVersion={3}
          revisions={[draftRevision, publishedRevision]}
          tournamentId="tournament-1"
        />
      </>,
    )

    expect(screen.getByTitle("ตัวอย่าง bracket-v1.pdf")).toBeTruthy()
    expect(
      screen
        .getByRole("link", { name: "เปิดไฟล์ในแท็บใหม่" })
        .getAttribute("href"),
    ).toBe("https://example.test/bracket-v1.pdf")
    expect(screen.getByText("Revision 2")).toBeTruthy()
    expect(screen.getByText("bracket-v2.png")).toBeTruthy()
    expect(screen.getAllByText("เผยแพร่แล้ว")).toHaveLength(2)
  })

  it("requires explicit confirmation before publishing a draft", async () => {
    const fetchMock = vi.fn(async () => Response.json({ workspace: {} }))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(
      <ExternalBracketRevisionList
        bracketVersion={3}
        revisions={[draftRevision, publishedRevision]}
        tournamentId="tournament-1"
      />,
    )

    await user.click(screen.getByRole("button", { name: "เผยแพร่ Revision 2" }))
    expect(fetchMock).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "ยืนยันเผยแพร่" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/tournaments/tournament-1/bracket/external/publication",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ revisionId: "revision-2", expectedVersion: 3 }),
      }),
    )
  })
})

function revision(input: {
  id: string
  revision: number
  status: ExternalBracketRevision["status"]
  fileName: string
  contentType: string
  publishedAt: string | null
}): ExternalBracketRevision {
  return {
    id: input.id,
    bracketId: "bracket-1",
    revision: input.revision,
    status: input.status,
    publishedAt: input.publishedAt,
    retiredAt: null,
    createdById: "organizer-1",
    createdByName: "Organizer One",
    createdAt: "2026-08-19T07:00:00.000Z",
    mediaAsset: {
      id: `asset-${input.revision}`,
      tournamentId: "tournament-1",
      kind: "BRACKET_DOCUMENT",
      bucket: "tournament-brackets",
      objectPath: `tournaments/tournament-1/bracket/revisions/${input.fileName}`,
      fileName: input.fileName,
      contentType: input.contentType,
      byteSize: 1_024,
      createdById: "organizer-1",
      createdAt: "2026-08-19T07:00:00.000Z",
      deletedAt: null,
    },
  }
}
