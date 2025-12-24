/*
  Warnings:

  - A unique constraint covering the columns `[workspaceAccountId]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceAccountId]` on the table `Label` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceAccountId]` on the table `Performer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceAccountId]` on the table `ProducerAndEngineer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceAccountId]` on the table `Publisher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownWorkspaceAccountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceAccountId]` on the table `Writer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'ARTIST_PERFORMER_PRODUCER_AND_ENGINEER_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'ARTIST_PERFORMER_PRODUCER_AND_ENGINEER_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'ARTIST_PERFORMER_PRODUCER_AND_ENGINEER_DELETED';

-- AlterEnum
ALTER TYPE "AUDIT_LOG_ENTITY" ADD VALUE 'ARTIST_PERFORMER_PRODUCER_AND_ENGINEER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ownWorkspaceAccountId" TEXT;

-- CreateTable
CREATE TABLE "ArtistPerformerProducerAndEngineer" (
    "id" TEXT NOT NULL,
    "artistId" TEXT,
    "performerId" TEXT,
    "producerAndEngineerId" TEXT,
    "name" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtistPerformerProducerAndEngineer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtistPerformerProducerAndEngineer_artistId_key" ON "ArtistPerformerProducerAndEngineer"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistPerformerProducerAndEngineer_performerId_key" ON "ArtistPerformerProducerAndEngineer"("performerId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistPerformerProducerAndEngineer_producerAndEngineerId_key" ON "ArtistPerformerProducerAndEngineer"("producerAndEngineerId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistPerformerProducerAndEngineer_artistId_performerId_pro_key" ON "ArtistPerformerProducerAndEngineer"("artistId", "performerId", "producerAndEngineerId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_workspaceAccountId_key" ON "Artist"("workspaceAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Label_workspaceAccountId_key" ON "Label"("workspaceAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Performer_workspaceAccountId_key" ON "Performer"("workspaceAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ProducerAndEngineer_workspaceAccountId_key" ON "ProducerAndEngineer"("workspaceAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Publisher_workspaceAccountId_key" ON "Publisher"("workspaceAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_ownWorkspaceAccountId_key" ON "User"("ownWorkspaceAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Writer_workspaceAccountId_key" ON "Writer"("workspaceAccountId");

-- AddForeignKey
ALTER TABLE "ArtistPerformerProducerAndEngineer" ADD CONSTRAINT "ArtistPerformerProducerAndEngineer_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistPerformerProducerAndEngineer" ADD CONSTRAINT "ArtistPerformerProducerAndEngineer_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Performer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistPerformerProducerAndEngineer" ADD CONSTRAINT "ArtistPerformerProducerAndEngineer_producerAndEngineerId_fkey" FOREIGN KEY ("producerAndEngineerId") REFERENCES "ProducerAndEngineer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
