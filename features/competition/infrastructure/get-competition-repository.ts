import "server-only"

import type { CompetitionRepository } from "@/features/competition/application/ports/competition-repository"
import { getPrismaClient } from "@/lib/server/prisma"

import { PrismaCompetitionRepository } from "./prisma-competition-repository"

export function getCompetitionRepository(): CompetitionRepository {
  return new PrismaCompetitionRepository(getPrismaClient())
}
