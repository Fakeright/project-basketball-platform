import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import { getDevelopmentTournamentOperationsRepository } from "./development-tournament-operations-repository"
import { PrismaTournamentOperationsRepository } from "./prisma-tournament-operations-repository"
import type { TournamentOperationsRepository } from "./tournament-operations-repository"

export async function getTournamentOperationsRepository(): Promise<TournamentOperationsRepository> {
  if (process.env.DATABASE_URL) {
    return new PrismaTournamentOperationsRepository(getPrismaClient())
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL_NOT_CONFIGURED")
  }

  return getDevelopmentTournamentOperationsRepository()
}
