CREATE TABLE "ServiceAssignmentEvent" (
  "id" TEXT NOT NULL,
  "serviceCaseId" TEXT NOT NULL,
  "changedById" TEXT,
  "previousAssigneeId" TEXT,
  "previousAssigneeName" TEXT,
  "newAssigneeId" TEXT,
  "newAssigneeName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ServiceAssignmentEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ServiceAssignmentEvent_serviceCaseId_idx" ON "ServiceAssignmentEvent"("serviceCaseId");
CREATE INDEX "ServiceAssignmentEvent_changedById_idx" ON "ServiceAssignmentEvent"("changedById");
CREATE INDEX "ServiceAssignmentEvent_createdAt_idx" ON "ServiceAssignmentEvent"("createdAt");

ALTER TABLE "ServiceAssignmentEvent"
ADD CONSTRAINT "ServiceAssignmentEvent_serviceCaseId_fkey"
FOREIGN KEY ("serviceCaseId") REFERENCES "ServiceCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ServiceAssignmentEvent"
ADD CONSTRAINT "ServiceAssignmentEvent_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
