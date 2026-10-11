import "server-only"

import type { ExternalBracketRepository } from "@/features/competition/application/ports/external-bracket-repository"
import { getPrismaClient } from "@/lib/server/prisma"

import { DevelopmentExternalBracketRepository } from "./development-external-bracket-repository"
import { PrismaExternalBracketRepository } from "./prisma-external-bracket-repository"

export function getExternalBracketRepository(): ExternalBracketRepository {
  if (process.env.DATABASE_URL) {
    return new PrismaExternalBracketRepository(getPrismaClient())
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL_NOT_CONFIGURED")
  }
  return new DevelopmentExternalBracketRepository()
}
