import "server-only"

import { SupabaseObjectStorage } from "@/features/tournament-media/infrastructure/supabase-object-storage"
import { getPrismaClient } from "@/lib/server/prisma"

import { MockTournamentRepository } from "./mock-tournament-repository"
import { PrismaTournamentRepository } from "./prisma-tournament-repository"
import type { TournamentRepository } from "./tournament-repository"

export function getTournamentRepository(): TournamentRepository {
  if (process.env.DATABASE_URL) {
    return new PrismaTournamentRepository(
      getPrismaClient(),
      new SupabaseObjectStorage(),
    )
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL_NOT_CONFIGURED")
  }

  return new MockTournamentRepository()
}
