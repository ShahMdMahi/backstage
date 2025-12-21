-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WORKSPACE_ACCOUNT_SUSPENDED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WORKSPACE_ACCOUNT_REACTIVATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'RELEASE_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'RELEASE_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'RELEASE_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'TRACK_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'TRACK_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'TRACK_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'VIDEO_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'VIDEO_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'VIDEO_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'RINGTONE_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'RINGTONE_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'RINGTONE_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'ARTIST_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'ARTIST_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'ARTIST_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'PERFORMER_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'PERFORMER_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'PERFORMER_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'PRODUCER_AND_ENGINEER_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'PRODUCER_AND_ENGINEER_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'PRODUCER_AND_ENGINEER_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WRITER_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WRITER_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WRITER_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'PUBLISHER_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'PUBLISHER_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'PUBLISHER_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'LABEL_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'LABEL_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'LABEL_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'SHARED_WORKSPACE_ACCOUNT_ACCESS_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'SHARED_WORKSPACE_ACCOUNT_ACCESS_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'SHARED_WORKSPACE_ACCOUNT_ACCESS_SUSPENDED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'SHARED_WORKSPACE_ACCOUNT_ACCESS_REACTIVATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'SHARED_WORKSPACE_ACCOUNT_ACCESS_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'TRANSACTION_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'TRANSACTION_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'TRANSACTION_DELETED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WITHDRAWAL_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WITHDRAWAL_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'WITHDRAWAL_DELETED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AUDIT_LOG_ENTITY" ADD VALUE 'WORKSPACE_ACCOUNT';
ALTER TYPE "AUDIT_LOG_ENTITY" ADD VALUE 'SHARED_WORKSPACE_ACCOUNT_ACCESS';

-- DropIndex
DROP INDEX "Session_userId_expiresAt_idx";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "entityId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ringtone" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ringtone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performer" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProducerAndEngineer" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProducerAndEngineer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Writer" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Writer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publisher" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "workspaceAccountId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReleaseToSharedWorkspaceAccountAccess" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReleaseToSharedWorkspaceAccountAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RingtoneToSharedWorkspaceAccountAccess" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RingtoneToSharedWorkspaceAccountAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ArtistToSharedWorkspaceAccountAccess" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArtistToSharedWorkspaceAccountAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PerformerToSharedWorkspaceAccountAccess" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PerformerToSharedWorkspaceAccountAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProducerAndEngineerToSharedWorkspaceAccountAccess" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProducerAndEngineerToSharedWorkspaceAccountAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PublisherToSharedWorkspaceAccountAccess" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PublisherToSharedWorkspaceAccountAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LabelToSharedWorkspaceAccountAccess" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabelToSharedWorkspaceAccountAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SharedWorkspaceAccountAccessToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SharedWorkspaceAccountAccessToTrack_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SharedWorkspaceAccountAccessToVideo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SharedWorkspaceAccountAccessToVideo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SharedWorkspaceAccountAccessToWriter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SharedWorkspaceAccountAccessToWriter_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ReleaseToSharedWorkspaceAccountAccess_B_index" ON "_ReleaseToSharedWorkspaceAccountAccess"("B");

-- CreateIndex
CREATE INDEX "_RingtoneToSharedWorkspaceAccountAccess_B_index" ON "_RingtoneToSharedWorkspaceAccountAccess"("B");

-- CreateIndex
CREATE INDEX "_ArtistToSharedWorkspaceAccountAccess_B_index" ON "_ArtistToSharedWorkspaceAccountAccess"("B");

-- CreateIndex
CREATE INDEX "_PerformerToSharedWorkspaceAccountAccess_B_index" ON "_PerformerToSharedWorkspaceAccountAccess"("B");

-- CreateIndex
CREATE INDEX "_ProducerAndEngineerToSharedWorkspaceAccountAccess_B_index" ON "_ProducerAndEngineerToSharedWorkspaceAccountAccess"("B");

-- CreateIndex
CREATE INDEX "_PublisherToSharedWorkspaceAccountAccess_B_index" ON "_PublisherToSharedWorkspaceAccountAccess"("B");

-- CreateIndex
CREATE INDEX "_LabelToSharedWorkspaceAccountAccess_B_index" ON "_LabelToSharedWorkspaceAccountAccess"("B");

-- CreateIndex
CREATE INDEX "_SharedWorkspaceAccountAccessToTrack_B_index" ON "_SharedWorkspaceAccountAccessToTrack"("B");

-- CreateIndex
CREATE INDEX "_SharedWorkspaceAccountAccessToVideo_B_index" ON "_SharedWorkspaceAccountAccessToVideo"("B");

-- CreateIndex
CREATE INDEX "_SharedWorkspaceAccountAccessToWriter_B_index" ON "_SharedWorkspaceAccountAccessToWriter"("B");

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ringtone" ADD CONSTRAINT "Ringtone_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performer" ADD CONSTRAINT "Performer_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducerAndEngineer" ADD CONSTRAINT "ProducerAndEngineer_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Writer" ADD CONSTRAINT "Writer_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publisher" ADD CONSTRAINT "Publisher_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_workspaceAccountId_fkey" FOREIGN KEY ("workspaceAccountId") REFERENCES "WorkspaceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReleaseToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_ReleaseToSharedWorkspaceAccountAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReleaseToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_ReleaseToSharedWorkspaceAccountAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RingtoneToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_RingtoneToSharedWorkspaceAccountAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Ringtone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RingtoneToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_RingtoneToSharedWorkspaceAccountAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_ArtistToSharedWorkspaceAccountAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_ArtistToSharedWorkspaceAccountAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerformerToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_PerformerToSharedWorkspaceAccountAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Performer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerformerToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_PerformerToSharedWorkspaceAccountAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProducerAndEngineerToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_ProducerAndEngineerToSharedWorkspaceAccountAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "ProducerAndEngineer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProducerAndEngineerToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_ProducerAndEngineerToSharedWorkspaceAccountAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublisherToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_PublisherToSharedWorkspaceAccountAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublisherToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_PublisherToSharedWorkspaceAccountAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_LabelToSharedWorkspaceAccountAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToSharedWorkspaceAccountAccess" ADD CONSTRAINT "_LabelToSharedWorkspaceAccountAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWorkspaceAccountAccessToTrack" ADD CONSTRAINT "_SharedWorkspaceAccountAccessToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWorkspaceAccountAccessToTrack" ADD CONSTRAINT "_SharedWorkspaceAccountAccessToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWorkspaceAccountAccessToVideo" ADD CONSTRAINT "_SharedWorkspaceAccountAccessToVideo_A_fkey" FOREIGN KEY ("A") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWorkspaceAccountAccessToVideo" ADD CONSTRAINT "_SharedWorkspaceAccountAccessToVideo_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWorkspaceAccountAccessToWriter" ADD CONSTRAINT "_SharedWorkspaceAccountAccessToWriter_A_fkey" FOREIGN KEY ("A") REFERENCES "SharedWorkspaceAccountAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWorkspaceAccountAccessToWriter" ADD CONSTRAINT "_SharedWorkspaceAccountAccessToWriter_B_fkey" FOREIGN KEY ("B") REFERENCES "Writer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
