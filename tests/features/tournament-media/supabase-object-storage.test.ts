import { StorageApiError } from "@supabase/supabase-js"
import { describe, expect, it, vi } from "vitest"

import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"

describe("SupabaseObjectStorage", () => {
  it("maps a missing move source to typed NOT_FOUND", async () => {
    const storage = new SupabaseObjectStorage(
      createClient(new StorageApiError("private missing detail", 404, "404")),
    )

    await expect(
      storage.move("bucket", "missing.pdf", "staged.pdf"),
    ).rejects.toMatchObject({
      name: "ObjectStorageError",
      code: "NOT_FOUND",
    })
  })

  it("maps storage permission or service failures to typed UNAVAILABLE", async () => {
    const storage = new SupabaseObjectStorage(
      createClient(
        new StorageApiError("private permission detail", 403, "403"),
      ),
    )

    await expect(
      storage.move("bucket", "source.pdf", "staged.pdf"),
    ).rejects.toMatchObject({
      name: "ObjectStorageError",
      code: "UNAVAILABLE",
    })
  })
})

function createClient(error: StorageApiError) {
  return {
    storage: {
      from: vi.fn(() => ({
        move: vi.fn(async () => ({ error })),
      })),
    },
  } as never
}
