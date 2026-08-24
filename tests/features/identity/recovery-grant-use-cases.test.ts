import { describe, expect, it, vi } from "vitest"

import {
  consumeRecoveryGrant,
  recordRecoveryGrant,
} from "@/features/identity/application/manage-recovery-grant"
import type { AuthRecoveryGrantRepository } from "@/features/identity/application/ports/auth-recovery-grant-repository"

describe("recovery grant use cases", () => {
  it("records only the nonce hash and lifecycle fields", async () => {
    const repository: AuthRecoveryGrantRepository = {
      create: vi.fn(async () => undefined),
      consume: vi.fn(async () => false),
    }
    const input = {
      nonceHash: "sha256-nonce-hash",
      userId: "user-1",
      expiresAt: new Date("2026-07-29T12:10:00.000Z"),
    }

    await recordRecoveryGrant(input, repository)

    expect(repository.create).toHaveBeenCalledWith(input)
    expect(JSON.stringify(input)).not.toContain("raw-nonce")
  })

  it("delegates one-time consumption to the atomic repository operation", async () => {
    const repository: AuthRecoveryGrantRepository = {
      create: vi.fn(async () => undefined),
      consume: vi.fn(async () => true),
    }
    const input = {
      nonceHash: "sha256-nonce-hash",
      userId: "user-1",
      now: new Date("2026-07-29T12:05:00.000Z"),
    }

    await expect(
      consumeRecoveryGrant(input, repository),
    ).resolves.toBe(true)
    expect(repository.consume).toHaveBeenCalledWith(input)
  })
})
