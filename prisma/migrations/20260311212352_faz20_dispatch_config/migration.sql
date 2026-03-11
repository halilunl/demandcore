-- CreateEnum
CREATE TYPE "DispatchMode" AS ENUM ('SEQUENTIAL', 'BROADCAST');

-- CreateTable
CREATE TABLE "DispatchConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "radiusKm" INTEGER NOT NULL DEFAULT 3,
    "maxDrivers" INTEGER NOT NULL DEFAULT 3,
    "offerTimeoutSec" INTEGER NOT NULL DEFAULT 10,
    "dispatchMode" "DispatchMode" NOT NULL DEFAULT 'SEQUENTIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DispatchConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DispatchConfig_tenantId_idx" ON "DispatchConfig"("tenantId");

-- AddForeignKey
ALTER TABLE "DispatchConfig" ADD CONSTRAINT "DispatchConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
