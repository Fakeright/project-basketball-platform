import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import type { TournamentMediaRepository } from "../application/ports/tournament-media-repository"
import { DevelopmentTournamentMediaRepository } from "./development-tournament-media-repository"
import { PrismaTournamentMediaRepository } from "./prisma-tournament-media-repository"

export async function getTournamentMediaRepository(): Promise<TournamentMediaRepository> {
  if (process.env.DATABASE_URL) {
    return new PrismaTournamentMediaRepository(getPrismaClient())
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL_NOT_CONFIGURED")
  }

  return new DevelopmentTournamentMediaRepository()
}
