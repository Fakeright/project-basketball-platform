-- AlterEnum
ALTER TYPE "MediaAssetKind" ADD VALUE 'BRACKET_DOCUMENT';

-- CreateEnum
CREATE TYPE "ExternalBracketRevisionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');

-- CreateTable
CREATE TABLE "ExternalBracketRevision" (
    "id" TEXT NOT NULL,
    "bracketId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "status" "ExternalBracketRevisionStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "retiredAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalBracketRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalBracketRevision_mediaAssetId_key" ON "ExternalBracketRevision"("mediaAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalBracketRevision_bracketId_revision_key" ON "ExternalBracketRevision"("bracketId", "revision");

-- CreateIndex
CREATE INDEX "ExternalBracketRevision_bracketId_status_idx" ON "ExternalBracketRevision"("bracketId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalBracketRevision_one_published_per_bracket"
ON "ExternalBracketRevision" ("bracketId")
WHERE "status" = 'PUBLISHED';

-- AddForeignKey
ALTER TABLE "ExternalBracketRevision" ADD CONSTRAINT "ExternalBracketRevision_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "Bracket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalBracketRevision" ADD CONSTRAINT "ExternalBracketRevision_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalBracketRevision" ADD CONSTRAINT "ExternalBracketRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
