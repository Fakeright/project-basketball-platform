import { describe, expect, it, vi } from "vitest"

import {
  assertDestructiveResetAllowed,
  resetDevelopmentSupabase,
} from "@/scripts/reset-development-supabase"

describe("development Supabase reset", () => {
  const configuration = {
    supabaseUrl: "https://example.supabase.co",
    serviceRoleKey: "service-role-key",
  }

  it("refuses production, missing confirmation, or incomplete configuration", () => {
    expect(() =>
      assertDestructiveResetAllowed("production", true, configuration),
    ).toThrow("DESTRUCTIVE_RESET_NOT_ALLOWED")
    expect(() =>
      assertDestructiveResetAllowed("development", false, configuration),
    ).toThrow("DESTRUCTIVE_RESET_NOT_ALLOWED")
    expect(() =>
      assertDestructiveResetAllowed("development", true, {}),
    ).toThrow("DESTRUCTIVE_RESET_NOT_ALLOWED")
  })

  it("removes nested storage objects and paginated Auth users", async () => {
    const posterBucket = createBucket([
      { id: null, name: "draft" },
      { id: "poster-1", name: "cover.png" },
    ])
    posterBucket.list.mockImplementation(async (path = "") => {
      if (path === "draft") {
        return { data: [{ id: "poster-2", name: "poster.png" }], error: null }
      }
      return { data: [{ id: null, name: "draft" }, { id: "poster-1", name: "cover.png" }], error: null }
    })
    const documentBucket = createBucket([{ id: "document-1", name: "rules.pdf" }])
    const users = [{ id: "user-1" }, { id: "user-2" }]
    const deleteUser = vi.fn(async (id: string) => {
      const index = users.findIndex((user) => user.id === id)
      if (index >= 0) users.splice(index, 1)
      return { error: null }
    })
    const client = {
      storage: {
        from: (bucket: string) =>
          bucket === "tournament-posters" ? posterBucket : documentBucket,
      },
      auth: {
        admin: {
          listUsers: vi.fn(async () => ({ data: { users: [...users] }, error: null })),
          deleteUser,
        },
      },
    }

    const result = await resetDevelopmentSupabase(client)

    expect(result).toEqual({ storageObjectsDeleted: 3, authUsersDeleted: 2 })
    expect(posterBucket.remove).toHaveBeenCalledWith(["draft/poster.png", "cover.png"])
    expect(documentBucket.remove).toHaveBeenCalledWith(["rules.pdf"])
    expect(deleteUser).toHaveBeenCalledTimes(2)
  })
})

function createBucket(initialData: Array<{ id: string | null; name: string }>) {
  return {
    list: vi.fn(async () => ({ data: initialData, error: null })),
    remove: vi.fn(async () => ({ error: null })),
  }
}
