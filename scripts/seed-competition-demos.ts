import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"

import { createPrismaDemoSeedPort } from "../features/demo-data/infrastructure/prisma-demo-seed-port"
import { runCompetitionDemoSeed } from "../features/demo-data/infrastructure/demo-seed-orchestration"
import { createDemoSeedClient } from "../features/demo-data/infrastructure/demo-seed-safety"
import { PrismaClient } from "../lib/generated/prisma/client"

config({ path: ".env.local" })
config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL_NOT_CONFIGURED")
}

const prisma = createDemoSeedClient(process.env, () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  }),
)

runCompetitionDemoSeed(createPrismaDemoSeedPort(prisma))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
