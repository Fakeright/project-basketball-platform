// @vitest-environment node

import { describe, expect, it, vi } from "vitest"

import { handleUploadExternalBracket } from "@/features/competition/presentation/external-bracket-handler"
import { createTestActor } from "@/tests/fixtures/actor"

describe("external bracket multipart request", () => {
  it("parses a real multipart upload after applying the body limit", async () => {
    const actor = createTestActor("organizer-1", "TOURNAMENT_ORGANIZER")
    const body = new FormData()
    body.set("file", new File(["%PDF-1.7"], "bracket.pdf", { type: "application/pdf" }))
    body.set("expectedVersion", "2")
    const upload = vi.fn(async () => ({ id: "revision-1" }))

    const response = await handleUploadExternalBracket(
      "t-1",
      new Request("http://localhost/api/bracket", { method: "POST", body }),
      { actorProvider: { getCurrentActor: async () => actor }, upload },
    )

    expect(response.status).toBe(201)
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ fileName: "bracket.pdf", byteSize: 8 }),
      }),
      actor,
    )
  })
})
