-- AlterEnum
ALTER TYPE "ProgramEnum" ADD VALUE 'OTHERS';

-- AlterTable
ALTER TABLE "TempUser" ALTER COLUMN "universityId" DROP NOT NULL;
