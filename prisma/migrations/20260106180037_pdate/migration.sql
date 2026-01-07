/*
  Warnings:

  - The `withdrawsAccessLevel` column on the `SystemAccess` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `workspaceAccountId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workspaceAccountId` on table `Withdrawal` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "WITHDRAW_SYSTEM_ACCESS_LEVEL" AS ENUM ('VIEW', 'APPROVE', 'STATUS', 'CREATE', 'DELETE');

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_workspaceAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Withdrawal" DROP CONSTRAINT "Withdrawal_workspaceAccountId_fkey";

-- DropIndex
DROP INDEX "Artist_workspaceAccountId_key";

-- DropIndex
DROP INDEX "Label_workspaceAccountId_key";

-- DropIndex
DROP INDEX "Performer_workspaceAccountId_key";

-- DropIndex
DROP INDEX "ProducerAndEngineer_workspaceAccountId_key";

-- DropIndex
DROP INDEX "Publisher_workspaceAccountId_key";

-- DropIndex
DROP INDEX "Writer_workspaceAccountId_key";

-- AlterTable
ALTER TABLE "SystemAccess" DROP COLUMN "withdrawsAccessLevel",
ADD COLUMN     "withdrawsAccessLevel" "WITHDRAW_SYSTEM_ACCESS_LEVEL"[] DEFAULT ARRAY[]::"WITHDRAW_SYSTEM_ACCESS_LEVEL"[];

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "workspaceAccountId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Withdrawal" ALTER COLUMN "workspaceAccountId" SET NOT NULL;

-- DropEnum
DROP TYPE "WITHDRAWS_SYSTEM_ACCESS_LEVEL";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
