/*
  Warnings:

  - The values [ANS] on the enum `REPORTING_TYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "REPORTING_TYPE_new" AS ENUM ('REVELATOR', 'BELIEVE');
ALTER TABLE "Reporting" ALTER COLUMN "type" TYPE "REPORTING_TYPE_new" USING ("type"::text::"REPORTING_TYPE_new");
ALTER TYPE "REPORTING_TYPE" RENAME TO "REPORTING_TYPE_old";
ALTER TYPE "REPORTING_TYPE_new" RENAME TO "REPORTING_TYPE";
DROP TYPE "public"."REPORTING_TYPE_old";
COMMIT;
