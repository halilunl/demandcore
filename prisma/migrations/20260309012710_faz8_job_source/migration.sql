-- CreateEnum
CREATE TYPE "JobSource" AS ENUM ('CLIENT_APP', 'ADMIN_PANEL', 'API', 'SYSTEM');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "source" "JobSource" NOT NULL DEFAULT 'CLIENT_APP';
