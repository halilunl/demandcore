/*
  Warnings:

  - A unique constraint covering the columns `[userId,capabilityId]` on the table `DriverCapability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "DriverCapability_capabilityId_idx" ON "DriverCapability"("capabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverCapability_userId_capabilityId_key" ON "DriverCapability"("userId", "capabilityId");

-- AddForeignKey
ALTER TABLE "DriverCapability" ADD CONSTRAINT "DriverCapability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverCapability" ADD CONSTRAINT "DriverCapability_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "JobCapability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
