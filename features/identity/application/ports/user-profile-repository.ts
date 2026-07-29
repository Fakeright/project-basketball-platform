import type { Actor, Role } from "@/features/identity/domain/actor"

export const selfAssignableRoles = [
  "PLAYER",
  "COACH",
  "TEAM_MANAGER",
  "TOURNAMENT_ORGANIZER",
] as const satisfies readonly Role[]

export type SelfAssignableRole = (typeof selfAssignableRoles)[number]

export interface AuthProfileInput {
  supabaseUserId: string
  email: string
  displayName: string
  role: SelfAssignableRole | "PLATFORM_ADMIN"
}

export interface CreateUserProfileInput {
  supabaseUserId: string
  email: string
  displayName: string
  role: SelfAssignableRole
}

export interface UserProfile extends Actor {
  supabaseUserId: string
}

export interface UserProfileRepository {
  findBySupabaseUserId(supabaseUserId: string): Promise<UserProfile | null>
  create(input: CreateUserProfileInput): Promise<UserProfile>
}

export type UserProfileConflictCode =
  | "EMAIL_ALREADY_REGISTERED"
  | "SUPABASE_PROFILE_CONFLICT"

export class UserProfileConflictError extends Error {
  constructor(readonly code: UserProfileConflictCode) {
    super(code)
    this.name = "UserProfileConflictError"
  }
}
