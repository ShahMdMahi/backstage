/*
  Warnings:

  - The values [ARTIST_PERFORMER_PRODUCER_AND_ENGINEER] on the enum `WORKSPACE_ACCOUNT_ACCESS_ROLE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WORKSPACE_ACCOUNT_ACCESS_ROLE_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "public"."SharedWorkspaceAccountAccess" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "role" TYPE "WORKSPACE_ACCOUNT_ACCESS_ROLE_new" USING ("role"::text::"WORKSPACE_ACCOUNT_ACCESS_ROLE_new");
ALTER TYPE "WORKSPACE_ACCOUNT_ACCESS_ROLE" RENAME TO "WORKSPACE_ACCOUNT_ACCESS_ROLE_old";
ALTER TYPE "WORKSPACE_ACCOUNT_ACCESS_ROLE_new" RENAME TO "WORKSPACE_ACCOUNT_ACCESS_ROLE";
DROP TYPE "public"."WORKSPACE_ACCOUNT_ACCESS_ROLE_old";
ALTER TABLE "SharedWorkspaceAccountAccess" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" DROP CONSTRAINT "SharedWorkspaceAccountAccess_artistId_fkey";

-- DropForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" DROP CONSTRAINT "SharedWorkspaceAccountAccess_labelId_fkey";

-- DropForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" DROP CONSTRAINT "SharedWorkspaceAccountAccess_performerId_fkey";

-- DropForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" DROP CONSTRAINT "SharedWorkspaceAccountAccess_producerAndEngineerId_fkey";

-- DropForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" DROP CONSTRAINT "SharedWorkspaceAccountAccess_publisherId_fkey";

-- DropForeignKey
ALTER TABLE "SharedWorkspaceAccountAccess" DROP CONSTRAINT "SharedWorkspaceAccountAccess_writerId_fkey";
