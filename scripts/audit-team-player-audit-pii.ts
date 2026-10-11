import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
import { PrismaClient } from "../lib/generated/prisma/client"
import { createTeamPlayerAuditPiiReport } from "../features/team-management/domain/team-player-audit"

config({ path: ".env.local" })
config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL_NOT_CONFIGURED")
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const teamPlayerAuditActions = [
  "team.players_added",
  "team.player_updated",
  "team.player_deactivated",
  "team.admin_override",
]

async function main() {
  try {
    const events = await prisma.auditLog.findMany({
      where: {
        entityType: "Team",
        action: { in: teamPlayerAuditActions },
      },
      select: {
        id: true,
        action: true,
        beforeJson: true,
        afterJson: true,
      },
      orderBy: { id: "asc" },
    })

    console.log(JSON.stringify({
      teamPlayerAuditPiiReport: createTeamPlayerAuditPiiReport(events),
    }, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
