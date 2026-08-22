-- AlterTable
ALTER TABLE "admin_permissions" ADD COLUMN     "userAssignCategory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userCreate" BOOLEAN NOT NULL DEFAULT false;
