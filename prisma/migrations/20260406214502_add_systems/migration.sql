-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT,
    "hospitalName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "System_code_key" ON "System"("code");

-- CreateIndex
CREATE INDEX "System_organizationId_idx" ON "System"("organizationId");

-- CreateIndex
CREATE INDEX "System_status_idx" ON "System"("status");

-- AddForeignKey
ALTER TABLE "System" ADD CONSTRAINT "System_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
