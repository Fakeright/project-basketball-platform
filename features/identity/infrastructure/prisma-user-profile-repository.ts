import { UserProfileConflictError } from "@/features/identity/application/ports/user-profile-repository"
import type {
  CreateUserProfileInput,
  UserProfile,
  UserProfileRepository,
} from "@/features/identity/application/ports/user-profile-repository"
import type { Role } from "@/features/identity/domain/actor"

const userProfileSelect = {
  id: true,
  supabaseUserId: true,
  email: true,
  displayName: true,
  role: true,
} as const

interface UserProfileRecord {
  id: string
  supabaseUserId: string | null
  email: string
  displayName: string
  role: string
}

interface UserProfileDatabaseClient {
  user: {
    findUnique(input: {
      where: { supabaseUserId: string }
      select: typeof userProfileSelect
    }): Promise<UserProfileRecord | null>
    create(input: {
      data: CreateUserProfileInput
      select: typeof userProfileSelect
    }): Promise<UserProfileRecord>
  }
}

export class PrismaUserProfileRepository implements UserProfileRepository {
  constructor(private readonly prisma: UserProfileDatabaseClient) {}

  async findBySupabaseUserId(supabaseUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseUserId },
      select: userProfileSelect,
    })
    return user ? mapUserProfile(user) : null
  }

  async create(input: CreateUserProfileInput) {
    try {
      const user = await this.prisma.user.create({
        data: input,
        select: userProfileSelect,
      })
      return mapUserProfile(user)
    } catch (error) {
      if (!isPrismaUniqueConflict(error)) throw error

      const existingProfile = await this.findBySupabaseUserId(
        input.supabaseUserId,
      )
      if (existingProfile) return existingProfile

      const conflictTarget = getUniqueConflictTarget(error)
      if (conflictTarget === "supabaseUserId") {
        throw new UserProfileConflictError("SUPABASE_PROFILE_CONFLICT")
      }
      if (conflictTarget === "email") {
        throw new UserProfileConflictError("EMAIL_ALREADY_REGISTERED")
      }
      throw error
    }
  }
}

function mapUserProfile(user: UserProfileRecord): UserProfile {
  if (!user.supabaseUserId) {
    throw new Error("SUPABASE_USER_ID_MISSING")
  }

  return {
    id: user.id,
    supabaseUserId: user.supabaseUserId,
    email: user.email,
    displayName: user.displayName,
    role: user.role as Role,
  }
}

function isPrismaUniqueConflict(
  error: unknown,
): error is { code: "P2002"; meta?: unknown } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
}

function getUniqueConflictTarget(
  error: unknown,
): "email" | "supabaseUserId" | null {
  if (
    !isPrismaUniqueConflict(error) ||
    !("meta" in error) ||
    typeof error.meta !== "object" ||
    error.meta === null ||
    !("target" in error.meta)
  ) {
    return null
  }

  const rawTarget = error.meta.target
  const normalizedTarget =
    Array.isArray(rawTarget) && rawTarget.length === 1
      ? rawTarget[0]
      : rawTarget

  if (
    normalizedTarget === "email" ||
    normalizedTarget === "User_email_key"
  ) {
    return "email"
  }
  if (
    normalizedTarget === "supabaseUserId" ||
    normalizedTarget === "User_supabaseUserId_key"
  ) {
    return "supabaseUserId"
  }
  return null
}
