/*
  Warnings:

  - You are about to drop the column `studentId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `academicYear` on the `documents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProgramEnum" ADD VALUE 'BBA';
ALTER TYPE "ProgramEnum" ADD VALUE 'MBA';

-- AlterEnum
ALTER TYPE "UserRoleEnum" ADD VALUE 'TEACHER';

-- DropIndex
DROP INDEX "users_studentId_key";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "academicYear",
ADD COLUMN     "academicYear" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "studentId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "AcademicYearEnum";

-- CreateIndex
CREATE INDEX "documents_departmentId_academicYear_idx" ON "documents"("departmentId", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "users"("userId");
