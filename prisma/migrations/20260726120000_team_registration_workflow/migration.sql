-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('PLAYER', 'COACH');

-- AlterEnum
ALTER TYPE "RegistrationStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "RegistrationStatus" ADD VALUE 'WITHDRAWN';

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN "role" "TeamMemberRole";
UPDATE "TeamMember" SET "role" = 'PLAYER' WHERE "role" IS NULL;
ALTER TABLE "TeamMember" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "TeamMember" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "TeamMember" ADD COLUMN "deactivatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Registration" ADD COLUMN "withdrawnAt" TIMESTAMP(3);
ALTER TABLE "Registration" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;

-- DropIndex
DROP INDEX "Registration_tournamentId_teamId_key";

-- CreateIndex
CREATE INDEX "Registration_tournamentId_teamId_createdAt_idx"
ON "Registration" ("tournamentId", "teamId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_active_tournamentId_teamId_key"
ON "Registration" ("tournamentId", "teamId")
WHERE "status" IN ('PENDING', 'APPROVED');
