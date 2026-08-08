import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
import { PrismaClient } from "../lib/generated/prisma/client"
import { listLegacyTeamReconciliations } from "../features/team-management/application/legacy-team-reconciliation"
import { PrismaTeamRepository } from "../features/team-management/infrastructure/prisma-team-repository"

config({ path: ".env.local" })
config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL_NOT_CONFIGURED")
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main() {
  try {
    const teams = await listLegacyTeamReconciliations({
      teams: new PrismaTeamRepository(prisma),
    })

    console.log(JSON.stringify({
      legacyTeamReconciliation: {
        teamCount: teams.length,
        readyForLegacyRemoval: teams.length === 0,
        teams,
      },
    }, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
