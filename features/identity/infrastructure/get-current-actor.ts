/**
 * COURTSIDE: คำอธิบายไฟล์
 * อ่านผู้ใช้ปัจจุบันผ่าน provider และใช้ React cache เพื่อลดการอ่านซ้ำภายในงาน render เดียวกัน
 * เรียกใช้จาก: app/(public)/layout.tsx
 * ตามการทำงานต่อ: features/identity/infrastructure/next-cookie-current-actor-provider.ts
 */

import "server-only"

import { cache } from "react"

import type {
  Actor,
  CurrentActorProvider,
} from "@/features/identity/domain/actor"

import { createNextCookieCurrentActorProvider } from "./next-cookie-current-actor-provider"

type ActorResolver = () => Promise<Actor | null>
type CacheFunction = (resolver: ActorResolver) => ActorResolver

// ห่อการอ่านผู้ใช้ด้วย cache ของ React เพื่อให้หลาย component ในคำขอเดียวใช้ผลอ่านเดียวกัน
export function createCurrentActorResolver(
  cacheFunction: CacheFunction = cache,
  providerFactory: () => CurrentActorProvider =
    createNextCookieCurrentActorProvider,
) {
  return cacheFunction(async () => providerFactory().getCurrentActor())
}

export const getCurrentActor = createCurrentActorResolver()
