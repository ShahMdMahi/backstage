/*
  Warnings:

  - You are about to drop the column `artistId` on the `SharedWorkspaceAccountAccess` table. All the data in the column will be lost.
  - You are about to drop the column `labelId` on the `SharedWorkspaceAccountAccess` table. All the data in the column will be lost.
  - You are about to drop the column `performerId` on the `SharedWorkspaceAccountAccess` table. All the data in the column will be lost.
  - You are about to drop the column `producerAndEngineerId` on the `SharedWorkspaceAccountAccess` table. All the data in the column will be lost.
  - You are about to drop the column `publisherId` on the `SharedWorkspaceAccountAccess` table. All the data in the column will be lost.
  - You are about to drop the column `writerId` on the `SharedWorkspaceAccountAccess` table. All the data in the column will be lost.
  - The `artistAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `labelAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `performerAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `producerAndEngineerAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `publisherAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `releaseAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ringtoneAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `trackAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transactionAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `videoAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `withdrawalAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `writerAccessLevel` column on the `SharedWorkspaceAccountAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `artistsAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `labelsAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `performersAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `producersAndEngineersAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `publishersAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `releasesAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `rightsManagementAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `ringtonesAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `tracksAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `transactionsAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `videosAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `withdrawalsAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceAccountsAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - You are about to drop the column `writersAccess` on the `SystemAccess` table. All the data in the column will be lost.
  - The `artistsAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `labelsAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `performersAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `producersAndEngineersAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `publishersAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `releasesAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rightsManagementAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ringtonesAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tracksAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transactionsAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `videosAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `withdrawalsAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `workspaceAccountsAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `writersAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "USER_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "RELEASE_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "TRACK_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "VIDEO_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "RINGTONE_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "ARTIST_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "PERFORMER_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "WRITER_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "PUBLISHER_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "LABEL_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "TRANSACTION_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "WITHDRAWAL_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "WORKSPACE_ACCOUNT_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "RELEASE_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "TRACK_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "VIDEO_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "RINGTONE_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "ARTIST_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "PERFORMER_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "PRODUCER_AND_ENGINEER_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "WRITER_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "PUBLISHER_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "LABEL_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "TRANSACTION_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "WITHDRAWAL_WORKSPACE_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- AlterTable
ALTER TABLE "SharedWorkspaceAccountAccess" DROP COLUMN "artistId",
DROP COLUMN "labelId",
DROP COLUMN "performerId",
DROP COLUMN "producerAndEngineerId",
DROP COLUMN "publisherId",
DROP COLUMN "writerId",
ADD COLUMN     "workspaceAccountAccessLevel" "WORKSPACE_ACCOUNT_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "artistAccessLevel",
ADD COLUMN     "artistAccessLevel" "ARTIST_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"ARTIST_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "labelAccessLevel",
ADD COLUMN     "labelAccessLevel" "LABEL_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"LABEL_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "performerAccessLevel",
ADD COLUMN     "performerAccessLevel" "PERFORMER_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"PERFORMER_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "producerAndEngineerAccessLevel",
ADD COLUMN     "producerAndEngineerAccessLevel" "PRODUCER_AND_ENGINEER_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"PRODUCER_AND_ENGINEER_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "publisherAccessLevel",
ADD COLUMN     "publisherAccessLevel" "PUBLISHER_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"PUBLISHER_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "releaseAccessLevel",
ADD COLUMN     "releaseAccessLevel" "RELEASE_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"RELEASE_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "ringtoneAccessLevel",
ADD COLUMN     "ringtoneAccessLevel" "RINGTONE_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"RINGTONE_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "trackAccessLevel",
ADD COLUMN     "trackAccessLevel" "TRACK_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"TRACK_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "transactionAccessLevel",
ADD COLUMN     "transactionAccessLevel" "TRANSACTION_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"TRANSACTION_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "videoAccessLevel",
ADD COLUMN     "videoAccessLevel" "VIDEO_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"VIDEO_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "withdrawalAccessLevel",
ADD COLUMN     "withdrawalAccessLevel" "WITHDRAWAL_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"WITHDRAWAL_WORKSPACE_ACCESS_LEVEL"[],
DROP COLUMN "writerAccessLevel",
ADD COLUMN     "writerAccessLevel" "WRITER_WORKSPACE_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"WRITER_WORKSPACE_ACCESS_LEVEL"[];

-- AlterTable
ALTER TABLE "SystemAccess" DROP COLUMN "artistsAccess",
DROP COLUMN "labelsAccess",
DROP COLUMN "performersAccess",
DROP COLUMN "producersAndEngineersAccess",
DROP COLUMN "publishersAccess",
DROP COLUMN "releasesAccess",
DROP COLUMN "rightsManagementAccess",
DROP COLUMN "ringtonesAccess",
DROP COLUMN "tracksAccess",
DROP COLUMN "transactionsAccess",
DROP COLUMN "videosAccess",
DROP COLUMN "withdrawalsAccess",
DROP COLUMN "workspaceAccountsAccess",
DROP COLUMN "writersAccess",
ADD COLUMN     "usersAccessLevel" "USER_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"USER_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "artistsAccessLevel",
ADD COLUMN     "artistsAccessLevel" "ARTIST_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"ARTIST_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "labelsAccessLevel",
ADD COLUMN     "labelsAccessLevel" "LABEL_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"LABEL_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "performersAccessLevel",
ADD COLUMN     "performersAccessLevel" "PERFORMER_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"PERFORMER_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "producersAndEngineersAccessLevel",
ADD COLUMN     "producersAndEngineersAccessLevel" "PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "publishersAccessLevel",
ADD COLUMN     "publishersAccessLevel" "PUBLISHER_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"PUBLISHER_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "releasesAccessLevel",
ADD COLUMN     "releasesAccessLevel" "RELEASE_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"RELEASE_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "rightsManagementAccessLevel",
ADD COLUMN     "rightsManagementAccessLevel" "RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "ringtonesAccessLevel",
ADD COLUMN     "ringtonesAccessLevel" "RINGTONE_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"RINGTONE_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "tracksAccessLevel",
ADD COLUMN     "tracksAccessLevel" "TRACK_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"TRACK_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "transactionsAccessLevel",
ADD COLUMN     "transactionsAccessLevel" "TRANSACTION_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"TRANSACTION_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "videosAccessLevel",
ADD COLUMN     "videosAccessLevel" "VIDEO_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"VIDEO_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "withdrawalsAccessLevel",
ADD COLUMN     "withdrawalsAccessLevel" "WITHDRAWAL_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"WITHDRAWAL_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "workspaceAccountsAccessLevel",
ADD COLUMN     "workspaceAccountsAccessLevel" "WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL"[],
DROP COLUMN "writersAccessLevel",
ADD COLUMN     "writersAccessLevel" "WRITER_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"WRITER_SYSTEM_ACCESS_LEVEL"[];

-- DropEnum
DROP TYPE "SYSTEM_ACCESS_LEVEL";

-- DropEnum
DROP TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL";
