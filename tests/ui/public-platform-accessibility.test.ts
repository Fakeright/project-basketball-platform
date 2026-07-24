import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

async function readSource(path: string) {
  return readFile(resolve(root, path), "utf8")
}

describe("public platform accessibility", () => {
  it("uses the supplied court photograph as an accessible Home hero image", async () => {
    const page = await readSource("app/(public)/page.tsx")

    expect(page).toContain('import Image from "next/image"')
    expect(page).toContain('src="/images/courtside-hero.png"')
    expect(page).toMatch(/alt="[^"]+"/)
  })

  it("gives every discovery control a visible label", async () => {
    const form = await readSource("components/tournament-search-form.tsx")

    expect(form.match(/<label /g)).toHaveLength(6)
    for (const id of ["q", "province", "format", "ageGroup", "venue", "date"]) {
      expect(form).toContain(`htmlFor="${id}"`)
      expect(form).toContain(`id="${id}"`)
    }
  })

  it("keeps icon-only menu controls named and discoverable", async () => {
    const header = await readSource("components/site-header.tsx")
    const sheet = await readSource("components/ui/sheet.tsx")

    expect(header).toContain("<Tooltip>")
    expect(header).toContain('aria-label="เปิดเมนูนำทาง"')
    expect(sheet).toContain('aria-label="ปิดเมนู"')
    expect(sheet).toContain("<Tooltip>")
  })
})
