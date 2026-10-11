/*
  Warnings:

  - Added the required column `updatedAt` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BracketMode" AS ENUM ('SYSTEM_GENERATED', 'EXTERNAL_DOCUMENT');

-- CreateEnum
CREATE TYPE "BracketGenerationMethod" AS ENUM ('SEEDED', 'RANDOM');

-- CreateEnum
CREATE TYPE "MatchSlot" AS ENUM ('HOME', 'AWAY');

-- AlterTable
ALTER TABLE "Bracket" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "drawToken" TEXT,
ADD COLUMN     "entriesLockedAt" TIMESTAMP(3),
ADD COLUMN     "generationMethod" "BracketGenerationMethod",
ADD COLUMN     "mode" "BracketMode" NOT NULL DEFAULT 'SYSTEM_GENERATED',
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "nextMatchId" TEXT,
ADD COLUMN     "nextSlot" "MatchSlot",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "BracketEntry" (
    "id" TEXT NOT NULL,
    "bracketId" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamNameSnapshot" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "drawPosition" INTEGER NOT NULL,
    "startRoundSequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BracketEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BracketEntry_bracketId_drawPosition_idx" ON "BracketEntry"("bracketId", "drawPosition");

-- CreateIndex
CREATE UNIQUE INDEX "BracketEntry_bracketId_registrationId_key" ON "BracketEntry"("bracketId", "registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "BracketEntry_bracketId_teamId_key" ON "BracketEntry"("bracketId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "BracketEntry_bracketId_seed_key" ON "BracketEntry"("bracketId", "seed");

-- CreateIndex
CREATE INDEX "Match_nextMatchId_idx" ON "Match"("nextMatchId");

-- CreateIndex
CREATE UNIQUE INDEX "Bracket_one_active_per_tournament"
ON "Bracket" ("tournamentId")
WHERE "status" <> 'ARCHIVED';

-- AddForeignKey
ALTER TABLE "BracketEntry" ADD CONSTRAINT "BracketEntry_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "Bracket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketEntry" ADD CONSTRAINT "BracketEntry_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketEntry" ADD CONSTRAINT "BracketEntry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_nextMatchId_fkey" FOREIGN KEY ("nextMatchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
