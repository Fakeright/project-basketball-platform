CREATE TABLE "AuthRecoveryGrant" (
    "id" TEXT NOT NULL,
    "nonceHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthRecoveryGrant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthRecoveryGrant_nonceHash_key"
ON "AuthRecoveryGrant"("nonceHash");

CREATE INDEX "AuthRecoveryGrant_userId_consumedAt_expiresAt_idx"
ON "AuthRecoveryGrant"("userId", "consumedAt", "expiresAt");

CREATE INDEX "AuthRecoveryGrant_expiresAt_idx"
ON "AuthRecoveryGrant"("expiresAt");

ALTER TABLE "AuthRecoveryGrant"
ADD CONSTRAINT "AuthRecoveryGrant_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
