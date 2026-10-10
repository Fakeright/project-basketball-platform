import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import type { AdminDashboardRepository } from "../application/ports/admin-dashboard-repository"
import { PrismaAdminDashboardRepository } from "./prisma-admin-dashboard-repository"

export function getAdminDashboardRepository(): AdminDashboardRepository {
  return new PrismaAdminDashboardRepository(getPrismaClient())
}
