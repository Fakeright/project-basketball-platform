import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
import { PrismaClient } from "../lib/generated/prisma/client"

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
    const counts = await prisma.teamMember.groupBy({
      by: ["role", "isActive"],
      _count: { _all: true },
    })

    console.log(JSON.stringify({ legacyTeamMembers: counts }, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
