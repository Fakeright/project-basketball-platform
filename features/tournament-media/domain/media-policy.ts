import type { MediaAssetKind, MediaFileDescriptor } from "./media-asset"

const mediaConstraints = {
  POSTER: {
    maximumBytes: 5_000_000,
    contentTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  DOCUMENT: {
    maximumBytes: 10_000_000,
    contentTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  BRACKET_DOCUMENT: {
    maximumBytes: 20_000_000,
    contentTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  },
} as const

export function validateMediaFile(
  input: MediaFileDescriptor & { kind: MediaAssetKind },
): void {
  const constraint = mediaConstraints[input.kind]
  if (!constraint.contentTypes.includes(input.contentType as never)) {
    throw new Error("MEDIA_FILE_TYPE_INVALID")
  }
  if (input.byteSize > constraint.maximumBytes) {
    throw new Error("MEDIA_FILE_TOO_LARGE")
  }
}

export function getMediaMaximumBytes(kind: MediaAssetKind): number {
  return mediaConstraints[kind].maximumBytes
}

export function validateMediaFileContent(input: {
  contentType: string
  data: Uint8Array
}): void {
  const valid =
    input.contentType === "image/jpeg"
      ? startsWith(input.data, [0xff, 0xd8, 0xff])
      : input.contentType === "image/png"
        ? startsWith(input.data, [
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
          ])
        : input.contentType === "image/webp"
          ? isWebP(input.data)
          : input.contentType === "application/pdf"
            ? startsWith(input.data, [0x25, 0x50, 0x44, 0x46, 0x2d])
            : input.contentType === "application/msword"
              ? startsWith(input.data, [
                  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
                ])
              : input.contentType ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ? isDocx(input.data)
                : false

  if (!valid) throw new Error("MEDIA_FILE_CONTENT_INVALID")
}

function startsWith(data: Uint8Array, signature: number[]) {
  return (
    data.length >= signature.length &&
    signature.every((value, index) => data[index] === value)
  )
}

function isWebP(data: Uint8Array) {
  return (
    startsWith(data, [0x52, 0x49, 0x46, 0x46]) &&
    data.length >= 12 &&
    data[8] === 0x57 &&
    data[9] === 0x45 &&
    data[10] === 0x42 &&
    data[11] === 0x50
  )
}

function isDocx(data: Uint8Array) {
  if (!startsWith(data, [0x50, 0x4b, 0x03, 0x04])) return false
  const archiveText = new TextDecoder("latin1").decode(data)
  return (
    archiveText.includes("[Content_Types].xml") &&
    archiveText.includes("word/")
  )
}
