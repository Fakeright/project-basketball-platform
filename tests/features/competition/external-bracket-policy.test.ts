import { describe, expect, it } from "vitest"

import {
  assertCanSelectBracketMode,
  assertExternalBracketFile,
  getExternalBracketFileKind,
  isExternalBracketStale,
} from "@/features/competition/domain/external-bracket-policy"

describe("external bracket file policy", () => {
  it.each([
    ["application/pdf", 20_000_000, "PDF"],
    ["image/jpeg", 10_000_000, "IMAGE"],
    ["image/png", 10_000_000, "IMAGE"],
    ["image/webp", 10_000_000, "IMAGE"],
  ] as const)("accepts %s at its exact limit", (contentType, byteSize, kind) => {
    expect(() =>
      assertExternalBracketFile({ contentType, byteSize }),
    ).not.toThrow()
    expect(getExternalBracketFileKind(contentType)).toBe(kind)
  })

  it.each([
    ["application/pdf", 20_000_001],
    ["image/png", 10_000_001],
  ] as const)("rejects %s above its limit", (contentType, byteSize) => {
    expect(() =>
      assertExternalBracketFile({ contentType, byteSize }),
    ).toThrow("BRACKET_FILE_TOO_LARGE")
  })

  it.each([
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
  ])("rejects unsupported type %s", (contentType) => {
    expect(() =>
      assertExternalBracketFile({ contentType, byteSize: 100 }),
    ).toThrow("BRACKET_FILE_TYPE_INVALID")
  })
})

describe("external bracket mode policy", () => {
  it("allows selecting another source while every match is still scheduled", () => {
    expect(() =>
      assertCanSelectBracketMode({
        currentMode: "SYSTEM_GENERATED",
        targetMode: "EXTERNAL_DOCUMENT",
        matches: [{ status: "SCHEDULED", hasConfirmedResult: false }],
      }),
    ).not.toThrow()
  })

  it.each(["IN_PROGRESS", "COMPLETED"] as const)(
    "rejects a source switch when a match is %s",
    (status) => {
      expect(() =>
        assertCanSelectBracketMode({
          currentMode: "SYSTEM_GENERATED",
          targetMode: "EXTERNAL_DOCUMENT",
          matches: [{ status, hasConfirmedResult: status === "COMPLETED" }],
        }),
      ).toThrow("BRACKET_MODE_LOCKED")
    },
  )

  it("rejects a source switch when a result is already confirmed", () => {
    expect(() =>
      assertCanSelectBracketMode({
        currentMode: "SYSTEM_GENERATED",
        targetMode: "EXTERNAL_DOCUMENT",
        matches: [{ status: "SCHEDULED", hasConfirmedResult: true }],
      }),
    ).toThrow("BRACKET_MODE_LOCKED")
  })

  it("treats selecting the current source as an idempotent command", () => {
    expect(() =>
      assertCanSelectBracketMode({
        currentMode: "EXTERNAL_DOCUMENT",
        targetMode: "EXTERNAL_DOCUMENT",
        matches: [{ status: "COMPLETED", hasConfirmedResult: true }],
      }),
    ).not.toThrow()
  })
})

describe("external bracket staleness", () => {
  it("is stale only when a confirmed result is newer than publication", () => {
    expect(
      isExternalBracketStale({
        publishedAt: "2026-08-19T02:00:00.000Z",
        latestConfirmedResultAt: "2026-08-19T03:00:00.000Z",
      }),
    ).toBe(true)
    expect(
      isExternalBracketStale({
        publishedAt: "2026-08-19T03:00:00.000Z",
        latestConfirmedResultAt: "2026-08-19T03:00:00.000Z",
      }),
    ).toBe(false)
    expect(
      isExternalBracketStale({
        publishedAt: "2026-08-19T03:00:00.000Z",
        latestConfirmedResultAt: null,
      }),
    ).toBe(false)
  })
})
