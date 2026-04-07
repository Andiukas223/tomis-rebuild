-- CreateTable
CREATE TABLE "ServiceCase" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "systemId" TEXT NOT NULL,
    "equipmentId" TEXT,
    "assignedUserId" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "serviceCaseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCase_code_key" ON "ServiceCase"("code");

-- CreateIndex
CREATE INDEX "ServiceCase_organizationId_idx" ON "ServiceCase"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceCase_systemId_idx" ON "ServiceCase"("systemId");

-- CreateIndex
CREATE INDEX "ServiceCase_equipmentId_idx" ON "ServiceCase"("equipmentId");

-- CreateIndex
CREATE INDEX "ServiceCase_assignedUserId_idx" ON "ServiceCase"("assignedUserId");

-- CreateIndex
CREATE INDEX "ServiceCase_status_idx" ON "ServiceCase"("status");

-- CreateIndex
CREATE INDEX "ServiceCase_priority_idx" ON "ServiceCase"("priority");

-- CreateIndex
CREATE INDEX "ServiceCase_scheduledAt_idx" ON "ServiceCase"("scheduledAt");

-- CreateIndex
CREATE INDEX "ServiceTask_serviceCaseId_idx" ON "ServiceTask"("serviceCaseId");

-- CreateIndex
CREATE INDEX "ServiceTask_sortOrder_idx" ON "ServiceTask"("sortOrder");

-- AddForeignKey
ALTER TABLE "ServiceCase" ADD CONSTRAINT "ServiceCase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCase" ADD CONSTRAINT "ServiceCase_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCase" ADD CONSTRAINT "ServiceCase_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCase" ADD CONSTRAINT "ServiceCase_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTask" ADD CONSTRAINT "ServiceTask_serviceCaseId_fkey" FOREIGN KEY ("serviceCaseId") REFERENCES "ServiceCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
