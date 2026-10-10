import "server-only"

import { getPrismaClient } from "@/lib/server/prisma"

import { PrismaUserProfileRepository } from "./prisma-user-profile-repository"

export function getUserProfileRepository() {
  return new PrismaUserProfileRepository(getPrismaClient())
}
