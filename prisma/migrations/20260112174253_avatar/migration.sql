/*
  Warnings:

  - The `avatar` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "REPORTING_TYPE" AS ENUM ('ANS', 'BELIEVE');

-- CreateEnum
CREATE TYPE "REPORTING_SEPARATOR" AS ENUM ('COMMA', 'SEMICOLON', 'TAB', 'PIPE');

-- CreateEnum
CREATE TYPE "REPORTING_CURRENCY" AS ENUM ('USD', 'EUR');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'REPORTING_UPLOADED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'REPORTING_DELETED';

-- AlterEnum
ALTER TYPE "AUDIT_LOG_ENTITY" ADD VALUE 'REPORTING';

-- AlterEnum
ALTER TYPE "REPORTING_SYSTEM_ACCESS_LEVEL" ADD VALUE 'PROCESS';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
ADD COLUMN     "avatar" BYTEA;

-- CreateTable
CREATE TABLE "Reporting" (
    "id" TEXT NOT NULL,
    "uploaderId" TEXT,
    "processorId" TEXT,
    "name" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "reportingMonth" TIMESTAMP(3) NOT NULL,
    "netRevenue" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "type" "REPORTING_TYPE" NOT NULL,
    "separator" "REPORTING_SEPARATOR" NOT NULL,
    "currency" "REPORTING_CURRENCY" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reporting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reportingId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reporting_hash_key" ON "Reporting"("hash");

-- AddForeignKey
ALTER TABLE "Reporting" ADD CONSTRAINT "Reporting_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporting" ADD CONSTRAINT "Reporting_processorId_fkey" FOREIGN KEY ("processorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportingId_fkey" FOREIGN KEY ("reportingId") REFERENCES "Reporting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
