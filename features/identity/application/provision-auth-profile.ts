import type {
  AuthProfileInput,
  UserProfileRepository,
} from "@/features/identity/application/ports/user-profile-repository"

export async function provisionAuthProfile(
  input: AuthProfileInput,
  repository: UserProfileRepository,
) {
  if (input.role === "PLATFORM_ADMIN") {
    throw new Error("ROLE_NOT_SELF_ASSIGNABLE")
  }

  const existingProfile = await repository.findBySupabaseUserId(
    input.supabaseUserId,
  )
  return existingProfile ?? repository.create({
    supabaseUserId: input.supabaseUserId,
    email: input.email,
    displayName: input.displayName,
    role: input.role,
  })
}
