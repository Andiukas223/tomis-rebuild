-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN "systemId" TEXT;

-- CreateIndex
CREATE INDEX "Equipment_systemId_idx" ON "Equipment"("systemId");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE SET NULL ON UPDATE CASCADE;
