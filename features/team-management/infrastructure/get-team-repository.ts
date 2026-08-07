import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import type { TeamRepository } from "../application/ports/team-repository"
import { PrismaTeamRepository } from "./prisma-team-repository"

export function getTeamRepository(): TeamRepository {
  return new PrismaTeamRepository(getPrismaClient())
}
