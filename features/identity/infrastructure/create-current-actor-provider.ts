import type { UserProfileRepository } from "@/features/identity/application/ports/user-profile-repository"
import type { CurrentActorProvider } from "@/features/identity/domain/actor"

import { CookieCurrentActorProvider } from "./cookie-current-actor-provider"
import {
  SupabaseCurrentActorProvider,
  type AuthenticatedUserReader,
} from "./supabase-current-actor-provider"

interface CurrentActorProviderOptions {
  environment: "development" | "test" | "production"
  authenticatedUserReader?: AuthenticatedUserReader
  userProfileRepository?: UserProfileRepository
  readDevelopmentActorCookie: () => Promise<string | undefined>
}

export function createCurrentActorProvider(
  options: CurrentActorProviderOptions,
): CurrentActorProvider {
  if (options.authenticatedUserReader) {
    if (!options.userProfileRepository) {
      throw new Error("USER_PROFILE_REPOSITORY_REQUIRED")
    }
    const supabaseProvider = new SupabaseCurrentActorProvider(
      options.authenticatedUserReader,
      options.userProfileRepository,
    )
    if (options.environment !== "development") return supabaseProvider

    const developmentProvider = new CookieCurrentActorProvider(
      options.readDevelopmentActorCookie,
      true,
    )
    return {
      async getCurrentActor() {
        return (
          (await supabaseProvider.getCurrentActor()) ??
          developmentProvider.getCurrentActor()
        )
      },
    }
  }

  return new CookieCurrentActorProvider(
    options.readDevelopmentActorCookie,
    options.environment === "development",
  )
}
