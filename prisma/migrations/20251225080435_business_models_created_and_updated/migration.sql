/*
  Warnings:

  - The values [PENDING_APPROVAL] on the enum `ARTIST_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [SESSION_ACCESSED,WORKSPACE_ACCOUNT_CREATED,WORKSPACE_ACCOUNT_UPDATED,WORKSPACE_ACCOUNT_DELETED,WORKSPACE_ACCOUNT_SUSPENDED,WORKSPACE_ACCOUNT_REACTIVATED,RELEASE_CREATED,RELEASE_UPDATED,RELEASE_DELETED,TRACK_CREATED,TRACK_UPDATED,TRACK_DELETED,VIDEO_CREATED,VIDEO_UPDATED,VIDEO_DELETED,RINGTONE_CREATED,RINGTONE_UPDATED,RINGTONE_DELETED,ARTIST_CREATED,ARTIST_UPDATED,ARTIST_DELETED,PERFORMER_CREATED,PERFORMER_UPDATED,PERFORMER_DELETED,PRODUCER_AND_ENGINEER_CREATED,PRODUCER_AND_ENGINEER_UPDATED,PRODUCER_AND_ENGINEER_DELETED,WRITER_CREATED,WRITER_UPDATED,WRITER_DELETED,PUBLISHER_CREATED,PUBLISHER_UPDATED,PUBLISHER_DELETED,LABEL_CREATED,LABEL_UPDATED,LABEL_DELETED,SHARED_WORKSPACE_ACCOUNT_ACCESS_CREATED,SHARED_WORKSPACE_ACCOUNT_ACCESS_UPDATED,SHARED_WORKSPACE_ACCOUNT_ACCESS_SUSPENDED,SHARED_WORKSPACE_ACCOUNT_ACCESS_REACTIVATED,SHARED_WORKSPACE_ACCOUNT_ACCESS_DELETED,TRANSACTION_CREATED,TRANSACTION_UPDATED,TRANSACTION_DELETED,WITHDRAWAL_CREATED,WITHDRAWAL_UPDATED,WITHDRAWAL_DELETED,ARTIST_PERFORMER_PRODUCER_AND_ENGINEER_CREATED,ARTIST_PERFORMER_PRODUCER_AND_ENGINEER_UPDATED,ARTIST_PERFORMER_PRODUCER_AND_ENGINEER_DELETED] on the enum `AUDIT_LOG_ACTION` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL] on the enum `LABEL_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL] on the enum `PERFORMER_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL] on the enum `PRODUCER_AND_ENGINEER_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL] on the enum `PUBLISHER_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL] on the enum `RELEASE_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL] on the enum `RINGTONE_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [DEVELOPER] on the enum `ROLE` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL] on the enum `TRACK_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL] on the enum `VIDEO_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - The values [MANAGER,ARTIST,MEMBER] on the enum `WORKSPACE_ACCOUNT_ACCESS_ROLE` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL] on the enum `WRITER_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `WorkspaceAccount` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionEndsAt` on the `WorkspaceAccount` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatsAt` on the `WorkspaceAccount` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `SharedWorkspaceAccountAccess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endedAt` to the `WorkspaceAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startedAt` to the `WorkspaceAccount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'ADMIN');

-- CreateEnum
CREATE TYPE "RIGHTS_MANAGEMENT_STATUS" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "ARTIST_STATUS_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PROCESSING', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED', 'TAKEN_DOWN');
ALTER TABLE "public"."Artist" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Artist" ALTER COLUMN "status" TYPE "ARTIST_STATUS_new" USING ("status"::text::"ARTIST_STATUS_new");
ALTER TYPE "ARTIST_STATUS" RENAME TO "ARTIST_STATUS_old";
ALTER TYPE "ARTIST_STATUS_new" RENAME TO "ARTIST_STATUS";
DROP TYPE "public"."ARTIST_STATUS_old";
ALTER TABLE "Artist" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AUDIT_LOG_ACTION_new" AS ENUM ('USER_REGISTERED', 'USER_LOGGED_IN', 'USER_LOGGED_OUT', 'USER_RESEND_VERIFICATION', 'USER_FORGOT_PASSWORD', 'USER_RESET_PASSWORD', 'USER_VERIFIED', 'USER_SUSPENDED', 'USER_APPROVED', 'USER_PASSWORD_CHANGED', 'USER_UPDATED', 'USER_DELETED', 'SESSION_CREATED', 'SESSION_REVOKED');
ALTER TABLE "AuditLog" ALTER COLUMN "action" TYPE "AUDIT_LOG_ACTION_new" USING ("action"::text::"AUDIT_LOG_ACTION_new");
ALTER TYPE "AUDIT_LOG_ACTION" RENAME TO "AUDIT_LOG_ACTION_old";
ALTER TYPE "AUDIT_LOG_ACTION_new" RENAME TO "AUDIT_LOG_ACTION";
DROP TYPE "public"."AUDIT_LOG_ACTION_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AUDIT_LOG_ENTITY" ADD VALUE 'SYSTEM_ACCESS';
ALTER TYPE "AUDIT_LOG_ENTITY" ADD VALUE 'RIGHTS_MANAGEMENT';

-- AlterEnum
BEGIN;
CREATE TYPE "LABEL_STATUS_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PROCESSING', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED', 'TAKEN_DOWN');
ALTER TABLE "public"."Label" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Label" ALTER COLUMN "status" TYPE "LABEL_STATUS_new" USING ("status"::text::"LABEL_STATUS_new");
ALTER TYPE "LABEL_STATUS" RENAME TO "LABEL_STATUS_old";
ALTER TYPE "LABEL_STATUS_new" RENAME TO "LABEL_STATUS";
DROP TYPE "public"."LABEL_STATUS_old";
ALTER TABLE "Label" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PERFORMER_STATUS_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PROCESSING', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED', 'TAKEN_DOWN');
ALTER TABLE "public"."Performer" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Performer" ALTER COLUMN "status" TYPE "PERFORMER_STATUS_new" USING ("status"::text::"PERFORMER_STATUS_new");
ALTER TYPE "PERFORMER_STATUS" RENAME TO "PERFORMER_STATUS_old";
ALTER TYPE "PERFORMER_STATUS_new" RENAME TO "PERFORMER_STATUS";
DROP TYPE "public"."PERFORMER_STATUS_old";
ALTER TABLE "Performer" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PRODUCER_AND_ENGINEER_STATUS_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PROCESSING', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED', 'TAKEN_DOWN');
ALTER TABLE "public"."ProducerAndEngineer" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ProducerAndEngineer" ALTER COLUMN "status" TYPE "PRODUCER_AND_ENGINEER_STATUS_new" USING ("status"::text::"PRODUCER_AND_ENGINEER_STATUS_new");
ALTER TYPE "PRODUCER_AND_ENGINEER_STATUS" RENAME TO "PRODUCER_AND_ENGINEER_STATUS_old";
ALTER TYPE "PRODUCER_AND_ENGINEER_STATUS_new" RENAME TO "PRODUCER_AND_ENGINEER_STATUS";
DROP TYPE "public"."PRODUCER_AND_ENGINEER_STATUS_old";
ALTER TABLE "ProducerAndEngineer" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PUBLISHER_STATUS_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PROCESSING', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED', 'TAKEN_DOWN');
ALTER TABLE "public"."Publisher" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Publisher" ALTER COLUMN "status" TYPE "PUBLISHER_STATUS_new" USING ("status"::text::"PUBLISHER_STATUS_new");
ALTER TYPE "PUBLISHER_STATUS" RENAME TO "PUBLISHER_STATUS_old";
ALTER TYPE "PUBLISHER_STATUS_new" RENAME TO "PUBLISHER_STATUS";
DROP TYPE "public"."PUBLISHER_STATUS_old";
ALTER TABLE "Publisher" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RELEASE_STATUS_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PROCESSING', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED', 'TAKEN_DOWN');
ALTER TABLE "public"."Release" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Release" ALTER COLUMN "status" TYPE "RELEASE_STATUS_new" USING ("status"::text::"RELEASE_STATUS_new");
ALTER TYPE "RELEASE_STATUS" RENAME TO "RELEASE_STATUS_old";
ALTER TYPE "RELEASE_STATUS_new" RENAME TO "RELEASE_STATUS";
DROP TYPE "public"."RELEASE_STATUS_old";
ALTER TABLE "Release" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RINGTONE_STATUS_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PROCESSING', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED', 'TAKEN_DOWN');
ALTER TABLE "public"."Ringtone" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Ringtone" ALTER COLUMN "status" TYPE "RINGTONE_STATUS_new" USING ("status"::text::"RINGTONE_STATUS_new");
ALTER TYPE "RINGTONE_STATUS" RENAME TO "RINGTONE_STATUS_old";
ALTER TYPE "RINGTONE_STATUS_new" RENAME TO "RINGTONE_STATUS";
DROP TYPE "public"."RINGTONE_STATUS_old";
ALTER TABLE "Ringtone" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ROLE_new" AS ENUM ('SYSTEM_OWNER', 'SYSTEM_ADMIN', 'SYSTEM_USER', 'USER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "ROLE_new" USING ("role"::text::"ROLE_new");
ALTER TYPE "ROLE" RENAME TO "ROLE_old";
ALTER TYPE "ROLE_new" RENAME TO "ROLE";
DROP TYPE "public"."ROLE_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TRACK_STATUS_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PROCESSING', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED', 'TAKEN_DOWN');
ALTER TABLE "public"."Track" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Track" ALTER COLUMN "status" TYPE "TRACK_STATUS_new" USING ("status"::text::"TRACK_STATUS_new");
ALTER TYPE "TRACK_STATUS" RENAME TO "TRACK_STATUS_old";
ALTER TYPE "TRACK_STATUS_new" RENAME TO "TRACK_STATUS";
DROP TYPE "public"."TRACK_STATUS_old";
ALTER TABLE "Track" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
ALTER TYPE "TRANSACTION_STATUS" ADD VALUE 'REJECTED';

-- AlterEnum
BEGIN;
CREATE TYPE "VIDEO_STATUS_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PROCESSING', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED', 'TAKEN_DOWN');
ALTER TABLE "public"."Video" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Video" ALTER COLUMN "status" TYPE "VIDEO_STATUS_new" USING ("status"::text::"VIDEO_STATUS_new");
ALTER TYPE "VIDEO_STATUS" RENAME TO "VIDEO_STATUS_old";
ALTER TYPE "VIDEO_STATUS_new" RENAME TO "VIDEO_STATUS";
DROP TYPE "public"."VIDEO_STATUS_old";
ALTER TABLE "Video" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
ALTER TYPE "WITHDRAWAL_STATUS" ADD VALUE 'REJECTED';

-- AlterEnum
BEGIN;
CREATE TYPE "WORKSPACE_ACCOUNT_ACCESS_ROLE_new" AS ENUM ('ADMIN', 'ARTIST_PERFORMER_PRODUCER_AND_ENGINEER', 'USER');
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "role" TYPE "WORKSPACE_ACCOUNT_ACCESS_ROLE_new" USING ("role"::text::"WORKSPACE_ACCOUNT_ACCESS_ROLE_new");
ALTER TYPE "WORKSPACE_ACCOUNT_ACCESS_ROLE" RENAME TO "WORKSPACE_ACCOUNT_ACCESS_ROLE_old";
ALTER TYPE "WORKSPACE_ACCOUNT_ACCESS_ROLE_new" RENAME TO "WORKSPACE_ACCOUNT_ACCESS_ROLE";
DROP TYPE "public"."WORKSPACE_ACCOUNT_ACCESS_ROLE_old";
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterEnum
ALTER TYPE "WORKSPACE_ACCOUNT_ACCESS_STATUS" ADD VALUE 'EXPIRED';

-- AlterEnum
ALTER TYPE "WORKSPACE_ACCOUNT_TYPE" ADD VALUE 'FREE_TRIAL';

-- AlterEnum
BEGIN;
CREATE TYPE "WRITER_STATUS_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PROCESSING', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED', 'TAKEN_DOWN');
ALTER TABLE "public"."Writer" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Writer" ALTER COLUMN "status" TYPE "WRITER_STATUS_new" USING ("status"::text::"WRITER_STATUS_new");
ALTER TYPE "WRITER_STATUS" RENAME TO "WRITER_STATUS_old";
ALTER TYPE "WRITER_STATUS_new" RENAME TO "WRITER_STATUS";
DROP TYPE "public"."WRITER_STATUS_old";
ALTER TABLE "Writer" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "SharedWorkspaceAccountAccess" ADD COLUMN     "allArtists" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allLabels" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allPerformers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allProducersAndEngineers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allPublishers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allRingtones" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allRleases" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allTracks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allTransactions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allVideos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allWithdrawals" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allWriters" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "artistAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "labelAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "performerAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "producerAndEngineerAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "publisherAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "releaseAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "ringtoneAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "trackAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "transactionAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "videoAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "withdrawalAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ADD COLUMN     "writerAccessLevel" "WORKSPACE_ACCOUNT_ACCESS_LEVEL" NOT NULL DEFAULT 'READ',
ALTER COLUMN "role" SET DEFAULT 'USER';

-- AlterTable
ALTER TABLE "WorkspaceAccount" DROP COLUMN "status",
DROP COLUMN "subscriptionEndsAt",
DROP COLUMN "subscriptionStatsAt",
ADD COLUMN     "agreementExpiresAt" TIMESTAMP(3),
ADD COLUMN     "agreementRenewedAt" TIMESTAMP(3),
ADD COLUMN     "agreementSignedAt" TIMESTAMP(3),
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "endedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "renewedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "suspendedAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "WORKSPACE_ACCOUNT_STATUS";

-- CreateTable
CREATE TABLE "SystemAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignerId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "suspendedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RightsManagement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "RIGHTS_MANAGEMENT_STATUS" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RightsManagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SharedWorkspaceAccountAccessToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SharedWorkspaceAccountAccessToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SharedWorkspaceAccountAccessToWithdrawal" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SharedWorkspaceAccountAccessToWithdrawal_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemAccess_userId_key" ON "SystemAccess"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemAccess_assignerId_key" ON "SystemAccess"("assignerId");

-- CreateIndex
CREATE INDEX "_SharedWorkspaceAccountAccessToTransaction_B_index" ON "_SharedWorkspaceAccountAccessToTransaction"("B");

-- CreateIndex
CREATE INDEX "_SharedWorkspaceAccountAccessToWithdrawal_B_index" ON "_SharedWorkspaceAccountAccessToWithdrawal"("B");

-- AddForeignKey
ALTER TABLE "SystemAccess" ADD CONSTRAINT "SystemAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAccess" ADD CONSTRAINT "SystemAccess_assignerId_fkey" FOREIGN KEY ("assignerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RightsManagement" ADD CONSTRAINT "RightsManagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWorkspaceAccountAccessToTransaction" ADD CONSTRAINT "_SharedWorkspaceAccountAccessToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWorkspaceAccountAccessToTransaction" ADD CONSTRAINT "_SharedWorkspaceAccountAccessToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWorkspaceAccountAccessToWithdrawal" ADD CONSTRAINT "_SharedWorkspaceAccountAccessToWithdrawal_A_fkey" FOREIGN KEY ("A") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWorkspaceAccountAccessToWithdrawal" ADD CONSTRAINT "_SharedWorkspaceAccountAccessToWithdrawal_B_fkey" FOREIGN KEY ("B") REFERENCES "Withdrawal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
