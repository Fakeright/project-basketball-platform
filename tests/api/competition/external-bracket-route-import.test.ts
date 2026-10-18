// @vitest-environment node

import { describe, expect, it, vi } from "vitest"

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => {
  throw new ReferenceError("DOMMatrix is not defined")
})

describe("external bracket upload route in Node", () => {
  it("loads without a browser DOMMatrix or the PDF.js canvas fallback", async () => {
    const route = await import(
      "@/app/api/organizer/tournaments/[id]/bracket/external/revisions/route"
    )

    expect(route.POST).toBeTypeOf("function")
  })
})
