import "server-only"

import { cache } from "react"

import type {
  Actor,
  CurrentActorProvider,
} from "@/features/identity/domain/actor"

import { createNextCookieCurrentActorProvider } from "./next-cookie-current-actor-provider"

type ActorResolver = () => Promise<Actor | null>
type CacheFunction = (resolver: ActorResolver) => ActorResolver

export function createCurrentActorResolver(
  cacheFunction: CacheFunction = cache,
  providerFactory: () => CurrentActorProvider =
    createNextCookieCurrentActorProvider,
) {
  return cacheFunction(async () => providerFactory().getCurrentActor())
}

export const getCurrentActor = createCurrentActorResolver()
