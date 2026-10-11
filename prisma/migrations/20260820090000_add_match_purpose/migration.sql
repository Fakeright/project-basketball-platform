CREATE TYPE "MatchPurpose" AS ENUM ('STANDARD', 'THIRD_PLACE', 'CHAMPIONSHIP');

ALTER TABLE "Match"
ADD COLUMN "purpose" "MatchPurpose" NOT NULL DEFAULT 'STANDARD';

UPDATE "Match" AS match
SET "purpose" = 'CHAMPIONSHIP'
FROM "Bracket" AS bracket
WHERE match."bracketId" = bracket."id"
  AND bracket."mode" = 'SYSTEM_GENERATED'
  AND match."nextMatchId" IS NULL;

CREATE UNIQUE INDEX "Match_bracketId_placementPurpose_key"
ON "Match" ("bracketId", "purpose")
WHERE "purpose" IN ('THIRD_PLACE', 'CHAMPIONSHIP');
