/*
  Warnings:

  - The values [SYSTEM_MANAGER,SYSTEM_USER,ACCOUNT_ADMIN,ACCOUNT_MANAGER,ACCOUNT_USER,ARTIST] on the enum `ROLE` will be removed. If these variants are still used in the database, this will fail.
  - The values [LAPTOP] on the enum `SESSION_DEVICE_TYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "WORKSPACE_ACCOUNT_TYPE" AS ENUM ('B2B', 'LABEL', 'ARTIST');

-- CreateEnum
CREATE TYPE "WORKSPACE_ACCOUNT_STATUS" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WORKSPACE_ACCOUNT_ACCESS_ROLE" AS ENUM ('ADMIN', 'MANAGER', 'ARTIST', 'MEMBER');

-- CreateEnum
CREATE TYPE "WORKSPACE_ACCOUNT_ACCESS_STATUS" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WORKSPACE_ACCOUNT_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WORKSPACE_ACCOUNT_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WORKSPACE_ACCOUNT_DELETED';

-- AlterEnum
BEGIN;
CREATE TYPE "ROLE_new" AS ENUM ('DEVELOPER', 'SYSTEM_ADMIN', 'USER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "ROLE_new" USING ("role"::text::"ROLE_new");
ALTER TYPE "ROLE" RENAME TO "ROLE_old";
ALTER TYPE "ROLE_new" RENAME TO "ROLE";
DROP TYPE "public"."ROLE_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SESSION_DEVICE_TYPE_new" AS ENUM ('DESKTOP', 'TABLET', 'MOBILE', 'CONSOLE', 'EMBEDDED', 'SMARTTV', 'WEARABLE', 'XR', 'OTHER');
ALTER TABLE "public"."Session" ALTER COLUMN "deviceType" DROP DEFAULT;
ALTER TABLE "Session" ALTER COLUMN "deviceType" TYPE "SESSION_DEVICE_TYPE_new" USING ("deviceType"::text::"SESSION_DEVICE_TYPE_new");
ALTER TYPE "SESSION_DEVICE_TYPE" RENAME TO "SESSION_DEVICE_TYPE_old";
ALTER TYPE "SESSION_DEVICE_TYPE_new" RENAME TO "SESSION_DEVICE_TYPE";
DROP TYPE "public"."SESSION_DEVICE_TYPE_old";
ALTER TABLE "Session" ALTER COLUMN "deviceType" SET DEFAULT 'OTHER';
COMMIT;

-- CreateTable
CREATE TABLE "WorkspaceAccount" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "metadata" JSONB,
    "type" "WORKSPACE_ACCOUNT_TYPE" NOT NULL,
    "status" "WORKSPACE_ACCOUNT_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionStatsAt" TIMESTAMP(3) NOT NULL,
    "subscriptionEndsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedWorkspaceAccountAccess" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignerId" TEXT NOT NULL,
    "metadata" JSONB,
    "role" "WORKSPACE_ACCOUNT_ACCESS_ROLE" NOT NULL DEFAULT 'MEMBER',
    "status" "WORKSPACE_ACCOUNT_ACCESS_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedWorkspaceAccountAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceAccount_ownerId_key" ON "WorkspaceAccount"("ownerId");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_revokedAt_idx" ON "Session"("revokedAt");

-- CreateIndex
CREATE INDEX "Session_accessedAt_idx" ON "Session"("accessedAt");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- AddForeignKey
ALTER TABLE "WorkspaceAccount" ADD CONSTRAINT "WorkspaceAccount_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" ADD CONSTRAINT "SharedWorkspaceAccountAccess_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" ADD CONSTRAINT "SharedWorkspaceAccountAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" ADD CONSTRAINT "SharedWorkspaceAccountAccess_assignerId_fkey" FOREIGN KEY ("assignerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
