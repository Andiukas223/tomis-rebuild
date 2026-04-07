-- AlterTable
ALTER TABLE "GeneratedReport"
ADD COLUMN "workflowStatus" TEXT NOT NULL DEFAULT 'Draft',
ADD COLUMN "label" TEXT;
