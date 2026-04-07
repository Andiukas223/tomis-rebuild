-- CreateTable
CREATE TABLE "ServiceAttachment" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "serviceCaseId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAttachment_storageKey_key" ON "ServiceAttachment"("storageKey");

-- CreateIndex
CREATE INDEX "ServiceAttachment_serviceCaseId_idx" ON "ServiceAttachment"("serviceCaseId");

-- CreateIndex
CREATE INDEX "ServiceAttachment_uploadedById_idx" ON "ServiceAttachment"("uploadedById");

-- CreateIndex
CREATE INDEX "ServiceAttachment_createdAt_idx" ON "ServiceAttachment"("createdAt");

-- AddForeignKey
ALTER TABLE "ServiceAttachment"
ADD CONSTRAINT "ServiceAttachment_serviceCaseId_fkey"
FOREIGN KEY ("serviceCaseId") REFERENCES "ServiceCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAttachment"
ADD CONSTRAINT "ServiceAttachment_uploadedById_fkey"
FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
