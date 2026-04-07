ALTER TABLE "ServiceCase"
ADD COLUMN "workPerformed" TEXT,
ADD COLUMN "resolution" TEXT,
ADD COLUMN "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "followUpActions" TEXT;
