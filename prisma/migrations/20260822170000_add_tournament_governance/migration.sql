CREATE TYPE "TournamentGovernanceStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REMOVED');

ALTER TABLE "Tournament"
ADD COLUMN "governanceStatus" "TournamentGovernanceStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "governanceReason" TEXT,
ADD COLUMN "governanceUpdatedAt" TIMESTAMP(3);

CREATE INDEX "Tournament_governanceStatus_status_idx"
ON "Tournament"("governanceStatus", "status");

UPDATE "Tournament"
SET "governanceStatus" = 'SUSPENDED',
    "governanceReason" = 'Legacy TournamentStatus.SUSPENDED requires manual review',
    "governanceUpdatedAt" = NOW()
WHERE "status" = 'SUSPENDED';
