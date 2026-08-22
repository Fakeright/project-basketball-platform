import { describe, expect, it, vi } from "vitest"

import {
  handlePublishExternalBracket,
  handleRetireExternalBracket,
  handleSelectBracketMode,
  handleUploadExternalBracket,
} from "@/features/competition/presentation/external-bracket-handler"
import { ObjectStorageError } from "@/features/tournament-media/application/ports/object-storage"
import { TournamentGovernancePolicyError } from "@/features/tournament-operations/domain/tournament-governance-policy"
import type { Actor } from "@/features/identity/domain/actor"

const organizer: Actor = {
  id: "organizer-1",
  role: "TOURNAMENT_ORGANIZER",
  email: "owner@example.com",
  displayName: "Owner",
}

const actorProvider = (actor: Actor | null = organizer) => ({
  getCurrentActor: vi.fn(async () => actor),
})

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

function uploadRequest(file?: File, fields: Record<string, string> = {}) {
  const uploadFile = file
    ? {
        name: file.name,
        type: file.type,
        size: file.size,
        arrayBuffer: async () => new Uint8Array(file.size).buffer,
      }
    : null
  return {
    headers: new Headers(),
    formData: vi.fn(async () => ({
      get(key: string) {
        return key === "file" ? uploadFile : (fields[key] ?? null)
      },
    })),
  } as unknown as Request
}

describe("external bracket HTTP handlers", () => {
  it("returns 401 before parsing when there is no authenticated actor", async () => {
    const select = vi.fn()
    const response = await handleSelectBracketMode("t-1", jsonRequest({}), {
      actorProvider: actorProvider(null),
      select,
    })
    expect(response.status).toBe(401)
    expect(select).not.toHaveBeenCalled()
  })

  it("validates mode JSON and delegates a valid request", async () => {
    const select = vi.fn(async () => ({ bracketMode: "EXTERNAL_DOCUMENT" }))
    const invalid = await handleSelectBracketMode("t-1", jsonRequest({ targetMode: "OTHER" }), {
      actorProvider: actorProvider(), select,
    })
    expect(invalid.status).toBe(422)

    const valid = await handleSelectBracketMode(
      "t-1",
      jsonRequest({ targetMode: "EXTERNAL_DOCUMENT", expectedVersion: 2 }),
      { actorProvider: actorProvider(), select },
    )
    expect(valid.status).toBe(200)
    expect(select).toHaveBeenCalledWith(
      { tournamentId: "t-1", targetMode: "EXTERNAL_DOCUMENT", expectedVersion: 2 },
      organizer,
    )
  })

  it("rejects multipart requests above the absolute body limit before formData parsing", async () => {
    const request = {
      headers: new Headers({ "content-length": "21000001" }),
      formData: vi.fn(),
    } as unknown as Request
    const response = await handleUploadExternalBracket("t-1", request, {
      actorProvider: actorProvider(), upload: vi.fn(),
    })
    expect(response.status).toBe(422)
    expect(request.formData).not.toHaveBeenCalled()
  })

  it("rejects a missing multipart file", async () => {
    const response = await handleUploadExternalBracket(
      "t-1",
      uploadRequest(undefined, { expectedVersion: "2" }),
      { actorProvider: actorProvider(), upload: vi.fn() },
    )
    expect(response.status).toBe(422)
  })

  it.each([
    ["application/pdf", 20_000_000],
    ["image/png", 10_000_000],
  ])("accepts the exact %s file boundary", async (contentType, size) => {
    const upload = vi.fn(async () => ({ id: "revision-1" }))
    const response = await handleUploadExternalBracket(
      "t-1",
      uploadRequest(new File([new Uint8Array(size)], "bracket", { type: contentType }), {
        expectedVersion: "2",
      }),
      { actorProvider: actorProvider(), upload },
    )
    expect(response.status).toBe(201)
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({
        tournamentId: "t-1",
        expectedVersion: 2,
        file: expect.objectContaining({ byteSize: size, contentType }),
      }),
      organizer,
    )
  })

  it("maps unsupported and unreadable files to 422", async () => {
    const unsupported = await handleUploadExternalBracket(
      "t-1",
      uploadRequest(new File(["doc"], "bracket.docx", { type: "application/docx" }), {
        expectedVersion: "2",
      }),
      { actorProvider: actorProvider(), upload: vi.fn() },
    )
    expect(unsupported.status).toBe(422)

    const unreadable = await handleUploadExternalBracket(
      "t-1",
      uploadRequest(new File(["%PDF"], "broken.pdf", { type: "application/pdf" }), {
        expectedVersion: "2",
      }),
      {
        actorProvider: actorProvider(),
        upload: vi.fn(async () => { throw new Error("BRACKET_FILE_UNREADABLE") }),
      },
    )
    expect(unreadable.status).toBe(422)
  })

  it.each([
    ["FORBIDDEN", 403],
    ["NOT_FOUND", 404],
    ["CONFLICT", 409],
    ["BRACKET_MODE_LOCKED", 409],
    ["REASON_REQUIRED", 422],
  ])("maps %s to %i", async (code, status) => {
    const response = await handlePublishExternalBracket(
      "t-1",
      jsonRequest({ revisionId: "r-1", expectedVersion: 2 }),
      {
        actorProvider: actorProvider(),
        publish: vi.fn(async () => { throw new Error(code) }),
      },
    )
    expect(response.status).toBe(status)
  })

  it("maps storage unavailability to 503 without exposing its details", async () => {
    const response = await handleUploadExternalBracket(
      "t-1",
      uploadRequest(new File(["%PDF"], "bracket.pdf", { type: "application/pdf" }), {
        expectedVersion: "2",
      }),
      {
        actorProvider: actorProvider(),
        upload: vi.fn(async () => { throw new ObjectStorageError("UNAVAILABLE") }),
      },
    )
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain("UNAVAILABLE")
  })

  it("maps blocked governance to the shared typed Thai 409 response", async () => {
    const response = await handlePublishExternalBracket(
      "t-1",
      jsonRequest({ revisionId: "r-1", expectedVersion: 2 }),
      {
        actorProvider: actorProvider(),
        publish: vi.fn(async () => {
          throw new TournamentGovernancePolicyError(["TOURNAMENT_SUSPENDED"])
        }),
      },
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      message: "รายการแข่งขันถูกระงับหรือถูกนำออก กรุณาตรวจสอบสถานะล่าสุด",
      issues: ["TOURNAMENT_SUSPENDED"],
    })
  })

  it("validates and delegates retirement", async () => {
    const retire = vi.fn(async () => ({ id: "r-1" }))
    const response = await handleRetireExternalBracket(
      "t-1",
      "r-1",
      jsonRequest({ expectedVersion: 2, reason: "เก็บฉบับใหม่แทน" }),
      { actorProvider: actorProvider(), retire },
    )
    expect(response.status).toBe(200)
    expect(retire).toHaveBeenCalledWith(
      {
        tournamentId: "t-1",
        revisionId: "r-1",
        expectedVersion: 2,
        reason: "เก็บฉบับใหม่แทน",
      },
      organizer,
    )
  })
})
