BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "TeamPlayer" p
    WHERE p."isActive" = true
    GROUP BY p."teamId", lower(btrim(p."firstName")), lower(btrim(p."lastName")), p."birthDate"
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'DUPLICATE_ACTIVE_TEAM_PLAYER_IDENTITY';
  END IF;
END $$;

CREATE TABLE "PlayerIdentity" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "birthDate" DATE NOT NULL,
  "normalizedFirstName" TEXT NOT NULL,
  "normalizedLastName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlayerIdentity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlayerIdentity_ownerId_normalizedFirstName_normalizedLastName_birthDate_key"
  ON "PlayerIdentity"("ownerId", "normalizedFirstName", "normalizedLastName", "birthDate");
CREATE INDEX "PlayerIdentity_ownerId_idx" ON "PlayerIdentity"("ownerId");
ALTER TABLE "PlayerIdentity" ADD CONSTRAINT "PlayerIdentity_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "PlayerIdentity" (
  "id", "ownerId", "firstName", "lastName", "birthDate",
  "normalizedFirstName", "normalizedLastName", "updatedAt"
)
SELECT DISTINCT ON (t."ownerId", lower(btrim(p."firstName")), lower(btrim(p."lastName")), p."birthDate")
  gen_random_uuid()::text, t."ownerId", btrim(p."firstName"), btrim(p."lastName"), p."birthDate",
  lower(btrim(p."firstName")), lower(btrim(p."lastName")), CURRENT_TIMESTAMP
FROM "TeamPlayer" p
JOIN "Team" t ON t."id" = p."teamId"
ORDER BY t."ownerId", lower(btrim(p."firstName")), lower(btrim(p."lastName")), p."birthDate", p."updatedAt" DESC, p."id" ASC;

ALTER TABLE "TeamPlayer" ADD COLUMN "playerIdentityId" TEXT;
UPDATE "TeamPlayer" p
SET "playerIdentityId" = identity."id"
FROM "Team" t, "PlayerIdentity" identity
WHERE p."teamId" = t."id"
  AND identity."ownerId" = t."ownerId"
  AND identity."normalizedFirstName" = lower(btrim(p."firstName"))
  AND identity."normalizedLastName" = lower(btrim(p."lastName"))
  AND identity."birthDate" = p."birthDate";
ALTER TABLE "TeamPlayer" ALTER COLUMN "playerIdentityId" SET NOT NULL;
CREATE INDEX "TeamPlayer_playerIdentityId_isActive_idx" ON "TeamPlayer"("playerIdentityId", "isActive");
CREATE UNIQUE INDEX "TeamPlayer_one_active_identity_per_team"
  ON "TeamPlayer"("teamId", "playerIdentityId") WHERE "isActive" = true;
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_playerIdentityId_fkey"
  FOREIGN KEY ("playerIdentityId") REFERENCES "PlayerIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "RegistrationPlayer" (
  "id" TEXT NOT NULL,
  "registrationId" TEXT NOT NULL,
  "playerIdentityId" TEXT NOT NULL,
  "teamPlayerId" TEXT,
  "firstNameSnapshot" TEXT NOT NULL,
  "lastNameSnapshot" TEXT NOT NULL,
  "birthDateSnapshot" DATE NOT NULL,
  "jerseyNumberSnapshot" INTEGER,
  "positionSnapshot" "BasketballPosition",
  "backfilled" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "RegistrationPlayer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RegistrationPlayer_registrationId_playerIdentityId_key"
  ON "RegistrationPlayer"("registrationId", "playerIdentityId");
CREATE INDEX "RegistrationPlayer_playerIdentityId_idx" ON "RegistrationPlayer"("playerIdentityId");
ALTER TABLE "RegistrationPlayer" ADD CONSTRAINT "RegistrationPlayer_registrationId_fkey"
  FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RegistrationPlayer" ADD CONSTRAINT "RegistrationPlayer_playerIdentityId_fkey"
  FOREIGN KEY ("playerIdentityId") REFERENCES "PlayerIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RegistrationPlayer" ADD CONSTRAINT "RegistrationPlayer_teamPlayerId_fkey"
  FOREIGN KEY ("teamPlayerId") REFERENCES "TeamPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "RegistrationPlayer" (
  "id", "registrationId", "playerIdentityId", "teamPlayerId", "firstNameSnapshot",
  "lastNameSnapshot", "birthDateSnapshot", "jerseyNumberSnapshot", "positionSnapshot", "backfilled"
)
SELECT DISTINCT ON (r."id", p."playerIdentityId")
  gen_random_uuid()::text, r."id", p."playerIdentityId", p."id", p."firstName",
  p."lastName", p."birthDate", p."jerseyNumber", p."position", true
FROM "Registration" r
JOIN "Tournament" tournament ON tournament."id" = r."tournamentId"
JOIN "TeamPlayer" p ON p."teamId" = r."teamId" AND p."isActive" = true
WHERE r."status" IN ('PENDING', 'APPROVED')
  AND tournament."status" NOT IN ('COMPLETED', 'ARCHIVED')
ORDER BY r."id", p."playerIdentityId", p."createdAt", p."id";

COMMIT;
