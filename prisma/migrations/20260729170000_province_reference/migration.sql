-- This migration requires the approved development reset before application.
-- Existing free-text province values cannot safely be converted to canonical codes.

CREATE TABLE "Province" (
    "code" CHAR(2) NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("code")
);

CREATE UNIQUE INDEX "Province_nameTh_key" ON "Province"("nameTh");
CREATE UNIQUE INDEX "Province_nameEn_key" ON "Province"("nameEn");

ALTER TABLE "Team" DROP COLUMN "province";
ALTER TABLE "Team" ADD COLUMN "provinceCode" CHAR(2) NOT NULL;
CREATE INDEX "Team_provinceCode_idx" ON "Team"("provinceCode");
ALTER TABLE "Team"
ADD CONSTRAINT "Team_provinceCode_fkey"
FOREIGN KEY ("provinceCode") REFERENCES "Province"("code")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Tournament" DROP COLUMN "province";
ALTER TABLE "Tournament" ADD COLUMN "provinceCode" CHAR(2) NOT NULL;
CREATE INDEX "Tournament_provinceCode_idx" ON "Tournament"("provinceCode");
ALTER TABLE "Tournament"
ADD CONSTRAINT "Tournament_provinceCode_fkey"
FOREIGN KEY ("provinceCode") REFERENCES "Province"("code")
ON DELETE RESTRICT ON UPDATE CASCADE;
