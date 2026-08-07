import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import type { LegacyTeamMemberRepository } from "../application/ports/team-repository"
import { PrismaTeamRepository } from "./prisma-team-repository"

export function getTeamRepository(): LegacyTeamMemberRepository {
  return new PrismaTeamRepository(getPrismaClient())
}
