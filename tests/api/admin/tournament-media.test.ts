import { describe, expect, it, vi } from "vitest"

import {
  handleTournamentMediaDelete,
  handleTournamentMediaUpload,
} from "@/features/admin/presentation/tournament-media-handler"
import { deleteTournamentMedia } from "@/features/tournament-media/application/delete-tournament-media"
import { ObjectStorageError } from "@/features/tournament-media/application/ports/object-storage"
import { createTestActor } from "@/tests/fixtures/actor"

const organizer = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")

function dependencies() {
  return {
    actorProvider: {
      getCurrentActor: vi.fn(async () => organizer),
    },
    authorize: vi.fn(async () => undefined),
    upload: vi.fn(),
    createCorrelationId: () => "media-correlation",
    logger: { error: vi.fn() },
  }
}

describe("handleTournamentMediaUpload", () => {
  it("authorizes tournament ownership before consuming the request body", async () => {
    const bodyAccess = vi.fn()
    const request = {
      headers: new Headers(),
      get body() {
        bodyAccess()
        return null
      },
    } as unknown as Request
    const services = dependencies()
    services.authorize.mockRejectedValueOnce(new Error("FORBIDDEN"))

    const response = await handleTournamentMediaUpload(
      request,
      "tournament-2",
      services,
    )

    expect(response.status).toBe(403)
    expect(bodyAccess).not.toHaveBeenCalled()
    expect(services.upload).not.toHaveBeenCalled()
  })

  it("stops an oversized stream without relying on Content-Length", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]))
        controller.enqueue(new Uint8Array([4, 5, 6]))
        controller.close()
      },
    })
    const request = {
      body: stream,
      headers: new Headers({
        "content-type": "multipart/form-data; boundary=test",
      }),
      method: "POST",
      url: "http://localhost/api/media",
    } as unknown as Request
    const services = { ...dependencies(), maxRequestBytes: 4 }

    const response = await handleTournamentMediaUpload(
      request,
      "tournament-1",
      services,
    )

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toEqual({
      message: "ไฟล์มีขนาดใหญ่เกินกว่าที่กำหนด",
    })
    expect(services.upload).not.toHaveBeenCalled()
  })

  it("returns a safe correlated 500 when the body stream fails", async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull() {
        throw new Error("secret stream failure")
      },
    })
    const request = {
      body: stream,
      headers: new Headers({
        "content-type": "multipart/form-data; boundary=test",
      }),
      method: "POST",
      url: "http://localhost/api/media",
    } as unknown as Request
    const services = dependencies()

    const response = await handleTournamentMediaUpload(
      request,
      "tournament-1",
      services,
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      message: "ไม่สามารถดำเนินการได้ในขณะนี้",
      correlationId: "media-correlation",
    })
    expect(services.logger.error).toHaveBeenCalledWith({
      operation: "media.upload",
      correlationId: "media-correlation",
      errorType: "Error",
    })
    expect(JSON.stringify(services.logger.error.mock.calls)).not.toContain(
      "secret stream failure",
    )
  })
})

describe("handleTournamentMediaDelete", () => {
  it("returns 204 after retiring metadata for an already missing object", async () => {
    const retireWithAudit = vi.fn()
    const response = await handleTournamentMediaDelete(
      "tournament-1",
      "asset-1",
      {
        actorProvider: {
          getCurrentActor: vi.fn(async () => organizer),
        },
        remove: (input, actor) =>
          deleteTournamentMedia(input, actor, {
            storage: {
              move: vi.fn(async () => {
                throw new ObjectStorageError("NOT_FOUND")
              }),
              remove: vi.fn(),
            },
            media: {
              findActiveAsset: vi.fn(async () => ({
                id: "asset-1",
                tournamentId: "tournament-1",
                kind: "DOCUMENT",
                bucket: "tournament-documents",
                objectPath:
                  "tournaments/tournament-1/documents/asset-1.pdf",
                fileName: "rules.pdf",
                contentType: "application/pdf",
                byteSize: 100,
                createdById: organizer.id,
                createdAt: "2026-01-01T00:00:00.000Z",
                deletedAt: null,
              })),
              retireWithAudit,
            },
            tournaments: {
              findById: vi.fn(async () => ({
                organizerId: organizer.id,
              })),
            },
          }),
      },
    )

    expect(response.status).toBe(204)
    expect(retireWithAudit).toHaveBeenCalledOnce()
  })

  it("returns a safe correlated 503 when storage is unavailable", async () => {
    const services = {
      actorProvider: {
        getCurrentActor: vi.fn(async () => organizer),
      },
      remove: vi.fn(async () => {
        throw new ObjectStorageError("UNAVAILABLE")
      }),
      createCorrelationId: () => "storage-correlation",
      logger: { error: vi.fn() },
    }

    const response = await handleTournamentMediaDelete(
      "tournament-1",
      "asset-1",
      services,
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      message: "ไม่สามารถดำเนินการได้ในขณะนี้",
      correlationId: "storage-correlation",
    })
    expect(services.logger.error).toHaveBeenCalledWith({
      operation: "media.delete",
      correlationId: "storage-correlation",
      errorType: "ObjectStorageError",
    })
  })
})
