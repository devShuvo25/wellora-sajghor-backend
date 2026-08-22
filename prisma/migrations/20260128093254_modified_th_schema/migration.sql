/*
  Warnings:

  - You are about to drop the column `userAssignCategory` on the `admin_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `userCreate` on the `admin_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_UserToCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicYear` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permission` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProgramEnum" AS ENUM ('BSC', 'MSC');

-- CreateEnum
CREATE TYPE "AcademicYearEnum" AS ENUM ('YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4');

-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('VIEW_ONLY', 'DOWNLOAD');

-- DropForeignKey
ALTER TABLE "_UserToCategory" DROP CONSTRAINT "_UserToCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToCategory" DROP CONSTRAINT "_UserToCategory_B_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_categoryId_fkey";

-- AlterTable
ALTER TABLE "admin_permissions" DROP COLUMN "userAssignCategory",
DROP COLUMN "userCreate";

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "academicYear" "AcademicYearEnum" NOT NULL,
ADD COLUMN     "departmentId" TEXT NOT NULL,
ADD COLUMN     "permission" "PermissionType" NOT NULL,
ADD COLUMN     "program" "ProgramEnum" NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "position",
ADD COLUMN     "departmentId" TEXT NOT NULL,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "program" "ProgramEnum" NOT NULL,
ADD COLUMN     "studentId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_UserToCategory";

-- DropEnum
DROP TYPE "PositionEnum";

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "program" "ProgramEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_program_key" ON "departments"("name", "program");

-- CreateIndex
CREATE INDEX "documents_departmentId_academicYear_idx" ON "documents"("departmentId", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "users_studentId_key" ON "users"("studentId");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
