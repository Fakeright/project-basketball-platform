import type { BracketMode } from "./competition"

export const externalBracketContentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type ExternalBracketContentType =
  (typeof externalBracketContentTypes)[number]
export type ExternalBracketFileKind = "PDF" | "IMAGE"

export function assertExternalBracketFile(input: {
  contentType: string
  byteSize: number
}): void {
  if (!externalBracketContentTypes.includes(input.contentType as never)) {
    throw new Error("BRACKET_FILE_TYPE_INVALID")
  }

  if (
    !Number.isInteger(input.byteSize) ||
    input.byteSize <= 0 ||
    input.byteSize > getExternalBracketMaximumBytes(input.contentType)
  ) {
    throw new Error("BRACKET_FILE_TOO_LARGE")
  }
}

export function getExternalBracketMaximumBytes(contentType: string): number {
  return contentType === "application/pdf" ? 20_000_000 : 10_000_000
}

export function getExternalBracketFileKind(
  contentType: string,
): ExternalBracketFileKind {
  if (!externalBracketContentTypes.includes(contentType as never)) {
    throw new Error("BRACKET_FILE_TYPE_INVALID")
  }
  return contentType === "application/pdf" ? "PDF" : "IMAGE"
}

export function assertCanSelectBracketMode(input: {
  currentMode: BracketMode
  targetMode: BracketMode
  matches: readonly {
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED"
    hasConfirmedResult: boolean
  }[]
}): void {
  if (input.currentMode === input.targetMode) return

  const isLocked = input.matches.some(
    (match) =>
      match.status === "IN_PROGRESS" ||
      match.status === "COMPLETED" ||
      match.hasConfirmedResult,
  )
  if (isLocked) throw new Error("BRACKET_MODE_LOCKED")
}

export function isExternalBracketStale(input: {
  publishedAt: string
  latestConfirmedResultAt: string | null
}): boolean {
  if (!input.latestConfirmedResultAt) return false
  return (
    new Date(input.latestConfirmedResultAt).getTime() >
    new Date(input.publishedAt).getTime()
  )
}
