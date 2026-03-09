-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'OPEN';

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "assignedDriverId" TEXT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
