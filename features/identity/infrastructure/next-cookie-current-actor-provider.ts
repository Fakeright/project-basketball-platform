import "server-only"

import { cookies } from "next/headers"

import { createCurrentActorProvider } from "./create-current-actor-provider"
import { getUserProfileRepository } from "./get-user-profile-repository"
import type { AuthenticatedUserReader } from "./supabase-current-actor-provider"

export function createNextCookieCurrentActorProvider(
  authenticatedUserReader?: AuthenticatedUserReader,
) {
  return createCurrentActorProvider({
    environment: process.env.NODE_ENV,
    authenticatedUserReader,
    userProfileRepository: authenticatedUserReader
      ? getUserProfileRepository()
      : undefined,
    readDevelopmentActorCookie: async () => {
      const cookieStore = await cookies()
      return cookieStore.get("courtside-actor")?.value
    },
  })
}
