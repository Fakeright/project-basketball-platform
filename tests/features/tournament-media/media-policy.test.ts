import { describe, expect, it } from "vitest"

import { validateMediaFile } from "@/features/tournament-media/domain/media-policy"

describe("validateMediaFile", () => {
  it("accepts a WebP poster below 5 MB", () => {
    expect(() =>
      validateMediaFile({
        kind: "POSTER",
        contentType: "image/webp",
        byteSize: 5_000_000,
      }),
    ).not.toThrow()
  })

  it("rejects a document larger than 10 MB", () => {
    expect(() =>
      validateMediaFile({
        kind: "DOCUMENT",
        contentType: "application/pdf",
        byteSize: 10_000_001,
      }),
    ).toThrow("MEDIA_FILE_TOO_LARGE")
  })

  it("rejects an unsupported poster type", () => {
    expect(() =>
      validateMediaFile({
        kind: "POSTER",
        contentType: "image/gif",
        byteSize: 512,
      }),
    ).toThrow("MEDIA_FILE_TYPE_INVALID")
  })
})
