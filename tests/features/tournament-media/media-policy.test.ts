import { describe, expect, it } from "vitest"

import {
  validateMediaFile,
  validateMediaFileContent,
} from "@/features/tournament-media/domain/media-policy"

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

describe("validateMediaFileContent", () => {
  it.each([
    ["image/jpeg", new Uint8Array([0xff, 0xd8, 0xff, 0xe0])],
    [
      "image/png",
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ],
    [
      "image/webp",
      new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42,
        0x50,
      ]),
    ],
    ["application/pdf", new TextEncoder().encode("%PDF-1.7")],
    [
      "application/msword",
      new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    ],
    [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      new Uint8Array([
        0x50,
        0x4b,
        0x03,
        0x04,
        ...new TextEncoder().encode("[Content_Types].xml word/document.xml"),
      ]),
    ],
  ])("accepts bytes matching %s", (contentType, data) => {
    expect(() => validateMediaFileContent({ contentType, data })).not.toThrow()
  })

  it("rejects bytes that do not match the declared MIME type", () => {
    expect(() =>
      validateMediaFileContent({
        contentType: "image/webp",
        data: new Uint8Array([0x47, 0x49, 0x46, 0x38]),
      }),
    ).toThrow("MEDIA_FILE_CONTENT_INVALID")
  })
})
