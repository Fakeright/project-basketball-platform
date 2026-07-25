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
