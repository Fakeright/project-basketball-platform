import "server-only"

import type { RegistrationRepository } from "../application/ports/registration-repository"
import { getPrismaClient } from "@/lib/server/prisma"

import { PrismaRegistrationRepository } from "./prisma-registration-repository"

export function getRegistrationRepository(): RegistrationRepository {
  return new PrismaRegistrationRepository(getPrismaClient())
}
