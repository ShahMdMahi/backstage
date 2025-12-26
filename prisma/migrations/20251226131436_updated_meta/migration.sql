/*
  Warnings:

  - The values [ADMIN] on the enum `WORKSPACE_ACCOUNT_ACCESS_LEVEL` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `allRleases` on the `SharedWorkspaceAccountAccess` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `SharedWorkspaceAccountAccess` table. All the data in the column will be lost.
  - Changed the column `artistAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `labelAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `performerAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `producerAndEngineerAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `publisherAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `releaseAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `ringtoneAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `trackAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `transactionAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `videoAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `withdrawalAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `writerAccessLevel` on the `SharedWorkspaceAccountAccess` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- CreateEnum
CREATE TYPE "SYSTEM_ACCESS_LEVEL" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');

-- AlterEnum
BEGIN;
CREATE TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE');
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "artistAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "labelAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "performerAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "producerAndEngineerAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "publisherAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "releaseAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "ringtoneAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "trackAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "transactionAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "videoAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "withdrawalAccessLevel" DROP DEFAULT;
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "writerAccessLevel" DROP DEFAULT;
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "releaseAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("releaseAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "trackAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("trackAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "videoAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("videoAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "ringtoneAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("ringtoneAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "artistAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("artistAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "performerAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("performerAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "producerAndEngineerAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("producerAndEngineerAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "writerAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("writerAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "publisherAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("publisherAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "labelAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("labelAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "transactionAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("transactionAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "withdrawalAccessLevel" TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[] USING ("withdrawalAccessLevel"::text::"WORKSPACE_ACCOUNT_ACCESS_LEVEL_new"[]);
ALTER TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL" RENAME TO "WORKSPACE_ACCOUNT_ACCESS_LEVEL_old";
ALTER TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL_new" RENAME TO "WORKSPACE_ACCOUNT_ACCESS_LEVEL";
DROP TYPE "public"."WORKSPACE_ACCOUNT_ACCESS_LEVEL_old";
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "artistAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "labelAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "performerAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "producerAndEngineerAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "publisherAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "releaseAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "ringtoneAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "trackAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "transactionAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "videoAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "withdrawalAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "writerAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];
COMMIT;

-- AlterTable
ALTER TABLE "SharedWorkspaceAccountAccess" DROP COLUMN "allRleases",
DROP COLUMN "status",
ADD COLUMN     "allReleases" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "artistId" TEXT,
ADD COLUMN     "labelId" TEXT,
ADD COLUMN     "performerId" TEXT,
ADD COLUMN     "producerAndEngineerId" TEXT,
ADD COLUMN     "publisherId" TEXT,
ADD COLUMN     "writerId" TEXT,
ALTER COLUMN "artistAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "artistAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "labelAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "labelAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "performerAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "performerAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "producerAndEngineerAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "producerAndEngineerAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "publisherAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "publisherAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "releaseAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "releaseAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "ringtoneAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "ringtoneAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "trackAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "trackAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "transactionAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "transactionAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "videoAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "videoAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "withdrawalAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "withdrawalAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "writerAccessLevel" SET DEFAULT ARRAY[]::"WORKSPACE_ACCOUNT_ACCESS_LEVEL"[],
ALTER COLUMN "writerAccessLevel" SET DATA TYPE "WORKSPACE_ACCOUNT_ACCESS_LEVEL"[];

-- AlterTable
ALTER TABLE "SystemAccess" ADD COLUMN     "artistsAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "artistsAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "labelsAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "labelsAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "performersAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "performersAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "producersAndEngineersAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "producersAndEngineersAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "publishersAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishersAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "releasesAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "releasesAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "rightsManagementAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rightsManagementAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "ringtonesAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ringtonesAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "tracksAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tracksAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "transactionsAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transactionsAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "videosAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videosAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "withdrawalsAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "withdrawalsAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "workspaceAccountsAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workspaceAccountsAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[],
ADD COLUMN     "writersAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "writersAccessLevel" "SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"SYSTEM_ACCESS_LEVEL"[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "metadata" JSONB;

-- DropEnum
DROP TYPE "WORKSPACE_ACCOUNT_ACCESS_STATUS";

-- AddForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" ADD CONSTRAINT "SharedWorkspaceAccountAccess_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" ADD CONSTRAINT "SharedWorkspaceAccountAccess_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Performer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" ADD CONSTRAINT "SharedWorkspaceAccountAccess_producerAndEngineerId_fkey" FOREIGN KEY ("producerAndEngineerId") REFERENCES "ProducerAndEngineer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" ADD CONSTRAINT "SharedWorkspaceAccountAccess_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "Writer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" ADD CONSTRAINT "SharedWorkspaceAccountAccess_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" ADD CONSTRAINT "SharedWorkspaceAccountAccess_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
