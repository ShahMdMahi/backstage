-- CreateEnum
CREATE TYPE "RELEASE_STATUS" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "TRACK_STATUS" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "VIDEO_STATUS" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "RINGTONE_STATUS" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "ARTIST_STATUS" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "PERFORMER_STATUS" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "PRODUCER_AND_ENGINEER_STATUS" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "WRITER_STATUS" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "PUBLISHER_STATUS" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "LABEL_STATUS" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "TRANSACTION_STATUS" AS ENUM ('PENDING', 'PROCESSING', 'ON_HOLD', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WITHDRAWAL_STATUS" AS ENUM ('PENDING', 'PROCESSING', 'ON_HOLD', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "WORKSPACE_ACCOUNT_STATUS" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "status" "ARTIST_STATUS" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Label" ADD COLUMN     "status" "LABEL_STATUS" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Performer" ADD COLUMN     "status" "PERFORMER_STATUS" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "ProducerAndEngineer" ADD COLUMN     "status" "PRODUCER_AND_ENGINEER_STATUS" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "status" "PUBLISHER_STATUS" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "status" "RELEASE_STATUS" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Ringtone" ADD COLUMN     "status" "RINGTONE_STATUS" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "status" "TRACK_STATUS" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "status" "TRANSACTION_STATUS" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "workspaceAccountId" TEXT;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "status" "VIDEO_STATUS" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "status" "WITHDRAWAL_STATUS" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "workspaceAccountId" TEXT;

-- AlterTable
ALTER TABLE "Writer" ADD COLUMN     "status" "WRITER_STATUS" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "_ArtistToLabel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArtistToLabel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LabelToRelease" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabelToRelease_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LabelToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabelToTrack_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LabelToVideo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabelToVideo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LabelToRingtone" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabelToRingtone_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LabelToPerformer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabelToPerformer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LabelToProducerAndEngineer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabelToProducerAndEngineer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LabelToWriter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabelToWriter_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LabelToPublisher" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabelToPublisher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ArtistToLabel_B_index" ON "_ArtistToLabel"("B");

-- CreateIndex
CREATE INDEX "_LabelToRelease_B_index" ON "_LabelToRelease"("B");

-- CreateIndex
CREATE INDEX "_LabelToTrack_B_index" ON "_LabelToTrack"("B");

-- CreateIndex
CREATE INDEX "_LabelToVideo_B_index" ON "_LabelToVideo"("B");

-- CreateIndex
CREATE INDEX "_LabelToRingtone_B_index" ON "_LabelToRingtone"("B");

-- CreateIndex
CREATE INDEX "_LabelToPerformer_B_index" ON "_LabelToPerformer"("B");

-- CreateIndex
CREATE INDEX "_LabelToProducerAndEngineer_B_index" ON "_LabelToProducerAndEngineer"("B");

-- CreateIndex
CREATE INDEX "_LabelToWriter_B_index" ON "_LabelToWriter"("B");

-- CreateIndex
CREATE INDEX "_LabelToPublisher_B_index" ON "_LabelToPublisher"("B");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToLabel" ADD CONSTRAINT "_ArtistToLabel_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToLabel" ADD CONSTRAINT "_ArtistToLabel_B_fkey" FOREIGN KEY ("B") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToRelease" ADD CONSTRAINT "_LabelToRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToRelease" ADD CONSTRAINT "_LabelToRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToTrack" ADD CONSTRAINT "_LabelToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToTrack" ADD CONSTRAINT "_LabelToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToVideo" ADD CONSTRAINT "_LabelToVideo_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToVideo" ADD CONSTRAINT "_LabelToVideo_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToRingtone" ADD CONSTRAINT "_LabelToRingtone_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToRingtone" ADD CONSTRAINT "_LabelToRingtone_B_fkey" FOREIGN KEY ("B") REFERENCES "Ringtone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToPerformer" ADD CONSTRAINT "_LabelToPerformer_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToPerformer" ADD CONSTRAINT "_LabelToPerformer_B_fkey" FOREIGN KEY ("B") REFERENCES "Performer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToProducerAndEngineer" ADD CONSTRAINT "_LabelToProducerAndEngineer_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToProducerAndEngineer" ADD CONSTRAINT "_LabelToProducerAndEngineer_B_fkey" FOREIGN KEY ("B") REFERENCES "ProducerAndEngineer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToWriter" ADD CONSTRAINT "_LabelToWriter_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToWriter" ADD CONSTRAINT "_LabelToWriter_B_fkey" FOREIGN KEY ("B") REFERENCES "Writer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToPublisher" ADD CONSTRAINT "_LabelToPublisher_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToPublisher" ADD CONSTRAINT "_LabelToPublisher_B_fkey" FOREIGN KEY ("B") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
