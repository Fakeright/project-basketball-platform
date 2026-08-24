import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import { probeBracketFile } from "@/features/competition/infrastructure/bracket-file-probe"

const fixture = (name: string) =>
  readFile(resolve(process.cwd(), "tests", "fixtures", "brackets", name))

describe("probeBracketFile", () => {
  it("opens the first page of a readable PDF", async () => {
    const data = await fixture("valid-bracket.pdf")

    await expect(
      probeBracketFile({ contentType: "application/pdf", data }),
    ).resolves.toEqual({ kind: "PDF", pageCount: 1 })
  })

  it("decodes positive image dimensions", async () => {
    const data = await fixture("valid-bracket.png")

    await expect(
      probeBracketFile({ contentType: "image/png", data }),
    ).resolves.toEqual({ kind: "IMAGE", width: 2, height: 2 })
  })

  it("rejects a truncated PDF even when its header is valid", async () => {
    const data = await fixture("corrupt-bracket.pdf")

    await expect(
      probeBracketFile({ contentType: "application/pdf", data }),
    ).rejects.toThrow("BRACKET_FILE_UNREADABLE")
  })

  it("rejects random bytes declared as an image", async () => {
    await expect(
      probeBracketFile({
        contentType: "image/png",
        data: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
      }),
    ).rejects.toThrow("BRACKET_FILE_UNREADABLE")
  })
})
