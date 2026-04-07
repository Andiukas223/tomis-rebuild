ALTER TABLE "ServiceTask"
ADD COLUMN "notes" TEXT,
ADD COLUMN "dueAt" TIMESTAMP(3),
ADD COLUMN "assignedUserId" TEXT;

ALTER TABLE "ServiceTask"
ADD CONSTRAINT "ServiceTask_assignedUserId_fkey"
FOREIGN KEY ("assignedUserId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX "ServiceTask_dueAt_idx" ON "ServiceTask"("dueAt");
CREATE INDEX "ServiceTask_assignedUserId_idx" ON "ServiceTask"("assignedUserId");
