/**
 * COURTSIDE: คำอธิบายไฟล์
 * ทดสอบ features/identity/domain/actor.ts, features/identity/infrastructure/get-current-actor.ts โดยจำลอง dependencies ตามกรณี และตรวจผลสำเร็จ/ข้อผิดพลาดด้วย assertions
 */

import { describe, expect, it, vi } from "vitest"

import type { CurrentActorProvider } from "@/features/identity/domain/actor"
import { createCurrentActorResolver } from "@/features/identity/infrastructure/get-current-actor"

describe("createCurrentActorResolver", () => {
  it("reads a fresh actor for a new request without sharing the previous account", async () => {
    let requestResult: Promise<Awaited<ReturnType<CurrentActorProvider["getCurrentActor"]>>> | undefined
    let accountId = "manager-1"
    const readActor = vi.fn(async () => ({
      id: accountId,
      role: "TEAM_MANAGER_COACH" as const,
      email: "manager@example.com",
      displayName: "Manager",
    }))
    const resolver = createCurrentActorResolver(
      (read) => () => requestResult ??= read(),
      () => ({ getCurrentActor: readActor }),
    )

    await Promise.all([resolver(), resolver()])
    expect(readActor).toHaveBeenCalledTimes(1)

    // จำลอง cache ของ React ที่เริ่มใหม่เมื่อมี request ใหม่ ไม่ใช่ TTL ข้ามผู้ใช้
    requestResult = undefined
    accountId = "manager-2"
    await expect(resolver()).resolves.toMatchObject({ id: "manager-2" })
    expect(readActor).toHaveBeenCalledTimes(2)
  })

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
