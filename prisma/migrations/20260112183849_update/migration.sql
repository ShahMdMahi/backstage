/*
  Warnings:

  - You are about to drop the column `separator` on the `Reporting` table. All the data in the column will be lost.
  - Added the required column `delimiter` to the `Reporting` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "REPORTING_DELIMITER" AS ENUM ('COMMA', 'SEMICOLON');

-- AlterEnum
ALTER TYPE "AUDIT_LOG_ENTITY" ADD VALUE 'REPORT';

-- AlterTable
ALTER TABLE "Reporting" DROP COLUMN "separator",
ADD COLUMN     "delimiter" "REPORTING_DELIMITER" NOT NULL;

-- DropEnum
DROP TYPE "REPORTING_SEPARATOR";

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_role_verifiedAt_approvedAt_suspendedAt_idx" ON "User"("role", "verifiedAt", "approvedAt", "suspendedAt");
