-- CreateTable
CREATE TABLE IF NOT EXISTS "Manufacturer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "country" TEXT,
    "website" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Manufacturer_organizationId_idx" ON "Manufacturer"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Manufacturer_organizationId_name_key" ON "Manufacturer"("organizationId", "name");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Manufacturer_organizationId_fkey'
    ) THEN
        ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "serialNumber" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_code_key" ON "Equipment"("code");

-- CreateIndex
CREATE INDEX "Equipment_organizationId_idx" ON "Equipment"("organizationId");

-- CreateIndex
CREATE INDEX "Equipment_manufacturerId_idx" ON "Equipment"("manufacturerId");

-- CreateIndex
CREATE INDEX "Equipment_status_idx" ON "Equipment"("status");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
