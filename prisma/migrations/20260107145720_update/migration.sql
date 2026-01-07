-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'SYSTEM_ACCESS_CREATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'SYSTEM_ACCESS_UPDATED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'SYSTEM_ACCESS_SUSPENDED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'SYSTEM_ACCESS_UNSUSPENDED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'SYSTEM_ACCESS_DELETED';
