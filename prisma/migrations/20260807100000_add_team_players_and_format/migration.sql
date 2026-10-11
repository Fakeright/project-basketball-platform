-- CreateEnum
CREATE TYPE "BasketballPosition" AS ENUM ('PG', 'SG', 'SF', 'PF', 'C');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "format" "TournamentFormat";
UPDATE "Team" SET "format" = 'FIVE_V_FIVE' WHERE "format" IS NULL;
ALTER TABLE "Team" ALTER COLUMN "format" SET NOT NULL;
ALTER TABLE "Team" ALTER COLUMN "format" SET DEFAULT 'FIVE_V_FIVE';
ALTER TABLE "Team" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Team" ADD COLUMN "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "Team" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TeamPlayer" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nickname" TEXT,
    "birthDate" DATE NOT NULL,
    "jerseyNumber" INTEGER,
    "position" "BasketballPosition",
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamPlayer_teamId_firstName_lastName_birthDate_key"
ON "TeamPlayer"("teamId", "firstName", "lastName", "birthDate");

-- CreateIndex
CREATE INDEX "TeamPlayer_teamId_isActive_idx" ON "TeamPlayer"("teamId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TeamPlayer_active_jersey_key"
ON "TeamPlayer" ("teamId", "jerseyNumber")
WHERE "isActive" = true AND "jerseyNumber" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
