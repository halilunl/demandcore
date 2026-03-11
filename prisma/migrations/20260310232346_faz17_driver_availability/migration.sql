-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('OFFLINE', 'ONLINE', 'BUSY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "driverStatus" "DriverStatus" NOT NULL DEFAULT 'OFFLINE';
