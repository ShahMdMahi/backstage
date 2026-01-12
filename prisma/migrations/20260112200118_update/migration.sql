-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'REPORTING_PROCESSED';
ALTER TYPE "AUDIT_LOG_ACTION" ADD VALUE 'REPORTING_EXPORTED';

-- AlterEnum
ALTER TYPE "REPORTING_SYSTEM_ACCESS_LEVEL" ADD VALUE 'EXPORT';
