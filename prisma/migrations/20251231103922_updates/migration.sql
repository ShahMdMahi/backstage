/*
  Warnings:

  - You are about to drop the column `workspaceAccountAccessLevel` on the `SharedWorkspaceAccountAccess` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `SharedWorkspaceAccountAccess` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SharedWorkspaceAccountAccess" DROP COLUMN "workspaceAccountAccessLevel";

-- CreateIndex
CREATE UNIQUE INDEX "SharedWorkspaceAccountAccess_userId_key" ON "SharedWorkspaceAccountAccess"("userId");
