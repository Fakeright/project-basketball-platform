import type { UserProfileRepository } from "@/features/identity/application/ports/user-profile-repository"
import type {
  Actor,
  CurrentActorProvider,
} from "@/features/identity/domain/actor"

export interface AuthenticatedUserReader {
  getAuthenticatedUser(): Promise<{ id: string } | null>
}

export class SupabaseCurrentActorProvider implements CurrentActorProvider {
  constructor(
    private readonly authenticatedUserReader: AuthenticatedUserReader,
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async getCurrentActor(): Promise<Actor | null> {
    const authenticatedUser =
      await this.authenticatedUserReader.getAuthenticatedUser()
    if (!authenticatedUser) return null

    const profile =
      await this.userProfileRepository.findBySupabaseUserId(authenticatedUser.id)
    if (!profile) return null

    return {
      id: profile.id,
      role: profile.role,
      email: profile.email,
      displayName: profile.displayName,
    }
  }
}
