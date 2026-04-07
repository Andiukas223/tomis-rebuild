-- CreateTable
CREATE TABLE "ServiceNote" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "serviceCaseId" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceNote_serviceCaseId_idx" ON "ServiceNote"("serviceCaseId");

-- CreateIndex
CREATE INDEX "ServiceNote_authorId_idx" ON "ServiceNote"("authorId");

-- CreateIndex
CREATE INDEX "ServiceNote_createdAt_idx" ON "ServiceNote"("createdAt");

-- AddForeignKey
ALTER TABLE "ServiceNote"
ADD CONSTRAINT "ServiceNote_serviceCaseId_fkey"
FOREIGN KEY ("serviceCaseId") REFERENCES "ServiceCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceNote"
ADD CONSTRAINT "ServiceNote_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
