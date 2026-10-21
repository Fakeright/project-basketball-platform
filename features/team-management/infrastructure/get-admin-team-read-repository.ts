import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import type { AdminTeamReadRepository } from "../application/ports/admin-team-read-repository"
import { PrismaAdminTeamReadRepository } from "./prisma-admin-team-read-repository"

export function getAdminTeamReadRepository(): AdminTeamReadRepository {
  return new PrismaAdminTeamReadRepository(getPrismaClient())
}
