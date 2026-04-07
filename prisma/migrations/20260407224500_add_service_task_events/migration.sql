CREATE TABLE "ServiceTaskEvent" (
  "id" TEXT NOT NULL,
  "serviceTaskId" TEXT NOT NULL,
  "changedById" TEXT,
  "eventType" TEXT NOT NULL,
  "previousTitle" TEXT,
  "newTitle" TEXT,
  "previousNotes" TEXT,
  "newNotes" TEXT,
  "previousDueAt" TIMESTAMP(3),
  "newDueAt" TIMESTAMP(3),
  "previousCompleted" BOOLEAN,
  "newCompleted" BOOLEAN,
  "previousAssigneeId" TEXT,
  "previousAssigneeName" TEXT,
  "newAssigneeId" TEXT,
  "newAssigneeName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ServiceTaskEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ServiceTaskEvent_serviceTaskId_idx" ON "ServiceTaskEvent"("serviceTaskId");
CREATE INDEX "ServiceTaskEvent_changedById_idx" ON "ServiceTaskEvent"("changedById");
CREATE INDEX "ServiceTaskEvent_createdAt_idx" ON "ServiceTaskEvent"("createdAt");

ALTER TABLE "ServiceTaskEvent"
ADD CONSTRAINT "ServiceTaskEvent_serviceTaskId_fkey"
FOREIGN KEY ("serviceTaskId") REFERENCES "ServiceTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ServiceTaskEvent"
ADD CONSTRAINT "ServiceTaskEvent_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
