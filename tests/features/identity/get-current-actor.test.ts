import { describe, expect, it, vi } from "vitest"

import type { CurrentActorProvider } from "@/features/identity/domain/actor"
import { createCurrentActorResolver } from "@/features/identity/infrastructure/get-current-actor"

describe("createCurrentActorResolver", () => {
  it("resolves the actor once when the memoized resolver is shared", async () => {
    const getCurrentActor = vi.fn(async () => null)
    const provider: CurrentActorProvider = { getCurrentActor }
    const providerFactory = vi.fn(() => provider)
    let memoizedResult: Promise<null> | undefined
    const cacheFunction = <Result>(
      resolver: () => Promise<Result>,
    ): (() => Promise<Result>) => {
      return () => {
        memoizedResult ??= resolver() as Promise<null>
        return memoizedResult as Promise<Result>
      }
    }

    const resolveCurrentActor = createCurrentActorResolver(
      cacheFunction,
      providerFactory,
    )

    await Promise.all([resolveCurrentActor(), resolveCurrentActor()])

    expect(providerFactory).toHaveBeenCalledTimes(1)
    expect(getCurrentActor).toHaveBeenCalledTimes(1)
  })
})
