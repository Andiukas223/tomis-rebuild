-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "city" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "System" ADD COLUMN "hospitalId" TEXT;

-- Seed hospitals from the existing systems records
INSERT INTO "Hospital" ("id", "name", "organizationId", "createdAt", "updatedAt")
SELECT
    'hospital_' || md5("organizationId" || ':' || "hospitalName"),
    "hospitalName",
    "organizationId",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT "organizationId", "hospitalName"
    FROM "System"
) AS "distinct_hospitals";

-- Link systems to their new hospital records
UPDATE "System" AS s
SET "hospitalId" = h."id"
FROM "Hospital" AS h
WHERE s."organizationId" = h."organizationId"
  AND s."hospitalName" = h."name";

-- Enforce the new relation after backfill
ALTER TABLE "System" ALTER COLUMN "hospitalId" SET NOT NULL;

-- Drop the legacy denormalized hospital name field
ALTER TABLE "System" DROP COLUMN "hospitalName";

-- CreateIndex
CREATE INDEX "Hospital_organizationId_idx" ON "Hospital"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_organizationId_name_key" ON "Hospital"("organizationId", "name");

-- CreateIndex
CREATE INDEX "System_hospitalId_idx" ON "System"("hospitalId");

-- AddForeignKey
ALTER TABLE "Hospital" ADD CONSTRAINT "Hospital_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "System" ADD CONSTRAINT "System_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
