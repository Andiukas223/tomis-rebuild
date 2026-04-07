-- CreateTable
CREATE TABLE "GeneratedReport" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scopeLabel" TEXT NOT NULL,
    "dateWindowLabel" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "snapshot" JSONB NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneratedReport_organizationId_idx" ON "GeneratedReport"("organizationId");

-- CreateIndex
CREATE INDEX "GeneratedReport_createdById_idx" ON "GeneratedReport"("createdById");

-- CreateIndex
CREATE INDEX "GeneratedReport_createdAt_idx" ON "GeneratedReport"("createdAt");

-- CreateIndex
CREATE INDEX "GeneratedReport_reportType_idx" ON "GeneratedReport"("reportType");

-- AddForeignKey
ALTER TABLE "GeneratedReport" ADD CONSTRAINT "GeneratedReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedReport" ADD CONSTRAINT "GeneratedReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
